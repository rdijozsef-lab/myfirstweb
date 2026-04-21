import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';
import { ProjectRole, ProjectStatus, ProjectTaskPriority, ProjectTaskStatus } from '@prisma/client';
import { LogoutForm } from '@/components/office/logout-form';
import { OfficeBottomNav, OfficeSidebarNav } from '@/components/office-nav';
import { prisma } from '@/lib/prisma';

type OfficeShellV2Props = PropsWithChildren<{
  title: string;
  description: string;
  userName?: string;
  toolbar?: ReactNode;
  focusLabel?: string;
  showHero?: boolean;
  headerAside?: ReactNode;
  heroTopContent?: ReactNode;
  quickActions?: { href: string; label: string }[];
  heroQuickLinks?: {
    href: string;
    label: string;
    note: string;
    tone?: 'forest' | 'lime' | 'sky' | 'sand' | 'rose' | 'slate';
    icon?: 'home' | 'folder' | 'check' | 'calendar' | 'people' | 'pulse';
  }[];
  heroStats?: { label: string; value: string; note: string; tone?: 'green' | 'blue' }[];
  sideCallout?: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
}>;

export async function OfficeShellV2({
  title,
  description,
  children,
  userName = 'Admin',
  toolbar,
  focusLabel = 'Mai fokusz',
  showHero = false,
  headerAside,
  heroTopContent,
  quickActions = [
    { href: '/office/projects', label: 'Projektkozpont' },
    { href: '/office/tasks', label: 'Gyors feladat' },
    { href: '/office/calendar', label: 'Uj esemeny' },
  ],
  heroQuickLinks = [
    { href: '/office/projects', label: 'Projektkozpont', note: 'Aktiv projektek', tone: 'forest', icon: 'folder' },
    { href: '/office/tasks', label: 'Teendok', note: 'Mai feladatok', tone: 'lime', icon: 'check' },
    { href: '/office/calendar', label: 'Idopontok', note: 'Naptar es hataridok', tone: 'sky', icon: 'calendar' },
    { href: '/office/subcontractors', label: 'Szakipar', note: 'Kiosztott munkak', tone: 'sand', icon: 'people' },
    { href: '/office/contacts', label: 'Emberek', note: 'Ugyfelek es csapat', tone: 'rose', icon: 'people' },
    { href: '/office/leads', label: 'Erdeklodok', note: 'Bejovo megkeresesek', tone: 'slate', icon: 'pulse' },
  ],
  heroStats = [
    { label: 'Mai terheles', value: '0', note: 'A mai nyitott teendok szama', tone: 'green' },
    { label: 'Napi lefedettseg', value: '0%', note: 'A mai kritikus pontok allapota', tone: 'blue' },
  ],
  sideCallout = {
    eyebrow: 'Gyors atlepes',
    title: 'Projekt- es feladatkereses',
    description: 'Innen egy kattintassal tovabbmehetsz a projektekhez, a feladatokhoz vagy a mai naptarhoz.',
    ctaLabel: 'Projektlista',
    ctaHref: '/office/projects',
  },
}: OfficeShellV2Props) {
  const topBarStats = await getOfficeTopBarStats();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_26%),#d8e1c5]">
      <div className="flex min-h-screen w-full gap-4 border border-white/65 bg-[#f4f7f0]/88 p-3 shadow-[0_24px_90px_rgba(37,52,42,0.10)] backdrop-blur lg:p-4">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[212px] shrink-0 overflow-hidden rounded-[28px] bg-white/78 px-3 py-4 shadow-[inset_0_0_0_1px_rgba(219,227,215,0.85)] lg:grid lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-5">
          <div>
            <Link
              href="/office"
              className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-[#eef5e7] text-[#1f4f3c] shadow-[0_10px_24px_rgba(31,79,60,0.10)]"
              aria-label="MyFirstOffice"
            >
              <BrandMark />
            </Link>
          </div>

          <div className="scrollbar-hidden min-h-0 overflow-y-auto pr-1">
            <OfficeSidebarNav />
          </div>

          <div className="space-y-3">
            <div className="rounded-[22px] border border-[#e3e9e0] bg-white p-3 text-center shadow-[0_12px_30px_rgba(33,48,39,0.04)]">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#eef5e7] text-[#1f4f3c]">
                {userName.trim().slice(0, 2).toUpperCase()}
              </div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profil</div>
            </div>
            <LogoutForm />
          </div>
        </aside>

        <div className="min-w-0 flex-1 rounded-[30px] bg-white/88 p-3 shadow-[inset_0_0_0_1px_rgba(227,233,224,0.95)] sm:p-4 lg:p-5">
          <header className="sticky top-3 z-30 rounded-[28px] border border-[#e4ebe0] bg-[#f8faf6]/95 px-4 py-4 shadow-[0_10px_30px_rgba(33,48,39,0.08)] backdrop-blur sm:px-5 lg:top-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <TopBarStatLink href="/office/projects" label="Futo" count={topBarStats.activeProjects} icon="folder" tone="green" />
                <TopBarStatLink href="/office/projects?sort=priority" label="Prioritas" count={topBarStats.priorityProjects} icon="pulse" tone="amber" />
                <TopBarStatLink href="/office/tasks" label="Teendok" count={topBarStats.openTasks} icon="check" tone="blue" />
                <TopBarStatLink href="/office/projects?sort=deadline" label="Hataridok" count={topBarStats.deadlineProjects} icon="calendar" tone="sky" />
                <TopBarStatLink href="/office/subcontractors" label="Szakipar" count={topBarStats.subcontractors} icon="people" tone="rose" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex min-w-0 items-center gap-3 rounded-full border border-[#e3e9e0] bg-white px-4 py-3 text-sm text-slate-400 sm:min-w-[320px]">
                  <SearchIcon />
                  <span className="truncate">Kereses projektek, feladatok, naptar...</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <UtilityButton icon={<InboxIcon />} />
                  <UtilityButton icon={<BellIcon />} badge="3" />
                  <div className="flex items-center gap-3 rounded-full border border-[#e3e9e0] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(33,48,39,0.04)]">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f6d4b8,#d2e6cf)] text-sm font-semibold text-[#1f4f3c]">
                      {userName.trim().slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{userName}</div>
                      <div className="text-xs text-slate-500">{focusLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="mt-4 space-y-6 pb-24 lg:pb-0">
            {heroTopContent}

            {showHero ? (
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_340px]">
                <div className="relative overflow-hidden rounded-[30px] border border-[#e3e9e0] bg-[linear-gradient(135deg,#f7faf7_0%,#f1f5ee_52%,#edf2ea_100%)] p-5 shadow-[0_16px_40px_rgba(33,48,39,0.04)] sm:p-6">
                  <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(210,230,207,0.7),transparent_68%)]" />
                  <div className="absolute bottom-0 right-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(227,239,213,0.65),transparent_70%)]" />
                  <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-[520px]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">{focusLabel}</div>
                      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.4rem]">{title}</h1>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
                      {toolbar ? <div className="mt-5 flex flex-wrap gap-3">{toolbar}</div> : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px]">
                      {heroStats.slice(0, 2).map((item) => (
                        <HeroMiniCard
                          key={item.label}
                          label={item.label}
                          value={item.value}
                          note={item.note}
                          tone={item.tone || 'green'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {heroQuickLinks.slice(0, 6).map((item) => (
                      <HeroQuickLinkCard key={`${item.href}-${item.label}`} {...item} />
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[30px] border border-[#dfe7da] bg-[linear-gradient(135deg,#dff0bf_0%,#edf7dc_52%,#dbeeb7_100%)] p-5 shadow-[0_16px_40px_rgba(71,102,49,0.10)] sm:p-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b8c47]">{sideCallout.eyebrow}</div>
                  <h2 className="mt-3 text-[1.7rem] font-semibold leading-tight text-[#193020]">{sideCallout.title}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#496048]">
                    {sideCallout.description}
                  </p>
                  <div className="mt-5">
                    <Link href={sideCallout.ctaHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#17392c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,57,44,0.18)] transition hover:bg-[#122a21]">
                      {sideCallout.ctaLabel}
                    </Link>
                  </div>
                  <div className="relative mt-8 h-[132px] overflow-hidden rounded-[24px] border border-white/50 bg-white/26">
                    <div className="absolute -right-2 bottom-[-72px] h-48 w-48 rounded-full border border-[#7ea763]/60" />
                    <div className="absolute right-10 bottom-[-56px] h-36 w-36 rounded-full border border-[#7ea763]/50" />
                    <div className="absolute right-24 bottom-[-38px] h-24 w-24 rounded-full border border-[#7ea763]/45" />
                    <AvatarBubble className="left-8 top-8" initials="AG" />
                    <AvatarBubble className="right-12 top-6" initials="KP" />
                    <AvatarBubble className="right-28 top-16" initials="ES" />
                    <AvatarBubble className="right-7 bottom-14" initials="MN" />
                    <AvatarBubble className="right-36 bottom-5" initials="RA" />
                  </div>
                </div>
              </section>
            ) : (
              <section className={headerAside ? 'grid gap-4 xl:grid-cols-[minmax(0,0.96fr)_minmax(520px,1.04fr)]' : ''}>
                <div className="rounded-[28px] border border-[#e4ebe0] bg-[linear-gradient(135deg,#fbfdf9,#f4f7f0)] p-5 shadow-[0_12px_32px_rgba(33,48,39,0.04)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">{focusLabel}</div>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                    {toolbar ? <div className="flex flex-wrap gap-3">{toolbar}</div> : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="inline-flex min-h-10 items-center rounded-full border border-[#dfe7da] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-[#1f4f3c]"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {headerAside}
              </section>
            )}

            {children}
          </main>
        </div>
      </div>

      <OfficeBottomNav />
    </div>
  );
}

function UtilityButton({ icon, badge }: { icon: ReactNode; badge?: string }) {
  return (
    <button
      type="button"
      className="relative inline-flex size-11 items-center justify-center rounded-full border border-[#e3e9e0] bg-white text-slate-500 shadow-[0_10px_24px_rgba(33,48,39,0.04)] transition hover:text-[#1f4f3c]"
    >
      {badge ? (
        <span className="absolute right-0 top-0 inline-flex size-5 items-center justify-center rounded-full bg-[#17392c] text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      {icon}
    </button>
  );
}

async function getOfficeTopBarStats() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [activeProjects, priorityProjects, openTasks, deadlineProjects, subcontractors] = await Promise.all([
    prisma.project.count({
      where: { status: { not: ProjectStatus.CLOSED } },
    }),
    prisma.project.count({
      where: {
        status: { not: ProjectStatus.CLOSED },
        tasks: {
          some: {
            status: { not: ProjectTaskStatus.DONE },
            priority: { in: [ProjectTaskPriority.HIGH, ProjectTaskPriority.URGENT] },
          },
        },
      },
    }),
    prisma.projectTask.count({
      where: { status: { not: ProjectTaskStatus.DONE } },
    }),
    prisma.project.count({
      where: {
        status: { not: ProjectStatus.CLOSED },
        expectedEndDate: {
          gte: now,
          lte: nextWeek,
        },
      },
    }),
    prisma.projectMember.count({
      where: {
        role: ProjectRole.SUBCONTRACTOR,
        isActive: true,
      },
    }),
  ]);

  return { activeProjects, priorityProjects, openTasks, deadlineProjects, subcontractors };
}

function TopBarStatLink({
  href,
  label,
  count,
  icon,
  tone,
}: {
  href: string;
  label: string;
  count: number | string;
  icon: 'folder' | 'pulse' | 'check' | 'calendar' | 'people';
  tone: 'green' | 'amber' | 'blue' | 'sky' | 'rose';
}) {
  const tones = {
    green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    sky: 'border-sky-100 bg-sky-50 text-sky-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <Link
      href={href}
      title={label}
      className="group inline-flex min-w-[68px] flex-col items-center gap-1 text-center text-[11px] font-semibold text-slate-500 transition hover:-translate-y-0.5 hover:text-[#1f4f3c]"
    >
      <span className="relative inline-flex size-11 items-center justify-center rounded-full border border-[#e3e9e0] bg-white text-slate-500 shadow-[0_10px_24px_rgba(33,48,39,0.04)] transition group-hover:text-[#1f4f3c] group-hover:shadow-[0_14px_30px_rgba(33,48,39,0.08)]">
        <TopBarStatIcon icon={icon} />
        <span className={`absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none shadow-sm ${tones[tone]}`}>
          {count}
        </span>
      </span>
      <span className="leading-tight">{label}</span>
    </Link>
  );
}

function TopBarStatIcon({ icon }: { icon: 'folder' | 'pulse' | 'check' | 'calendar' | 'people' }) {
  const paths = {
    folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z',
    pulse: 'M3 12h4l2.3-4.5L13 17l2.5-5H21',
    check: 'M5 12.5 9.5 17 19 7.5',
    calendar: 'M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2',
    people: 'M9 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7m7 2a3 3 0 1 0-2.8-4H13a4.8 4.8 0 0 1 .3 1.7c0 .8-.2 1.6-.5 2.3zM4 20a5 5 0 0 1 10 0zM14.5 20c0-1.5-.5-2.9-1.3-4 3 .2 5.3 1.8 5.8 4z',
  };

  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[icon]} />
    </svg>
  );
}

function HeroMiniCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: 'green' | 'blue';
}) {
  const toneClass = tone === 'green'
    ? 'bg-[linear-gradient(135deg,#e5f4ca,#d6ecae)] text-[#274628]'
    : 'bg-[linear-gradient(135deg,#dff4fb,#c6ecf7)] text-[#1d4860]';

  return (
    <div className={`rounded-[24px] border border-white/70 p-4 shadow-[0_14px_30px_rgba(33,48,39,0.05)] ${toneClass}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">{label}</div>
      <div className="mt-3 text-[2rem] font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm opacity-75">{note}</div>
      <div className="mt-4 h-1.5 rounded-full bg-white/50">
        <div className={`h-1.5 rounded-full ${tone === 'green' ? 'w-[72%] bg-[#84a948]' : 'w-[44%] bg-[#3ea8d8]'}`} />
      </div>
    </div>
  );
}

function HeroQuickLinkCard({
  href,
  label,
  note,
  tone = 'forest',
  icon = 'folder',
}: {
  href: string;
  label: string;
  note: string;
  tone?: 'forest' | 'lime' | 'sky' | 'sand' | 'rose' | 'slate';
  icon?: 'home' | 'folder' | 'check' | 'calendar' | 'people' | 'pulse';
}) {
  const iconTones = {
    forest: 'bg-[#eef5e7] text-[#5e8f36]',
    lime: 'bg-[#f3f8df] text-[#7aa43f]',
    sky: 'bg-[#e8f6fd] text-[#49addb]',
    sand: 'bg-[#fff1e5] text-[#f08d34]',
    rose: 'bg-[#fff0ec] text-[#c36b56]',
    slate: 'bg-[#f4f7f0] text-slate-500',
  };
  const accentTones = {
    forest: 'text-emerald-600',
    lime: 'text-lime-700',
    sky: 'text-sky-600',
    sand: 'text-orange-600',
    rose: 'text-rose-600',
    slate: 'text-slate-500',
  };

  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-[#e3e9e0] bg-white p-4 shadow-[0_12px_24px_rgba(33,48,39,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_36px_rgba(33,48,39,0.08)]"
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${iconTones[tone]}`}>
          <HeroQuickIcon icon={icon} />
        </span>
        <span className={`text-right text-sm font-semibold ${accentTones[tone]}`}>Megnyitas</span>
      </span>
      <span className="mt-4 block min-w-0">
        <span className="block text-sm font-semibold tracking-tight text-slate-950">{label}</span>
        <span className="mt-2 block text-xs leading-5 text-slate-500">{note}</span>
      </span>
    </Link>
  );
}

function HeroQuickIcon({ icon }: { icon: 'home' | 'folder' | 'check' | 'calendar' | 'people' | 'pulse' }) {
  const paths = {
    home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
    folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z',
    check: 'M5 12.5 9.5 17 19 7.5',
    calendar: 'M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2',
    people: 'M9 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7m7 2a3 3 0 1 0-2.8-4H13a4.8 4.8 0 0 1 .3 1.7c0 .8-.2 1.6-.5 2.3zM4 20a5 5 0 0 1 10 0zM14.5 20c0-1.5-.5-2.9-1.3-4 3 .2 5.3 1.8 5.8 4z',
    pulse: 'M3 12h4l2.3-4.5L13 17l2.5-5H21',
  };

  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[icon]} />
    </svg>
  );
}

function AvatarBubble({ initials, className }: { initials: string; className: string }) {
  return (
    <div className={`absolute flex size-10 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#f5d7bf,#c7e4d4)] text-[11px] font-semibold text-[#1f4f3c] shadow-[0_10px_24px_rgba(33,48,39,0.12)] ${className}`}>
      {initials}
    </div>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8a8 8 0 1 1 0-16Z" />
      <path d="m8 13 2.3-2.3 2.1 2.1L16 9.2" />
      <path d="M12 20V8" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5z" />
      <path d="M8 10.5h8m-8 3h5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 16.5h11l-1.4-2.1a5.6 5.6 0 0 1-.9-3.1V10a3.2 3.2 0 1 0-6.4 0v1.3a5.6 5.6 0 0 1-.9 3.1z" />
      <path d="M10 18.5a2.3 2.3 0 0 0 4 0" />
    </svg>
  );
}
