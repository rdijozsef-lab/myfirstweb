import {
  PrismaClient,
  EventType,
  LeadSource,
  LeadStatus,
  ProjectDocumentCategory,
  ProjectDocumentScope,
  ProjectEventType,
  ProjectIssueCategory,
  ProjectIssueStatus,
  ProjectPermissionLevel,
  ProjectPlanChecklistType,
  ProjectRole,
  ProjectStatus,
  ProjectTaskPriority,
  ProjectTaskStatus,
  ProjectTaskType,
  ProjectTechnicalSection,
  ProjectTechnicalValueType,
  ProjectWorkflowStatus,
  ProjectWorkflowTemplate,
  TaskPriority,
  TaskStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureContacts() {
  let contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'asc' }, take: 3 });
  if (contacts.length > 0) return contacts;

  contacts = await Promise.all([
    prisma.contact.create({ data: { name: 'Kiss Gabor', company: 'Kecskemet Klima', email: 'gabor@klima.hu', phone: '+36301112233', source: LeadSource.WEBSITE, statusLabel: 'Ajanlatra var', tags: 'klima, szolgaltato' } }),
    prisma.contact.create({ data: { name: 'Toth Eniko', company: 'Heni Konyhaja', email: 'hello@henikonyha.hu', phone: '+36703332211', source: LeadSource.PHONE, statusLabel: 'Aktiv ugyfel', tags: 'workshop, food' } }),
    prisma.contact.create({ data: { name: 'Molnar Patrik', company: 'EpPont Kft.', email: 'patrik@eppont.hu', phone: '+36205678899', source: LeadSource.FACEBOOK, statusLabel: 'Visszahivando', tags: 'kivitelezo' } }),
  ]);

  return contacts;
}

async function ensureOfficeDemo(adminId: string, contactIds: string[]) {
  if ((await prisma.lead.count()) === 0) {
    await prisma.lead.createMany({
      data: [
        { title: 'Kivitelezoi ajanlatkeres', status: LeadStatus.NEW, source: LeadSource.WEBSITE, contactId: contactIds[2], ownerId: adminId, valueLabel: 'Kozepes', dueAt: new Date(Date.now() + 86400000) },
        { title: 'Workshop landing egyeztetes', status: LeadStatus.IN_PROGRESS, source: LeadSource.PHONE, contactId: contactIds[1], ownerId: adminId, valueLabel: 'Magas', dueAt: new Date(Date.now() + 2 * 86400000) },
        { title: 'Klimas demo erdeklodes', status: LeadStatus.OFFER_SENT, source: LeadSource.FACEBOOK, contactId: contactIds[0], ownerId: adminId, valueLabel: 'Alacsony', dueAt: new Date(Date.now() + 3 * 86400000) },
      ],
    });
  }

  if ((await prisma.task.count()) === 0) {
    await prisma.task.createMany({
      data: [
        { title: 'Ajanlat kikuldese', status: TaskStatus.TODO, priority: TaskPriority.URGENT, contactId: contactIds[2], ownerId: adminId, dueAt: new Date(Date.now() + 4 * 3600000) },
        { title: 'Workshop oldal javitasa', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, contactId: contactIds[1], ownerId: adminId, dueAt: new Date(Date.now() + 8 * 3600000) },
        { title: 'Klimas hivas vissza', status: TaskStatus.WAITING, priority: TaskPriority.MEDIUM, contactId: contactIds[0], ownerId: adminId, dueAt: new Date(Date.now() + 24 * 3600000) },
      ],
    });
  }

  if ((await prisma.calendarEvent.count()) === 0) {
    await prisma.calendarEvent.createMany({
      data: [
        { title: 'EpPont egyeztetes', type: EventType.MEETING, startsAt: new Date(Date.now() + 2 * 3600000), endsAt: new Date(Date.now() + 3 * 3600000), contactId: contactIds[2], ownerId: adminId, location: 'Google Meet' },
        { title: 'Heni workshop call', type: EventType.CALL, startsAt: new Date(Date.now() + 6 * 3600000), endsAt: new Date(Date.now() + 7 * 3600000), contactId: contactIds[1], ownerId: adminId, location: 'Telefon' },
        { title: 'Instagram poszt idozites', type: EventType.SOCIAL, startsAt: new Date(Date.now() + 10 * 3600000), ownerId: adminId },
      ],
    });
  }
}

