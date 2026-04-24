import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckpointStatus, WorkphaseStatus } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addUploadMetadataAction, addWorkphaseCommentAction, requestWorkphaseRevisionAction, updateCheckpointStatusAction, updateWorkphaseAssignmentAction, updateWorkphaseStatusAction, uploadEvidenceFileAction } from '@/app/dashboard/actions';
import { badgeTone, canApproveProject, canContributeToWorkphase, canManageProject, canViewProject, checkpointStatusLabel, formatDateTime, requirementProgress, uploadTypeLabel, workphaseStatusLabel } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';

export default async function WorkphasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const phase = await prisma.workphase.findUnique({
    where: { id },
    include: {
      uploadRequirements: { orderBy: { sortOrder: 'asc' } },
      uploads: { orderBy: { createdAt: 'desc' } },
      checkpoints: { orderBy: { createdAt: 'asc' } },
      approvals: { orderBy: { createdAt: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
      workgroup: { include: { subproject: { include: { certification: true } } } },
      dependencies: { include: { dependsOnWorkphase: true } },
    },
  });
  if (!phase) notFound();

  const certification = phase.workgroup.subproject.certification;
  if (!(await canViewProject(user, certification.projectId))) notFound();
  const canManage = await canManageProject(user, certification.projectId);
  const canContribute = await canContributeToWorkphase(user, {
    projectId: certification.projectId,
    assignedUserId: phase.assignedUserId,
    assignedCompanyId: phase.assignedCompanyId,
  });
  const canApprove = await canApproveProject(user, certification.projectId);
  const [memberLinks, companies] = await Promise.all([
    prisma.projectMemberLink.findMany({
      where: { projectId: certification.projectId, isActive: true },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
  ]);
  const memberUsers = await prisma.user.findMany({
    where: { id: { in: memberLinks.map((member) => member.userId).filter(Boolean) as string[] } },
    select: { id: true, name: true, username: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  const companyMap = new Map(companies.map((company) => [company.id, company]));
  const assignedUser = memberUsers.find((item) => item.id === phase.assignedUserId);
  const assignedCompany = phase.assignedCompanyId ? companyMap.get(phase.assignedCompanyId) : null;
  const commentAuthors = await prisma.user.findMany({
    where: { id: { in: phase.comments.map((comment) => comment.authorId).filter(Boolean) as string[] } },
    select: { id: true, name: true, username: true },
  });
  const commentAuthorMap = new Map(commentAuthors.map((author) => [author.id, author]));
  const visibleComments = phase.comments.filter((comment) => canApprove || !comment.isInternal);
  const errorText = query?.error === 'uploads'
    ? 'A munkafazis nem zarhato le, mert van hianyzo kotelezo dokumentacio.'
    : query?.error === 'checkpoint'
      ? 'A munkafazis nem zarhato le, mert van meg nem megfelelt checkpoint.'
      : query?.error === 'dependency'
        ? 'A munkafazis nem indithato, mert valamelyik elofeltetel meg nem teljesult.'
        : query?.error === 'file-too-large'
          ? 'A feltoltott fajl tul nagy. A lokalis MVP limitje 25 MB fajlonkent.'
          : query?.error === 'assignee'
            ? 'A kijelolt felelosnek aktiv projekt-hozzaferessel kell rendelkeznie.'
            : '';

  return (
    <OfficeShellV2
      title={phase.title}
      description="Munkafazis adatlap kotelezo dokumentacioval, feltoltesi metaadatokkal, checkpoint dontesekkel es audit-kompatibilis statuszvaltassal."
      userName={user.name}
      focusLabel="Munkafazis"
      toolbar={<Link href={`/dashboard/projects/${certification.projectId}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/workphases/${phase.id}`, label: 'Attekintes' },
        { href: `/dashboard/workphases/${phase.id}/uploads`, label: 'Feltoltesek' },
        { href: `/dashboard/workphases/${phase.id}/checkpoints`, label: 'Checkpointok' },
      ]}
    >
      {errorText ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{errorText}</div> : null}

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <Panel title="Statusz es felelosseg">
          <div className="space-y-4">
            <Badge tone={badgeTone(phase.status)}>{workphaseStatusLabel[phase.status]}</Badge>
            <div className="grid gap-3">
              <Info label="Munkacsoport" value={`${phase.workgroup.subproject.name} / ${phase.workgroup.name}`} />
              <Info label="Felelos ceg" value={assignedCompany?.name || 'Nincs kijelolve'} />
              <Info label="Felelos felhasznalo" value={assignedUser?.name || 'Nincs kijelolve'} />
              <Info label="Tervezett hatarido" value={formatDateTime(phase.plannedEndDate)} />
              <Info label="Ellenorzes kotelezo" value={phase.requiresInspection ? 'Igen' : 'Nem'} />
              <Info label="Portalon lathato" value={phase.requiresCustomerVisibility ? 'Igen' : 'Nem'} />
            </div>
            {canManage ? (
              <form action={updateWorkphaseAssignmentAction} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input type="hidden" name="workphaseId" value={phase.id} />
                <input type="hidden" name="projectId" value={certification.projectId} />
                <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
                <Field label="Felelos ceg">
                  <Select name="assignedCompanyId" defaultValue={phase.assignedCompanyId || ''}>
                    <option value="">Nincs kijelolve</option>
                    {memberLinks
                      .map((member) => member.companyId)
                      .filter(Boolean)
                      .filter((companyId, index, list) => list.indexOf(companyId) === index)
                      .map((companyId) => {
                        const company = companyMap.get(companyId as string);
                        return company ? <option key={company.id} value={company.id}>{company.name}</option> : null;
                      })}
                  </Select>
                </Field>
                <Field label="Felelos felhasznalo">
                  <Select name="assignedUserId" defaultValue={phase.assignedUserId || ''}>
                    <option value="">Nincs kijelolve</option>
                    {memberUsers.map((memberUser) => (
                      <option key={memberUser.id} value={memberUser.id}>
                        {memberUser.name} / {memberUser.username} / {memberUser.role}
                      </option>
                    ))}
                  </Select>
                </Field>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input name="requiresCustomerVisibility" type="checkbox" className="size-4" defaultChecked={phase.requiresCustomerVisibility} />
                  Megrendeloi portalon lathato
                </label>
                <button className="btn-secondary" type="submit">Felelosseg mentese</button>
              </form>
            ) : null}
            {canContribute ? (
              <form action={updateWorkphaseStatusAction} className="grid gap-3">
                <input type="hidden" name="workphaseId" value={phase.id} />
                <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
                <Field label="Statuszvaltas">
                  <Select name="status" defaultValue={phase.status}>
                    {Object.entries(workphaseStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <button className="btn-secondary" type="submit">Statusz mentese</button>
              </form>
            ) : (
              <p className="text-sm leading-6 text-slate-600">A statusz modositasahoz kivitelezoi vagy kezeloi jogosultsag kell.</p>
            )}
          </div>
        </Panel>

        <Panel title="Kotelezo dokumentacio">
          <div className="grid gap-3 md:grid-cols-2">
            {phase.uploadRequirements.map((requirement) => {
              const progress = requirementProgress(requirement, phase.uploads);
              return (
                <div key={requirement.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-950">{requirement.label}</div>
                      <div className="mt-1 text-sm text-slate-500">{uploadTypeLabel[requirement.requiredType]} | minimum {requirement.minCount}</div>
                    </div>
                    <Badge tone={progress.complete ? 'green' : 'amber'}>{progress.count}/{requirement.minCount}</Badge>
                  </div>
                  {progress.missing ? <div className="mt-3 text-sm text-amber-700">Hianyzik: {progress.missing} db</div> : null}
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Fajl feltoltese">
          {canContribute ? (
            <form action={uploadEvidenceFileAction} className="grid gap-4">
              <input type="hidden" name="workphaseId" value={phase.id} />
              <input type="hidden" name="projectId" value={certification.projectId} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
              <Field label="Requirement">
                <Select name="uploadRequirementId">
                  <option value="">Altalanos feltoltes</option>
                  {phase.uploadRequirements.map((requirement) => (
                    <option key={requirement.id} value={requirement.id}>{requirement.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cim">
                <Input name="title" required placeholder="Sarokpont foto 1" />
              </Field>
              <Field label="Fajl">
                <Input name="file" type="file" required accept="image/*,video/*,application/pdf" />
              </Field>
              <Field label="Leiras">
                <Textarea name="description" />
              </Field>
              <button className="btn-primary" type="submit">Fajl feltoltese</button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Fajlt feltolteni csak hozzajarulo vagy kezelo jogosultsaggal lehet.</p>
          )}
        </Panel>

        <Panel title="Feltoltes metaadat rogzitese">
          {canContribute ? <form action={addUploadMetadataAction} className="grid gap-4">
            <input type="hidden" name="workphaseId" value={phase.id} />
            <input type="hidden" name="projectId" value={certification.projectId} />
            <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
            <Field label="Requirement">
              <Select name="uploadRequirementId">
                <option value="">Altalanos feltoltes</option>
                {phase.uploadRequirements.map((requirement) => (
                  <option key={requirement.id} value={requirement.id}>{requirement.label}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cim">
                <Input name="title" required />
              </Field>
              <Field label="Tipus">
                <Select name="fileType" defaultValue="PHOTO">
                  <option value="PHOTO">Foto</option>
                  <option value="PDF">PDF</option>
                  <option value="VIDEO">Video</option>
                </Select>
              </Field>
            </div>
            <Field label="Storage utvonal vagy link">
              <Input name="filePath" required placeholder="project/phase/foto-01.jpg" />
            </Field>
            <Field label="Leiras">
              <Textarea name="description" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="isRequiredEvidence" type="checkbox" className="size-4" defaultChecked />
              Kotelezo bizonyitekkent szamoljon
            </label>
            <button className="btn-primary" type="submit">Feltoltes rogzitese</button>
          </form> : <p className="text-sm leading-6 text-slate-600">Metaadatot rogzithet a kivitelezo, ellenor vagy projektkezelo.</p>}
        </Panel>

        <Panel title="Feltoltesek">
          <div className="space-y-3">
            {phase.uploads.map((upload) => (
              <div key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-semibold text-slate-950">{upload.title}</div>
                <div className="mt-1 break-all text-sm text-slate-600">{upload.fileType} | {upload.filePath}</div>
                <div className="mt-1 text-xs text-slate-500">{formatDateTime(upload.createdAt)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Checkpointok">
        <div className="grid gap-3 lg:grid-cols-2">
          {phase.checkpoints.map((checkpoint) => (
            <form key={checkpoint.id} action={updateCheckpointStatusAction} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="checkpointId" value={checkpoint.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{checkpoint.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{checkpoint.description}</div>
                </div>
                <Badge tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
              </div>
              {canApprove ? <div className="mt-4 grid gap-3">
                <Select name="status" defaultValue={checkpoint.status}>
                  {Object.entries(checkpointStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
                <Textarea name="resultNotes" defaultValue={checkpoint.resultNotes || ''} placeholder="Ellenori megjegyzes" />
                <button className="btn-secondary" type="submit">Dontes mentese</button>
              </div> : <p className="mt-4 text-sm leading-6 text-slate-600">Checkpoint donteshez ellenori vagy jovahagyoi jogosultsag kell.</p>}
            </form>
          ))}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Komment / megjegyzes">
          {canContribute || canApprove ? (
            <form action={addWorkphaseCommentAction} className="grid gap-4">
              <input type="hidden" name="workphaseId" value={phase.id} />
              <input type="hidden" name="projectId" value={certification.projectId} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
              <Field label="Megjegyzes">
                <Textarea name="body" required placeholder="Rogzits helyszini megjegyzest, szakertoi eszrevetelt vagy kivitelezoi valaszt." />
              </Field>
              {canApprove ? (
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input name="isInternal" type="checkbox" className="size-4" />
                  Belso megjegyzes, megrendelonek nem lathato
                </label>
              ) : null}
              <button type="submit" className="btn-secondary">Komment mentese</button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Kommentet a felelos kivitelezo, ellenor vagy projektkezelo rogzithet.</p>
          )}

          {canApprove ? (
            <form action={requestWorkphaseRevisionAction} className="mt-5 grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <input type="hidden" name="workphaseId" value={phase.id} />
              <input type="hidden" name="projectId" value={certification.projectId} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}`} />
              <Field label="Hianypotlas oka">
                <Textarea name="body" required placeholder="Pontosan mi hianyzik vagy mit kell javitani?" />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-amber-950">
                <input name="notifyAssignee" type="checkbox" className="size-4" defaultChecked />
                Felelos kivitelezo ertesitese
              </label>
              <button type="submit" className="btn-secondary">Hianypotlas kerese</button>
            </form>
          ) : null}
        </Panel>

        <Panel title="Komment elozmenyek">
          <div className="space-y-3">
            {visibleComments.map((comment) => {
              const author = comment.authorId ? commentAuthorMap.get(comment.authorId) : null;
              return (
                <article key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-slate-950">{author?.name || author?.username || 'Rendszer'}</div>
                    <div className="flex items-center gap-2">
                      <Badge tone={comment.isInternal ? 'slate' : 'green'}>{comment.isInternal ? 'Belso' : 'Lathato'}</Badge>
                      <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.body}</p>
                </article>
              );
            })}
            {!visibleComments.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs komment ezen a munkafazison.</div>
            ) : null}
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
