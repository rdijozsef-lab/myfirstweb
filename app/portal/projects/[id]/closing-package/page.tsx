import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  canViewProject,
  closingPackageStatusLabel,
  flattenWorkphases,
  formatDateTime,
  getCustomerProjectShell,
  projectCompletion,
} from '@/lib/construction';

export default async function PortalClosingPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getCustomerProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();

  const phases = flattenWorkphases(certification);
  const readyPackages = certification.closingPackages;

  return (
    <OfficeShellV2
      title={`${project.name} zaro csomag`}
      description="Megrendeloi atadasi csomag: csak elkeszult, ugyfelnek kiadhato zaro dokumentacio."
      userName={user.name}
      focusLabel="Portal zaro csomag"
      toolbar={<Link href={`/portal/projects/${project.id}`} className="btn-secondary">Vissza az attekinteshez</Link>}
      quickActions={[
        { href: `/portal/projects/${project.id}`, label: 'Attekintes' },
        { href: `/portal/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/portal/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/portal/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Keszultseg" value={`${projectCompletion(phases)}%`} note="Portal munkafazisok alapjan" />
        <StatCard label="Zaro csomag" value={String(readyPackages.length)} note="Elkeszult verzio" />
        <StatCard label="Projekt statusz" value={certification.status} note="Minositett rendszerben" />
      </section>

      <Panel title="Elkeszult zaro csomagok">
        <div className="space-y-3">
          {readyPackages.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">Zaro dokumentacio - verzio {item.version}</div>
                  <div className="mt-1 text-sm text-slate-500">Generalva: {formatDateTime(item.generatedAt)}</div>
                </div>
                <Badge tone="green">{closingPackageStatusLabel[item.status]}</Badge>
              </div>
              {item.generatedFilePath ? (
                <a href={item.generatedFilePath} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  Zaro csomag megnyitasa
                </a>
              ) : null}
            </article>
          ))}
          {!readyPackages.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              A zaro csomag meg nem keszult el, vagy meg nincs ugyfelnek kiadhato verzio.
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel title="Atadasi osszefoglalo">
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Megrendelo" value={project.customerName || '-'} />
          <Info label="Helyszin" value={project.city || '-'} />
          <Info label="Utolso frissites" value={formatDateTime(certification.updatedAt)} />
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
