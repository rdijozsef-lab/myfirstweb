import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  canViewProject,
  flattenWorkphases,
  getCustomerProjectShell,
  requirementProgress,
  uploadTypeLabel,
} from '@/lib/construction';

export default async function PortalDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getCustomerProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();

  const phases = flattenWorkphases(certification);
  const uploads = phases.flatMap((phase) => phase.uploads.map((upload) => ({ ...upload, phase })));
  const requirements = phases.flatMap((phase) => phase.uploadRequirements.map((requirement) => ({ ...requirement, phase })));
  const completedRequirements = requirements.filter((requirement) => requirementProgress(requirement, requirement.phase.uploads).complete);

  return (
    <OfficeShellV2
      title={`${project.name} dokumentumai`}
      description="Megrendeloi dokumentumtar: csak ugyfelnek lathato bizonyitekok es kotelezo dokumentacios teljesites."
      userName={user.name}
      focusLabel="Portal dokumentumok"
      toolbar={<Link href={`/portal/projects/${project.id}`} className="btn-secondary">Vissza az attekinteshez</Link>}
      quickActions={[
        { href: `/portal/projects/${project.id}`, label: 'Attekintes' },
        { href: `/portal/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/portal/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/portal/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Dokumentum" value={String(uploads.length)} note="Ugyfelnek lathato" />
        <StatCard label="Requirement" value={`${completedRequirements.length}/${requirements.length}`} note="Lathato teljesites" />
        <StatCard label="Munkafazis" value={String(phases.length)} note="Dokumentacioval kovetve" />
      </section>

      <Panel title="Dokumentacios teljesites">
        <div className="grid gap-3 lg:grid-cols-2">
          {requirements.map((requirement) => {
            const progress = requirementProgress(requirement, requirement.phase.uploads);
            return (
              <article key={requirement.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{requirement.label}</div>
                    <div className="mt-1 text-sm text-slate-500">{requirement.phase.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{uploadTypeLabel[requirement.requiredType]} | minimum {requirement.minCount}</div>
                  </div>
                  <Badge tone={progress.complete ? 'green' : 'amber'}>{progress.count}/{requirement.minCount}</Badge>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel title="Lathato dokumentumok">
        <div className="grid gap-3 lg:grid-cols-2">
          {uploads.map((upload) => (
            <article key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{upload.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{upload.phase.subproject.name} / {upload.phase.workgroup.name} / {upload.phase.title}</div>
                </div>
                <Badge tone="green">{upload.fileType}</Badge>
              </div>
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                {upload.filePath}
              </a>
            </article>
          ))}
          {!uploads.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs ugyfelnek lathato dokumentacio.</div> : null}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