async function ensureTechnicalParameters(
  projectId: string,
  items: Array<{
    section: ProjectTechnicalSection;
    groupKey: string;
    paramKey: string;
    label: string;
    valueType: ProjectTechnicalValueType;
    unit?: string | null;
    textValue?: string | null;
    numberValue?: number | null;
    booleanValue?: boolean | null;
  }>,
) {
  for (const item of items) {
    await prisma.projectTechnicalParameter.upsert({
      where: {
        projectId_paramKey: {
          projectId,
          paramKey: item.paramKey,
        },
      },
      update: {
        section: item.section,
        groupKey: item.groupKey,
        label: item.label,
        valueType: item.valueType,
        unit: item.unit || null,
        textValue: item.textValue || null,
        numberValue: item.numberValue ?? null,
        booleanValue: item.booleanValue ?? null,
      },
      create: {
        projectId,
        section: item.section,
        groupKey: item.groupKey,
        paramKey: item.paramKey,
        label: item.label,
        valueType: item.valueType,
        unit: item.unit || null,
        textValue: item.textValue || null,
        numberValue: item.numberValue ?? null,
        booleanValue: item.booleanValue ?? null,
      },
    });
  }
}

async function ensureProjectDemo(adminId: string, contactIds: string[]) {
  const existingPrepProject = await prisma.project.findFirst({
    where: { name: 'Farkas haz - Gyor' },
    select: { id: true },
  });
  let prepProjectId = existingPrepProject?.id || null;

  if (!existingPrepProject) {
    const prepProject = await prisma.project.create({
      data: {
        name: 'Farkas haz - Gyor',
        code: 'FAR-2026-01',
        city: 'Gyor',
        postalCode: '9021',
        addressLine: 'Minta utca 12.',
        status: ProjectStatus.PREPARATION,
        customerName: 'Farkas Andras',
        customerPhone: '+36301234567',
        customerEmail: 'farkas.andras@example.com',
        description: 'Elokeszites alatti projekt, hianyos dokumentacioval.',
        createdByUserId: adminId,
      },
    });

    await prisma.projectMember.createMany({
      data: [
        {
          projectId: prepProject.id,
          contactId: contactIds[2],
          name: 'Molnar Patrik',
          phone: '+36205678899',
          email: 'patrik@eppont.hu',
          role: ProjectRole.PROJECT_MANAGER,
          permissionLevel: ProjectPermissionLevel.FULL,
        },
        {
          projectId: prepProject.id,
          name: 'Farkas Andras',
          phone: '+36301234567',
          email: 'farkas.andras@example.com',
          role: ProjectRole.CUSTOMER,
          permissionLevel: ProjectPermissionLevel.VIEW_APPROVE,
        },
      ],
    });
    prepProjectId = prepProject.id;
  }

  if (prepProjectId) {
    await ensureTechnicalParameters(prepProjectId, [
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'lot_area_m2', label: 'Telek merete', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 720 },
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'gross_floor_area_m2', label: 'Brutto alapterulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 138 },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_type', label: 'Alapozas tipusa', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'strip' },
      { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'decision_blockers', label: 'Megrendeloi dontesi blokkolok', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Homlokzati szin es nyilaszaro gyarto meg nincs veglegesitve.' },
    ]);
  }

  const existingActiveProject = await prisma.project.findFirst({
    where: { name: 'Kovacs haz - Kecskemet' },
    select: { id: true },
  });

  if (existingActiveProject) {
    await ensureTechnicalParameters(existingActiveProject.id, [
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'lot_area_m2', label: 'Telek merete', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 860 },
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'gross_floor_area_m2', label: 'Brutto alapterulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 148 },
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'level_count', label: 'Szintek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 1 },
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'room_count', label: 'Helyisegek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 12 },
      { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'utilities_ready', label: 'Kozmuellatottsag rendezett', valueType: ProjectTechnicalValueType.BOOLEAN, booleanValue: true },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_type', label: 'Alapozas tipusa', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'slab' },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_depth_cm', label: 'Alapozasi melyseg', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 90 },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_concrete', label: 'Betonminoseg', valueType: ProjectTechnicalValueType.TEXT, textValue: 'C25/30' },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'excavation_volume_m3', label: 'Kiemelendo fold mennyiseg', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm3', numberValue: 68 },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'masonry', paramKey: 'main_wall_material', label: 'Fofal anyaga', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'porotherm' },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'masonry', paramKey: 'main_wall_thickness_cm', label: 'Fofal vastagsag', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 30 },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_structure_type', label: 'Tetoszerkezet', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'traditional' },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_cover_type', label: 'Tetofedes tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Beton cserép, antracit' },
      { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_area_m2', label: 'Teto felulete', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 212 },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'insulation', paramKey: 'facade_insulation_type', label: 'Homlokzati hoszigeteles tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Grafitos EPS' },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'insulation', paramKey: 'facade_insulation_thickness_cm', label: 'Homlokzati vastagsag', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 15 },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'window_material', label: 'Nyilaszaro anyaga', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'plastic' },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'window_count', label: 'Ablakok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 14 },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'shading_type', label: 'Arnyekolas', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Motoros redony + szunyogháló' },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'facade', paramKey: 'facade_finish_type', label: 'Vakolat / homlokzati rendszer', valueType: ProjectTechnicalValueType.TEXT, textValue: '1,5 mm kapart vakolat' },
      { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'facade', paramKey: 'facade_area_m2', label: 'Homlokzati felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 196 },
      { section: ProjectTechnicalSection.INTERIOR, groupKey: 'screed', paramKey: 'screed_type', label: 'Aljzatbeton tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Usztatott, padlofutessel' },
      { section: ProjectTechnicalSection.INTERIOR, groupKey: 'screed', paramKey: 'screed_area_m2', label: 'Aljzat felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 132 },
      { section: ProjectTechnicalSection.INTERIOR, groupKey: 'tiling', paramKey: 'tile_area_m2', label: 'Burkolando felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 84 },
      { section: ProjectTechnicalSection.INTERIOR, groupKey: 'painting', paramKey: 'paint_area_m2', label: 'Festendo falfelulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 318 },
      { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'power_supply', label: 'Aramellatas', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: '3_phase' },
      { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'socket_count', label: 'Dugaljak szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 62 },
      { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'switch_count', label: 'Kapcsolok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 31 },
      { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'smart_home_ready', label: 'Okosotthon elokeszites', valueType: ProjectTechnicalValueType.BOOLEAN, booleanValue: true },
      { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'heating_system', label: 'Futesi rendszer', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Hoszivattyu + padlofutes' },
      { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'heating_circuit_count', label: 'Padlofutesi korok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 11 },
      { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'wet_room_count', label: 'Vizes helyisegek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 3 },
      { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'contract_scope_summary', label: 'Szerzodeses muszaki tartalom', valueType: ProjectTechnicalValueType.TEXT, textValue: 'A homlokzati, nyilaszaro es gepeszeti csomagok kulon alvallalkozoi szerzodessel indulnak.' },
      { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'quote_request_notes', label: 'Ajanlatkeresi megjegyzesek', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Minden ajanlatkereshez csatolni kell a relevans tervlapot, nyilaszarolistat es hataridot.' },
      { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'decision_blockers', label: 'Megrendeloi dontesi blokkolok', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Vegleges burkolat es kapcsolocsalad valasztas meg hianyzik.' },
    ]);

    const contractorMember = await prisma.projectMember.findFirst({
      where: {
        projectId: existingActiveProject.id,
        role: ProjectRole.SUBCONTRACTOR,
      },
      select: { id: true },
    });

    const workflows = await prisma.projectWorkflow.findMany({
      where: { projectId: existingActiveProject.id },
      select: { id: true, name: true },
    });

    if (contractorMember) {
      for (const workflow of workflows) {
        await prisma.projectWorkflow.update({
          where: { id: workflow.id },
          data: { contractorMemberId: contractorMember.id },
        });
      }
    }

    const facadeWorkflow = workflows.find((workflow) => workflow.name === 'Homlokzati szinezes');
    const openingsWorkflow = workflows.find((workflow) => workflow.name === 'Nyilaszaro beepites');
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: existingActiveProject.id },
      select: { id: true, title: true },
    });

    const facadeTask = tasks.find((task) => task.title === 'Homlokzati szinminta jovahagyasa');
    const openingsTask = tasks.find((task) => task.title === 'Ablakok pontos meretezese');

    if (facadeTask && facadeWorkflow) {
      await prisma.projectTask.update({
        where: { id: facadeTask.id },
        data: { workflowId: facadeWorkflow.id },
      });
    }

    if (openingsTask && openingsWorkflow) {
      await prisma.projectTask.update({
        where: { id: openingsTask.id },
        data: { workflowId: openingsWorkflow.id },
      });
    }

    const workflowDocuments = await prisma.projectDocument.findMany({
      where: {
        projectId: existingActiveProject.id,
        workflowId: { not: null },
      },
      select: { id: true, title: true },
    });

    const facadeDoc = workflowDocuments.find((document) => document.title === 'Homlokzati szinminta fotok');
    const openingsDoc = workflowDocuments.find((document) => document.title === 'Nyilaszaro vallalkozoi szerzodes');

    if (facadeDoc) {
      await prisma.projectDocument.update({
        where: { id: facadeDoc.id },
        data: { workflowRequirementKey: 'color_approval' },
      });
    }

    if (openingsDoc) {
      await prisma.projectDocument.update({
        where: { id: openingsDoc.id },
        data: { workflowRequirementKey: 'openings_schedule' },
      });
    }
    return;
  }

  const activeProject = await prisma.project.create({
    data: {
      name: 'Kovacs haz - Kecskemet',
      code: 'KOV-2026-02',
      city: 'Kecskemet',
      postalCode: '6000',
      addressLine: 'Fo utca 18.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-04-01'),
      expectedEndDate: new Date('2026-09-30'),
      customerName: 'Kovacs Janos',
      customerPhone: '+36305557777',
      customerEmail: 'kovacs.janos@example.com',
      description: 'Teljesen feltoltott demo projekt a teljes funkciohalmaz kiprobalasahoz.',
      createdByUserId: adminId,
    },
  });

  const ownerMember = await prisma.projectMember.create({
    data: {
      projectId: activeProject.id,
      name: 'Admin',
      email: 'admin@myfirstoffice.local',
      role: ProjectRole.OWNER,
      permissionLevel: ProjectPermissionLevel.FULL,
    },
  });

  const customerMember = await prisma.projectMember.create({
    data: {
      projectId: activeProject.id,
      name: 'Kovacs Janos',
      phone: '+36305557777',
      email: 'kovacs.janos@example.com',
      role: ProjectRole.CUSTOMER,
      permissionLevel: ProjectPermissionLevel.VIEW_APPROVE,
    },
  });

  const contractorMember = await prisma.projectMember.create({
    data: {
      projectId: activeProject.id,
      contactId: contactIds[2],
      name: 'Molnar Patrik',
      phone: '+36205678899',
      email: 'patrik@eppont.hu',
      role: ProjectRole.SUBCONTRACTOR,
      permissionLevel: ProjectPermissionLevel.CONTRIBUTE,
      notes: 'Demo kivitelezo kapcsolattarto',
    },
  });

  const workflow1 = await prisma.projectWorkflow.create({
    data: {
      projectId: activeProject.id,
      contractorMemberId: contractorMember.id,
      name: 'Homlokzati szinezes',
      template: ProjectWorkflowTemplate.FACADE,
      status: ProjectWorkflowStatus.ACTIVE,
      contractorCompany: 'Homlokzat Profi Kft.',
      contractorName: 'Sipos Marton',
      contractorPhone: '+36306661111',
      contractorEmail: 'marton@homlokzatprofi.hu',
      customerSelections: 'Homlokzatszin: tortfeher, labazat: antracit, ereszcsatorna: grafitszurke.',
      specificationNotes: 'A kivitelezo minden mintaszint a projektnaploban ellenoriz.',
      createdByUserId: adminId,
    },
  });

  const workflow2 = await prisma.projectWorkflow.create({
    data: {
      projectId: activeProject.id,
      contractorMemberId: contractorMember.id,
      name: 'Nyilaszaro beepites',
      template: ProjectWorkflowTemplate.OPENINGS,
      status: ProjectWorkflowStatus.PLANNED,
      contractorCompany: 'AblakPont Kft.',
      contractorName: 'Boros Levente',
      contractorPhone: '+36307778888',
      contractorEmail: 'levente@ablakpont.hu',
      customerSelections: 'Nyilaszarok: dio szinu, 3 retegu muanyag profil, antracit kilincs.',
      specificationNotes: 'Beepites elott a pontos nyilasmereteket ujra fel kell venni.',
      createdByUserId: adminId,
    },
  });

  const task1 = await prisma.projectTask.create({
    data: {
      projectId: activeProject.id,
      workflowId: workflow1.id,
      title: 'Homlokzati szinminta jovahagyasa',
      type: ProjectTaskType.CUSTOMER_DECISION,
      status: ProjectTaskStatus.WAITING_APPROVAL,
      priority: ProjectTaskPriority.HIGH,
      assigneeMemberId: customerMember.id,
      approvedByMemberId: customerMember.id,
      approvalRequired: true,
      dueAt: new Date(Date.now() + 2 * 86400000),
      createdByUserId: adminId,
    },
  });

  const task2 = await prisma.projectTask.create({
    data: {
      projectId: activeProject.id,
      workflowId: workflow2.id,
      title: 'Ablakok pontos meretezese',
      type: ProjectTaskType.EXECUTION,
      status: ProjectTaskStatus.IN_PROGRESS,
      priority: ProjectTaskPriority.MEDIUM,
      assigneeMemberId: contractorMember.id,
      dueAt: new Date(Date.now() + 5 * 86400000),
      createdByUserId: adminId,
    },
  });

  await prisma.projectEvent.createMany({
    data: [
      {
        projectId: activeProject.id,
        taskId: task1.id,
        title: 'Megrendeloi bejaras',
        type: ProjectEventType.MEETING,
        startsAt: new Date(Date.now() + 86400000),
        location: 'Helyszin',
        notes: 'Szinmintak es nyilaszaro mintak egyeztetese',
        createdByUserId: adminId,
      },
      {
        projectId: activeProject.id,
        taskId: task2.id,
        title: 'Meretezesi nap',
        type: ProjectEventType.WORK_START,
        startsAt: new Date(Date.now() + 3 * 86400000),
        createdByUserId: adminId,
      },
    ],
  });

  await prisma.projectSiteLogEntry.create({
    data: {
      projectId: activeProject.id,
      entryDate: new Date(),
      attendees: 'projektvezeto, 2 fo komuves, homlokzati kivitelezo',
      completedWork: 'Homlokzati allvanyozas elokeszitve, szinmintak helyszini ellenorzese megtortent.',
      issues: 'A labazati szinrol vegso jovahagyas meg hianyzik.',
      weather: 'napos, 19 C',
      createdByUserId: adminId,
    },
  });

  await prisma.projectIssue.create({
    data: {
      projectId: activeProject.id,
      taskId: task1.id,
      title: 'Labazati szin meg nincs jovahagyva',
      category: ProjectIssueCategory.DECISION,
      status: ProjectIssueStatus.OPEN,
      responsibleName: 'Kovacs Janos',
      description: 'A homlokzati rendszer gyartasahoz szukseges a labazat vegleges szin dontese.',
      createdByUserId: adminId,
    },
  });

  const checklistDocs: Array<{ type: ProjectPlanChecklistType; title: string; workflowId: string | null }> = [
    { type: ProjectPlanChecklistType.ARCHITECTURAL, title: 'Epiteszeti tervlap csomag', workflowId: null },
    { type: ProjectPlanChecklistType.STRUCTURAL, title: 'Statikai terv', workflowId: null },
    { type: ProjectPlanChecklistType.ELECTRICAL, title: 'Villamos terv', workflowId: workflow2.id },
    { type: ProjectPlanChecklistType.MECHANICAL, title: 'Gepeszeti terv', workflowId: null },
    { type: ProjectPlanChecklistType.FACADE, title: 'Homlokzati tervlap', workflowId: workflow1.id },
    { type: ProjectPlanChecklistType.INTERIOR, title: 'Belso specifikacio', workflowId: workflow2.id },
  ];

  for (const doc of checklistDocs) {
    await prisma.projectDocument.create({
      data: {
        projectId: activeProject.id,
        workflowId: doc.workflowId,
        title: doc.title,
        category: ProjectDocumentCategory.PLAN,
        scope: ProjectDocumentScope.PLAN_PACKAGE,
        planChecklistType: doc.type,
        linkUrl: `https://example.com/docs/${String(doc.type).toLowerCase()}.pdf`,
        tags: 'terv, demo',
        notes: 'Demodokumentum a projekt tesztelesehez.',
        uploadedByUserId: adminId,
      },
    });
  }

  await prisma.projectDocument.createMany({
    data: [
      {
        projectId: activeProject.id,
        workflowId: workflow1.id,
        taskId: task1.id,
        workflowRequirementKey: 'color_approval',
        title: 'Homlokzati szinminta fotok',
        category: ProjectDocumentCategory.PHOTO,
        scope: ProjectDocumentScope.WORKFLOW,
        linkUrl: 'https://example.com/docs/homlokzat-fotok',
        tags: 'homlokzat, foto, minta',
        notes: 'A megrendelovel egyeztetett fotok.',
        uploadedByUserId: adminId,
      },
      {
        projectId: activeProject.id,
        workflowId: workflow2.id,
        workflowRequirementKey: 'openings_schedule',
        title: 'Nyilaszaro vallalkozoi szerzodes',
        category: ProjectDocumentCategory.CONTRACT,
        scope: ProjectDocumentScope.CONTRACTOR,
        linkUrl: 'https://example.com/docs/nyilaszaro-szerzodes.pdf',
        tags: 'szerzodes, kivitelezo',
        notes: 'Alvallalkozoi szerzodes mintadokumentum.',
        uploadedByUserId: adminId,
      },
      {
        projectId: activeProject.id,
        workflowId: workflow2.id,
        title: 'Ablak elo szamla',
        category: ProjectDocumentCategory.OTHER,
        scope: ProjectDocumentScope.FINANCIAL,
        linkUrl: 'https://example.com/docs/eloszamla.pdf',
        tags: 'szamla, penzugy',
        notes: 'Demo penzugyi dokumentum.',
        uploadedByUserId: adminId,
      },
    ],
  });

  await ensureTechnicalParameters(activeProject.id, [
    { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'lot_area_m2', label: 'Telek merete', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 860 },
    { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'gross_floor_area_m2', label: 'Brutto alapterulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 148 },
    { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'level_count', label: 'Szintek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 1 },
    { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'room_count', label: 'Helyisegek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 12 },
    { section: ProjectTechnicalSection.BASICS, groupKey: 'site', paramKey: 'utilities_ready', label: 'Kozmuellatottsag rendezett', valueType: ProjectTechnicalValueType.BOOLEAN, booleanValue: true },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_type', label: 'Alapozas tipusa', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'slab' },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_depth_cm', label: 'Alapozasi melyseg', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 90 },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'foundation_concrete', label: 'Betonminoseg', valueType: ProjectTechnicalValueType.TEXT, textValue: 'C25/30' },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'foundation', paramKey: 'excavation_volume_m3', label: 'Kiemelendo fold mennyiseg', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm3', numberValue: 68 },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'masonry', paramKey: 'main_wall_material', label: 'Fofal anyaga', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'porotherm' },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'masonry', paramKey: 'main_wall_thickness_cm', label: 'Fofal vastagsag', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 30 },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_structure_type', label: 'Tetoszerkezet', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'traditional' },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_cover_type', label: 'Tetofedes tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Beton cserép, antracit' },
    { section: ProjectTechnicalSection.STRUCTURES, groupKey: 'roof', paramKey: 'roof_area_m2', label: 'Teto felulete', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 212 },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'insulation', paramKey: 'facade_insulation_type', label: 'Homlokzati hoszigeteles tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Grafitos EPS' },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'insulation', paramKey: 'facade_insulation_thickness_cm', label: 'Homlokzati vastagsag', valueType: ProjectTechnicalValueType.NUMBER, unit: 'cm', numberValue: 15 },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'window_material', label: 'Nyilaszaro anyaga', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: 'plastic' },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'window_count', label: 'Ablakok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 14 },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'openings', paramKey: 'shading_type', label: 'Arnyekolas', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Motoros redony + szunyogháló' },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'facade', paramKey: 'facade_finish_type', label: 'Vakolat / homlokzati rendszer', valueType: ProjectTechnicalValueType.TEXT, textValue: '1,5 mm kapart vakolat' },
    { section: ProjectTechnicalSection.EXTERIOR, groupKey: 'facade', paramKey: 'facade_area_m2', label: 'Homlokzati felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 196 },
    { section: ProjectTechnicalSection.INTERIOR, groupKey: 'screed', paramKey: 'screed_type', label: 'Aljzatbeton tipusa', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Usztatott, padlofutessel' },
    { section: ProjectTechnicalSection.INTERIOR, groupKey: 'screed', paramKey: 'screed_area_m2', label: 'Aljzat felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 132 },
    { section: ProjectTechnicalSection.INTERIOR, groupKey: 'tiling', paramKey: 'tile_area_m2', label: 'Burkolando felulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 84 },
    { section: ProjectTechnicalSection.INTERIOR, groupKey: 'painting', paramKey: 'paint_area_m2', label: 'Festendo falfelulet', valueType: ProjectTechnicalValueType.NUMBER, unit: 'm2', numberValue: 318 },
    { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'power_supply', label: 'Aramellatas', valueType: ProjectTechnicalValueType.SINGLE_SELECT, textValue: '3_phase' },
    { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'socket_count', label: 'Dugaljak szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 62 },
    { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'switch_count', label: 'Kapcsolok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 31 },
    { section: ProjectTechnicalSection.MEP, groupKey: 'electrical', paramKey: 'smart_home_ready', label: 'Okosotthon elokeszites', valueType: ProjectTechnicalValueType.BOOLEAN, booleanValue: true },
    { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'heating_system', label: 'Futesi rendszer', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Hoszivattyu + padlofutes' },
    { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'heating_circuit_count', label: 'Padlofutesi korok szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 11 },
    { section: ProjectTechnicalSection.MEP, groupKey: 'mechanical', paramKey: 'wet_room_count', label: 'Vizes helyisegek szama', valueType: ProjectTechnicalValueType.NUMBER, numberValue: 3 },
    { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'contract_scope_summary', label: 'Szerzodeses muszaki tartalom', valueType: ProjectTechnicalValueType.TEXT, textValue: 'A homlokzati, nyilaszaro es gepeszeti csomagok kulon alvallalkozoi szerzodessel indulnak.' },
    { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'quote_request_notes', label: 'Ajanlatkeresi megjegyzesek', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Minden ajanlatkereshez csatolni kell a relevans tervlapot, nyilaszarolistat es hataridot.' },
    { section: ProjectTechnicalSection.SUBCONTRACTOR_PREP, groupKey: 'package', paramKey: 'decision_blockers', label: 'Megrendeloi dontesi blokkolok', valueType: ProjectTechnicalValueType.TEXT, textValue: 'Vegleges burkolat es kapcsolocsalad valasztas meg hianyzik.' },
  ]);

  await prisma.projectTask.update({
    where: { id: task1.id },
    data: { approvedByMemberId: ownerMember.id },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@myfirstoffice.local',
      name: 'Admin',
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  const contacts = await ensureContacts();
  await ensureOfficeDemo(admin.id, contacts.map((contact) => contact.id));
  await ensureProjectDemo(admin.id, contacts.map((contact) => contact.id));
}

main().finally(async () => {
  await prisma.$disconnect();
});
