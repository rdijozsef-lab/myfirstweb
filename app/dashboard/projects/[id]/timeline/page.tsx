import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { canViewProject, formatDateTime, getProjectShell } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';

type TimelineItem = {
  id: string;
  at: Date;
  title: string;
  meta: string;
  tone: 'blue' | 'green' | 'amber' | 'slate';
};

export default async function ProjectTimelinePage({ params }: { params: Promise<{ id: string }> }) {
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

  const timeline: TimelineItem[] = [
    ...certification.auditLogs.map((log) => ({
      id: `audit-${log.id}`,
      at: log.createdAt,
      title: log.action,
      meta: `${log.entityType} / ${log.entityId}`,
      tone: log.customerVisible ? 'green' as const : 'slate' as const,
    })),
    ...phases.flatMap((phase) => [
      phase.actualStartDate ? {
        id: `phase-start-${phase.id}`,
        at: phase.actualStartDate,
        title: `${phase.title} elindult`,
        meta: `${phase.subproject.name} / ${phase.workgroup.name}`,
        tone: 'blue' as const,
      } : null,
      phase.actualEndDate ? {
        id: `phase-end-${phase.id}`,
        at: phase.actualEndDate,
        title: `${phase.title} lezarva`,
        meta: `${phase.subproject.name} / ${phase.workgroup.name}`,
        tone: 'green' as const,
      } : null,
      ...phase.uploads.map((upload) => ({
        id: `upload-${upload.id}`,
        at: upload.createdAt,
        title: `Feltoltes: ${upload.title}`,
        meta: phase.title,
        tone: upload.isRequiredEvidence ? 'green' as const : 'slate' as const,
      })),
      ...phase.checkpoints.map((checkpoint) => ({
        id: `checkpoint-${checkpoint.id}`,
        at: checkpoint.reviewedAt || checkpoint.updatedAt,
        title: `Checkpoint: ${checkpoint.title}`,
        meta: checkpoint.status,
        tone: checkpoint.status === 'APPROVED' ? 'green' as const : checkpoint.status === 'REJECTED' || checkpoint.status === 'REVISION_REQUIRED' ? 'amber' as const : 'blue' as const,
      })),
    ].filter(Boolean) as TimelineItem[]),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <OfficeShellV2
      title={`${project.name} idovonala`}
      description="Audit esemenyek, munkafazis inditasok, feltoltesek es checkpoint dontesek idorendben."
      userName={user.name}
      focusLabel="Idovonal"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/members`, label: 'Tagok' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <Panel title="Projekt idovonal">
        <div className="space-y-3">
          {timeline.length ? timeline.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.meta}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={item.tone}>{formatDateTime(item.at)}</Badge>
                </div>
              </div>
            </article>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs idovonal esemeny.</div>}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
