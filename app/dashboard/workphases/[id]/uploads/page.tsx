import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addUploadMetadataAction, uploadEvidenceFileAction } from '@/app/dashboard/actions';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canContributeToWorkphase,
  canViewProject,
  formatDateTime,
  requirementProgress,
  uploadTypeLabel,
  workphaseStatusLabel,
} from '@/lib/construction';
import { prisma } from '@/lib/prisma';

export default async function WorkphaseUploadsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const phase = await prisma.workphase.findUnique({
    where: { id },
    include: {
      uploadRequirements: { orderBy: { sortOrder: 'asc' } },
      uploads: { orderBy: { createdAt: 'desc' } },
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!phase) notFound();

  const certification = phase.workgroup.subproject.certification;
  if (!(await canViewProject(user, certification.projectId))) notFound();
  const canContribute = await canContributeToWorkphase(user, {
    projectId: certification.projectId,
    assignedUserId: phase.assignedUserId,
    assignedCompanyId: phase.assignedCompanyId,
  });

  const completeRequirements = phase.uploadRequirements.filter((requirement) => requirementProgress(requirement, phase.uploads).complete);
  const requiredUploads = phase.uploads.filter((upload) => upload.isRequiredEvidence);

  return (
    <OfficeShellV2
      title={`${phase.title} feltoltesei`}
      description="Kotelezo dokumentacios requirementek, tenyleges feltoltesek es bizonyitekok munkafazis szinten."
      userName={user.name}
      focusLabel="Feltoltesek"
      toolbar={<Link href={`/dashboard/workphases/${phase.id}`} className="btn-secondary">Vissza a munkafazishoz</Link>}
      quickActions={[
        { href: `/dashboard/workphases/${phase.id}`, label: 'Attekintes' },
        { href: `/dashboard/workphases/${phase.id}/uploads`, label: 'Feltoltesek' },
        { href: `/dashboard/workphases/${phase.id}/checkpoints`, label: 'Checkpointok' },
        { href: `/dashboard/projects/${certification.projectId}/documents`, label: 'Projekt dokumentumok' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Statusz" value={workphaseStatusLabel[phase.status]} note={`${phase.workgroup.subproject.name} / ${phase.workgroup.name}`} />
        <StatCard label="Requirement" value={`${completeRequirements.length}/${phase.uploadRequirements.length}`} note="Teljesitett kotelezo elem" />
        <StatCard label="Feltoltes" value={String(phase.uploads.length)} note="Osszes metaadat" />
        <StatCard label="Bizonyitek" value={String(requiredUploads.length)} note="Kotelezo evidence" />
      </section>

      <Panel title="Requirement teljesites">
        <div className="grid gap-3 lg:grid-cols-2">
          {phase.uploadRequirements.map((requirement) => {
            const progress = requirementProgress(requirement, phase.uploads);
            return (
              <article key={requirement.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{requirement.label}</div>
                    <div className="mt-1 text-sm text-slate-500">{uploadTypeLabel[requirement.requiredType]} | minimum {requirement.minCount}</div>
                    {requirement.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.description}</p> : null}
                  </div>
                  <Badge tone={progress.complete ? 'green' : 'amber'}>{progress.count}/{requirement.minCount}</Badge>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Fajl feltoltese">
          {canContribute ? (
            <form action={uploadEvidenceFileAction} className="grid gap-4">
              <input type="hidden" name="workphaseId" value={phase.id} />
              <input type="hidden" name="projectId" value={certification.projectId} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}/uploads`} />
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
            <p className="text-sm leading-6 text-slate-600">Fajlt csak a kijelolt felelos vagy projektkezelo tolthet fel.</p>
          )}
        </Panel>

        <Panel title="Kulső link vagy storage metaadat">
          {canContribute ? (
            <form action={addUploadMetadataAction} className="grid gap-4">
              <input type="hidden" name="workphaseId" value={phase.id} />
              <input type="hidden" name="projectId" value={certification.projectId} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}/uploads`} />
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
                <Input name="filePath" required placeholder="/uploads/projekt/foto-01.jpg" />
              </Field>
              <Field label="Leiras">
                <Textarea name="description" />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input name="isRequiredEvidence" type="checkbox" className="size-4" defaultChecked />
                Kotelezo bizonyitekkent szamoljon
              </label>
              <button className="btn-primary" type="submit">Metaadat rogzitese</button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Metaadatot csak a kijelolt felelos vagy projektkezelo rogzithet.</p>
          )}
        </Panel>
      </section>

      <Panel title="Feltoltes lista">
        <div className="grid gap-3 lg:grid-cols-2">
          {phase.uploads.map((upload) => (
            <article key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{upload.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatDateTime(upload.createdAt)}</div>
                </div>
                <Badge tone={upload.isRequiredEvidence ? 'green' : badgeTone(phase.status)}>{upload.fileType}</Badge>
              </div>
              {upload.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{upload.description}</p> : null}
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                {upload.filePath}
              </a>
            </article>
          ))}
          {!phase.uploads.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs feltoltes ezen a munkafazison.</div> : null}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
