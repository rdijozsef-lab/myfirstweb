import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectDocumentCategory, ProjectDocumentScope, ProjectEventType, ProjectIssueCategory, ProjectIssueStatus, ProjectPermissionLevel, ProjectPlanChecklistType, ProjectRole, ProjectStatus, ProjectTaskPriority, ProjectTaskStatus, ProjectTaskType, ProjectTechnicalSection, ProjectTechnicalValueType, ProjectWorkflowStatus, ProjectWorkflowTemplate } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { formatDate, formatDateTime } from '@/lib/office';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectDocumentAction, createProjectEventAction, createProjectIssueAction, createProjectMemberAction, createProjectSiteLogEntryAction, createProjectTaskAction, createProjectWorkflowAction, updateProjectIssueStatusAction, updateProjectMemberActivityAction, updateProjectStatusAction, updateProjectTaskStatusAction, upsertProjectTechnicalParameterAction } from '@/app/office/actions/core';
import { buildTechnicalSummaryCards, formatTechnicalValue, getTechnicalGroups, technicalFieldDefinitions, technicalSectionLabel } from '@/lib/project-technical';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Kivitelezes',
  HANDOVER: 'Atadas alatt',
  CLOSED: 'Lezart',
};

const memberRoleLabel: Record<ProjectRole, string> = {
  OWNER: 'Tulajdonos',
  CUSTOMER: 'Megrendelo',
  TECH_INSPECTOR: 'Muszaki ellenor',
  FMV: 'FMV',
  PROJECT_MANAGER: 'Projektvezeto',
  SUBCONTRACTOR: 'Alvallalkozo',
};

const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
};

const taskTypeLabel: Record<ProjectTaskType, string> = {
  EXECUTION: 'Kivitelezesi',
  CUSTOMER_DECISION: 'Megrendeloi dontes',
};

const taskPriorityLabel: Record<ProjectTaskPriority, string> = {
  LOW: 'Alacsony',
  MEDIUM: 'Normal',
  HIGH: 'Magas',
  URGENT: 'Surgos',
};

const eventTypeLabel: Record<ProjectEventType, string> = {
  MEETING: 'Megbeszeles',
  WORK_START: 'Munkakezdes',
  TASK_DEADLINE: 'Hatarido',
  HANDOVER: 'Atadas',
};

const permissionLevelLabel: Record<ProjectPermissionLevel, string> = {
  FULL: 'Teljes hozzaferes',
  MANAGE: 'Kezeles',
  CONTRIBUTE: 'Szerkesztes',
  COMMENT: 'Kommentelhet',
  VIEW_APPROVE: 'Megtekint es jovahagy',
  VIEW_ONLY: 'Csak megtekintes',
};

const issueCategoryLabel: Record<ProjectIssueCategory, string> = {
  TECHNICAL: 'Muszaki hiba',
  DELAY: 'Csuszas',
  MISSING: 'Hiany',
  DECISION: 'Dontesi problema',
};

const issueStatusLabel: Record<ProjectIssueStatus, string> = {
  OPEN: 'Nyitott',
  IN_PROGRESS: 'Folyamatban',
  RESOLVED: 'Megoldva',
};

const documentCategoryLabel: Record<ProjectDocumentCategory, string> = {
  PLAN: 'Terv',
  PHOTO: 'Foto',
  CONTRACT: 'Szerzodes',
  OTHER: 'Egyeb',
};

const documentScopeLabel: Record<ProjectDocumentScope, string> = {
  PLAN_PACKAGE: 'Tervdokumentacio',
  WORKFLOW: 'Munkafolyamat',
  CONTRACTOR: 'Kivitelezo',
  FINANCIAL: 'Penzugy',
  GENERAL: 'Altalanos',
};

const planChecklistLabel: Record<ProjectPlanChecklistType, string> = {
  ARCHITECTURAL: 'Epiteszeti terv',
  STRUCTURAL: 'Statika',
  ELECTRICAL: 'Villamos terv',
  MECHANICAL: 'Gepeszet',
  FACADE: 'Homlokzat',
  INTERIOR: 'Belso specifikacio',
  BUDGET: 'Kolteseg / kiiras',
  CONTRACT: 'Szerzodeses melleklet',
  OTHER: 'Egyeb',
};

const workflowTemplateLabel: Record<ProjectWorkflowTemplate, string> = {
  EARTHWORK: 'Foldmunka',
  MASONRY: 'Komuves munka',
  ROOFING: 'Tetoszerkezet',
  FACADE: 'Homlokzat',
  OPENINGS: 'Nyilaszarok',
  ELECTRICAL: 'Villanyszereles',
  MECHANICAL: 'Gepeszet',
  INTERIOR: 'Belso munkak',
  PAINTING: 'Festes',
  TILING: 'Burkolas',
  OTHER: 'Egyeb',
};

