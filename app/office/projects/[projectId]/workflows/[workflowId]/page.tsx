import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectTaskType, ProjectWorkflowStatus, ProjectWorkflowTemplate } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import { formatDateTime } from '@/lib/office';
import { buildTechnicalSummaryCards, formatTechnicalValue, technicalFieldDefinitions, workflowDocumentRequirements } from '@/lib/project-technical';
import { createProjectDocumentAction, createProjectTaskAction, deleteProjectDocumentAction, deleteProjectWorkflowAction, updateProjectDocumentAction, updateProjectTaskStatusAction, updateProjectWorkflowDetailsAction, updateProjectWorkflowStatusAction } from '@/app/office/actions/core';

const workflowTemplateLabel: Record<ProjectWorkflowTemplate, string> = {
  EARTHWORK: 'Foldmunka',
  MASONRY: 'Komuves munka',
  ROOFING: 'Tetoszerkezet',
  FACADE: 'Homlokzat',
  OPENINGS: 'Nyilaszarok',
  ELECTRICAL: 'Villanyszereles',
  MECHANICAL: 'Gepeszet',
  INTERIOR: 'Belso munkak',
  PAINTING: 'Festes',
  TILING: 'Burkolas',
  OTHER: 'Egyeb',
};

const workflowStatusLabel: Record<ProjectWorkflowStatus, string> = {
  PLANNED: 'Tervezett',
  ACTIVE: 'Aktiv',
  WAITING: 'Varakozik',
  DONE: 'Lezart',
};

const taskStatusLabel = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
} as const;

