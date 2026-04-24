import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  badgeTone,
  canViewProject,
  formatDateTime,
  getProjectShell,
  requirementProgress,
  uploadTypeLabel,
} from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

export default async function ProjectDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();

  const phases = certification.subprojects.flatMap((subproject) =>
    subproject.workgroups.flatMap((workgroup) =>
      workgroup.workphases.map((phase) => ({ ...phase, workgroup, subproject })),
    ),
  );
  const uploads = phases.flatMap((phase) => phase.uploads.map((upload) => ({ ...upload, phase })));
  const requirements = phases.flatMap((phase) => phase.uploadRequirements.map((requirement) => ({ ...requirement, phase })));
  const missingRequirements = requirements.filter((requirement) => !requirementProgress(requirement, requirement.phase.uploads).complete);

  const legacyDocuments = await prisma.projectDocument.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
    include: {
      workflow: { select: { name: true } },
      task: { select: { title: true } },
    },
  });

  return (
    <OfficeShellV2
      title={`${project.name} dokumentumai`}
      description="Kotelezo dokumentacios requirementek, feltoltesek es korabbi projektdokumentumok egy helyen."
      userName={user.name}
      focusLabel="Dokumentumok"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/members`, label: 'Tagok' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Feltoltes" value={String(uploads.length)} note="Munkafazishoz kotve" />
        <StatCard label="Requirement" value={String(requirements.length)} note="Kotelezo es opcionalis elemek" />
        <StatCard label="Hianyzo" value={String(missingRequirements.length)} note="Meg nem teljesult requirement" />
      </section>

      <Panel title="Requirement teljesites">
        <div className="grid gap-3 lg:grid-cols-2">
          {requirements.map((requirement) => {
            const progress = requirementProgress(requirement, requirement.phase.uploads);
            return (
              <Link key={requirement.id} href={`/dashboard/workphases/${requirement.workphaseId}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{requirement.label}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {requirement.phase.subproject.name} / {requirement.phase.workgroup.name} / {requirement.phase.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{uploadTypeLabel[requirement.requiredType]} | minimum {requirement.minCount}</div>
                  </div>
                  <Badge tone={progress.complete ? 'green' : 'amber'}>{progress.count}/{requirement.minCount}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>

      <Panel title="Feltoltesek">
        <div className="grid gap-3 lg:grid-cols-2">
          {uploads.length ? uploads.map((upload) => (
            <article key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{upload.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{upload.phase.title} | {formatDateTime(upload.createdAt)}</div>
                </div>
                <Badge tone={upload.isRequiredEvidence ? 'green' : 'slate'}>{upload.fileType}</Badge>
              </div>
              <a href={upload.filePath} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                {upload.filePath}
              </a>
            </article>
          )) : <Empty text="Meg nincs munkafazishoz kotott feltoltes." />}
        </div>
      </Panel>

      <Panel title="Korabbi projektdokumentumok">
        <div className="grid gap-3 lg:grid-cols-2">
          {legacyDocuments.length ? legacyDocuments.map((document) => (
            <article key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{document.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {document.workflow?.name || document.task?.title || 'Altalanos'} | {formatDateTime(document.createdAt)}
                  </div>
                </div>
                <Badge tone={badgeTone(document.category)}>{document.category}</Badge>
              </div>
              <a href={document.linkUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                {document.linkUrl}
              </a>
            </article>
          )) : <Empty text="Nincs korabbi projektdokumentum." />}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">{text}</div>;
}
