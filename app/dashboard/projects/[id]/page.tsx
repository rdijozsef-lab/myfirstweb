import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  certifiedProjectStatusLabel,
  checkpointStatusLabel,
  flattenWorkphases,
  formatDateTime,
  getProjectShell,
  canManageProject,
  canViewProject,
  projectCompletion,
  requirementProgress,
  workphaseStatusLabel,
} from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { generateClosingPackageAction } from '@/app/dashboard/actions';

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const { project, certification } = await getProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();
  const canManage = await canManageProject(user, project.id);

  const phases = flattenWorkphases(certification);
  const checkpoints = phases.flatMap((phase) => phase.checkpoints);
  const missingRequirements = phases.reduce((sum, phase) => (
    sum + phase.uploadRequirements.filter((requirement) => !requirementProgress(requirement, phase.uploads).complete).length
  ), 0);
  const openCheckpoints = checkpoints.filter((checkpoint) => checkpoint.status !== 'APPROVED').length;

  return (
    <OfficeShellV2
      title={project.name}
      description="Projekt adatlap: alprojektek, munkafazisok, kotelezo feltoltesek, checkpointok, audit es zaro csomag."
      userName={user.name}
      focusLabel="Projekt adatlap"
      toolbar={<Link href="/dashboard/projects" className="btn-secondary">Projektlista</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        ...(canManage ? [{ href: `/dashboard/projects/${project.id}/edit`, label: 'Szerkesztes' }] : []),
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/members`, label: 'Tagok' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
        { href: `/portal/projects/${project.id}`, label: 'Portal nezet' },
      ]}
    >
      {query?.error === 'not-ready' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          A zaro csomag csak akkor generalhato, ha minden munkafazis jovahagyott vagy lezart, es minden checkpoint megfelelt.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Keszultseg" value={`${projectCompletion(phases)}%`} note={`${phases.length} munkafazis alapjan`} />
        <StatCard label="Hianyzo dokumentacio" value={String(missingRequirements)} note="Kotelezo requirement" />
        <StatCard label="Nyitott checkpoint" value={String(openCheckpoints)} note="Meg nem megfelelt" />
        <StatCard label="Feltoltesek" value={String(phases.reduce((sum, phase) => sum + phase.uploads.length, 0))} note="Metaadatban rogzitve" />
        <StatCard label="Zaro csomag" value={String(certification.closingPackages.length)} note="Generalt verzio" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Projekt alapadatok">
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Statusz" value={certifiedProjectStatusLabel[certification.status]} />
            <Info label="Helyszin" value={project.city || '-'} />
            <Info label="Megrendelo" value={project.customerName || '-'} />
            <Info label="Projekt tipus" value={certification.projectType || '-'} />
            <Info label="Brutto/netto" value={`${certification.grossArea || '-'} / ${certification.netArea || '-'} m2`} />
            <Info label="Utolso frissites" value={formatDateTime(certification.updatedAt)} />
          </div>
        </Panel>

        <Panel title="Zaro csomag gyorsmuvelet">
          {canManage ? (
            <form action={generateClosingPackageAction} className="space-y-4">
              <input type="hidden" name="certificationId" value={certification.id} />
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}`} />
              <p className="text-sm leading-6 text-slate-600">
                A rendszer ellenorzi a lezart munkafazisokat es a megfelelt checkpointokat, majd letrehoz egy export metaadatot PDF linkkel.
              </p>
              <button className="btn-secondary" type="submit">Zaro csomag generalasa</button>
            </form>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              A zaro csomag generalasa csak projektkezelo vagy admin jogosultsaggal erheto el.
            </p>
          )}
        </Panel>
      </section>

      <Panel title="Munkafazis-struktura">
        <div className="space-y-6">
          {certification.subprojects.map((subproject) => (
            <section key={subproject.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/dashboard/projects/${project.id}/subprojects/${subproject.id}`} className="text-lg font-semibold text-slate-950 hover:text-orange-700">
                  {subproject.name}
                </Link>
                <Badge tone={badgeTone(subproject.status)}>{certifiedProjectStatusLabel[subproject.status]}</Badge>
              </div>
              <div className="mt-4 space-y-4">
                {subproject.workgroups.map((workgroup) => (
                  <div key={workgroup.id}>
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{workgroup.name}</div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {workgroup.workphases.map((phase) => {
                        const complete = phase.uploadRequirements.filter((requirement) => requirementProgress(requirement, phase.uploads).complete).length;
                        return (
                          <Link key={phase.id} href={`/dashboard/workphases/${phase.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-slate-950">{phase.title}</div>
                                <div className="mt-1 text-sm text-slate-500">{complete}/{phase.uploadRequirements.length} dokumentacios requirement teljesult</div>
                              </div>
                              <Badge tone={badgeTone(phase.status)}>{workphaseStatusLabel[phase.status]}</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {phase.checkpoints.map((checkpoint) => (
                                <Badge key={checkpoint.id} tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
                              ))}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Panel>

      <Panel title="Audit idovonal">
        <div className="space-y-3">
          {certification.auditLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-medium text-slate-900">{log.action}</div>
              <div className="mt-1 text-sm text-slate-500">{log.entityType} | {formatDateTime(log.createdAt)}</div>
            </div>
          ))}
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
