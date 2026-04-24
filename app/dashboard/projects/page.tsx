import Link from 'next/link';
import { CertifiedProjectStatus } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { badgeTone, canCreateCertifiedProject, certifiedProjectStatusLabel, flattenWorkphases, getAccessibleProjectIds, projectCompletion } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { Field, Input, Select } from '@/components/forms';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const q = String(params?.q || '').trim();
  const status = Object.values(CertifiedProjectStatus).includes(String(params?.status || '') as CertifiedProjectStatus)
    ? String(params?.status) as CertifiedProjectStatus
    : '';
  const accessibleProjectIds = await getAccessibleProjectIds(user);
  const canCreateProject = canCreateCertifiedProject(user);

  const certifications = await prisma.projectCertification.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(accessibleProjectIds ? { projectId: { in: accessibleProjectIds } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      subprojects: { include: { workgroups: { include: { workphases: true } } } },
      closingPackages: { orderBy: { version: 'desc' }, take: 1 },
    },
  });
  const projects = await prisma.project.findMany({
    where: {
      id: { in: certifications.map((item) => item.projectId) },
      ...(q ? { OR: [{ name: { contains: q } }, { city: { contains: q } }, { customerName: { contains: q } }] } : {}),
    },
  });
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const rows = certifications.filter((item) => projectMap.has(item.projectId));

  return (
    <OfficeShellV2
      title="Minositett projektek"
      description="Keresheto projektlista munkafazis-keszultseggel, statuszokkal es gyors megnyitassal."
      userName={user.name}
      focusLabel="Projektkezeles"
      toolbar={canCreateProject ? <Link href="/dashboard/projects/new" className="btn-primary">Uj projekt</Link> : null}
      quickActions={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/checkpoints', label: 'Ellenorzesek' },
        { href: '/portal', label: 'Portal' },
      ]}
    >
      <Panel title="Szures">
        <form className="grid gap-4 md:grid-cols-[1fr_240px_auto] md:items-end">
          <Field label="Kereses">
            <Input name="q" defaultValue={q} placeholder="Projekt, varos, megrendelo..." />
          </Field>
          <Field label="Statusz">
            <Select name="status" defaultValue={status}>
              <option value="">Osszes</option>
              {Object.entries(certifiedProjectStatusLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <button className="btn-secondary" type="submit">Szures</button>
        </form>
      </Panel>

      <Panel title="Projektlista">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                {['Projekt', 'Statusz', 'Keszultseg', 'Zaro csomag', 'Muvelet'].map((header) => (
                  <th key={header} className="border-b border-slate-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((certification) => {
                const project = projectMap.get(certification.projectId)!;
                const phases = flattenWorkphases(certification);
                return (
                  <tr key={certification.id}>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="font-semibold text-slate-950">{project.name}</div>
                      <div className="mt-1 text-slate-500">{project.city || 'Nincs helyszin'} | {project.customerName || 'Nincs megrendelo'}</div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <Badge tone={badgeTone(certification.status)}>{certifiedProjectStatusLabel[certification.status]}</Badge>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <div className="font-semibold">{projectCompletion(phases)}%</div>
                      <div className="mt-1 text-slate-500">{phases.length} munkafazis</div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-slate-600">
                      {certification.closingPackages[0]?.generatedFilePath || 'Meg nincs'}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4">
                      <Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Megnyitas</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
