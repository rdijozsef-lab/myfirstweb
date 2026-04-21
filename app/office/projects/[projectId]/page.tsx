import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectDocumentCategory, ProjectDocumentScope, ProjectEventType, ProjectIssueCategory, ProjectIssueStatus, ProjectPermissionLevel, ProjectPlanChecklistType, ProjectRole, ProjectStatus, ProjectTaskPriority, ProjectTaskStatus, ProjectTaskType, ProjectTechnicalSection, ProjectTechnicalValueType, ProjectWorkflowStatus, ProjectWorkflowTemplate } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';
import { formatDate, formatDateTime, toDateInput, toDateTimeLocalInput } from '@/lib/office';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { ConfirmSubmitButton } from '@/components/confirm-submit-button';
import { createProjectDocumentAction, createProjectSiteLogEntryAction, createProjectWorkflowAction, deleteProjectDocumentAction, deleteProjectEventAction, deleteProjectIssueAction, deleteProjectWorkflowAction, updateProjectDetailsAction, updateProjectDocumentAction, updateProjectEventAction, updateProjectIssueAction, updateProjectIssueStatusAction, updateProjectMemberActivityAction, updateProjectTaskStatusAction, upsertProjectTechnicalParameterAction } from '@/app/office/actions/core';
import { buildTechnicalCalculationGroups, buildTechnicalSummaryCards, formatTechnicalValue, getTechnicalGroups, technicalFieldDefinitions, technicalSectionLabel } from '@/lib/project-technical';

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
  WORKFLOW: 'Munkafazis',
  CONTRACTOR: 'Kivitelezo',
  FINANCIAL: 'Penzugy',
  GENERAL: 'Altalanos',
};

