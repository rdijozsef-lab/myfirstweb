import Link from 'next/link';
import { ProjectStatus, ProjectTaskStatus, ProjectWorkflowStatus } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { getAccessibleSubcontractorMembers, isPrivilegedOfficeUser, workflowTemplateLabel } from '@/lib/subcontractor';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Kivitelezes',
  HANDOVER: 'Atadas alatt',
  CLOSED: 'Lezart',
};

const workflowStatusLabel: Record<ProjectWorkflowStatus, string> = {
  PLANNED: 'Tervezett',
  ACTIVE: 'Aktiv',
  WAITING: 'Varakozik',
  DONE: 'Lezart',
};

const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
};

export default async function SubcontractorHubPage() {
  const user = await requireUser();
  const members = await getAccessibleSubcontractorMembers(user);
  const privileged = isPrivilegedOfficeUser(user);

  const workflowCount = members.reduce((sum, member) => sum + member.ownedWorkflows.length, 0);
  const taskCount = members.reduce((sum, member) => sum + member.assignedTasks.length, 0);
  const openTaskCount = members.reduce((sum, member) => sum + member.assignedTasks.filter((task) => task.status !== 'DONE').length, 0);

  return (
    <OfficeShellV2
      title="Alvallalkozoi felulet"
      description="Kulon munkafeluletek a szakipari csapatoknak: csak a hozzajuk rendelt projektreszek, feladatok, dokumentaciok es napi adminisztracio jelenik meg."
      userName={user.name}
      focusLabel={privileged ? 'Admin elonezet' : 'Sajat munkareszek'}
      quickActions={[
        { href: '/office/projects', label: 'Projektlista' },
        { href: '/office/tasks', label: 'Kozponti feladatok' },
        { href: '/office/subcontractors', label: 'Alvallalkozoi felulet' },
      ]}
      heroStats={[
        { label: 'Alvallalkozoi profilok', value: String(members.length), note: privileged ? 'Aktiv projektszereplok' : 'A hozzad kotott szerepkorok', tone: 'green' },
        { label: 'Nyitott teendok', value: String(openTaskCount), note: `${taskCount} kiosztott feladatbol`, tone: 'blue' },
      ]}
      sideCallout={{
        eyebrow: 'Mukodesi logika',
        title: privileged ? 'Admin oldalrol is atnezheto' : 'Csak a megosztott munkak latszanak',
        description: privileged
          ? 'Innen projektenkent meg tudod nyitni az alvallalkozoi nezetet, ellenorizni a dokumentaciot, a naplokat es a szakipari kapcsolodasokat.'
          : 'A rendszer csak a hozzad kotott munkafolyamatokat, feladatokat, tervlapokat es szakipari kapcsolatokat mutatja.',
        ctaLabel: members[0] ? 'Elso munkafeluletem' : 'Projektlista',
        ctaHref: members[0] ? `/office/subcontractors/${members[0].id}` : '/office/projects',
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Kiosztott workflow-k" value={String(workflowCount)} note="Osszes kapcsolt szakipari munkacsomag" />
        <StatCard label="Kiosztott feladatok" value={String(taskCount)} note="A feluleten kovethetok es indithatok" />
        <StatCard label="Nyitott teendok" value={String(openTaskCount)} note="A keszre jelentendo vagy egyeztetendo tetelek" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={privileged ? 'Aktiv alvallalkozoi profilok' : 'Sajat munkafeluleteim'}>
          <div className="space-y-4">
            {members.length ? members.map((member) => {
              const activeWorkflows = member.ownedWorkflows.filter((workflow) => workflow.status !== 'DONE').length;
              const openTasks = member.assignedTasks.filter((task) => task.status !== 'DONE').length;

              return (
                <article key={member.id} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold tracking-tight text-slate-950">{member.name}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        {member.project.name}
                        {member.project.city ? ` | ${member.project.city}` : ''}
                      </div>
                    </div>
                    <Badge tone={member.project.status === 'IN_PROGRESS' ? 'green' : member.project.status === 'HANDOVER' ? 'amber' : 'slate'}>
                      {projectStatusLabel[member.project.status]}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <MiniInfo label="Aktiv workflow" value={String(activeWorkflows)} />
                    <MiniInfo label="Nyitott feladat" value={String(openTasks)} />
                    <MiniInfo label="Dokumentum" value={String(member.ownedWorkflows.reduce((sum, workflow) => sum + workflow.documents.length, 0))} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.ownedWorkflows.slice(0, 3).map((workflow) => (
                      <span key={workflow.id} className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {workflow.name} • {workflowTemplateLabel[workflow.template]}
                      </span>
                    ))}
                    {!member.ownedWorkflows.length ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                        Meg nincs hozzarendelt workflow
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={`/office/subcontractors/${member.id}`} className="btn-primary">Munkafelulet megnyitasa</Link>
                    <Link href={`/office/projects/${member.project.id}?tab=team`} className="btn-secondary">Projektcsapat</Link>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-500">
                {privileged
                  ? 'Meg nincs aktiv alvallalkozo a projektekhez rogzitve.'
                  : 'Ehhez a fiokhoz meg nincs olyan alvallalkozoi szerepkor kotve, amelynek emailje megegyezik a bejelentkezett felhasznalo email cimevel.'}
              </div>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Mit tud ez a felulet?">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <Capability text="Csak a hozzarendelt projektreszek, munkafolyamatok es feladatok latszanak." />
              <Capability text="Az alvallalkozo sajat e-naplo bejegyzest rogzithet, fotodokumentacios linket adhat hozza es feladatot kerhet a projekt tulajdonosatol vagy mas szakipartol." />
              <Capability text="A tobbi szakipari naplo es elerhetoseg csak olvashato, igy az egyuttmukodes atlathato marad, de a masik csapat munkajaba nem lehet belenyulni." />
            </div>
          </Panel>

          <Panel title="Legfrissebb kiosztott feladatok">
            <div className="space-y-3">
              {members.flatMap((member) => member.assignedTasks).slice(0, 6).map((task) => (
                <article key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{task.project.name} | {task.workflow?.name || 'Altalanos feladat'}</div>
                    </div>
                    <Badge tone={task.status === 'DONE' ? 'green' : task.status === 'WAITING_APPROVAL' ? 'amber' : 'blue'}>
                      {taskStatusLabel[task.status]}
                    </Badge>
                  </div>
                </article>
              ))}
              {!members.some((member) => member.assignedTasks.length) ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Meg nincs kiosztott szakipari feladat.
                </div>
              ) : null}
            </div>
          </Panel>

          {privileged ? (
            <Panel title="Admin megjegyzes">
              <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                Ezen az oldalon admin/owner nezetben az osszes aktiv alvallalkozo profiljat latod. A tenyleges alvallalkozoi hozzaferes email-egyezes alapjan mukodik, ezert a meghivott felhasznalo emailjenek egyeznie kell a projektcsapatban rogzitett emaillel.
              </div>
            </Panel>
          ) : null}
        </div>
      </section>
    </OfficeShellV2>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{note}</div>
    </article>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Capability({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {text}
    </div>
  );
}
