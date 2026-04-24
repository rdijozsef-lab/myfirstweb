import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createContractAction, generateClosingPackageAction } from '@/app/dashboard/actions';
import { Field, Input, Select } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canManageProject,
  canViewProject,
  checkpointStatusLabel,
  closingPackageStatusLabel,
  formatDateTime,
  getProjectShell,
  projectCompletion,
  requirementProgress,
  workphaseStatusLabel,
} from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

export default async function ProjectClosingPackagePage({
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

  const phases = certification.subprojects.flatMap((subproject) =>
    subproject.workgroups.flatMap((workgroup) =>
      workgroup.workphases.map((phase) => ({ ...phase, workgroup, subproject })),
    ),
  );
  const checkpoints = phases.flatMap((phase) => phase.checkpoints.map((checkpoint) => ({ ...checkpoint, phase })));
  const requirements = phases.flatMap((phase) => phase.uploadRequirements.map((requirement) => ({ ...requirement, phase })));
  const blockingPhases = phases.filter((phase) => !['APPROVED', 'CLOSED'].includes(phase.status));
  const blockingCheckpoints = checkpoints.filter((checkpoint) => checkpoint.status !== 'APPROVED');
  const missingRequirements = requirements.filter((requirement) => !requirementProgress(requirement, requirement.phase.uploads).complete);
  const ready = blockingPhases.length === 0 && blockingCheckpoints.length === 0 && missingRequirements.length === 0;

  return (
    <OfficeShellV2
      title={`${project.name} zaro csomag`}
      description="Atadasi csomag keszultsege, blokkolo elemek es export metaadatok."
      userName={user.name}
      focusLabel="Zaro csomag"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/members`, label: 'Tagok' },
      ]}
    >
      {query?.error === 'not-ready' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          A zaro csomag meg nem generalhato, mert van nyitott munkafazis vagy checkpoint.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Keszultseg" value={`${projectCompletion(phases)}%`} note="Munkafazis allapotok alapjan" />
        <StatCard label="Blokkolo fazis" value={String(blockingPhases.length)} note="Nem approved vagy closed" />
        <StatCard label="Blokkolo checkpoint" value={String(blockingCheckpoints.length)} note="Nem approved" />
        <StatCard label="Hianyzo requirement" value={String(missingRequirements.length)} note="Dokumentacio" />
      </section>

      <Panel title="Export generalas">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge tone={ready ? 'green' : 'amber'}>{ready ? 'Generalhato' : 'Meg nem kesz'}</Badge>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Az MVP nyomtathato HTML zaro riportot general. A megnyitott riportbol a bongeszo nyomtatasi funkciojaval PDF mentheto.
            </p>
          </div>
          {canManage ? (
            <form action={generateClosingPackageAction}>
              <input type="hidden" name="certificationId" value={certification.id} />
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/closing-package`} />
              <button className="btn-primary" type="submit">Zaro csomag generalasa</button>
            </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Generalashoz projektkezelo jogosultsag kell.</div>
          )}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Blokkolo munkafazisok">
          <div className="space-y-3">
            {blockingPhases.length ? blockingPhases.map((phase) => (
              <Link key={phase.id} href={`/dashboard/workphases/${phase.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{phase.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{phase.subproject.name} / {phase.workgroup.name}</div>
                  </div>
                  <Badge tone={badgeTone(phase.status)}>{workphaseStatusLabel[phase.status]}</Badge>
                </div>
              </Link>
            )) : <Empty text="Nincs blokkolo munkafazis." />}
          </div>
        </Panel>

        <Panel title="Blokkolo checkpointok">
          <div className="space-y-3">
            {blockingCheckpoints.length ? blockingCheckpoints.map((checkpoint) => (
              <Link key={checkpoint.id} href={`/dashboard/workphases/${checkpoint.phase.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{checkpoint.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{checkpoint.phase.title}</div>
                  </div>
                  <Badge tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
                </div>
              </Link>
            )) : <Empty text="Nincs blokkolo checkpoint." />}
          </div>
        </Panel>
      </section>

      <Panel title="Generalt csomagok">
        <div className="grid gap-3 lg:grid-cols-2">
          {certification.closingPackages.length ? certification.closingPackages.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">Verzio {item.version}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatDateTime(item.generatedAt)}</div>
                </div>
                <Badge tone={badgeTone(item.status)}>{closingPackageStatusLabel[item.status]}</Badge>
              </div>
              {item.generatedFilePath ? (
                <a href={item.generatedFilePath} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                  Export megnyitasa: {item.generatedFilePath}
                </a>
              ) : (
                <div className="mt-3 break-all text-sm font-semibold text-slate-500">Nincs export utvonal</div>
              )}
              {item.summaryJson && typeof item.summaryJson === 'object' ? (
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <div>Fazisok: {String((item.summaryJson as { phaseCount?: number }).phaseCount ?? '-')}</div>
                  <div>Checkpointok: {String((item.summaryJson as { checkpointCount?: number }).checkpointCount ?? '-')}</div>
                  <div>Feltoltesek: {String((item.summaryJson as { uploadCount?: number }).uploadCount ?? '-')}</div>
                </div>
              ) : null}
            </article>
          )) : <Empty text="Meg nincs generalt zaro csomag." />}
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Szerzodes rogzitese">
          {canManage ? (
            <form action={createContractAction} className="grid gap-4">
              <input type="hidden" name="certificationId" value={certification.id} />
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/closing-package`} />
              <Field label="Szerzodes cime">
                <Input name="title" required placeholder="Kivitelezesi keretszerzodes" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipus">
                  <Input name="contractType" required placeholder="main_contractor" />
                </Field>
                <Field label="Statusz">
                  <Select name="status" defaultValue="draft">
                    <option value="draft">Piszkozat</option>
                    <option value="active">Aktiv</option>
                    <option value="signed">Alaírt</option>
                    <option value="archived">Archivalt</option>
                  </Select>
                </Field>
              </div>
              <Field label="Fajl eleresi ut vagy link">
                <Input name="filePath" placeholder="/contracts/project/keretszerzodes.pdf" />
              </Field>
              <Field label="Alairas datuma">
                <Input name="signedAt" type="date" />
              </Field>
              <button className="btn-secondary" type="submit">Szerzodes mentese</button>
            </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Szerzodes rogzitesehez projektkezelo jogosultsag kell.</div>
          )}
        </Panel>

        <Panel title="Projekt szerzodesek">
          <div className="grid gap-3 lg:grid-cols-2">
            {certification.contracts.length ? certification.contracts.map((contract) => (
              <article key={contract.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{contract.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{contract.contractType}</div>
                  </div>
                  <Badge tone={contract.status === 'signed' || contract.status === 'active' ? 'green' : 'slate'}>{contract.status}</Badge>
                </div>
                <div className="mt-3 text-sm text-slate-600">Alairas: {formatDateTime(contract.signedAt)}</div>
                {contract.filePath ? (
                  <a href={contract.filePath} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700">
                    {contract.filePath}
                  </a>
                ) : (
                  <div className="mt-3 text-sm text-slate-500">Nincs csatolt fajl</div>
                )}
              </article>
            )) : <Empty text="Meg nincs rogzitett projekt szerzodes." />}
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">{text}</div>;
}
