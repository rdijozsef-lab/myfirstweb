import Link from 'next/link';
import { ProjectStatus, ProjectTaskPriority, ProjectTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, Badge } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectAction, updateProjectStatusAction } from '@/app/office/actions/core';
import { formatDate } from '@/lib/office';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Kivitelezes',
  HANDOVER: 'Atadas alatt',
  CLOSED: 'Lezart',
};

const projectSortLabel = {
  priority: 'Prioritas szerint',
  updated: 'Frissesseg szerint',
  deadline: 'Hatarido szerint',
} as const;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = (params?.q || '').trim();
  const statusFilter = Object.values(ProjectStatus).includes((params?.status || '') as ProjectStatus)
    ? (params?.status as ProjectStatus)
    : '';
  const sortMode = (params?.sort || 'priority') in projectSortLabel
    ? (params?.sort as keyof typeof projectSortLabel)
    : 'priority';
  const returnParams: string[][] = [];
  if (query) returnParams.push(['q', query]);
  if (statusFilter) returnParams.push(['status', statusFilter]);
  if (sortMode) returnParams.push(['sort', sortMode]);
  const returnTo = `/office/projects${returnParams.length ? `?${new URLSearchParams(returnParams).toString()}` : ''}`;

  const projects = await prisma.project.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { code: { contains: query } },
              { city: { contains: query } },
              { addressLine: { contains: query } },
              { customerName: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      tasks: {
        select: {
          status: true,
          priority: true,
          dueAt: true,
        },
      },
      siteLogEntries: {
        select: {
          entryDate: true,
        },
        orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
        take: 1,
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          events: true,
        },
      },
    },
  });

  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;

  const rankedProjects = projects
    .map((project) => {
      const openTasks = project.tasks.filter((task) => task.status !== ProjectTaskStatus.DONE);
      const overdueOpenTasks = openTasks.filter((task) => task.dueAt && task.dueAt.getTime() < now.getTime());
      const urgentOpenTasks = openTasks.filter((task) => task.priority === ProjectTaskPriority.URGENT).length;
      const highOpenTasks = openTasks.filter((task) => task.priority === ProjectTaskPriority.HIGH).length;
      const dueSoonTasks = openTasks.filter((task) => {
        if (!task.dueAt) return false;
        const diff = task.dueAt.getTime() - now.getTime();
        return diff >= 0 && diff <= dayMs * 3;
      }).length;
      const expectedEndDiff = project.expectedEndDate ? project.expectedEndDate.getTime() - now.getTime() : Number.POSITIVE_INFINITY;
      const handoverBoost = project.status === ProjectStatus.HANDOVER ? 8 : 0;
      const inProgressBoost = project.status === ProjectStatus.IN_PROGRESS ? 4 : 0;
      const overdueBoost = overdueOpenTasks.length * 10;
      const urgentBoost = urgentOpenTasks * 8;
      const highBoost = highOpenTasks * 4;
      const soonBoost = dueSoonTasks * 3;
      const deadlineBoost = Number.isFinite(expectedEndDiff) && expectedEndDiff <= dayMs * 7 ? 5 : 0;
      const priorityScore = handoverBoost + inProgressBoost + overdueBoost + urgentBoost + highBoost + soonBoost + deadlineBoost;

      let priorityTone: 'blue' | 'green' | 'amber' | 'slate';
      let priorityLabel: string;
      if (priorityScore >= 12) {
        priorityTone = 'amber';
        priorityLabel = 'Magas prioritas';
      } else if (priorityScore >= 5) {
        priorityTone = 'blue';
        priorityLabel = 'Kozepes prioritas';
      } else {
        priorityTone = 'green';
        priorityLabel = 'Stabil';
      }

      return {
        ...project,
        openTasks,
        overdueOpenTasks,
        priorityScore,
        priorityLabel,
        priorityTone,
      };
    })
    .sort((a, b) => {
      if (sortMode === 'updated') {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      if (sortMode === 'deadline') {
        const aTime = a.expectedEndDate?.getTime() ?? Number.POSITIVE_INFINITY;
        const bTime = b.expectedEndDate?.getTime() ?? Number.POSITIVE_INFINITY;
        return aTime - bTime;
      }
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const urgentProjects = rankedProjects.filter((project) => project.overdueOpenTasks.length > 0 || project.priorityScore >= 12).slice(0, 4);
  const deadlineProjects = rankedProjects
    .filter((project) => {
      if (!project.expectedEndDate || project.status === ProjectStatus.CLOSED) return false;
      const diff = project.expectedEndDate.getTime() - now.getTime();
      return diff >= 0 && diff <= dayMs * 7;
    })
    .slice(0, 4);

  return (
    <OfficeShellV2
      title="Projektek"
      description="Az elso builderes V1 mag: projektlista, alapadatok, statuszok es gyors letrehozas egy helyen."
      userName={user.name}
      toolbar={<Link href="/office" className="btn-secondary">Vissza a dashboardra</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: '/office/projects', label: 'Futo projektek atnezese' },
        { href: '/office/tasks', label: 'Lejaro feladatok' },
        { href: '/office/calendar', label: 'Mai helyszinek' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickStatCard label="Futo projektek" value={String(rankedProjects.filter((project) => project.status !== ProjectStatus.CLOSED).length)} note="nyitott vagy atadas alatt" />
        <QuickStatCard label="Magas prioritas" value={String(rankedProjects.filter((project) => project.priorityScore >= 12).length)} note="azonnali figyelmet ker" />
        <QuickStatCard label="Lejart feladat" value={String(rankedProjects.reduce((sum, project) => sum + project.overdueOpenTasks.length, 0))} note="projekt szinten osszesitve" />
        <QuickStatCard label="Kovetkezo hataridok" value={String(deadlineProjects.length)} note="7 napon belul zarando" />
      </section>

      {(urgentProjects.length > 0 || deadlineProjects.length > 0) ? (
        <section className="mb-6 grid gap-4 xl:grid-cols-2">
          <Panel title="Lejaro / csuszo projektek">
            <div className="space-y-3">
              {urgentProjects.length ? urgentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/office/projects/${project.id}`}
                  className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {project.overdueOpenTasks.length} lejart feladat | {project.openTasks.length} nyitott feladat
                      </div>
                    </div>
                    <Badge tone="amber">{project.priorityLabel}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    Hatarido: {formatDate(project.expectedEndDate)}
                  </div>
                </Link>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Jelenleg nincs kiemelten csuszo projekt.</div>}
            </div>
          </Panel>

          <Panel title="Kovetkezo hataridok">
            <div className="space-y-3">
              {deadlineProjects.length ? deadlineProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/office/projects/${project.id}`}
                  className="block rounded-2xl border border-blue-200 bg-blue-50 p-4 transition hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Varhato befejezes: {formatDate(project.expectedEndDate)}
                      </div>
                    </div>
                    <Badge tone="blue">{project.openTasks.length} nyitott</Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    Utolso e-naplo: {formatDate(project.siteLogEntries[0]?.entryDate || null)}
                  </div>
                </Link>
              )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">A kovetkezo 7 napban nincs kozelgo projekt-hatarido.</div>}
            </div>
          </Panel>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Projektlista">
          <form className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_220px_220px_auto] sm:items-end">
            <Field label="Kereses">
              <Input name="q" defaultValue={query} placeholder="Projekt, varos, megrendelo..." />
            </Field>
            <Field label="Statusz">
              <Select name="status" defaultValue={statusFilter}>
                <option value="">Osszes statusz</option>
                {Object.entries(projectStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Rendezes">
              <Select name="sort" defaultValue={sortMode}>
                {Object.entries(projectSortLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">Szures</button>
              {(query || statusFilter) ? <Link href="/office/projects" className="btn-secondary">Torles</Link> : null}
            </div>
          </form>

          <div className="mb-4 text-sm text-slate-500">
            {rankedProjects.length} projekt latszik{statusFilter ? ` - ${projectStatusLabel[statusFilter]}` : ''}{query ? ` - kereses: "${query}"` : ''}{sortMode ? ` - ${projectSortLabel[sortMode]}` : ''}
          </div>

          <div className="space-y-4">
            {rankedProjects.length ? rankedProjects.map((project) => (
              <article key={project.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={project.priorityTone}>{project.priorityLabel}</Badge>
                      <Badge tone={project.status === 'CLOSED' ? 'slate' : project.status === 'HANDOVER' ? 'amber' : 'blue'}>
                        {projectStatusLabel[project.status]}
                      </Badge>
                    </div>
                    <Link href={`/office/projects/${project.id}`} className="mt-3 block text-lg font-semibold text-slate-950 transition hover:text-orange-700">
                      {project.name}
                    </Link>
                    <p className="mt-2 text-sm text-slate-500">
                      {[project.city, project.addressLine].filter(Boolean).join(' - ') || 'Nincs helyszin megadva'}
                    </p>
                  </div>

                  <Link href={`/office/projects/${project.id}`} className="btn-secondary">
                    Megnyitas
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricChip label="Megrendelo" value={project.customerName || 'Nincs megadva'} note={project.customerPhone || project.customerEmail || 'Nincs elerhetoseg'} />
                  <MetricChip label="Nyitott feladat" value={String(project.openTasks.length)} note={`${project.overdueOpenTasks.length} lejart`} />
                  <MetricChip label="Projekt allapot" value={`${project._count.members} szereplo`} note={`${project._count.events} esemeny`} />
                  <MetricChip label="Kovetkezo datum" value={formatDate(project.expectedEndDate)} note={`Utolso e-naplo: ${formatDate(project.siteLogEntries[0]?.entryDate || null)}`} />
                </div>

                <form action={updateProjectStatusAction} className="mt-4 grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <Field label="Gyors statuszvaltas">
                    <Select name="status" defaultValue={project.status}>
                      {Object.entries(projectStatusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <button className="btn-secondary" type="submit">Statusz mentese</button>
                </form>
              </article>
            )) : <EmptyState text="Nincs a szuroknek megfelelo projekt." />}
          </div>
        </Panel>

        <Panel title="Uj projekt letrehozasa">
          <form action={createProjectAction} className="grid gap-4">
            <Field label="Projekt neve">
              <Input name="name" placeholder="Pl. Kovacs haz - Kecskemet" required />
            </Field>
            <Field label="Projekt kod">
              <Input name="code" placeholder="Pl. KOV-2026-01" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Varos">
                <Input name="city" placeholder="Kecskemet" />
              </Field>
              <Field label="Irsz">
                <Input name="postalCode" placeholder="6000" />
              </Field>
            </div>
            <Field label="Cim / helyszin">
              <Input name="addressLine" placeholder="Fo utca 12." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kezdes">
                <Input type="date" name="startDate" />
              </Field>
              <Field label="Varhato befejezes">
                <Input type="date" name="expectedEndDate" />
              </Field>
            </div>
            <Field label="Projekt statusz">
              <Select name="status" defaultValue={ProjectStatus.PREPARATION}>
                {Object.entries(projectStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Megrendelo neve">
              <Input name="customerName" placeholder="Kovacs Janos" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Megrendelo telefon">
                <Input name="customerPhone" placeholder="+36..." />
              </Field>
              <Field label="Megrendelo email">
                <Input type="email" name="customerEmail" placeholder="email@pelda.hu" />
              </Field>
            </div>
            <Field label="Leiras">
              <Textarea name="description" placeholder="Rovid projekt osszefoglalo, aktualis helyzet, kulonleges megjegyzesek." />
            </Field>
            <button className="btn-primary" type="submit">Projekt mentese</button>
          </form>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function QuickStatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </article>
  );
}

function MetricChip({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{note}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">{text}</div>;
}