const planChecklistLabel: Record<ProjectPlanChecklistType, string> = {
  FLOOR_PLAN: 'Alaprajz',
  SECTIONS: 'Metszetek',
  FACADES: 'Homlokzatok',
  MECHANICAL_PLAN: 'Gepeszterv',
  ELECTRICAL_PLAN: 'Elektromos terv',
  STRUCTURAL_PLAN: 'Statikai tervek',
  SITE_PLAN: 'Helyszinrajz',
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
  searchParams?: Promise<{ q?: string; taskStatus?: string; taskType?: string; docQ?: string; docScope?: string; tab?: string; notice?: string; error?: string; techSection?: string }>;
}) {
  const user = await requireUser();
  const canEdit = user.role !== 'VIEWER';
  const canDelete = user.role === 'OWNER' || user.role === 'ADMIN';
  const { projectId } = await params;
  const taskParams = await searchParams;
  const tabValue = String(taskParams?.tab || '').trim();
  const notice = String(taskParams?.notice || '').trim();
  const error = String(taskParams?.error || '').trim();

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
              id: true,
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
              id: true,
              title: true,
            },
          },
          workflow: {
            select: {
              id: true,
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
              id: true,
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
    'FLOOR_PLAN',
    'SECTIONS',
    'FACADES',
    'MECHANICAL_PLAN',
    'ELECTRICAL_PLAN',
    'STRUCTURAL_PLAN',
    'SITE_PLAN',
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
    { key: 'overview', label: 'Allapot' },
    { key: 'technical', label: 'Muszaki adatok' },
    { key: 'documents', label: 'Dokumentumok' },
    { key: 'workflows', label: 'Munkafazisok' },
    { key: 'team', label: 'Emberek' },
  ] as const;
  const projectExecutionTabs = [
    { key: 'tasks', label: 'Teendok' },
    { key: 'calendar', label: 'Idopontok' },
    { key: 'site-log', label: 'Napi naplo' },
    { key: 'issues', label: 'Problemak' },
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
  const technicalCalculationGroups = buildTechnicalCalculationGroups(project.technicalParameters);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const hasTodaySiteLog = project.siteLogEntries.some((entry) => entry.entryDate >= startOfToday && entry.entryDate < endOfToday);
  const nextStepCards = [
    !documentationReady
      ? {
          title: 'Toltsd fel a hianyzo terveket',
          text: 'A kivitelezes inditasa elott legyen meg a kotelezo tervcsomag.',
          href: tabHref('documents'),
          cta: 'Dokumentumok',
          tone: 'amber' as const,
        }
      : null,
    project.status === ProjectStatus.PREPARATION && documentationReady
      ? {
          title: 'Indithato a kivitelezes',
          text: 'A dokumentumok rendben vannak, mar csak a projekt statuszat kell Kivitelezesre allitani.',
          href: tabHref('overview'),
          cta: 'Statusz valtasa',
          tone: 'green' as const,
        }
      : null,
    projectIsActive && !hasTodaySiteLog
      ? {
          title: 'Hianyzik a mai napi naplo',
          text: 'Rogzitsd, kik voltak kint, mi keszult el, es volt-e problema.',
          href: tabHref('site-log'),
          cta: 'Napi naplo irasa',
          tone: 'amber' as const,
        }
      : null,
    overdueTasks.length
      ? {
          title: `${overdueTasks.length} lejart teendo van`,
          text: 'Ezeket erdemes elsokent kiosztani, frissiteni vagy lezarni.',
          href: tabHref('tasks'),
          cta: 'Teendok megnyitasa',
          tone: 'amber' as const,
        }
      : null,
    openIssues.length
      ? {
          title: `${openIssues.length} nyitott problema blokkolhat`,
          text: 'Adj felelos nevet, allapotot vagy kovetkezo lepest a problemakhoz.',
          href: tabHref('issues'),
          cta: 'Problemak kezelese',
          tone: 'amber' as const,
        }
      : null,
    !activeMembers.length
      ? {
          title: 'Nincs aktiv szereplo',
          text: 'Add meg, kik dolgoznak ezen a projekten, hogy legyen kinek kiosztani a munkat.',
          href: tabHref('team'),
          cta: 'Emberek hozzaadasa',
          tone: 'blue' as const,
        }
      : null,
    !project.workflows.length
      ? {
          title: 'Nincsenek munkafazisok',
          text: 'Bontsd ertheto munkacsomagokra a projektet: foldmunka, falazas, gepeszet, villany es tovabbi fazisok.',
          href: tabHref('workflows'),
          cta: 'Munkafazisok',
          tone: 'blue' as const,
        }
      : null,
    upcomingTasks.length && !overdueTasks.length
      ? {
          title: `${upcomingTasks.length} kozelgo teendo jon`,
          text: 'A kovetkezo 3 nap teendoi mar latszanak, erdemes elore kiosztani oket.',
          href: tabHref('tasks'),
          cta: 'Kozelgo teendok',
          tone: 'green' as const,
        }
      : null,
  ].filter(Boolean).slice(0, 3) as Array<{
    title: string;
    text: string;
    href: string;
    cta: string;
    tone: 'green' | 'blue' | 'amber';
  }>;
  return (
    <OfficeShellV2
      title={project.name}
      description="Egy projekt teljes napi munkafelulete: allapot, emberek, dokumentumok, teendok, idopontok, napi naplo es problemak egy helyen."
      userName={user.name}
      toolbar={<Link href="/office/projects" className="btn-secondary">Vissza a projektekhez</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: tabHref('overview'), label: 'Allapot' },
        { href: technicalTabHref(ProjectTechnicalSection.BASICS), label: 'Muszaki alapok' },
        { href: tabHref('documents'), label: 'Dokumentumok' },
        { href: tabHref('workflows'), label: 'Munkafazisok' },
        { href: tabHref('team'), label: 'Szereplok' },
        ...(projectIsActive
          ? [
              { href: tabHref('tasks'), label: 'Teendok' },
              { href: tabHref('calendar'), label: 'Idopontok' },
              { href: tabHref('site-log'), label: 'Napi naplo' },
              { href: tabHref('issues'), label: 'Problemak' },
              { href: `/office/projects/${project.id}/new/person`, label: 'Uj szereplo' },
              { href: `/office/projects/${project.id}/new/task`, label: 'Uj teendo' },
              { href: `/office/projects/${project.id}/new/event`, label: 'Uj idopont' },
              { href: `/office/projects/${project.id}/new/issue`, label: 'Uj problema' },
            ]
          : []),
      ]}
    >
      {error ? (
        <InlineNotice tone="error" text={error} />
      ) : notice && notice !== 'docs-required' ? (
        <InlineNotice tone="success" text={notice} />
      ) : null}

      {!documentationReady ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
          A projekt meg nincs keszen az aktiv kivitelezeshez. Eloszor toltsd fel a kotelezo terveket, utana allitsd a statuszt Kivitelezesre.
        </section>
      ) : null}

      {notice === 'docs-required' ? (
        <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
          Nem lehet a projektet aktiv kivitelezesbe tenni, amig a kotelezo tervcsomag nincs feltoltve.
        </section>
      ) : null}

      <section className="rounded-[28px] border border-[#dfe7da] bg-[linear-gradient(135deg,#f8faf6,#eef5e7)] p-5 shadow-[0_16px_40px_rgba(33,48,39,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">Mit csinaljak most?</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Kovetkezo legfontosabb lepesek</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Ez a blokk nem modulokban gondolkodik, hanem abban, hogy a projekt ma mit ker toled.
            </p>
          </div>
          <Link href="/office" className="btn-secondary">Vissza a mai listahoz</Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {nextStepCards.length ? nextStepCards.map((card) => (
            <NextStepCard key={card.title} {...card} />
          )) : (
            <div className="rounded-[24px] border border-emerald-200 bg-white p-5 text-sm leading-6 text-emerald-900 lg:col-span-3">
              Jelenleg nincs surgos teendo ezen a projekten. Ha megis dolgozol rajta ma, kezdd a napi naploval vagy nezd at a kovetkezo hataridoket.
            </div>
          )}
        </div>
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
          <Panel title="Napi naplo">
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

          <Panel title="Problemak">
            <div className="space-y-6">
              <IssueGroup title="Nyitott problemak" issues={openIssues} projectId={project.id} returnTo={tabHref('overview')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
              <IssueGroup title="Folyamatban" issues={activeIssues} projectId={project.id} returnTo={tabHref('overview')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
              <IssueGroup title="Megoldva" issues={resolvedIssues} projectId={project.id} returnTo={tabHref('overview')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
              {!project.issues.length ? <EmptyState text="Ehhez a projekthez meg nincs problema rogzitve." /> : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          {canEdit ? <Panel title="Projektadatok szerkesztese">
            <form action={updateProjectDetailsAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={tabHref('overview')} />
              <Field label="Projekt neve">
                <Input name="name" defaultValue={project.name} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Projekt kod">
                  <Input name="code" defaultValue={project.code || ''} />
                </Field>
                <Field label="Irsz">
                  <Input name="postalCode" defaultValue={project.postalCode || ''} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Varos">
                  <Input name="city" defaultValue={project.city || ''} />
                </Field>
                <Field label="Cim">
                  <Input name="addressLine" defaultValue={project.addressLine || ''} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kezdes">
                  <Input type="date" name="startDate" defaultValue={toDateInput(project.startDate)} />
                </Field>
                <Field label="Varhato befejezes">
                  <Input type="date" name="expectedEndDate" defaultValue={toDateInput(project.expectedEndDate)} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tenyleges befejezes">
                  <Input type="date" name="actualEndDate" defaultValue={toDateInput(project.actualEndDate)} />
                </Field>
                <div />
              </div>
              <Field label="Megrendelo neve">
                <Input name="customerName" defaultValue={project.customerName || ''} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Megrendelo telefon">
                  <Input name="customerPhone" defaultValue={project.customerPhone || ''} />
                </Field>
                <Field label="Megrendelo email">
                  <Input type="email" name="customerEmail" defaultValue={project.customerEmail || ''} />
                </Field>
              </div>
              <Field label="Leiras">
                <Textarea name="description" defaultValue={project.description || ''} placeholder="Projekt megjegyzesek, aktualis allapot, kulon fontos tudnivalok." />
              </Field>
              <button className="btn-primary" type="submit">Projektadatok mentese</button>
            </form>
          </Panel> : null}

          <Panel title="Kovetkezo lepesek">
            <div className="space-y-3">
              <Link href={technicalTabHref(ProjectTechnicalSection.BASICS)} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Muszaki alapadatok</span>
                <span>{technicalCompletionCount}/{technicalFieldDefinitions.length}</span>
              </Link>
              <Link href={tabHref('tasks')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Teendok kezelese</span>
                <span>{openTasks}</span>
              </Link>
              <Link href={tabHref('workflows')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Munkafazisok</span>
                <span>{project.workflows.length}</span>
              </Link>
              <Link href={tabHref('documents')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Dokumentumok</span>
                <span>{project.documents.length}</span>
              </Link>
              <Link href={tabHref('calendar')} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50">
                <span>Idopontok</span>
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

          {activeTechnicalSection === ProjectTechnicalSection.SUMMARIES ? (
            <Panel title="Automatikus mennyisegi szamitasok">
              <div className="space-y-4">
                {technicalCalculationGroups.length ? technicalCalculationGroups.map((group) => (
                  <article key={group.title} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold tracking-tight text-slate-900">{group.title}</div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{group.note}</p>
                      </div>
                      <Badge tone="blue">{group.items.length} tetel</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((item) => (
                        <div key={`${group.title}-${item.label}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
                          <div className="mt-2 text-base font-semibold text-slate-950">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                )) : <EmptyState text="A megadott muszaki adatokbol meg nem keszult szamithato mennyisegi osszesites." />}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel title="Munkafazis osszefoglalok">
            <div className="space-y-3">
              {technicalSummaryCards.map((summary) => (
                <article key={summary.key} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{summary.title}</div>
                    <Badge tone={summary.ready ? 'green' : 'amber'}>{summary.completion}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    {summary.relatedWorkflow
                      ? `Kapcsolt munkafazis: ${summary.relatedWorkflow.name}`
                      : 'Meg nincs hozzarendelt munkafazis.'}
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
                  A rogzitett muszaki parameterekbol mar automatikus mennyisegi becslesek keszulnek az alapozastol a burkolasig, ezekre lehet a szakipari workflow-kat es az ajanlatkeresi csomagokat raepiteni.
                </p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-950">
                <div className="font-medium">Kovetkezo epitesi kor</div>
                <p className="mt-2 leading-6">
                  A projektinditasnal automatikusan letrejott az alap szakipari munkafazis-lista. Innen mar csak a megfelelo alvallalkozot, dokumentumokat es teendoket kell hozzarendelni.
                </p>
              </div>
              <Link href={tabHref('workflows')} className="btn-primary inline-flex w-full justify-center">Munkafazisok megnyitasa</Link>
            </div>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'tasks' ? (
      <section className="mt-6">
        <Panel title="Teendok">
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
            {filteredTasks.length} teendo latszik
            {taskStatusFilter ? ` - ${taskStatusLabel[taskStatusFilter]}` : ''}
            {taskTypeFilter ? ` - ${taskTypeLabel[taskTypeFilter]}` : ''}
            {taskQuery ? ` - kereses: "${taskQuery}"` : ''}
          </div>

          <div className="space-y-6">
            {filteredTasks.length ? (
              <>
                <TaskGroup title="Lejart teendok" tasks={overdueTasks} projectId={project.id} returnTo={tabHref('tasks')} />
                <TaskGroup title="Mai / kozelgo teendok" tasks={upcomingTasks} projectId={project.id} returnTo={tabHref('tasks')} />
                <TaskGroup title="Megrendeloi dontesek" tasks={decisionTypeTasks} projectId={project.id} returnTo={tabHref('tasks')} />
                <TaskGroup title="Tovabbi aktiv teendok" tasks={remainingTasks} projectId={project.id} returnTo={tabHref('tasks')} />
                <TaskGroup title="Kesz teendok" tasks={doneTasks} projectId={project.id} returnTo={tabHref('tasks')} />
              </>
            ) : <EmptyState text="Nincs a szuroknek megfelelo projektteendo." />}
          </div>
        </Panel>

      </section>
      ) : null}

      {activeTab === 'workflows' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Munkafazisok">
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
            <form action={deleteProjectWorkflowAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="workflowId" value={workflow.id} />
              <input type="hidden" name="returnTo" value={tabHref('workflows')} />
              <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt a munkafolyamatot?">
                Torles
              </ConfirmSubmitButton>
            </form>
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
                )) : <EmptyState text="Ehhez a projekthez meg nincs munkafazis rogzitve." />}
            </div>
          </Panel>

          <Panel title="Uj munkafazis">
            <form action={createProjectWorkflowAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={tabHref('workflows')} />
              <Field label="Munkafazis neve">
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
              <button className="btn-primary" type="submit">Munkafazis rogzitese</button>
            </form>
          </Panel>
      </section>
      ) : null}

      {activeTab === 'team' ? (
      <section className="mt-6">
          <Panel title="Emberek">
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
                  <div className="mt-4 flex flex-wrap gap-3">
                    {member.role === ProjectRole.SUBCONTRACTOR ? (
                      <Link href={`/office/subcontractors/${member.id}`} className="btn-secondary">
                        Alvallalkozoi nezet
                      </Link>
                    ) : null}
                    <form action={updateProjectMemberActivityAction}>
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="isActive" value={member.isActive ? 'false' : 'true'} />
                      <input type="hidden" name="returnTo" value={tabHref('team')} />
                      <button className="btn-secondary" type="submit">
                        {member.isActive ? 'Inaktivva teszem' : 'Aktivalom'}
                      </button>
                    </form>
                  </div>
                </article>
              )) : <EmptyState text="Ehhez a projekthez meg nincs ember felvive." />}
            </div>
          </Panel>

      </section>
      ) : null}

      {activeTab === 'calendar' ? (
      <section className="mt-6">
          <Panel title="Projekt idopontok">
            <div className="space-y-6">
              {project.events.length ? (
                <>
                  <EventGroup title="Lejart idopontok" events={overdueEvents} projectId={project.id} returnTo={tabHref('calendar')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} />
                  <EventGroup title="Kovetkezo 7 nap" events={upcomingEvents} projectId={project.id} returnTo={tabHref('calendar')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} />
                  <EventGroup title="Teendohoz kotott idopontok" events={taskLinkedEvents} projectId={project.id} returnTo={tabHref('calendar')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} />
                  <EventGroup title="Tovabbi idopontok" events={remainingEvents} projectId={project.id} returnTo={tabHref('calendar')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} />
                </>
              ) : <EmptyState text="Ehhez a projekthez meg nincs idopont rogzitve." />}
            </div>
          </Panel>

      </section>
      ) : null}

      {activeTab === 'documents' ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Dokumentumok">
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
            <Field label="Dokumentum tipusa">
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
            <DocumentGroup title="Tervdokumentacios csomag" documents={planDocuments} projectId={project.id} returnTo={tabHref('documents')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} workflowOptions={project.workflows.map((workflow) => ({ id: workflow.id, name: workflow.name }))} />
            <DocumentGroup title="Munkafazis dokumentumok" documents={workflowDocuments} projectId={project.id} returnTo={tabHref('documents')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} workflowOptions={project.workflows.map((workflow) => ({ id: workflow.id, name: workflow.name }))} />
            <DocumentGroup title="Kivitelezoi / penzugyi dokumentumok" documents={contractorDocuments} projectId={project.id} returnTo={tabHref('documents')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} workflowOptions={project.workflows.map((workflow) => ({ id: workflow.id, name: workflow.name }))} />
            <DocumentGroup title="Altalanos dokumentumok" documents={generalDocuments} projectId={project.id} returnTo={tabHref('documents')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} workflowOptions={project.workflows.map((workflow) => ({ id: workflow.id, name: workflow.name }))} />
            {!filteredDocuments.length ? <EmptyState text="Ehhez a projekthez meg nincs a szuroknek megfelelo dokumentum." /> : null}
          </div>
        </Panel>

        <div id="uj-dokumentum">
        <Panel title="Uj dokumentum / link">
          <form action={createProjectDocumentAction} className="grid gap-4">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="returnTo" value={tabHref('documents')} />
            <Field label="Cim">
              <Input name="title" placeholder="Pl. statikai terv, szerzodes PDF, helyszini fotomappa" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hova tartozik?">
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
                <Select name="planChecklistType" defaultValue={ProjectPlanChecklistType.FLOOR_PLAN}>
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
              <Field label="Kapcsolodo munkafazis">
              <Select name="workflowId" defaultValue="">
                  <option value="">Nincs munkafazishoz kotve</option>
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
        <Panel title="Napi naplo">
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
            )) : <EmptyState text="Ehhez a projekthez meg nincs napi naplo bejegyzes." />}
          </div>
        </Panel>

        <div id="uj-enaplo">
        <Panel title="Uj napi naplo bejegyzes">
            <form action={createProjectSiteLogEntryAction} className="grid gap-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="returnTo" value={tabHref('site-log')} />
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
              <button className="btn-primary" type="submit">Napi naplo rogzitese</button>
            </form>
          </Panel>
        </div>
      </section>
      ) : null}

      {activeTab === 'issues' ? (
      <section className="mt-6">
        <Panel title="Problemak">
          <div className="space-y-6">
            <IssueGroup title="Nyitott problemak" issues={openIssues} projectId={project.id} returnTo={tabHref('issues')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
            <IssueGroup title="Folyamatban" issues={activeIssues} projectId={project.id} returnTo={tabHref('issues')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
            <IssueGroup title="Megoldva" issues={resolvedIssues} projectId={project.id} returnTo={tabHref('issues')} taskOptions={project.tasks.map((task) => ({ id: task.id, title: task.title }))} canEdit={canEdit} canDelete={canDelete} />
            {!project.issues.length ? <EmptyState text="Ehhez a projekthez meg nincs problema rogzitve." /> : null}
          </div>
        </Panel>

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

function NextStepCard({
  title,
  text,
  href,
  cta,
  tone,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
  tone: 'green' | 'blue' | 'amber';
}) {
  const toneClass = tone === 'green'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
    : tone === 'blue'
      ? 'border-sky-200 bg-sky-50 text-sky-950'
      : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <article className={`rounded-[24px] border p-5 ${toneClass}`}>
      <div className="text-lg font-semibold tracking-tight">{title}</div>
      <p className="mt-2 text-sm leading-6 text-current opacity-75">{text}</p>
      <Link href={href} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_22px_rgba(33,48,39,0.08)]">
        {cta}
      </Link>
    </article>
  );
}

function TaskGroup({
  title,
  tasks,
  projectId,
  returnTo,
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
    approvedAt: Date | null;
    approvalRequired: boolean;
    assignee: { name: string } | null;
    approvedBy: { name: string } | null;
    workflow: { name: string } | null;
  }>;
  projectId: string;
  returnTo: string;
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
              <InfoRow
                label="Jovahagyas"
                value={task.approvalRequired
                  ? task.status === 'DONE' && task.approvedAt
                    ? `${task.approvedBy?.name || 'Rogzitett jovahagyas'} | ${formatDateTime(task.approvedAt)}`
                    : task.status === 'WAITING_APPROVAL'
                      ? `${task.approvedBy?.name || 'Nincs kijelolve'} | Jovahagyasra var`
                      : `${task.approvedBy?.name || 'Nincs kijelolve'} | Meg nem tortent`
                  : 'Nem szukseges'}
                compact
              />
            </div>
            {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
            <form action={updateProjectTaskStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Field label="Gyors statuszvaltas">
                <Select name="status" defaultValue={task.status}>
                  {Object.entries(taskStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <button className="btn-secondary" type="submit">
                {task.approvalRequired && task.status === 'WAITING_APPROVAL' ? 'Jovahagyas rogzitese' : 'Frissites'}
              </button>
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
  projectId,
  returnTo,
  taskOptions,
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
    task: { id: string; title: string } | null;
  }>;
  projectId: string;
  returnTo: string;
  taskOptions: Array<{ id: string; title: string }>;
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
            <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
                Szerkesztes
              </summary>
              <form action={updateProjectEventAction} className="grid gap-3 border-t border-slate-200 p-4">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <Field label="Esemeny cime">
                  <Input name="title" defaultValue={event.title} required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tipus">
                    <Select name="type" defaultValue={event.type}>
                      {Object.entries(eventTypeLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Kapcsolodo feladat">
                    <Select name="taskId" defaultValue={event.task?.id || ''}>
                      <option value="">Nincs hozzakotve feladathoz</option>
                      {taskOptions.map((task) => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Kezdes">
                    <Input type="datetime-local" name="startsAt" defaultValue={toDateTimeLocalInput(event.startsAt)} required />
                  </Field>
                  <Field label="Vege">
                    <Input type="datetime-local" name="endsAt" defaultValue={toDateTimeLocalInput(event.endsAt)} />
                  </Field>
                </div>
                <Field label="Helyszin">
                  <Input name="location" defaultValue={event.location || ''} />
                </Field>
                <Field label="Megjegyzes">
                  <Textarea name="notes" defaultValue={event.notes || ''} />
                </Field>
                <button className="btn-secondary" type="submit">Esemeny mentese</button>
              </form>
            </details>
            <form action={deleteProjectEventAction} className="mt-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="eventId" value={event.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt az esemenyt?">
                Esemeny torlese
              </ConfirmSubmitButton>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

function DocumentGroup({
  title,
  documents,
  projectId,
  returnTo,
  taskOptions,
  workflowOptions,
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
    task: { id: string; title: string } | null;
    workflow: { id: string; name: string } | null;
  }>;
  projectId: string;
  returnTo: string;
  taskOptions: Array<{ id: string; title: string }>;
  workflowOptions: Array<{ id: string; name: string }>;
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
              <InfoRow label="Teendo" value={document.task?.title || 'Nincs teendohoz kotve'} compact />
              <InfoRow label="Munkafazis" value={document.workflow?.name || 'Nincs munkafazishoz kotve'} compact />
            </div>
            <a href={document.linkUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-sm font-semibold text-orange-700 hover:text-orange-800">
              Megnyitas: {document.linkUrl}
            </a>
            {document.tags ? <div className="mt-2 text-sm text-slate-500">Cimkek: {document.tags}</div> : null}
            {document.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{document.notes}</p> : null}
            <div className="mt-3 text-xs text-slate-500">Rogzitve: {formatDateTime(document.createdAt)}</div>
            <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
                Szerkesztes
              </summary>
              <form action={updateProjectDocumentAction} className="grid gap-3 border-t border-slate-200 p-4">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="documentId" value={document.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <Field label="Cim">
                  <Input name="title" defaultValue={document.title} required />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Dokumentum scope">
                    <Select name="scope" defaultValue={document.scope}>
                      {Object.entries(documentScopeLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Kategoria">
                    <Select name="category" defaultValue={document.category}>
                      {Object.entries(documentCategoryLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Terv checklista elem">
                    <Select name="planChecklistType" defaultValue={document.planChecklistType || ''}>
                      <option value="">Nincs megadva</option>
                      {Object.entries(planChecklistLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Kapcsolodo teendo">
                    <Select name="taskId" defaultValue={document.task?.id || ''}>
                      <option value="">Nincs teendohoz kotve</option>
                      {taskOptions.map((task) => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Kapcsolodo munkafazis">
                  <Select name="workflowId" defaultValue={document.workflow?.id || ''}>
                    <option value="">Nincs munkafazishoz kotve</option>
                    {workflowOptions.map((workflow) => (
                      <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Link vagy eleresi ut">
                  <Input name="linkUrl" defaultValue={document.linkUrl} required />
                </Field>
                <Field label="Cimkek">
                  <Input name="tags" defaultValue={document.tags || ''} />
                </Field>
                <Field label="Megjegyzes">
                  <Textarea name="notes" defaultValue={document.notes || ''} />
                </Field>
                <button className="btn-secondary" type="submit">Dokumentum mentese</button>
              </form>
            </details>
            <form action={deleteProjectDocumentAction} className="mt-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="documentId" value={document.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt a dokumentumot?">
                Dokumentum torlese
              </ConfirmSubmitButton>
            </form>
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
  returnTo,
  taskOptions,
  canEdit,
  canDelete,
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
    task: { id: string; title: string } | null;
  }>;
  projectId: string;
  returnTo: string;
  taskOptions: Array<{ id: string; title: string }>;
  canEdit: boolean;
  canDelete: boolean;
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
              <div>Kapcsolodo teendo: {issue.task?.title || 'Nincs hozzakotve'}</div>
              <div>Megoldva: {formatDateTime(issue.resolvedAt)}</div>
            </div>
            {issue.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{issue.description}</p> : null}
            {canEdit ? (
              <>
                <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
                    Szerkesztes
                  </summary>
                  <form action={updateProjectIssueAction} className="grid gap-3 border-t border-slate-200 p-4">
                    <input type="hidden" name="projectId" value={projectId} />
                    <input type="hidden" name="issueId" value={issue.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <Field label="Cim">
                      <Input name="title" defaultValue={issue.title} required />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Kategoria">
                        <Select name="category" defaultValue={issue.category}>
                          {Object.entries(issueCategoryLabel).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Statusz">
                        <Select name="status" defaultValue={issue.status}>
                          {Object.entries(issueStatusLabel).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Kapcsolodo teendo">
                        <Select name="taskId" defaultValue={issue.task?.id || ''}>
                          <option value="">Nincs hozzakotve teendohoz</option>
                          {taskOptions.map((task) => (
                            <option key={task.id} value={task.id}>{task.title}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Felelos / kapcsolattarto">
                        <Input name="responsibleName" defaultValue={issue.responsibleName || ''} />
                      </Field>
                    </div>
                    <Field label="Leiras">
                      <Textarea name="description" defaultValue={issue.description || ''} />
                    </Field>
                    <button className="btn-secondary" type="submit">Problema mentese</button>
                  </form>
                </details>
                <form action={updateProjectIssueStatusAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="issueId" value={issue.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <Field label="Problema statusza">
                    <Select name="status" defaultValue={issue.status}>
                      {Object.entries(issueStatusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <button className="btn-secondary" type="submit">Frissites</button>
                </form>
              </>
            ) : null}
            {canDelete ? (
              <form action={deleteProjectIssueAction} className="mt-3">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="issueId" value={issue.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <ConfirmSubmitButton className="btn-secondary" message="Biztosan torlod ezt a problemat?">
                  Problema torlese
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">{text}</div>;
}

function InlineNotice({ tone, text }: { tone: 'success' | 'error' | 'warn'; text: string }) {
  const classes = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <section className={`rounded-[24px] border p-4 text-sm shadow-[0_14px_36px_rgba(15,23,42,0.05)] ${classes}`}>
      {text}
    </section>
  );
}