const workflowStatusLabel: Record<ProjectWorkflowStatus, string> = {
  PLANNED: 'Tervezett',
  ACTIVE: 'Aktiv',
  WAITING: 'Varakozik',
  DONE: 'Lezart',
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ q?: string; taskStatus?: string; taskType?: string; docQ?: string; docScope?: string; tab?: string; notice?: string; techSection?: string }>;
}) {
  const user = await requireUser();
  const { projectId } = await params;
  const taskParams = await searchParams;
  const tabValue = String(taskParams?.tab || '').trim();
  const notice = String(taskParams?.notice || '').trim();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
      },
      siteLogEntries: {
        orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
      },
      issues: {
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          task: {
            select: {
              title: true,
            },
          },
        },
      },
      documents: {
        orderBy: [{ createdAt: 'desc' }],
        include: {
          task: {
            select: {
              title: true,
            },
          },
          workflow: {
            select: {
              name: true,
            },
          },
        },
      },
      workflows: {
        orderBy: [{ createdAt: 'desc' }],
        include: {
          contractorMember: true,
          documents: {
            select: {
              id: true,
            },
          },
        },
      },
      technicalParameters: {
        orderBy: [{ section: 'asc' }, { label: 'asc' }],
      },
      tasks: {
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          assignee: true,
          approvedBy: true,
          workflow: true,
        },
      },
      events: {
        orderBy: [{ startsAt: 'asc' }],
        include: {
          task: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const openTasks = project.tasks.filter((task) => task.status !== 'DONE').length;
  const decisionTasks = project.tasks.filter((task) => task.type === 'CUSTOMER_DECISION').length;
  const activeMembers = project.members.filter((member) => member.isActive);
  const taskQuery = (taskParams?.q || '').trim().toLowerCase();
  const docQuery = (taskParams?.docQ || '').trim().toLowerCase();
  const taskStatusFilter = Object.values(ProjectTaskStatus).includes((taskParams?.taskStatus || '') as ProjectTaskStatus)
    ? (taskParams?.taskStatus as ProjectTaskStatus)
    : '';
  const taskTypeFilter = Object.values(ProjectTaskType).includes((taskParams?.taskType || '') as ProjectTaskType)
    ? (taskParams?.taskType as ProjectTaskType)
    : '';
  const docScopeFilter = Object.values(ProjectDocumentScope).includes((taskParams?.docScope || '') as ProjectDocumentScope)
    ? (taskParams?.docScope as ProjectDocumentScope)
    : '';
  const filteredTasks = project.tasks.filter((task) => {
    const matchesQuery = !taskQuery
      || task.title.toLowerCase().includes(taskQuery)
      || task.description?.toLowerCase().includes(taskQuery)
      || task.assignee?.name?.toLowerCase().includes(taskQuery);
    const matchesStatus = !taskStatusFilter || task.status === taskStatusFilter;
    const matchesType = !taskTypeFilter || task.type === taskTypeFilter;
    return matchesQuery && matchesStatus && matchesType;
  });
  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;
  const overdueTasks = filteredTasks.filter((task) => task.status !== 'DONE' && task.dueAt && task.dueAt.getTime() < now.getTime());
  const upcomingTasks = filteredTasks.filter((task) => {
    if (task.status === 'DONE' || !task.dueAt) return false;
    const diff = task.dueAt.getTime() - now.getTime();
    return diff >= 0 && diff <= dayMs * 3;
  });
  const decisionTypeTasks = filteredTasks.filter((task) => task.type === 'CUSTOMER_DECISION' && task.status !== 'DONE');
  const doneTasks = filteredTasks.filter((task) => task.status === 'DONE');
  const remainingTasks = filteredTasks.filter((task) => {
    return !overdueTasks.some((item) => item.id === task.id)
      && !upcomingTasks.some((item) => item.id === task.id)
      && !decisionTypeTasks.some((item) => item.id === task.id)
      && !doneTasks.some((item) => item.id === task.id);
  });
  const overdueEvents = project.events.filter((event) => {
    const endTime = event.endsAt?.getTime() ?? event.startsAt.getTime();
    return endTime < now.getTime();
  });
  const upcomingEvents = project.events.filter((event) => {
    const diff = event.startsAt.getTime() - now.getTime();
    return diff >= 0 && diff <= dayMs * 7;
  });
  const taskLinkedEvents = project.events.filter((event) => event.task);
  const remainingEvents = project.events.filter((event) => {
    return !overdueEvents.some((item) => item.id === event.id)
      && !upcomingEvents.some((item) => item.id === event.id)
      && !taskLinkedEvents.some((item) => item.id === event.id);
  });
  const openIssues = project.issues.filter((issue) => issue.status === 'OPEN');
  const activeIssues = project.issues.filter((issue) => issue.status === 'IN_PROGRESS');
  const resolvedIssues = project.issues.filter((issue) => issue.status === 'RESOLVED');
  const filteredDocuments = project.documents.filter((document) => {
    const matchesQuery = !docQuery
      || document.title.toLowerCase().includes(docQuery)
      || document.linkUrl.toLowerCase().includes(docQuery)
      || document.notes?.toLowerCase().includes(docQuery)
      || document.tags?.toLowerCase().includes(docQuery)
      || document.task?.title?.toLowerCase().includes(docQuery);
    const matchesScope = !docScopeFilter || document.scope === docScopeFilter;
    return matchesQuery && matchesScope;
  });
  const planDocuments = filteredDocuments.filter((document) => document.scope === 'PLAN_PACKAGE');
  const workflowDocuments = filteredDocuments.filter((document) => document.scope === 'WORKFLOW');
  const contractorDocuments = filteredDocuments.filter((document) => document.scope === 'CONTRACTOR' || document.scope === 'FINANCIAL');
  const generalDocuments = filteredDocuments.filter((document) => document.scope === 'GENERAL');
  const requiredPlanChecklist: ProjectPlanChecklistType[] = [
    'ARCHITECTURAL',
    'STRUCTURAL',
    'ELECTRICAL',
    'MECHANICAL',
    'FACADE',
    'INTERIOR',
  ];
  const completedPlanChecklist = new Set(
    project.documents
      .filter((document) => document.scope === 'PLAN_PACKAGE' && document.planChecklistType)
      .map((document) => document.planChecklistType as ProjectPlanChecklistType),
  );
  const technicalValueMap = new Map(project.technicalParameters.map((parameter) => [parameter.paramKey, parameter]));
  const documentationReady = requiredPlanChecklist.every((item) => completedPlanChecklist.has(item));
  const projectIsActive = project.status !== 'PREPARATION';
  const projectFoundationTabs = [
    { key: 'overview', label: 'Attekintes' },
    { key: 'technical', label: 'Muszaki alapadatok' },
    { key: 'documents', label: 'Dokumentacio' },
    { key: 'workflows', label: 'Munkafolyamatok' },
    { key: 'team', label: 'Szereplok' },
  ] as const;
  const projectExecutionTabs = [
    { key: 'tasks', label: 'Feladatok' },
    { key: 'calendar', label: 'Naptar' },
    { key: 'site-log', label: 'E-naplo' },
    { key: 'issues', label: 'Hibajegyek' },
  ] as const;
  const projectTabs = [...projectFoundationTabs, ...projectExecutionTabs];
  const requestedTab = projectTabs.some((tab) => tab.key === tabValue) ? tabValue : 'overview';
  const activeTab = !projectIsActive && projectExecutionTabs.some((tab) => tab.key === requestedTab) ? 'overview' : requestedTab;
  const requestedTechnicalSection = String(taskParams?.techSection || '').trim() as ProjectTechnicalSection;
  const activeTechnicalSection = Object.values(ProjectTechnicalSection).includes(requestedTechnicalSection)
    ? requestedTechnicalSection
    : ProjectTechnicalSection.BASICS;
  const technicalSectionTabs = [
    ProjectTechnicalSection.BASICS,
    ProjectTechnicalSection.STRUCTURES,
    ProjectTechnicalSection.EXTERIOR,
    ProjectTechnicalSection.INTERIOR,
    ProjectTechnicalSection.MEP,
    ProjectTechnicalSection.SUMMARIES,
    ProjectTechnicalSection.SUBCONTRACTOR_PREP,
  ];
  const tabHref = (tab: typeof projectTabs[number]['key']) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    return `/office/projects/${project.id}?${params.toString()}`;
  };
  const technicalTabHref = (section: ProjectTechnicalSection) => {
    const params = new URLSearchParams();
    params.set('tab', 'technical');
    params.set('techSection', section);
    return `/office/projects/${project.id}?${params.toString()}`;
  };
  const activeTechnicalGroups = getTechnicalGroups(activeTechnicalSection);
  const technicalCompletionCount = technicalFieldDefinitions.filter((field) => technicalValueMap.has(field.paramKey)).length;
  const technicalSummaryCards = buildTechnicalSummaryCards(project.technicalParameters, project.workflows);

  return (
    <OfficeShellV2
      title={project.name}
      description="Projekt adatlap builderes V1 szemlelettel: alapadatok, szereplok, feladatok es naptar egy helyen."
      userName={user.name}
      toolbar={<Link href="/office/projects" className="btn-secondary">Vissza a projektekhez</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: technicalTabHref(ProjectTechnicalSection.BASICS), label: 'Muszaki alapok' },
        { href: tabHref('documents'), label: 'Dokumentacio' },
        { href: tabHref(projectIsActive ? 'tasks' : 'workflows'), label: projectIsActive ? 'Feladatok' : 'Munkafolyamatok' },
      ]}
    >
      {!documentationReady ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
          A projekt meg nincs dokumentaciosan keszen az aktiv kivitelezeshez. Eloszor toltsd fel a tervdokumentacios checklistat, utana valtsd a statuszt `Kivitelezes` allapotra.
        </section>
      ) : null}

      {notice === 'docs-required' ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
          Nem lehet a projektet aktiv kivitelezesbe tenni, amíg a tervdokumentacios csomag kotelezo elemei nincsenek feltoltve.
        </section>
      ) : null}

      <section className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_14px_36px_rgba(15,23,42,0.16)]">
        <div className="space-y-4">
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">Projekt alap</div>
            <div className="flex flex-wrap gap-3">
              {projectFoundationTabs.map((tab) => (
                <ProjectTabLink
                  key={tab.key}
                  href={tabHref(tab.key)}
                  label={tab.label}
                  active={activeTab === tab.key}
                  tone="core"
                />
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Aktiv kivitelezes</div>
                <div className="mt-1 text-sm text-slate-300">
                  {projectIsActive
                    ? 'A projekt aktiv, az operativ nezetek hasznalhatok.'
                    : 'Ezek a nezetek csak akkor elnek, ha a projekt statusza aktiv.'}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${projectIsActive ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
                {projectIsActive ? 'Aktiv' : 'Zarolt'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {projectExecutionTabs.map((tab) => (
                <ProjectTabLink
                  key={tab.key}
                  href={projectIsActive ? tabHref(tab.key) : undefined}
                  label={tab.label}
                  active={activeTab === tab.key}
                  disabled={!projectIsActive}
                  tone="execution"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <Panel title="Statusz">
          <form action={updateProjectStatusAction} className="grid gap-3">
            <input type="hidden" name="projectId" value={project.id} />
            <Badge tone={project.status === 'CLOSED' ? 'slate' : project.status === 'HANDOVER' ? 'amber' : 'blue'}>
              {projectStatusLabel[project.status]}
            </Badge>
            <Select name="status" defaultValue={project.status}>
              {Object.entries(projectStatusLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <button className="btn-secondary" type="submit">Projekt statusz mentese</button>
          </form>
        </Panel>
        <Panel title="Szereplok">
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{project.members.length}</div>
          <div className="mt-2 text-sm text-slate-500">Projektben rogzitett szereplok</div>
        </Panel>
        <Panel title="Nyitott feladatok">
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{openTasks}</div>
          <div className="mt-2 text-sm text-slate-500">{decisionTasks} megrendeloi dontesre var</div>
        </Panel>
        <Panel title="Esemenyek">
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{project.events.length}</div>
          <div className="mt-2 text-sm text-slate-500">Hataridok, munkakezdesek es atadasok</div>
        </Panel>
        <Panel title="Hibajegyek">
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{project.issues.length}</div>
          <div className="mt-2 text-sm text-slate-500">{openIssues.length} nyitott problema</div>
        </Panel>
      </section>

      {activeTab === 'overview' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Projekt alapadatok">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Projekt kod" value={project.code || 'Nincs megadva'} />
              <InfoRow label="Kezdes" value={formatDate(project.startDate)} />
              <InfoRow label="Varhato befejezes" value={formatDate(project.expectedEndDate)} />
              <InfoRow label="Tenyleges befejezes" value={formatDate(project.actualEndDate)} />
              <InfoRow label="Varos" value={project.city || 'Nincs megadva'} />
              <InfoRow label="Cim" value={project.addressLine || 'Nincs megadva'} />
              <InfoRow label="Megrendelo" value={project.customerName || 'Nincs megadva'} />
              <InfoRow label="Elerhetoseg" value={project.customerPhone || project.customerEmail || 'Nincs megadva'} />
            </div>
            {project.description ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {project.description}
              </div>
            ) : null}
          </Panel>
          <Panel title="E-naplo">
            <div className="space-y-3">
              {project.siteLogEntries.length ? project.siteLogEntries.map((entry) => (
                <article key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-medium text-slate-900">{formatDate(entry.entryDate)}</div>
                    <div className="text-sm text-slate-500">{entry.weather || 'Idojaras nincs megadva'}</div>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <InfoRow label="Jelenlevok" value={entry.attendees || 'Nincs rogzitve'} compact />
                    <InfoRow label="Rogzitve" value={formatDateTime(entry.createdAt)} compact />
                  </div>
                  <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    <div className="font-medium text-slate-900">Elvegzett munkak</div>
                    <p className="mt-2">{entry.completedWork}</p>
                  </div>
                  {entry.issues ? (
                    <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <div className="font-medium">Problemak</div>
                      <p className="mt-2">{entry.issues}</p>
                    </div>
                  ) : null}
                </article>
              )) : <EmptyState text="Ehhez a projekthez meg nincs e-naplo bejegyzes." />}
            </div>
          </Panel>

          <Panel title="Problemakezeles">
            <div className="space-y-6">
              <IssueGroup title="Nyitott hibajegyek" issues={openIssues} projectId={project.id} />
              <IssueGroup title="Folyamatban" issues={activeIssues} projectId={project.id} />
              <IssueGroup title="Megoldva" issues={resolvedIssues} projectId={project.id} />
              {!project.issues.length ? <EmptyState text="Ehhez a projekthez meg nincs hibajegy rogzitve." /> : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Kovetkezo lepesek">
            <div className="space-y-3">
              <Link href={technicalTabHref(ProjectTechnicalSection.BASICS)} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Muszaki alapadatok</span>
                <span>{technicalCompletionCount}/{technicalFieldDefinitions.length}</span>
              </Link>
              <Link href={tabHref('tasks')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Feladatok kezelese</span>
                <span>{openTasks}</span>
              </Link>
              <Link href={tabHref('workflows')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Munkafolyamatok</span>
                <span>{project.workflows.length}</span>
              </Link>
              <Link href={tabHref('documents')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Dokumentacio</span>
                <span>{project.documents.length}</span>
              </Link>
              <Link href={tabHref('calendar')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Naptar</span>
                <span>{project.events.length}</span>
              </Link>
            </div>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'technical' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title="Muszaki alapadatok">
            <div className="mb-5 flex flex-wrap gap-3">
              {technicalSectionTabs.map((section) => (
                <ProjectTabLink
                  key={section}
                  href={technicalTabHref(section)}
                  label={technicalSectionLabel[section]}
                  active={activeTechnicalSection === section}
                  tone="core"
                />
              ))}
            </div>

            {activeTechnicalSection !== ProjectTechnicalSection.SUMMARIES ? (
              <div className="space-y-6">
                {activeTechnicalGroups.length ? activeTechnicalGroups.map((group) => (
                  <article key={group.key} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-4">
                      <div className="text-lg font-semibold tracking-tight text-slate-900">{group.label}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{group.description}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {group.fields.map((field) => {
                        const parameter = technicalValueMap.get(field.paramKey);
                        return (
                          <form key={field.paramKey} action={upsertProjectTechnicalParameterAction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <input type="hidden" name="projectId" value={project.id} />
                            <input type="hidden" name="section" value={field.section} />
                            <input type="hidden" name="techSection" value={activeTechnicalSection} />
                            <input type="hidden" name="groupKey" value={field.groupKey} />
                            <input type="hidden" name="paramKey" value={field.paramKey} />
                            <input type="hidden" name="label" value={field.label} />
                            <input type="hidden" name="valueType" value={field.valueType} />
                            <input type="hidden" name="unit" value={field.unit || ''} />
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium text-slate-900">{field.label}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                  {field.relatedWorkflows.map((workflow) => workflowTemplateLabel[workflow]).join(' | ')}
                                </div>
                              </div>
                              {parameter ? (
                                <Badge tone="green">Rogzitve</Badge>
                              ) : (
                                <Badge tone="amber">Hianyzik</Badge>
                              )}
                            </div>
                            <div className="mt-4">
                              <TechnicalValueInput field={field} parameter={parameter} />
                            </div>
                            <div className="mt-3 text-xs text-slate-500">
                              Aktualis ertek: <span className="font-medium text-slate-700">{parameter ? formatTechnicalValue(parameter) : 'Nincs megadva'}</span>
                            </div>
                            <div className="mt-4">
                              <button className="btn-secondary w-full" type="submit">Parameter mentese</button>
                            </div>
                          </form>
                        );
                      })}
                    </div>
                  </article>
                )) : (
                  <EmptyState text="Ehhez a szekciohoz meg nincs rogzitendo parameterezesi blokk." />
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {technicalSummaryCards.map((summary) => (
                  <article key={summary.key} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-tight text-slate-900">{summary.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{summary.completion} paraméter kitöltve</div>
                      </div>
                      <Badge tone={summary.ready ? 'green' : 'amber'}>
                        {summary.ready ? 'Indithato' : 'Hianyos'}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      {summary.lines.length ? summary.lines.map((line) => (
                        <div key={line} className="rounded-2xl bg-slate-50 px-3 py-2">{line}</div>
                      )) : (
                        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-500">Meg nincs eleg adat a munkacsomaghoz.</div>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600">
                      <InfoRow
                        label="Kapcsolodo munkafolyamat"
                        value={summary.relatedWorkflow ? summary.relatedWorkflow.name : 'Meg nincs letrehozva'}
                        compact
                      />
                      <InfoRow label="Hianyzo alapparameterek" value={String(summary.missingCount)} compact />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Munkacsomag-osszefoglalok">
            <div className="space-y-3">
              {technicalSummaryCards.map((summary) => (
                <article key={summary.key} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{summary.title}</div>
                    <Badge tone={summary.ready ? 'green' : 'amber'}>{summary.completion}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {summary.relatedWorkflow
                      ? `Kapcsolt munkafolyamat: ${summary.relatedWorkflow.name}`
                      : 'Meg nincs hozzarendelt munkafolyamat.'}
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Alvallalkozoi elokeszites">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">Mit tud most ez a blokk?</div>
                <p className="mt-2 leading-6">
                  A rogzitett muszaki parameterekbol munkacsomag-szintu osszefoglalok keszulnek, amelyek alapot adnak a workflow-khoz, az ajanlatkereshez es a szerzodeses muszaki tartalomhoz.
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-950">
                <div className="font-medium">Kovetkezo epitesi kor</div>
                <p className="mt-2 leading-6">
                  Innen a legerosebb kovetkezo lepes a workflow-szintu adatlap lesz, ahol a muszaki alapadatok automatikusan rahuzhatok az adott munkafolyamatra es alvallalkozora.
                </p>
              </div>
              <Link href={tabHref('workflows')} className="btn-primary inline-flex w-full justify-center">Munkafolyamatok megnyitasa</Link>
            </div>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'tasks' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Feladatok">
          <form className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_220px_220px_auto] sm:items-end">
            <Field label="Kereses">
              <Input name="q" defaultValue={taskQuery} placeholder="Feladat, leiras, felelos..." />
            </Field>
            <Field label="Statusz">
              <Select name="taskStatus" defaultValue={taskStatusFilter}>
                <option value="">Osszes statusz</option>
                {Object.entries(taskStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tipus">
              <Select name="taskType" defaultValue={taskTypeFilter}>
                <option value="">Osszes tipus</option>
                {Object.entries(taskTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">Szures</button>
              {(taskQuery || taskStatusFilter || taskTypeFilter) ? (
                <Link href={tabHref('tasks')} className="btn-secondary">Torles</Link>
              ) : null}
            </div>
          </form>

          <div className="mb-4 text-sm text-slate-500">
            {filteredTasks.length} feladat latszik
            {taskStatusFilter ? ` - ${taskStatusLabel[taskStatusFilter]}` : ''}
            {taskTypeFilter ? ` - ${taskTypeLabel[taskTypeFilter]}` : ''}
            {taskQuery ? ` - kereses: "${taskQuery}"` : ''}
          </div>

          <div className="space-y-6">
            {filteredTasks.length ? (
              <>
                <TaskGroup title="Lejart feladatok" tasks={overdueTasks} projectId={project.id} />
                <TaskGroup title="Mai / kozelgo feladatok" tasks={upcomingTasks} projectId={project.id} />
                <TaskGroup title="Megrendeloi dontesek" tasks={decisionTypeTasks} projectId={project.id} />
                <TaskGroup title="Tovabbi aktiv feladatok" tasks={remainingTasks} projectId={project.id} />
                <TaskGroup title="Kesz feladatok" tasks={doneTasks} projectId={project.id} />
              </>
            ) : <EmptyState text="Nincs a szuroknek megfelelo projektfeladat." />}
          </div>
        </Panel>

        <div id="uj-feladat">
        <Panel title="Uj projektfeladat">
            <form action={createProjectTaskAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Feladat cime">
                <Input name="title" placeholder="Pl. Aljzatbeton elokeszitese" required />
              </Field>
              <Field label="Feladat tipusa">
                <Select name="type" defaultValue={ProjectTaskType.EXECUTION}>
                  {Object.entries(taskTypeLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prioritas">
                  <Select name="priority" defaultValue={ProjectTaskPriority.MEDIUM}>
                    {Object.entries(taskPriorityLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Statusz">
                  <Select name="status" defaultValue={ProjectTaskStatus.NEW}>
                    {Object.entries(taskStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Felelos">
                  <Select name="assigneeMemberId" defaultValue="">
                    <option value="">Nincs kiosztva</option>
                    {activeMembers.map((member) => (
                      <option key={member.id} value={member.id}>{member.name} - {memberRoleLabel[member.role]}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Munkafolyamat">
                  <Select name="workflowId" defaultValue="">
                    <option value="">Nincs workflow-hoz kotve</option>
                    {project.workflows.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hatarido">
                  <Input type="datetime-local" name="dueAt" />
                </Field>
                <div />
              </div>
              <Field label="Leiras">
                <Textarea name="description" placeholder="Mit kell elvegezni, milyen anyaggal, milyen dontes vagy feltetel kapcsolodik hozza?" />
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="approvalRequired" className="size-4 rounded border-slate-300" />
                Jovahagyast igenyel
              </label>
              <Field label="Jovahagyo">
                  <Select name="approvedByMemberId" defaultValue="">
                  <option value="">Nincs kijelolve</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id}>{member.name} - {memberRoleLabel[member.role]}</option>
                  ))}
                </Select>
              </Field>
              <button className="btn-primary" type="submit">Feladat letrehozasa</button>
            </form>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'workflows' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Munkafolyamatok">
            <div className="space-y-3">
              {project.workflows.length ? project.workflows.map((workflow) => (
                <article key={workflow.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/office/projects/${project.id}/workflows/${workflow.id}`} className="font-medium text-slate-900 hover:text-orange-700">
                        {workflow.name}
                      </Link>
                      <div className="mt-1 text-sm text-slate-500">
                        {workflowTemplateLabel[workflow.template]} | {workflow.contractorMember?.name || workflow.contractorCompany || workflow.contractorName || 'Kivitelezo nincs megadva'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={workflow.status === 'DONE' ? 'green' : workflow.status === 'WAITING' ? 'amber' : 'blue'}>
                        {workflowStatusLabel[workflow.status]}
                      </Badge>
                      <Link href={`/office/projects/${project.id}/workflows/${workflow.id}`} className="btn-secondary">
                        Megnyitas
                      </Link>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <InfoRow label="Kapcsolattarto" value={workflow.contractorName || workflow.contractorPhone || workflow.contractorEmail || 'Nincs megadva'} compact />
                    <InfoRow label="Dokumentumok" value={`${workflow.documents.length} kapcsolodo dokumentum`} compact />
                  </div>
                  {workflow.customerSelections ? (
                    <div className="mt-3 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                      <div className="font-medium">Megrendeloi parameterek</div>
                      <p className="mt-2">{workflow.customerSelections}</p>
                    </div>
                  ) : null}
                  {workflow.specificationNotes ? (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      <div className="font-medium text-slate-900">Kivitelezesi megjegyzesek</div>
                      <p className="mt-2">{workflow.specificationNotes}</p>
                    </div>
                  ) : null}
                </article>
              )) : <EmptyState text="Ehhez a projekthez meg nincs munkafolyamat rogzitve." />}
            </div>
          </Panel>

          <Panel title="Uj munkafolyamat">
            <form action={createProjectWorkflowAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Munkafolyamat neve">
                <Input name="name" placeholder="Pl. Homlokzati szinezes, nyilaszaro beepites, villanyszereles 1. kor" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sablon">
                  <Select name="template" defaultValue={ProjectWorkflowTemplate.OTHER}>
                    {Object.entries(workflowTemplateLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Allapot">
                  <Select name="status" defaultValue={ProjectWorkflowStatus.PLANNED}>
                    {Object.entries(workflowStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Kivitelezo ceg">
                <Input name="contractorCompany" placeholder="Pl. Homlokzat Profi Kft." />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Projekt szereplo">
                  <Select name="contractorMemberId" defaultValue="">
                    <option value="">Kulso kivitelezo adat</option>
                    {project.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name} - {memberRoleLabel[member.role]}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kapcsolattarto">
                  <Input name="contractorName" placeholder="Nev" />
                </Field>
                <Field label="Telefon">
                  <Input name="contractorPhone" placeholder="+36..." />
                </Field>
                <Field label="Email">
                  <Input type="email" name="contractorEmail" placeholder="email@pelda.hu" />
                </Field>
              </div>
              <Field label="Megrendeloi parameterek">
                <Textarea name="customerSelections" placeholder="Pl. homlokzatszin: tortfeher, labazat: antracit, nyilaszarok: dio szinu 3 retegu muanyag, parkany: grafitszurke." />
              </Field>
              <Field label="Kivitelezesi megjegyzesek / workflow leiras">
                <Textarea name="specificationNotes" placeholder="Milyen dokumentumok tartoznak ide, milyen teljesitesi igazolas kell, milyen sorrendben kell haladni, mire kell figyelnie a kivitelezonek." />
              </Field>
              <button className="btn-primary" type="submit">Munkafolyamat rogzitese</button>
            </form>
          </Panel>
      </section>
      ) : null}

      {activeTab === 'team' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Szereplok">
            <div className="space-y-3">
              {project.members.length ? project.members.map((member) => (
                <article key={member.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{member.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{memberRoleLabel[member.role]}</div>
                    </div>
                    <Badge tone={member.isActive ? 'green' : 'slate'}>
                      {member.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    <div>{member.phone || 'Nincs telefonszam'}</div>
                    <div>{member.email || 'Nincs email'}</div>
                    <div className="mt-1">{permissionLevelLabel[member.permissionLevel]}</div>
                  </div>
                  {member.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{member.notes}</p> : null}
                  <form action={updateProjectMemberActivityAction} className="mt-4">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <input type="hidden" name="isActive" value={member.isActive ? 'false' : 'true'} />
                    <button className="btn-secondary" type="submit">
                      {member.isActive ? 'Inaktivva teszem' : 'Aktivalom'}
                    </button>
                  </form>
                </article>
              )) : <EmptyState text="Ehhez a projekthez meg nincs szereplo felvive." />}
            </div>
          </Panel>

          <Panel title="Uj szereplo">
            <form action={createProjectMemberAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Nev">
                <Input name="name" placeholder="Pl. Kiss Peter" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Szerepkor">
                  <Select name="role" defaultValue={ProjectRole.SUBCONTRACTOR}>
                    {Object.entries(memberRoleLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Jogosultsag">
                  <Select name="permissionLevel" defaultValue={ProjectPermissionLevel.CONTRIBUTE}>
                    {Object.entries(permissionLevelLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefonszam">
                  <Input name="phone" placeholder="+36..." />
                </Field>
                <Field label="Email">
                  <Input type="email" name="email" placeholder="email@pelda.hu" />
                </Field>
              </div>
              <Field label="Megjegyzes">
                <Textarea name="notes" placeholder="Pl. villanyszerelo, kulcs nala van, csak hetfon es szerdan elerheto." />
              </Field>
              <button className="btn-primary" type="submit">Szereplo hozzaadasa</button>
            </form>
          </Panel>
      </section>
      ) : null}

      {activeTab === 'calendar' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Projekt naptar">
            <div className="space-y-6">
              {project.events.length ? (
                <>
                  <EventGroup title="Lejart esemenyek" events={overdueEvents} />
                  <EventGroup title="Kovetkezo 7 nap" events={upcomingEvents} />
                  <EventGroup title="Feladathoz kotott esemenyek" events={taskLinkedEvents} />
                  <EventGroup title="Tovabbi esemenyek" events={remainingEvents} />
                </>
              ) : <EmptyState text="Ehhez a projekthez meg nincs esemeny rogzitve." />}
            </div>
          </Panel>

          <Panel title="Uj esemeny">
            <form action={createProjectEventAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Esemeny cime">
                <Input name="title" placeholder="Pl. Hetfoi munkakezdes" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipus">
                  <Select name="type" defaultValue={ProjectEventType.MEETING}>
                    {Object.entries(eventTypeLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Kapcsolodo feladat">
                  <Select name="taskId" defaultValue="">
                    <option value="">Nincs hozzakotve feladathoz</option>
                    {project.tasks.map((task) => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kezdes">
                  <Input type="datetime-local" name="startsAt" required />
                </Field>
                <Field label="Vege">
                  <Input type="datetime-local" name="endsAt" />
                </Field>
              </div>
              <Field label="Helyszin">
                <Input name="location" placeholder="Pl. Kecskemet, Fo utca 12." />
              </Field>
              <Field label="Megjegyzes">
                <Textarea name="notes" placeholder="Pl. megrendeloi bejaras, anyag atvetel, alapozas ellenorzes." />
              </Field>
              <button className="btn-primary" type="submit">Esemeny letrehozasa</button>
            </form>
          </Panel>
      </section>
      ) : null}

      {activeTab === 'documents' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Dokumentacio">
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requiredPlanChecklist.map((item) => (
              <div key={item} className={`rounded-2xl border p-4 ${completedPlanChecklist.has(item) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Terv checklista</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{planChecklistLabel[item]}</div>
                <div className="mt-1 text-sm text-slate-500">{completedPlanChecklist.has(item) ? 'Rogzitve' : 'Hianyzik'}</div>
              </div>
            ))}
          </div>

          <form className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <Field label="Kereses">
              <Input name="docQ" defaultValue={docQuery} placeholder="Dokumentum, link, cimke, feladat..." />
            </Field>
            <Field label="Scope">
              <Select name="docScope" defaultValue={docScopeFilter}>
                <option value="">Minden dokumentum</option>
                {Object.entries(documentScopeLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">Kereses</button>
              {(docQuery || docScopeFilter) ? (
                <Link href={tabHref('documents')} className="btn-secondary">Torles</Link>
              ) : null}
            </div>
          </form>

          <div className="mb-4 text-sm text-slate-500">
            {filteredDocuments.length} dokumentum latszik
            {docScopeFilter ? ` - ${documentScopeLabel[docScopeFilter]}` : ''}
            {docQuery ? ` - kereses: "${docQuery}"` : ''}
          </div>

          <div className="space-y-3">
            <DocumentGroup title="Tervdokumentacios csomag" documents={planDocuments} />
            <DocumentGroup title="Munkafolyamat dokumentumok" documents={workflowDocuments} />
            <DocumentGroup title="Kivitelezoi / penzugyi dokumentumok" documents={contractorDocuments} />
            <DocumentGroup title="Altalanos dokumentumok" documents={generalDocuments} />
            {!filteredDocuments.length ? <EmptyState text="Ehhez a projekthez meg nincs a szuroknek megfelelo dokumentum." /> : null}
          </div>
        </Panel>

        <div id="uj-dokumentum">
        <Panel title="Uj dokumentum / hivatkozas">
          <form action={createProjectDocumentAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.id} />
            <Field label="Cim">
              <Input name="title" placeholder="Pl. statikai terv, szerzodes PDF, helyszini fotomappa" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dokumentum scope">
                <Select name="scope" defaultValue={ProjectDocumentScope.PLAN_PACKAGE}>
                  {Object.entries(documentScopeLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Kategoria">
                <Select name="category" defaultValue={ProjectDocumentCategory.PLAN}>
                  {Object.entries(documentCategoryLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Terv checklista elem">
                <Select name="planChecklistType" defaultValue={ProjectPlanChecklistType.ARCHITECTURAL}>
                  {Object.entries(planChecklistLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Kapcsolodo feladat">
                <Select name="taskId" defaultValue="">
                  <option value="">Nincs feladathoz kotve</option>
                  {project.tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Kapcsolodo munkafolyamat">
              <Select name="workflowId" defaultValue="">
                <option value="">Nincs munkafolyamathoz kotve</option>
                {project.workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Link vagy eleresi ut">
              <Input name="linkUrl" placeholder="Pl. https://..., \\\\szerver\\megosztas\\terv.pdf vagy /uploads/projekt/foto.jpg" required />
            </Field>
            <Field label="Cimkek / keresesi kulcsszavak">
              <Input name="tags" placeholder="Pl. homlokzat, statika, villany, szamla, teljesitesi igazolas" />
            </Field>
            <Field label="Megjegyzes">
              <Textarea name="notes" placeholder="Mi ez a dokumentum, melyik fazishoz tartozik, mit kell vele csinalni?" />
            </Field>
            <button className="btn-primary" type="submit">Dokumentum rogzitese</button>
          </form>
        </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'site-log' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="E-naplo">
          <div className="space-y-3">
            {project.siteLogEntries.length ? project.siteLogEntries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="font-medium text-slate-900">{formatDate(entry.entryDate)}</div>
                  <div className="text-sm text-slate-500">{entry.weather || 'Idojaras nincs megadva'}</div>
                </div>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <InfoRow label="Jelenlevok" value={entry.attendees || 'Nincs rogzitve'} compact />
                  <InfoRow label="Rogzitve" value={formatDateTime(entry.createdAt)} compact />
                </div>
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <div className="font-medium text-slate-900">Elvegzett munkak</div>
                  <p className="mt-2">{entry.completedWork}</p>
                </div>
                {entry.issues ? (
                  <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    <div className="font-medium">Problemak</div>
                    <p className="mt-2">{entry.issues}</p>
                  </div>
                ) : null}
              </article>
            )) : <EmptyState text="Ehhez a projekthez meg nincs e-naplo bejegyzes." />}
          </div>
        </Panel>

        <div id="uj-enaplo">
        <Panel title="Uj e-naplo bejegyzes">
            <form action={createProjectSiteLogEntryAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Datum">
                <Input type="date" name="entryDate" required />
              </Field>
              <Field label="Jelenlevok">
                <Textarea name="attendees" placeholder="Pl. projektvezeto, 2 fo komuves, villanyszerelo." />
              </Field>
              <Field label="Elvegzett munkak">
                <Textarea name="completedWork" placeholder="Pl. zsaluzas befejezve, betonozas elokeszitve, villanyszereles 1. kor kesz." required />
              </Field>
              <Field label="Problemak">
                <Textarea name="issues" placeholder="Pl. anyagkeses, helyszini dontes hianya, idojarasi csuszas." />
              </Field>
              <Field label="Idojaras">
                <Input name="weather" placeholder="Pl. napos, 18 C, eros szel" />
              </Field>
              <button className="btn-primary" type="submit">E-naplo rogzitese</button>
            </form>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'issues' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Hibajegyek">
          <div className="space-y-6">
            <IssueGroup title="Nyitott hibajegyek" issues={openIssues} projectId={project.id} />
            <IssueGroup title="Folyamatban" issues={activeIssues} projectId={project.id} />
            <IssueGroup title="Megoldva" issues={resolvedIssues} projectId={project.id} />
            {!project.issues.length ? <EmptyState text="Ehhez a projekthez meg nincs hibajegy rogzitve." /> : null}
          </div>
        </Panel>

        <div>
          <Panel title="Uj hibajegy">
            <form action={createProjectIssueAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <Field label="Cim">
                <Input name="title" placeholder="Pl. betonminosegi problema az alapnal" required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kategoria">
                  <Select name="category" defaultValue={ProjectIssueCategory.TECHNICAL}>
                    {Object.entries(issueCategoryLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Statusz">
                  <Select name="status" defaultValue={ProjectIssueStatus.OPEN}>
                    {Object.entries(issueStatusLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kapcsolodo feladat">
                  <Select name="taskId" defaultValue="">
                    <option value="">Nincs hozzakotve feladathoz</option>
                    {project.tasks.map((task) => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Felelos / kapcsolattarto">
                  <Input name="responsibleName" placeholder="Pl. projektvezeto vagy alvallalkozo neve" />
                </Field>
              </div>
              <Field label="Leiras">
                <Textarea name="description" placeholder="Mi a problema, mi latszik a helyszinen, mi blokkolodik miatta, kell-e dontes vagy uj anyag?" />
              </Field>
              <button className="btn-primary" type="submit">Hibajegy letrehozasa</button>
            </form>
          </Panel>
        </div>
      </section>
      ) : null}
    </OfficeShellV2>
  );
}

function InfoRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'rounded-2xl border border-slate-200 bg-slate-50 p-4'}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function TechnicalValueInput({
  field,
  parameter,
}: {
  field: (typeof technicalFieldDefinitions)[number];
  parameter?: {
    textValue: string | null;
    numberValue: number | null;
    booleanValue: boolean | null;
  } | null;
}) {
  if (field.input === 'textarea') {
    return (
      <Textarea
        name="value"
        defaultValue={parameter?.textValue || ''}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.input === 'number') {
    return (
      <Input
        type="number"
        step="0.01"
        name="value"
        defaultValue={parameter?.numberValue?.toString() || ''}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.input === 'boolean') {
    return (
      <Select name="value" defaultValue={parameter?.booleanValue === null || parameter?.booleanValue === undefined ? '' : parameter.booleanValue ? 'true' : 'false'}>
        <option value="">Nincs megadva</option>
        <option value="true">Igen</option>
        <option value="false">Nem</option>
      </Select>
    );
  }

  if (field.input === 'select') {
    return (
      <Select name="value" defaultValue={parameter?.textValue || ''}>
        <option value="">Valassz</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      name="value"
      defaultValue={parameter?.textValue || ''}
      placeholder={field.placeholder}
    />
  );
}

function ProjectTabLink({
  href,
  label,
  active,
  disabled = false,
  tone = 'core',
}: {
  href?: string;
  label: string;
  active: boolean;
  disabled?: boolean;
  tone?: 'core' | 'execution';
}) {
  const baseClass = `inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
    active
      ? tone === 'execution'
        ? 'border-white/20 bg-white text-slate-950'
        : 'border-orange-300 bg-orange-50 text-orange-700'
      : tone === 'execution'
        ? 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
  } ${disabled ? 'cursor-not-allowed opacity-45 hover:border-white/10 hover:bg-white/5 hover:text-white' : ''}`;

  if (disabled || !href) {
    return (
      <span className={baseClass} aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      {label}
    </Link>
  );
}

function TaskGroup({
  title,
  tasks,
  projectId,
}: {
  title: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    type: ProjectTaskType;
    status: ProjectTaskStatus;
    priority: ProjectTaskPriority;
    dueAt: Date | null;
    approvalRequired: boolean;
    assignee: { name: string } | null;
    approvedBy: { name: string } | null;
    workflow: { name: string } | null;
  }>;
  projectId: string;
}) {
  if (!tasks.length) return null;

  return (
    <section>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{task.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {taskTypeLabel[task.type]} | {taskPriorityLabel[task.priority]}
                </div>
                {task.workflow ? (
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {task.workflow.name}
                  </div>
                ) : null}
              </div>
              <Badge tone={task.status === 'DONE' ? 'green' : task.status === 'WAITING_APPROVAL' ? 'amber' : 'blue'}>
                {taskStatusLabel[task.status]}
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <InfoRow label="Felelos" value={task.assignee?.name || 'Nincs kiosztva'} compact />
              <InfoRow label="Hatarido" value={formatDateTime(task.dueAt)} compact />
              <InfoRow label="Jovahagyo" value={task.approvedBy?.name || (task.approvalRequired ? 'Meg nem tortent' : 'Nem szukseges')} compact />
            </div>
            {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
            <form action={updateProjectTaskStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="taskId" value={task.id} />
              <Field label="Gyors statuszvaltas">
                <Select name="status" defaultValue={task.status}>
                  {Object.entries(taskStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <button className="btn-secondary" type="submit">Frissites</button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventGroup({
  title,
  events,
}: {
  title: string;
  events: Array<{
    id: string;
    title: string;
    type: ProjectEventType;
    startsAt: Date;
    endsAt: Date | null;
    location: string | null;
    notes: string | null;
    task: { title: string } | null;
  }>;
}) {
  if (!events.length) return null;

  return (
    <section>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{event.title}</div>
                <div className="mt-1 text-sm text-slate-500">{eventTypeLabel[event.type]}</div>
              </div>
              <div className="text-sm text-slate-500">{formatDateTime(event.startsAt)}</div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              <div>Vege: {formatDateTime(event.endsAt)}</div>
              <div>Helyszin: {event.location || 'Nincs megadva'}</div>
              <div>Kapcsolodo feladat: {event.task?.title || 'Nincs hozzakotve'}</div>
            </div>
            {event.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{event.notes}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function DocumentGroup({
  title,
  documents,
}: {
  title: string;
  documents: Array<{
    id: string;
    title: string;
    category: ProjectDocumentCategory;
    scope: ProjectDocumentScope;
    planChecklistType: ProjectPlanChecklistType | null;
    linkUrl: string;
    tags: string | null;
    notes: string | null;
    createdAt: Date;
    task: { title: string } | null;
    workflow: { name: string } | null;
  }>;
}) {
  if (!documents.length) return null;

  return (
    <section>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-3">
        {documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{document.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {documentScopeLabel[document.scope]} | {documentCategoryLabel[document.category]}
                  {document.planChecklistType ? ` | ${planChecklistLabel[document.planChecklistType]}` : ''}
                </div>
              </div>
              <Badge tone={document.scope === 'FINANCIAL' || document.category === 'CONTRACT' ? 'amber' : document.category === 'PHOTO' ? 'green' : 'blue'}>
                {documentCategoryLabel[document.category]}
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <InfoRow label="Feladat" value={document.task?.title || 'Nincs feladathoz kotve'} compact />
              <InfoRow label="Munkafolyamat" value={document.workflow?.name || 'Nincs workflow-hoz kotve'} compact />
            </div>
            <a href={document.linkUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700 hover:text-orange-800">
              Megnyitas: {document.linkUrl}
            </a>
            {document.tags ? <div className="mt-2 text-sm text-slate-500">Cimkek: {document.tags}</div> : null}
            {document.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{document.notes}</p> : null}
            <div className="mt-3 text-xs text-slate-500">Rogzitve: {formatDateTime(document.createdAt)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IssueGroup({
  title,
  issues,
  projectId,
}: {
  title: string;
  issues: Array<{
    id: string;
    title: string;
    description: string | null;
    category: ProjectIssueCategory;
    status: ProjectIssueStatus;
    responsibleName: string | null;
    resolvedAt: Date | null;
    task: { title: string } | null;
  }>;
  projectId: string;
}) {
  if (!issues.length) return null;

  return (
    <section>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-3">
        {issues.map((issue) => (
          <article key={issue.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900">{issue.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {issueCategoryLabel[issue.category]} | {issue.responsibleName || 'Nincs felelos megadva'}
                </div>
              </div>
              <Badge tone={issue.status === 'RESOLVED' ? 'green' : issue.status === 'IN_PROGRESS' ? 'blue' : 'amber'}>
                {issueStatusLabel[issue.status]}
              </Badge>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              <div>Kapcsolodo feladat: {issue.task?.title || 'Nincs hozzakotve'}</div>
              <div>Megoldva: {formatDateTime(issue.resolvedAt)}</div>
            </div>
            {issue.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{issue.description}</p> : null}
            <form action={updateProjectIssueStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="issueId" value={issue.id} />
              <Field label="Hibajegy statusza">
                <Select name="status" defaultValue={issue.status}>
                  {Object.entries(issueStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <button className="btn-secondary" type="submit">Frissites</button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">{text}</div>;
}
