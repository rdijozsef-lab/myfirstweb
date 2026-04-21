import Link from 'next/link';
import { ProjectIssueStatus, ProjectStatus, ProjectTaskStatus, ProjectTaskType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Kivitelezes',
  HANDOVER: 'Atadas alatt',
  CLOSED: 'Lezart',
};

const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
};

export default async function OfficeDashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const threeDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

  const [
    activeProjects,
    dueTasks,
    openIssues,
    todayEvents,
    decisionTasks,
    activeProjectCount,
    currentConstructionCount,
    fixableIssueCount,
    pendingTaskCount,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { status: { in: [ProjectStatus.IN_PROGRESS, ProjectStatus.HANDOVER] } },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        siteLogEntries: {
          where: {
            entryDate: {
              gte: startOfDay,
              lt: nextDay,
            },
          },
          select: {
            id: true,
            entryDate: true,
          },
          take: 1,
        },
        tasks: {
          where: {
            status: { in: [ProjectTaskStatus.NEW, ProjectTaskStatus.IN_PROGRESS, ProjectTaskStatus.WAITING_APPROVAL] },
          },
          select: {
            id: true,
            type: true,
            dueAt: true,
          },
        },
        issues: {
          where: { status: { in: [ProjectIssueStatus.OPEN, ProjectIssueStatus.IN_PROGRESS] } },
          select: {
            id: true,
          },
        },
        events: {
          where: {
            startsAt: {
              gte: startOfDay,
              lt: nextDay,
            },
          },
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.projectTask.findMany({
      where: {
        status: { in: [ProjectTaskStatus.NEW, ProjectTaskStatus.IN_PROGRESS, ProjectTaskStatus.WAITING_APPROVAL] },
        dueAt: {
          gte: startOfDay,
          lt: threeDaysLater,
        },
      },
      orderBy: [{ dueAt: 'asc' }, { updatedAt: 'desc' }],
      take: 6,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
        workflow: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.projectIssue.findMany({
      where: { status: { in: [ProjectIssueStatus.OPEN, ProjectIssueStatus.IN_PROGRESS] } },
      orderBy: [{ updatedAt: 'desc' }],
      take: 6,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.projectEvent.findMany({
      where: {
        startsAt: {
          gte: startOfDay,
          lt: nextDay,
        },
      },
      orderBy: [{ startsAt: 'asc' }],
      take: 6,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.projectTask.findMany({
      where: {
        type: ProjectTaskType.CUSTOMER_DECISION,
        status: { in: [ProjectTaskStatus.NEW, ProjectTaskStatus.IN_PROGRESS, ProjectTaskStatus.WAITING_APPROVAL] },
      },
      orderBy: [{ dueAt: 'asc' }, { updatedAt: 'desc' }],
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.project.count({
      where: { status: { not: ProjectStatus.CLOSED } },
    }),
    prisma.project.count({
      where: { status: ProjectStatus.IN_PROGRESS },
    }),
    prisma.projectIssue.count({
      where: { status: { in: [ProjectIssueStatus.OPEN, ProjectIssueStatus.IN_PROGRESS] } },
    }),
    prisma.projectTask.count({
      where: { status: { in: [ProjectTaskStatus.NEW, ProjectTaskStatus.IN_PROGRESS, ProjectTaskStatus.WAITING_APPROVAL] } },
    }),
  ]);

  const projectsMissingSiteLog = activeProjects.filter((project) => project.siteLogEntries.length === 0);
  const dueTodayCount = dueTasks.filter((task) => task.dueAt && task.dueAt < nextDay).length;
  const siteLogCoverage = activeProjects.length ? Math.round(((activeProjects.length - projectsMissingSiteLog.length) / activeProjects.length) * 100) : 100;
  const openDecisionCount = decisionTasks.length;
  const openTaskCount = dueTasks.length;
  const blockedProjectCount = activeProjects.filter((project) => project.issues.length > 0).length;

  return (
    <OfficeShellV2
      title="Mai operativ attekintes"
      description="A kivitelezesi csapat napi iranyitopultja: aktiv projektek, hataridok, helyszini esemenyek, e-naplo hianyok es megrendeloi dontesek egy helyen."
      userName={user.name}
      showHero
      focusLabel="Vezerlopult"
      quickActions={[
        { href: '/office/projects', label: 'Projektkozpont' },
        { href: '/office/tasks', label: 'Feladatok' },
        { href: '/office/calendar', label: 'Naptar' },
      ]}
      heroStats={[
        { label: 'Nyitott feladat', value: String(openTaskCount), note: `${dueTodayCount} mar ma esedekes`, tone: 'green' },
        { label: 'E-naplo lefedettseg', value: `${siteLogCoverage}%`, note: 'Aktiv projektek kozul', tone: 'blue' },
      ]}
      heroTopContent={
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard label="Aktiv projektek" value={String(activeProjectCount)} note="minden nem lezart projekt" tone="green" />
          <DashboardStatCard label="Aktualis kivitelezesek" value={String(currentConstructionCount)} note="eppen kivitelezes alatt" tone="blue" />
          <DashboardStatCard label="Javitando hibak" value={String(fixableIssueCount)} note="nyitott vagy folyamatban" tone="neutral" />
          <DashboardStatCard label="Fuggoben levo teendok" value={String(pendingTaskCount)} note="meg nem lezart feladat" tone="neutral" />
        </section>
      }
      sideCallout={{
        eyebrow: 'Gyors muvelet',
        title: 'Uj projekt inditasa',
        description: 'Innen indithatod el a projekt varazslot: alapadatok, megrendelo, hataridok es kezdokeszlet egy tiszta folyamatban.',
        ctaLabel: 'Uj projekt varazslo',
        ctaHref: '/office/projects/new',
      }}
    >
      <section>
        <section className="office-card overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[1.55rem] font-semibold text-slate-950">Mai intezesi kozpont</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Nem diagram, hanem napi munkasor: mi surgos, mi blokkol, hol kell dontes, es hova kell ma odamenned.</p>
            </div>
            <div className="inline-flex rounded-full border border-[#e3e9e0] bg-[#f7faf5] p-1 text-xs font-semibold text-slate-500">
              <Link href="/office/tasks" className="rounded-full bg-white px-4 py-2 text-[#1f4f3c] shadow-[0_6px_14px_rgba(33,48,39,0.05)]">Teendok</Link>
              <Link href="/office/projects" className="px-4 py-2 transition hover:text-[#1f4f3c]">Projektkozpont</Link>
              <Link href="/office/calendar" className="px-4 py-2 transition hover:text-[#1f4f3c]">Naptar</Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <RevenueMiniCard label="Ma esedekes" value={String(dueTodayCount)} delta={`${openTaskCount} kozelgo teendo`} tone="green" />
            <RevenueMiniCard label="Hibat kell javitani" value={String(openIssues.length)} delta={`${blockedProjectCount} erintett projekt`} tone="orange" />
            <RevenueMiniCard label="Dontesre var" value={String(openDecisionCount)} delta="megrendeloi valasz kell" tone="blue" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-[28px] border border-[#e5ebe2] bg-[linear-gradient(180deg,#fbfdf9_0%,#f5f8f3_100%)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6f8a67]">Mai sorrend</div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">Eloszor ezekkel foglalkozz</h3>
                </div>
                <Link href="/office/tasks" className="btn-secondary">Osszes teendo</Link>
              </div>

              <div className="mt-4 space-y-3">
                {dueTasks.length ? dueTasks.slice(0, 3).map((task) => (
                  <DailyActionRow
                    key={task.id}
                    href={`/office/projects/${task.project.id}?tab=tasks`}
                    eyebrow={task.dueAt && task.dueAt < nextDay ? 'Ma esedekes' : '3 napon belul'}
                    title={task.title}
                    meta={`${task.project.name}${task.assignee?.name ? ` | ${task.assignee.name}` : ''}`}
                    tone="green"
                  />
                )) : null}
                {openIssues.length ? openIssues.slice(0, 2).map((issue) => (
                  <DailyActionRow
                    key={issue.id}
                    href={`/office/projects/${issue.project.id}?tab=issues`}
                    eyebrow="Javitando hiba"
                    title={issue.title}
                    meta={`${issue.project.name}${issue.task?.title ? ` | ${issue.task.title}` : ''}`}
                    tone="amber"
                  />
                )) : null}
                {!dueTasks.length && !openIssues.length ? (
                  <EmptyState text="Nincs surgos teendo vagy javitando hiba. Ez jo hir, de a mai e-naplot meg erdemes ellenorizni." />
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-[#d9ead0] bg-[#f3f8ea] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6f8a67]">Gyors rogzitest</div>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Mi tortent ma?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Ha kint voltatok helyszinen, rogzitsetek e-naplot vagy nyissatok problemat.</p>
                <div className="mt-4 grid gap-2">
                  <Link href="/office/projects" className="btn-primary">Projekt megnyitasa</Link>
                  <Link href="/office/projects/new" className="btn-secondary">Uj projekt varazslo</Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e4ebe0] bg-white p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Dontesi pontok</div>
                <div className="mt-3 text-3xl font-semibold text-slate-950">{openDecisionCount}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">Megrendeloi dontesre varo feladat.</p>
                <Link href="/office/tasks" className="mt-4 inline-flex text-sm font-semibold text-[#1f4f3c]">Dontesek atnezese</Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </OfficeShellV2>
  );
}

function DashboardStatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: 'green' | 'blue' | 'neutral';
}) {
  const iconClass = tone === 'green'
    ? 'bg-[#eef5e7] text-[#5e8f36]'
    : tone === 'blue'
      ? 'bg-[#e8f6fd] text-[#49addb]'
      : 'bg-[#f4f7f0] text-slate-500';
  const accentClass = tone === 'green'
    ? 'text-emerald-600'
    : tone === 'blue'
      ? 'text-sky-600'
      : 'text-slate-500';

  return (
    <article className="rounded-[24px] border border-[#e3e9e0] bg-white p-4 shadow-[0_12px_24px_rgba(33,48,39,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-2xl ${iconClass}`}>
          <DotIcon />
        </div>
        <div className={`text-right text-sm font-semibold ${accentClass}`}>{note}</div>
      </div>
      <div className="mt-4 text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950">{value}</div>
    </article>
  );
}

function RevenueMiniCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: 'green' | 'orange' | 'blue' }) {
  const iconClass = tone === 'green'
    ? 'bg-[#eef5e7] text-[#5e8f36]'
    : tone === 'orange'
      ? 'bg-[#fff1e5] text-[#f08d34]'
      : 'bg-[#e8f6fd] text-[#49addb]';

  return (
    <div className="rounded-[24px] border border-[#e3e9e0] bg-white p-4 shadow-[0_12px_24px_rgba(33,48,39,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-2xl ${iconClass}`}>
          <DotIcon />
        </div>
        <div className="text-sm font-semibold text-emerald-600">{delta}</div>
      </div>
      <div className="mt-4 text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-[2rem] font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function DailyActionRow({
  href,
  eyebrow,
  title,
  meta,
  tone,
}: {
  href: string;
  eyebrow: string;
  title: string;
  meta: string;
  tone: 'green' | 'amber';
}) {
  const toneClass = tone === 'green'
    ? 'border-emerald-200 bg-white hover:border-emerald-300'
    : 'border-amber-200 bg-amber-50/70 hover:border-amber-300';

  return (
    <Link href={href} className={`block rounded-[22px] border p-4 transition ${toneClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</div>
          <div className="mt-2 font-semibold text-slate-950">{title}</div>
          <div className="mt-1 text-sm text-slate-500">{meta}</div>
        </div>
        <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#1f4f3c] shadow-[0_8px_18px_rgba(33,48,39,0.06)]">
          Megnyitas
        </span>
      </div>
    </Link>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-slate-300">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function CompactInsightCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[26px] border border-[#e3e9e0] bg-white p-5 shadow-[0_16px_40px_rgba(33,48,39,0.05)]">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InsightProgress({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[#e7ede4]">
        <div className="h-2 rounded-full bg-[#84b25d]" style={{ width: `${Math.max(10, width)}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[20px] border border-[#e3e9e0] bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{note}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[22px] border border-dashed border-[#cfd9ca] bg-[#f8faf6] p-6 text-sm text-slate-500">{text}</div>;
}

function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 12h12" />
      <path d="M12 6v12" />
    </svg>
  );
}
