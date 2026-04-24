import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canViewProject,
  checkpointStatusLabel,
  flattenWorkphases,
  formatDateTime,
  getCustomerProjectShell,
  workphaseStatusLabel,
} from '@/lib/construction';

export default async function PortalTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getCustomerProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();

  const phases = flattenWorkphases(certification);
  const events = [
    ...phases.map((phase) => ({
      id: `phase-${phase.id}`,
      title: phase.title,
      subtitle: `${phase.subproject.name} / ${phase.workgroup.name}`,
      status: phase.status,
      label: workphaseStatusLabel[phase.status],
      type: 'Munkafazis',
    })),
    ...phases.flatMap((phase) => phase.checkpoints.map((checkpoint) => ({
      id: `checkpoint-${checkpoint.id}`,
      title: checkpoint.title || 'Checkpoint',
      subtitle: phase.title,
      status: checkpoint.status,
      label: checkpointStatusLabel[checkpoint.status],
      type: 'Ellenorzes',
    }))),
  ];

  return (
    <OfficeShellV2
      title={`${project.name} idovonal`}
      description="Megrendeloi idovonal: lathato munkafazisok, checkpoint eredmenyek es ugyfelnek jelolt esemenyek."
      userName={user.name}
      focusLabel="Portal idovonal"
      toolbar={<Link href={`/portal/projects/${project.id}`} className="btn-secondary">Vissza az attekinteshez</Link>}
      quickActions={[
        { href: `/portal/projects/${project.id}`, label: 'Attekintes' },
        { href: `/portal/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/portal/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/portal/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Lathato fazis" value={String(phases.length)} note="Megrendeloi portalon" />
        <StatCard label="Checkpoint" value={String(phases.flatMap((phase) => phase.checkpoints).length)} note="Ugyfelnek mutatva" />
        <StatCard label="Audit esemeny" value={String(certification.auditLogs.length)} note="Customer-visible" />
      </section>

      <Panel title="Merfoldko idovonal">
        <div className="space-y-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{event.type}</div>
                  <div className="mt-2 font-semibold text-slate-950">{event.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{event.subtitle}</div>
                </div>
                <Badge tone={badgeTone(event.status)}>{event.label}</Badge>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Ugyfelnek lathato esemenynaplo">
        <div className="space-y-3">
          {certification.auditLogs.map((log) => (
            <article key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-950">{log.action}</div>
              <div className="mt-1 text-sm text-slate-500">{formatDateTime(log.createdAt)}</div>
            </article>
          ))}
          {!certification.auditLogs.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs ugyfelnek lathato esemeny.</div> : null}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