export default async function ProjectWorkflowDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; workflowId: string }>;
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { projectId, workflowId } = await params;
  const pageParams = await searchParams;
  const notice = String(pageParams?.notice || '').trim();
  const error = String(pageParams?.error || '').trim();

  const workflow = await prisma.projectWorkflow.findFirst({
    where: { id: workflowId, projectId },
    include: {
      project: {
        include: {
          members: true,
          technicalParameters: true,
          documents: {
            orderBy: [{ createdAt: 'desc' }],
            include: { task: { select: { title: true } } },
          },
        },
      },
      documents: {
        orderBy: [{ createdAt: 'desc' }],
        include: { task: { select: { id: true, title: true } } },
      },
      contractorMember: true,
      tasks: {
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          assignee: true,
          approvedBy: true,
        },
      },
    },
  });

  if (!workflow) notFound();

  const technicalSummaryCards = buildTechnicalSummaryCards(workflow.project.technicalParameters, [
    { id: workflow.id, name: workflow.name, template: workflow.template },
  ]);
  const activeSummary = technicalSummaryCards.find((summary) => summary.workflow === workflow.template) || null;
  const relevantFields = technicalFieldDefinitions.filter((field) => field.relatedWorkflows.includes(workflow.template));
  const relevantParameters = relevantFields
    .map((field) => ({
      field,
      value: workflow.project.technicalParameters.find((parameter) => parameter.paramKey === field.paramKey),
    }))
    .filter((item) => item.value);
  const planDocuments = workflow.project.documents.filter((document) => document.scope === 'PLAN_PACKAGE');
  const missingTechnical = relevantFields.length - relevantParameters.length;
  const documentRequirements = workflowDocumentRequirements[workflow.template] || [];
  const requirementStatus = documentRequirements.map((requirement) => ({
    ...requirement,
    documents: workflow.documents.filter((document) => document.workflowRequirementKey === requirement.key),
  }));
  const missingRequiredDocuments = requirementStatus.filter((item) => item.required && item.documents.length === 0).length;
  const decisionTasks = workflow.tasks.filter((task) => task.type === 'CUSTOMER_DECISION');
  const executionTasks = workflow.tasks.filter((task) => task.type !== 'CUSTOMER_DECISION');
  const openDecisionTasks = decisionTasks.filter((task) => task.status !== 'DONE');
  const completedDecisionTasks = decisionTasks.filter((task) => task.status === 'DONE');

  return (
    <OfficeShellV2
      title={workflow.name}
      description="Egy munkafazis reszletes lapja: mit kell megcsinalni, ki felel erte, milyen dokumentum kell hozza, es hol tart."
      userName={user.name}
      toolbar={
        <>
          <Link href={`/office/projects/${projectId}?tab=workflows`} className="btn-secondary">Vissza a munkafazisokhoz</Link>
          <Link href={`/office/projects/${projectId}?tab=technical&techSection=SUMMARIES`} className="btn-secondary">Muszaki osszesitok</Link>
        </>
      }
      focusLabel="Munkacsomag"
      quickActions={[
        { href: `/office/projects/${projectId}?tab=technical&techSection=SUMMARIES`, label: 'Muszaki osszesito' },
        { href: `/office/projects/${projectId}?tab=documents`, label: 'Projekt dokumentacio' },
        { href: `/office/projects/${projectId}?tab=tasks`, label: 'Projekt teendok' },
      ]}
    >
      {error ? (
        <InlineNotice tone="error" text={error} />
      ) : notice ? (
        <InlineNotice tone="success" text={notice} />
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <WorkflowStat label="Munkafazis tipusa" value={workflowTemplateLabel[workflow.template]} note={workflowStatusLabel[workflow.status]} />
        <WorkflowStat label="Kapcsolodo muszaki adatok" value={`${relevantParameters.length}/${relevantFields.length}`} note="kitoltott parameter" />
        <WorkflowStat label="Munkafazis dokumentumok" value={String(workflow.documents.length)} note="kozvetlenul ide kotve" />
        <WorkflowStat label="Nyitott dontesek" value={String(openDecisionTasks.length)} note="megrendeloi valaszra var" />
        <WorkflowStat label="Hianyzo kotelezo dokumentum" value={String(missingRequiredDocuments)} note="munkafazis checklistarol" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Munkafazis allapota">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Projekt" value={workflow.project.name} />
              <InfoRow label="Tipus" value={workflowTemplateLabel[workflow.template]} />
              <InfoRow label="Statusz" value={workflowStatusLabel[workflow.status]} />
              <InfoRow label="Letrehozva" value={formatDateTime(workflow.createdAt)} />
              <InfoRow label="Kivitelezo ceg" value={workflow.contractorCompany || workflow.contractorMember?.name || 'Nincs megadva'} />
              <InfoRow label="Kapcsolattarto" value={workflow.contractorMember?.name || workflow.contractorName || workflow.contractorPhone || workflow.contractorEmail || 'Nincs megadva'} />
            </div>
            {workflow.customerSelections ? (
              <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                <div className="font-medium">Megrendeloi dontesek es valasztasok</div>
                <p className="mt-2">{workflow.customerSelections}</p>
              </div>
            ) : null}
            {workflow.specificationNotes ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <div className="font-medium text-slate-900">Kivitelezesi megjegyzesek</div>
                <p className="mt-2">{workflow.specificationNotes}</p>
              </div>
            ) : null}
          </Panel>

          <Panel title="Muszaki osszesito">
            {activeSummary ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold tracking-tight text-slate-900">{activeSummary.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{activeSummary.completion} parameter rogzitve ehhez a munkacsomaghoz</div>
                  </div>
                  <Badge tone={activeSummary.ready ? 'green' : 'amber'}>
                    {activeSummary.ready ? 'Elokeszitett' : 'Hianyos'}
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {relevantParameters.length ? relevantParameters.map(({ field, value }) => (
                    <div key={field.paramKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{field.groupLabel}</div>
                      <div className="mt-2 font-medium text-slate-900">{field.label}</div>
                      <div className="mt-2 text-sm text-slate-600">{value ? formatTechnicalValue(value) : 'Nincs megadva'}</div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Ehhez a munkafazishoz meg nincsenek relevans muszaki adatok rogzitve a projektben.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Ehhez a munkafazis-tipushoz meg nincs automatikus osszesito definialva.
              </div>
            )}
          </Panel>

          <Panel title="Kapcsolodo dokumentumok">
            <div className="space-y-3">
              {workflow.documents.length ? workflow.documents.map((document) => (
                <article key={document.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{document.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{document.task?.title || 'Nincs teendohoz kotve'}</div>
                    </div>
                    <a href={document.linkUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
                      Megnyitas
                    </a>
                  </div>
                  {document.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{document.notes}</p> : null}
                  <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
                      Szerkesztes
                    </summary>
                    <form action={updateProjectDocumentAction} className="grid gap-3 border-t border-slate-200 p-4">
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="documentId" value={document.id} />
                      <input type="hidden" name="workflowId" value={workflow.id} />
                      <input type="hidden" name="scope" value="WORKFLOW" />
                      <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
                      <Field label="Dokumentum cime">
                        <Input name="title" defaultValue={document.title} required />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Checklist pont">
                          <Select name="workflowRequirementKey" defaultValue={document.workflowRequirementKey || ''}>
                            <option value="">Nincs checklist ponthoz kotve</option>
                            {documentRequirements.map((item) => (
                              <option key={item.key} value={item.key}>{item.label}</option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Kapcsolodo teendo">
                          <Select name="taskId" defaultValue={document.task?.id || ''}>
                            <option value="">Nincs teendohoz kotve</option>
                            {workflow.tasks.map((task) => (
                              <option key={task.id} value={task.id}>{task.title}</option>
                            ))}
                          </Select>
                        </Field>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Kategoria">
                          <Select name="category" defaultValue={document.category}>
                            <option value="PLAN">Terv</option>
                            <option value="PHOTO">Foto</option>
                            <option value="CONTRACT">Szerzodes</option>
                            <option value="OTHER">Egyeb</option>
                          </Select>
                        </Field>
                        <Field label="Link / eleresi ut">
                          <Input name="linkUrl" defaultValue={document.linkUrl} required />
                        </Field>
                      </div>
                      <Field label="Megjegyzes">
                        <Textarea name="notes" defaultValue={document.notes || ''} />
                      </Field>
                      <button className="btn-secondary" type="submit">Dokumentum mentese</button>
                    </form>
                  </details>
                  <form action={deleteProjectDocumentAction} className="mt-4">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="documentId" value={document.id} />
                    <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
                    <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt a dokumentumot?">
                      Dokumentum torlese
                    </ConfirmSubmitButton>
                  </form>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Ehhez a munkafazishoz meg nincs kozvetlen dokumentum hozzarendelve.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Munkafazis teendok">
            <div className="space-y-3">
              {executionTasks.length ? executionTasks.map((task) => (
                <article key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{task.assignee?.name || 'Nincs kiosztva'} | {task.dueAt ? formatDateTime(task.dueAt) : 'Nincs hatarido'}</div>
                    </div>
                    <Badge tone={task.status === 'DONE' ? 'green' : task.status === 'WAITING_APPROVAL' ? 'amber' : 'blue'}>
                      {taskStatusLabel[task.status]}
                    </Badge>
                  </div>
                  {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
                  <div className="mt-3 text-sm text-slate-600">
                    Jovahagyas: {task.approvalRequired
                      ? task.status === 'DONE' && task.approvedAt
                        ? `${task.approvedBy?.name || 'Rogzitett jovahagyas'} | ${formatDateTime(task.approvedAt)}`
                        : `${task.approvedBy?.name || 'Nincs kijelolve'} | folyamatban`
                      : 'Nem szukseges'}
                  </div>
                  <form action={updateProjectTaskStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
                    <Field label="Statusz">
                      <Select name="status" defaultValue={task.status}>
                        {Object.entries(taskStatusLabel).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </Select>
                    </Field>
                    <button className="btn-secondary" type="submit">
                      {task.approvalRequired && task.status === 'WAITING_APPROVAL' ? 'Jovahagyas rogzitese' : 'Frissites'}
                    </button>
                  </form>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Ehhez a munkafazishoz meg nincs kivitelezesi teendo rogzitve.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Megrendeloi dontesi teendok">
            <div className="space-y-4">
              {openDecisionTasks.length ? openDecisionTasks.map((task) => (
                <article key={task.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {task.assignee?.name || 'Nincs kijelolt megrendelo'} | {task.dueAt ? formatDateTime(task.dueAt) : 'Nincs hatarido'}
                      </div>
                    </div>
                    <Badge tone="amber">{taskStatusLabel[task.status]}</Badge>
                  </div>
                  {task.description ? <p className="mt-3 text-sm leading-6 text-slate-700">{task.description}</p> : null}
                  <div className="mt-3 text-sm text-slate-600">
                    Jovahagyo: {task.approvedBy?.name || 'Nincs kijelolve'}
                  </div>
                  <form action={updateProjectTaskStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
                    <Field label="Statusz">
                      <Select name="status" defaultValue={task.status}>
                        {Object.entries(taskStatusLabel).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </Select>
                    </Field>
                    <button className="btn-secondary" type="submit">
                      {task.status === 'WAITING_APPROVAL' ? 'Jovahagyas rogzitese' : 'Frissites'}
                    </button>
                  </form>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Nincs nyitott megrendeloi dontesi teendo ezen a munkafazison.
                </div>
              )}

              {completedDecisionTasks.length ? (
                <div className="pt-2">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Lezart dontesek</div>
                  <div className="space-y-3">
                    {completedDecisionTasks.map((task) => (
                      <article key={task.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{task.title}</div>
                            <div className="mt-1 text-sm text-slate-600">{task.assignee?.name || 'Nincs kijelolt megrendelo'}</div>
                          </div>
                          <Badge tone="green">Kesz</Badge>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel title="Munkafazis dokumentumchecklista">
            <div className="space-y-3">
              {requirementStatus.length ? requirementStatus.map((item) => (
                <article key={item.key} className={`rounded-2xl border p-4 ${item.documents.length ? 'border-emerald-200 bg-emerald-50' : item.required ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.label}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                    </div>
                    <Badge tone={item.documents.length ? 'green' : item.required ? 'amber' : 'slate'}>
                      {item.documents.length ? 'Megvan' : item.required ? 'Kotelezo' : 'Opcionális'}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    {item.documents.length
                      ? `${item.documents.length} dokumentum kapcsolva`
                      : 'Meg nincs dokumentum ehhez a checklist ponthoz.'}
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Ehhez a munkafazis-tipushoz meg nincs dokumentumchecklista definialva.
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Gyors allapotkezeles">
            <form action={updateProjectWorkflowStatusAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
              <Field label="Munkafazis allapota">
                <Select name="status" defaultValue={workflow.status}>
                  {Object.entries(workflowStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <button className="btn-primary" type="submit">Statusz frissitese</button>
            </form>
            <form action={deleteProjectWorkflowAction} className="mt-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}?tab=workflows`} />
              <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt a munkafazist?">
                Munkafazis torlese
              </ConfirmSubmitButton>
            </form>
          </Panel>

          <Panel title="Munkafazis adatainak szerkesztese">
            <form action={updateProjectWorkflowDetailsAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
              <Field label="Munkafazis neve">
                <Input name="name" defaultValue={workflow.name} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sablon">
                  <Select name="template" defaultValue={workflow.template}>
                    {Object.entries(workflowTemplateLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Projekt ember">
                  <Select name="contractorMemberId" defaultValue={workflow.contractorMemberId || ''}>
                    <option value="">Kulso kivitelezo adat</option>
                    {workflow.project.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Kivitelezo ceg">
                <Input name="contractorCompany" defaultValue={workflow.contractorCompany || ''} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Kapcsolattarto">
                  <Input name="contractorName" defaultValue={workflow.contractorName || ''} />
                </Field>
                <Field label="Telefon">
                  <Input name="contractorPhone" defaultValue={workflow.contractorPhone || ''} />
                </Field>
                <Field label="Email">
                  <Input type="email" name="contractorEmail" defaultValue={workflow.contractorEmail || ''} />
                </Field>
              </div>
              <Field label="Megrendeloi dontesek">
                <Textarea name="customerSelections" defaultValue={workflow.customerSelections || ''} />
              </Field>
              <Field label="Kivitelezesi megjegyzesek">
                <Textarea name="specificationNotes" defaultValue={workflow.specificationNotes || ''} />
              </Field>
              <button className="btn-primary" type="submit">Munkafazis mentese</button>
            </form>
          </Panel>

          <Panel title="Elokeszitettseg">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">Hianyzo muszaki adatok</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{missingTechnical}</div>
                <div className="mt-2 text-slate-500">ennyi relevans parameter nincs meg feltoltve ehhez a munkacsomaghoz</div>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-950">
                <div className="font-medium">Kovetkezo legjobb lepes</div>
                <p className="mt-2 leading-6">
                  Ha a muszaki osszesito hianyos, eloszor a projekt muszaki alapadatait egeszitsd ki. Utana johetnek a dokumentumok, teendok es kesobb a szerzodesinditas.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Szerzodes-elokeszites">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">Szerzodeses alap</div>
                <p className="mt-2 leading-6">
                  Projekt: {workflow.project.name}
                  <br />
                  Munkanem: {workflowTemplateLabel[workflow.template]}
                  <br />
                  Kivitelezo: {workflow.contractorMember?.name || workflow.contractorCompany || workflow.contractorName || 'Nincs megadva'}
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-950">
                <div className="font-medium">Behuzhato muszaki tartalom</div>
                <p className="mt-2 leading-6">
                  {activeSummary?.lines.length
                    ? activeSummary.lines.join(' | ')
                    : 'Meg nincs eleg muszaki parameter a szerzodeses tartalomhoz.'}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Projekt szintu forrasok">
            <div className="space-y-3">
              {planDocuments.slice(0, 5).map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{document.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{document.planChecklistType || 'Altalanos tervdokumentum'}</div>
                </div>
              ))}
              {!planDocuments.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Ehhez a projekthez meg nincs tervdokumentacios csomag feltoltve.
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel title="Uj munkafazis dokumentum">
            <form action={createProjectDocumentAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="scope" value="WORKFLOW" />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
              <Field label="Dokumentum cime">
                <Input name="title" placeholder="Pl. Homlokzati szinminta jovahagyas" required />
              </Field>
              <Field label="Checklist pont">
                <Select name="workflowRequirementKey" defaultValue="">
                  <option value="">Nincs checklist ponthoz kotve</option>
                  {documentRequirements.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kategoria">
                  <Select name="category" defaultValue="OTHER">
                    <option value="PLAN">Terv</option>
                    <option value="PHOTO">Foto</option>
                    <option value="CONTRACT">Szerzodes</option>
                    <option value="OTHER">Egyeb</option>
                  </Select>
                </Field>
                <Field label="Link / eleresi ut">
                  <Input name="linkUrl" placeholder="https://... vagy helyi eleresi ut" required />
                </Field>
              </div>
              <Field label="Megjegyzes">
                <Textarea name="notes" placeholder="Mi ez a dokumentum, mit igazol, kinek szol?" />
              </Field>
              <button className="btn-primary" type="submit">Munkafazis dokumentum rogzitese</button>
            </form>
          </Panel>

          <Panel title="Uj munkafazis teendo">
            <form action={createProjectTaskAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="type" value={ProjectTaskType.EXECUTION} />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
              <Field label="Teendo cime">
                <Input name="title" placeholder="Pl. mintafeluletek vegso ellenorzese" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Felelos">
                  <Select name="assigneeMemberId" defaultValue="">
                    <option value="">Nincs kiosztva</option>
                    {workflow.project.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Hatarido">
                  <Input type="datetime-local" name="dueAt" />
                </Field>
              </div>
              <Field label="Leiras">
                <Textarea name="description" placeholder="Mit kell megcsinalni ahhoz, hogy ez a munkafazis indithato vagy teljesitheto legyen?" />
              </Field>
              <button className="btn-primary" type="submit">Munkafazis teendo letrehozasa</button>
            </form>
          </Panel>

          <Panel title="Uj megrendeloi dontesi teendo">
            <form action={createProjectTaskAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="type" value={ProjectTaskType.CUSTOMER_DECISION} />
              <input type="hidden" name="approvalRequired" value="on" />
              <input type="hidden" name="returnTo" value={`/office/projects/${projectId}/workflows/${workflow.id}`} />
              <Field label="Dontesi pont cime">
                <Input name="title" placeholder="Pl. Homlokzati vegso szin jovahagyasa" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Erintett ember">
                  <Select name="assigneeMemberId" defaultValue="">
                    <option value="">Nincs kijelolve</option>
                    {workflow.project.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Hatarido">
                  <Input type="datetime-local" name="dueAt" />
                </Field>
              </div>
              <Field label="Mit kell eldonteni?">
                <Textarea name="description" placeholder="Pl. homlokzati szin, kapcsolocsalad, burkolat tipus vagy vegleges termekvalasztas." />
              </Field>
              <button className="btn-primary" type="submit">Dontesi teendo letrehozasa</button>
            </form>
          </Panel>
        </div>
      </section>
    </OfficeShellV2>
  );
}

function WorkflowStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{note}</div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function InlineNotice({ tone, text }: { tone: 'success' | 'error'; text: string }) {
  const classes = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-rose-200 bg-rose-50 text-rose-900';

  return (
    <section className={`rounded-[24px] border p-4 text-sm shadow-[0_14px_36px_rgba(15,23,42,0.05)] ${classes}`}>
      {text}
    </section>
  );
}
