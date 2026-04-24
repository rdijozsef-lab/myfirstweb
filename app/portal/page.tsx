import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { flattenWorkphases, getAccessibleProjectIds, projectCompletion } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';

export default async function PortalPage() {
  const user = await requireUser();
  const accessibleProjectIds = await getAccessibleProjectIds(user);
  const certifications = await prisma.projectCertification.findMany({
    where: {
      ...(accessibleProjectIds ? { projectId: { in: accessibleProjectIds } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      subprojects: {
        include: {
          workgroups: {
            include: {
              workphases: {
                where: { requiresCustomerVisibility: true },
              },
            },
          },
        },
      },
    },
  });
  const projects = await prisma.project.findMany({ where: { id: { in: certifications.map((item) => item.projectId) } } });
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return (
    <OfficeShellV2
      title="Megrendeloi portal"
      description="Egyszerusitett betekintes: keszultseg, aktualis munkafazisok, lathato dokumentacio es zaro csomag."
      userName={user.name}
      focusLabel="Portal"
      quickActions={[
        { href: '/dashboard', label: 'Admin dashboard' },
        { href: '/dashboard/projects', label: 'Projektek' },
      ]}
    >
      <Panel title="Sajat projektek">
        <div className="grid gap-3">
          {certifications.map((certification) => {
            const project = projectMap.get(certification.projectId);
            if (!project) return null;
            const phases = flattenWorkphases(certification);
            const activePhase = phases.find((phase) => ['IN_PROGRESS', 'AWAITING_UPLOADS', 'AWAITING_REVIEW'].includes(phase.status));
            return (
              <Link key={certification.id} href={`/portal/projects/${project.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{project.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Aktualis munkafazis: {activePhase?.title || 'Nincs aktiv munkafazis'}</div>
                  </div>
                  <div className="text-2xl font-semibold text-slate-950">{projectCompletion(phases)}%</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
