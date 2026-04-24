import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canViewProject,
  certifiedProjectStatusLabel,
  checkpointStatusLabel,
  formatDate,
  projectCompletion,
  requirementProgress,
  workphaseStatusLabel,
} from '@/lib/construction';
import { prisma } from '@/lib/prisma';

export default async function SubprojectPage({
  params,
}: {
  params: Promise<{ id: string; subprojectId: string }>;
}) {
  const user = await requireUser();
  const { id, subprojectId } = await params;
  if (!(await canViewProject(user, id))) notFound();

  const [project, subproject] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.subproject.findUnique({
      where: { id: subprojectId },
      include: {
        certification: true,
        workgroups: {
          orderBy: { sortOrder: 'asc' },
          include: {
            workphases: {
              orderBy: { sortOrder: 'asc' },
              include: {
                uploadRequirements: { orderBy: { sortOrder: 'asc' } },
                uploads: true,
                checkpoints: { orderBy: { createdAt: 'asc' } },
                dependencies: { include: { dependsOnWorkphase: { select: { id: true, title: true, status: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!project || !subproject || subproject.certification.projectId !== project.id) notFound();

  const phases = subproject.workgroups.flatMap((workgroup) =>
    workgroup.workphases.map((phase) => ({ ...phase, workgroup })),
  );
  const checkpoints = phases.flatMap((phase) => phase.checkpoints);
  const uploads = phases.flatMap((phase) => phase.uploads);
  const missingRequirements = phases.reduce((sum, phase) => (
    sum + phase.uploadRequirements.filter((requirement) => !requirementProgress(requirement, phase.uploads).complete).length
  ), 0);

  return (
    <OfficeShellV2
      title={`${project.name} / ${subproject.name}`}
      description="Alprojekt szintu bontas: munkacsoportok, munkafazisok, dokumentacios allapot es ellenorzesi kapuk."
      userName={user.name}
      focusLabel="Alprojekt"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Alprojekt statusz" value={certifiedProjectStatusLabel[subproject.status]} note={subproject.type} />
        <StatCard label="Keszultseg" value={`${projectCompletion(phases)}%`} note={`${phases.length} munkafazis`} />
        <StatCard label="Munkacsoport" value={String(subproject.workgroups.length)} note="Sablon szerinti bontas" />
        <StatCard label="Hianyzo dokumentacio" value={String(missingRequirements)} note="Requirement szinten" />
        <StatCard label="Checkpoint" value={String(checkpoints.length)} note={`${checkpoints.filter((item) => item.status === 'APPROVED').length} megfelelt`} />
      </section>

      <Panel title="Munkacsoportok es munkafazisok">
        <div className="space-y-5">
          {subproject.workgroups.map((workgroup) => (
            <section key={workgroup.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{workgroup.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{workgroup.category} / {workgroup.workphases.length} munkafazis</p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="border-b border-slate-200 py-3 pr-4">Munkafazis</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Statusz</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Dokumentacio</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Checkpoint</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Tervezett vege</th>
                      <th className="border-b border-slate-200 py-3 pr-4">Fuggoseg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workgroup.workphases.map((phase) => {
                      const completeRequirements = phase.uploadRequirements.filter((requirement) => requirementProgress(requirement, phase.uploads).complete).length;
                      return (
                        <tr key={phase.id} className="align-top">
                          <td className="border-b border-slate-200 py-3 pr-4">
                            <Link href={`/dashboard/workphases/${phase.id}`} className="font-semibold text-slate-950 hover:text-orange-700">
                              {phase.title}
                            </Link>
                            {phase.description ? <div className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{phase.description}</div> : null}
                          </td>
                          <td className="border-b border-slate-200 py-3 pr-4">
                            <Badge tone={badgeTone(phase.status)}>{workphaseStatusLabel[phase.status]}</Badge>
                          </td>
                          <td className="border-b border-slate-200 py-3 pr-4">
                            <Badge tone={completeRequirements === phase.uploadRequirements.length ? 'green' : 'amber'}>
                              {completeRequirements}/{phase.uploadRequirements.length}
                            </Badge>
                          </td>
                          <td className="border-b border-slate-200 py-3 pr-4">
                            <div className="flex flex-wrap gap-2">
                              {phase.checkpoints.length ? phase.checkpoints.map((checkpoint) => (
                                <Badge key={checkpoint.id} tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
                              )) : <span className="text-xs text-slate-500">Nincs</span>}
                            </div>
                          </td>
                          <td className="border-b border-slate-200 py-3 pr-4 text-slate-600">{formatDate(phase.plannedEndDate)}</td>
                          <td className="border-b border-slate-200 py-3 pr-4 text-slate-600">
                            {phase.dependencies.length ? phase.dependencies.map((dependency) => dependency.dependsOnWorkphase.title).join(', ') : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </Panel>

      <Panel title="Alprojekt dokumentacios osszegzes">
        <div className="grid gap-3 lg:grid-cols-3">
          <Summary label="Feltoltesek" value={String(uploads.length)} />
          <Summary label="Nyitott checkpoint" value={String(checkpoints.filter((checkpoint) => checkpoint.status !== 'APPROVED').length)} />
          <Summary label="Megrendelo fele lathato fazis" value={String(phases.filter((phase) => phase.requiresCustomerVisibility).length)} />
        </div>
      </Panel>
    </OfficeShellV2>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
