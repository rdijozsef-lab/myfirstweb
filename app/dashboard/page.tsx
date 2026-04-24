import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getDashboardStats, formatDateTime, canCreateCertifiedProject } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, StatCard } from '@/components/office-ui';

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats();
  const canCreateProject = canCreateCertifiedProject(user);

  return (
    <OfficeShellV2
      title="Minositett kivitelezesi dashboard"
      description="Projektallapot, hianypotlasok, ellenorzesi pontok, audit es legutobbi dokumentacio egy helyen."
      userName={user.name}
      focusLabel="Kivitelezesi rendszer"
      toolbar={canCreateProject ? <Link href="/dashboard/projects/new" className="btn-primary">Uj minositett projekt</Link> : null}
      quickActions={[
        { href: '/dashboard/projects', label: 'Projektek' },
        { href: '/dashboard/checkpoints', label: 'Ellenorzesek' },
        { href: '/dashboard/notifications', label: 'Ertesitesek' },
        { href: '/dashboard/partners', label: 'Partnerek' },
        { href: '/portal', label: 'Megrendeloi portal' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Osszes projekt" value={String(stats.projects)} note="Minositett rendszerben" />
        <StatCard label="Aktiv projekt" value={String(stats.activeProjects)} note="Inditott vagy ellenorzes alatt" />
        <StatCard label="Nyitott checkpoint" value={String(stats.openCheckpoints)} note="Ellenorzesre var" />
        <StatCard label="Hianypotlas" value={String(stats.revisionWorkphases)} note="Munkafazis szinten" />
        <StatCard label="Minositett partner" value={String(stats.partners)} note="Aktiv bizalmi statusz" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Utolso audit esemenyek">
          <div className="space-y-3">
            {stats.recentAuditLogs.length ? stats.recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">{log.action}</div>
                  <div className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{log.entityType} / {log.entityId}</div>
              </div>
            )) : <Empty text="Meg nincs audit esemeny." />}
          </div>
        </Panel>

        <Panel title="Legutobbi feltoltesek">
          <div className="space-y-3">
            {stats.recentUploads.length ? stats.recentUploads.map((upload) => (
              <div key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-medium text-slate-900">{upload.title}</div>
                <div className="mt-2 text-sm text-slate-600">{upload.fileType} | {upload.filePath}</div>
                <div className="mt-2 text-xs text-slate-500">{formatDateTime(upload.createdAt)}</div>
              </div>
            )) : <Empty text="Meg nincs feltoltesi metaadat." />}
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">{text}</div>;
}
