import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canViewProject,
  checkpointStatusLabel,
  flattenWorkphases,
  formatDateTime,
  getCustomerProjectShell,
  projectCompletion,
  workphaseStatusLabel,
} from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

export default async function PortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getCustomerProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();

  const phases = flattenWorkphases(certification);
  const checkpoints = phases.flatMap((phase) => phase.checkpoints);
  const visibleUploads = phases.flatMap((phase) => phase.uploads.filter((upload) => upload.isRequiredEvidence));
  const activePhase = phases.find((phase) => ['IN_PROGRESS', 'AWAITING_UPLOADS', 'AWAITING_REVIEW'].includes(phase.status));

  return (
    <OfficeShellV2
      title={project.name}
      description="Megrendeloi nezet: csak a projekt kovetesehez szukseges, ugyfelbiztos informaciok."
      userName={user.name}
      focusLabel="Megrendeloi portal"
      toolbar={<Link href="/portal" className="btn-secondary">Portal lista</Link>}
      quickActions={[
        { href: `/portal/projects/${project.id}`, label: 'Attekintes' },
        { href: `/portal/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/portal/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/portal/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Osszkeszultseg" value={`${projectCompletion(phases)}%`} note="Lathato munkafazisok alapjan" />
        <StatCard label="Munkafazis" value={String(phases.length)} note="Ugyfelnek lathato" />
        <StatCard label="Ellenorzes" value={String(checkpoints.filter((item) => item.status === 'APPROVED').length)} note="Megfelelt checkpoint" />
        <StatCard label="Dokumentum" value={String(visibleUploads.length)} note="Lathato bizonyitek" />
      </section>

      <Panel title="Aktualis allapot">
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Projekt statusz" value={certification.status} />
          <Info label="Aktualis munkafazis" value={activePhase?.title || 'Nincs aktiv munkafazis'} />
          <Info label="Utolso frissites" value={formatDateTime(certification.updatedAt)} />
        </div>
      </Panel>

      <Panel title="Merfoldkovek">
        <div className="grid gap-3 lg:grid-cols-2">
          {phases.map((phase) => (
            <div key={phase.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{phase.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{phase.subproject.name} / {phase.workgroup.name}</div>
                </div>
                <Badge tone={badgeTone(phase.status)}>{workphaseStatusLabel[phase.status]}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {phase.checkpoints.map((checkpoint) => (
                  <Badge key={checkpoint.id} tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Lathato dokumentacio">
        <div className="grid gap-3 lg:grid-cols-2">
          {visibleUploads.map((upload) => (
            <div key={upload.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-950">{upload.title}</div>
              <div className="mt-1 break-all text-sm text-slate-600">{upload.fileType} | {upload.filePath}</div>
            </div>
          ))}
          {!visibleUploads.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs ugyfelnek lathato dokumentacio.</div> : null}
        </div>
      </Panel>

      <Panel title="Zaro csomag">
        <div className="space-y-3">
          {certification.closingPackages.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-950">Verzio {item.version}</div>
              {item.generatedFilePath ? (
                <a href={item.generatedFilePath} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm font-semibold text-orange-700">
                  {item.generatedFilePath}
                </a>
              ) : (
                <div className="mt-1 text-sm text-slate-600">Generalas alatt</div>
              )}
            </div>
          ))}
          {!certification.closingPackages.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">A zaro csomag meg nem keszult el.</div> : null}
        </div>
      </Panel>

      <Panel title="Ugyfelnek lathato idovonal">
        <div className="space-y-3">
          {certification.auditLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-950">{log.action}</div>
              <div className="mt-1 text-sm text-slate-500">{formatDateTime(log.createdAt)}</div>
            </div>
          ))}
          {!certification.auditLogs.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs ugyfelnek lathato esemeny.</div> : null}
        </div>
      </Panel>
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
