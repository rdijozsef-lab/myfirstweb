import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectDocumentScope, ProjectTaskStatus, ProjectTaskType, ProjectWorkflowStatus } from '@prisma/client';
import { createProjectDocumentAction, createProjectSiteLogEntryAction, createProjectTaskAction, updateProjectTaskStatusAction } from '@/app/office/actions/core';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/office';
import { prisma } from '@/lib/prisma';
import { isPrivilegedOfficeUser, workflowTemplateLabel } from '@/lib/subcontractor';
import { workflowDocumentRequirements } from '@/lib/project-technical';

const workflowStatusLabel: Record<ProjectWorkflowStatus, string> = {
  PLANNED: 'Tervezett',
  ACTIVE: 'Aktiv',
  WAITING: 'Varakozik',
  DONE: 'Lezart',
};

const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
};

export default async function SubcontractorMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ memberId: string }>;
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const user = await requireUser();
  const privileged = isPrivilegedOfficeUser(user);
  const { memberId } = await params;
  const pageParams = await searchParams;
  const notice = String(pageParams?.notice || '').trim();
  const error = String(pageParams?.error || '').trim();

  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    include: {
      project: {
        include: {
          members: {
            where: { isActive: true },
            orderBy: [{ role: 'asc' }, { name: 'asc' }],
          },
          documents: {
            orderBy: [{ createdAt: 'desc' }],
            include: {
              workflow: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          siteLogEntries: {
            orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          tasks: {
            orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
            include: {
              assignee: true,
              workflow: true,
            },
          },
        },
      },
      ownedWorkflows: {
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        include: {
          documents: {
            orderBy: [{ createdAt: 'desc' }],
          },
          tasks: {
            orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
            include: {
              assignee: true,
              approvedBy: true,
            },
          },
        },
      },
      assignedTasks: {
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          workflow: true,
        },
      },
    },
  });

  if (!member || member.role !== 'SUBCONTRACTOR') {
    notFound();
  }

  if (!privileged && member.email !== user.email) {
    notFound();
  }

  const projectOwner = member.project.members.find((item) => item.role === 'OWNER') || null;
  const otherSubcontractors = member.project.members.filter((item) => item.role === 'SUBCONTRACTOR' && item.id !== member.id);
  const planDocuments = member.project.documents.filter((document) => document.scope === ProjectDocumentScope.PLAN_PACKAGE);
  const contractorDocuments = member.project.documents.filter((document) => document.scope === ProjectDocumentScope.CONTRACTOR || document.scope === ProjectDocumentScope.FINANCIAL);
  const relevantWorkflowIds = new Set(member.ownedWorkflows.map((workflow) => workflow.id));
  const sharedWorkflowDocuments = member.project.documents.filter((document) => document.workflowId && relevantWorkflowIds.has(document.workflowId));
  const ownLogEntries = member.project.siteLogEntries.filter((entry) => entry.createdByUserId === user.id);
  const myOpenTasks = member.assignedTasks.filter((task) => task.status !== 'DONE');
  const workflowChecklist = member.ownedWorkflows.map((workflow) => {
    const requirements = workflowDocumentRequirements[workflow.template] || [];
    return {
      workflow,
      items: requirements.map((requirement) => ({
        ...requirement,
        documents: workflow.documents.filter((document) => document.workflowRequirementKey === requirement.key),
      })),
    };
  });

  return (
    <OfficeShellV2
      title={member.name}
      description="Alvallalkozoi munkafelulet: kiosztott munkafolyamatok, csak olvashato projektkozi informaciok, sajat e-naplo es dokumentacios adminisztracio."
      userName={user.name}
      focusLabel={privileged ? 'Admin elonezet' : 'Alvallalkozoi nezet'}
      quickActions={[
        { href: '/office/subcontractors', label: 'Alvallalkozoi lista' },
        { href: `/office/projects/${member.project.id}`, label: 'Projekt adatlap' },
        { href: `/office/projects/${member.project.id}?tab=documents`, label: 'Projekt dokumentumok' },
      ]}
      toolbar={(
        <>
          <Link href="/office/subcontractors" className="btn-secondary">Vissza az alvallalkozoi listahoz</Link>
          <Link href={`/office/projects/${member.project.id}?tab=team`} className="btn-secondary">Projektcsapat</Link>
        </>
      )}
      heroStats={[
        { label: 'Aktiv workflow', value: String(member.ownedWorkflows.filter((workflow) => workflow.status !== 'DONE').length), note: 'A hozzad rendelt szakipari csomagok', tone: 'green' },
        { label: 'Nyitott feladat', value: String(myOpenTasks.length), note: `${member.assignedTasks.length} kiosztott tetelbol`, tone: 'blue' },
      ]}
      sideCallout={{
        eyebrow: 'Egyuttmukodes',
        title: 'Dokumentalj es jelezz vissza folyamatosan',
        description: 'A munkanaplot, a fotodokumentaciot es a feladatkereseket ugyanitt rogzitheted. A tobbi szakipari naplo csak olvashato, hogy az elszamolas es az atadas kovetheto maradjon.',
        ctaLabel: 'Uj e-naplo',
        ctaHref: '#uj-naplo',
      }}
    >
      {error ? <InlineNotice tone="error" text={error} /> : null}
      {!error && notice ? <InlineNotice tone="success" text={notice} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Projekt" value={member.project.name} note={member.project.city || 'Telepules nincs rogzitve'} />
        <StatCard label="Workflow" value={String(member.ownedWorkflows.length)} note="Kapcsolt munkacsomagok" />
        <StatCard label="Sajat naplo" value={String(ownLogEntries.length)} note="A jelenlegi fiok altal rogzitve" />
        <StatCard label="Tervcsomag" value={String(planDocuments.length)} note="Megosztott tervdokumentum" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Panel title="Kiosztott munkafolyamatok">
            <div className="space-y-4">
              {member.ownedWorkflows.length ? member.ownedWorkflows.map((workflow) => {
                const openWorkflowTasks = workflow.tasks.filter((task) => task.status !== 'DONE');

                return (
                  <article key={workflow.id} className="rounded-[24px] border border-slate-200 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-tight text-slate-950">{workflow.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{workflowTemplateLabel[workflow.template]}</div>
                      </div>
                      <Badge tone={workflow.status === 'DONE' ? 'green' : workflow.status === 'WAITING' ? 'amber' : 'blue'}>
                        {workflowStatusLabel[workflow.status]}
                      </Badge>
                    </div>
                    {workflow.specificationNotes ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{workflow.specificationNotes}</p>
                    ) : null}
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <MiniInfo label="Nyitott feladat" value={String(openWorkflowTasks.length)} />
                      <MiniInfo label="Dokumentum" value={String(workflow.documents.length)} />
                      <MiniInfo label="Megrendeloi dontes" value={workflow.customerSelections ? 'Van' : 'Nincs'} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={`/office/projects/${member.project.id}/workflows/${workflow.id}`} className="btn-secondary">Teljes workflow adatlap</Link>
                    </div>
                  </article>
                );
              }) : (
                <EmptyState text="Ehhez az alvallalkozohoz meg nincs workflow rendelve." />
              )}
            </div>
          </Panel>

          <Panel title="Sajat feladataim">
            <div className="space-y-3">
              {member.assignedTasks.length ? member.assignedTasks.map((task) => (
                <article key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {task.workflow?.name || 'Altalanos projektfeladat'}
                        {task.dueAt ? ` | ${formatDateTime(task.dueAt)}` : ' | Nincs hatarido'}
                      </div>
                    </div>
                    <Badge tone={task.status === 'DONE' ? 'green' : task.status === 'WAITING_APPROVAL' ? 'amber' : 'blue'}>
                      {taskStatusLabel[task.status]}
                    </Badge>
                  </div>
                  {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
                  <form action={updateProjectTaskStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <input type="hidden" name="projectId" value={member.project.id} />
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="returnTo" value={`/office/subcontractors/${member.id}`} />
                    <Field label="Allapot">
                      <Select name="status" defaultValue={task.status}>
                        {Object.entries(taskStatusLabel).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </Select>
                    </Field>
                    <button className="btn-secondary" type="submit">Statusz frissitese</button>
                  </form>
                </article>
              )) : (
                <EmptyState text="Meg nincs kozvetlenul neked kiosztott feladat." />
              )}
            </div>
          </Panel>

          <Panel title="Szakipari dokumentacios checklista">
            <div className="space-y-4">
              {workflowChecklist.length ? workflowChecklist.map(({ workflow, items }) => (
                <article key={workflow.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">{workflow.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{workflowTemplateLabel[workflow.template]}</div>
                  <div className="mt-4 space-y-3">
                    {items.length ? items.map((item) => (
                      <div key={item.key} className={`rounded-2xl border p-4 ${item.documents.length ? 'border-emerald-200 bg-emerald-50' : item.required ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{item.label}</div>
                            <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                          </div>
                          <Badge tone={item.documents.length ? 'green' : item.required ? 'amber' : 'slate'}>
                            {item.documents.length ? 'Megvan' : item.required ? 'Kotelezo' : 'Opcionalis'}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                        Ehhez a workflow-hoz nincs kulon dokumentacios checklista.
                      </div>
                    )}
                  </div>
                </article>
              )) : (
                <EmptyState text="Nincs checklistazhato munkafolyamat." />
              )}
            </div>
          </Panel>

          <Panel title="Olvashato e-naplok minden csapattol">
            <div className="space-y-3">
              {member.project.siteLogEntries.length ? member.project.siteLogEntries.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-medium text-slate-900">{formatDate(entry.entryDate)}</div>
                    <div className="text-sm text-slate-500">{entry.createdBy?.name || 'Ismeretlen rogzitette'}</div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-600">{entry.completedWork}</div>
                  {entry.issues ? (
                    <div className="mt-3 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                      <div className="font-medium">Problema / akadas</div>
                      <p className="mt-2">{entry.issues}</p>
                    </div>
                  ) : null}
                </article>
              )) : (
                <EmptyState text="Meg nincs rogzitett e-naplo a projekten." />
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Kapcsolatok es egyeztetes">
            <div className="space-y-3">
              {projectOwner ? (
                <ContactCard
                  title="Projekt tulajdonosa"
                  name={projectOwner.name}
                  phone={projectOwner.phone}
                  email={projectOwner.email}
                  note={projectOwner.notes || 'A feladateszkalaciok es jovahagyasi kerdesek elsodleges cimzettje.'}
                />
              ) : null}
              {otherSubcontractors.map((item) => (
                <ContactCard
                  key={item.id}
                  title="Masik szakipar"
                  name={item.name}
                  phone={item.phone}
                  email={item.email}
                  note={item.notes || 'Csak olvashato kapcsolat; a sajat munkareszt nem szerkesztheted helyette.'}
                />
              ))}
              {!projectOwner && !otherSubcontractors.length ? (
                <EmptyState text="Meg nincs tovabbi megjelenitheto kapcsolattarto." />
              ) : null}
            </div>
          </Panel>

          <div id="uj-naplo">
            <Panel title="Sajat e-naplo bejegyzes">
              <form action={createProjectSiteLogEntryAction} className="grid gap-4">
                <input type="hidden" name="projectId" value={member.project.id} />
                <input type="hidden" name="returnTo" value={`/office/subcontractors/${member.id}`} />
                <Field label="Datum">
                  <Input type="date" name="entryDate" required />
                </Field>
                <Field label="Jelenlevok">
                  <Textarea name="attendees" defaultValue={member.name} placeholder="Pl. 3 fo komuves, darus auto, gepezetes alvallalkozo." />
                </Field>
                <Field label="Elvegzett munkak">
                  <Textarea name="completedWork" placeholder="Reszletesen ird le, mi keszult el a sajat munkafolyamatodban." required />
                </Field>
                <Field label="Problema / hiany">
                  <Textarea name="issues" placeholder="Anyaghiany, tervi kerdes, dontesi akadas, gephiba, csuszas." />
                </Field>
                <Field label="Idojaras">
                  <Input name="weather" placeholder="Pl. napos, 17 C, eros szel" />
                </Field>
                <button className="btn-primary" type="submit">Sajat naplo rogzitese</button>
              </form>
            </Panel>
          </div>

          <Panel title="Fotodokumentacio / sajat anyagfeltoltes">
            <form action={createProjectDocumentAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={member.project.id} />
              <input type="hidden" name="scope" value="CONTRACTOR" />
              <input type="hidden" name="returnTo" value={`/office/subcontractors/${member.id}`} />
              <Field label="Dokumentum cime">
                <Input name="title" placeholder="Pl. 2026-04-20 zsaluzas keszultsegi fotok" required />
              </Field>
              <Field label="Kapcsolodo workflow">
                <Select name="workflowId" defaultValue={member.ownedWorkflows[0]?.id || ''}>
                  <option value="">Nincs workflow-hoz kotve</option>
                  {member.ownedWorkflows.map((workflow) => (
                    <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Link / kepmappa elerese">
                <Input name="linkUrl" placeholder="https://... vagy helyi mappa / cloud link" required />
              </Field>
              <Field label="Megjegyzes">
                <Textarea name="notes" placeholder="Mit igazol a fotoanyag, melyik munkafazishoz tartozik, elszamolashoz relevans-e?" />
              </Field>
              <input type="hidden" name="category" value="PHOTO" />
              <button className="btn-primary" type="submit">Fotodokumentacio rogzitese</button>
            </form>
          </Panel>

          <Panel title="Feladatkeres a tulajdonosnak vagy szakiparnak">
            <form action={createProjectTaskAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={member.project.id} />
              <input type="hidden" name="type" value={ProjectTaskType.EXECUTION} />
              <input type="hidden" name="returnTo" value={`/office/subcontractors/${member.id}`} />
              <Field label="Feladat / keres cime">
                <Input name="title" placeholder="Pl. Koszoru terv pontositas szukseges" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Erintett szakipari workflow">
                  <Select name="workflowId" defaultValue={member.ownedWorkflows[0]?.id || ''}>
                    <option value="">Altalanos projektkeres</option>
                    {member.ownedWorkflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cimzett">
                  <Select name="assigneeMemberId" defaultValue={projectOwner?.id || ''}>
                    <option value="">Nincs kijelolve</option>
                    {member.project.members
                      .filter((item) => item.id !== member.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                  </Select>
                </Field>
              </div>
              <Field label="Leiras">
                <Textarea name="description" placeholder="Mit kell meghozni, leszallitani, jovahagyni vagy elokesziteni ahhoz, hogy a sajat munkad haladni tudjon?" />
              </Field>
              <Field label="Hatarido">
                <Input type="datetime-local" name="dueAt" />
              </Field>
              <button className="btn-primary" type="submit">Feladatkeres letrehozasa</button>
            </form>
          </Panel>

          <Panel title="Megosztott dokumentaciok">
            <div className="space-y-3">
              <DocumentStack title="Tervdokumentacio" documents={planDocuments} />
              <DocumentStack title="Sajat workflow dokumentumok" documents={sharedWorkflowDocuments} />
              <DocumentStack title="Kivitelezoi / elszamolasi anyagok" documents={contractorDocuments} />
            </div>
          </Panel>
        </div>
      </section>
    </OfficeShellV2>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{note}</div>
    </article>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ContactCard({
  title,
  name,
  phone,
  email,
  note,
}: {
  title: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  note: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="mt-2 font-medium text-slate-900">{name}</div>
      <div className="mt-2 text-sm text-slate-600">{phone || 'Nincs telefonszam'}</div>
      <div className="text-sm text-slate-600">{email || 'Nincs email'}</div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{note}</p>
    </article>
  );
}

function DocumentStack({
  title,
  documents,
}: {
  title: string;
  documents: Array<{
    id: string;
    title: string;
    linkUrl: string;
    notes: string | null;
    workflow?: { id: string; name: string } | null;
  }>;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-3 space-y-3">
        {documents.length ? documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{document.title}</div>
                <div className="mt-1 text-sm text-slate-500">{document.workflow?.name || 'Altalanos dokumentum'}</div>
              </div>
              <a href={document.linkUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
                Megnyitas
              </a>
            </div>
            {document.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{document.notes}</p> : null}
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            Meg nincs kapcsolt dokumentum.
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
      {text}
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
