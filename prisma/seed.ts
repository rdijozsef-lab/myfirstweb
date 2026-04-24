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
  PartnerQualificationStatus,
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

async function ensureSubcontractorUser() {
  const passwordHash = await bcrypt.hash('patrik123', 10);

  return prisma.user.upsert({
    where: { username: 'patrik' },
    update: {
      email: 'patrik@eppont.hu',
      name: 'Molnar Patrik',
      passwordHash,
      role: UserRole.OPERATOR,
      isActive: true,
    },
    create: {
      username: 'patrik',
      email: 'patrik@eppont.hu',
      name: 'Molnar Patrik',
      passwordHash,
      role: UserRole.OPERATOR,
      isActive: true,
    },
  });
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
    { type: ProjectPlanChecklistType.FLOOR_PLAN, title: 'Alaprajz', workflowId: null },
    { type: ProjectPlanChecklistType.SECTIONS, title: 'Metszetek', workflowId: null },
    { type: ProjectPlanChecklistType.FACADES, title: 'Homlokzatok', workflowId: workflow1.id },
    { type: ProjectPlanChecklistType.MECHANICAL_PLAN, title: 'Gepeszterv', workflowId: null },
    { type: ProjectPlanChecklistType.ELECTRICAL_PLAN, title: 'Elektromos terv', workflowId: workflow2.id },
    { type: ProjectPlanChecklistType.STRUCTURAL_PLAN, title: 'Statikai tervek', workflowId: null },
    { type: ProjectPlanChecklistType.SITE_PLAN, title: 'Helyszinrajz', workflowId: null },
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

async function ensureConstructionRoleUsers() {
  const passwordHash = await bcrypt.hash('demo123', 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'fovallalkozo' },
      update: { email: 'fovallalkozo@hazepitok.local', name: 'Nagy Adam', passwordHash, role: UserRole.ADMIN, isActive: true },
      create: { username: 'fovallalkozo', email: 'fovallalkozo@hazepitok.local', name: 'Nagy Adam', passwordHash, role: UserRole.ADMIN },
    }),
    prisma.user.upsert({
      where: { username: 'alvallalkozo' },
      update: { email: 'alvallalkozo@hazepitok.local', name: 'Szabo Peter', passwordHash, role: UserRole.OPERATOR, isActive: true },
      create: { username: 'alvallalkozo', email: 'alvallalkozo@hazepitok.local', name: 'Szabo Peter', passwordHash, role: UserRole.OPERATOR },
    }),
    prisma.user.upsert({
      where: { username: 'ellenor' },
      update: { email: 'ellenor@hazepitok.local', name: 'Toth Erika', passwordHash, role: UserRole.EDITOR, isActive: true },
      create: { username: 'ellenor', email: 'ellenor@hazepitok.local', name: 'Toth Erika', passwordHash, role: UserRole.EDITOR },
    }),
    prisma.user.upsert({
      where: { username: 'megrendelo' },
      update: { email: 'megrendelo@hazepitok.local', name: 'Kovacs Janos', passwordHash, role: UserRole.VIEWER, isActive: true },
      create: { username: 'megrendelo', email: 'megrendelo@hazepitok.local', name: 'Kovacs Janos', passwordHash, role: UserRole.VIEWER },
    }),
  ]);

  return {
    mainContractor: users[0],
    subcontractor: users[1],
    inspector: users[2],
    customer: users[3],
  };
}

async function ensureProjectMemberLink(data: {
  projectId: string;
  userId: string;
  companyId?: string | null;
  role: string;
  permissionLevel: string;
  customerSafeNotes?: string | null;
  internalNotes?: string | null;
}) {
  const existing = await prisma.projectMemberLink.findFirst({
    where: {
      projectId: data.projectId,
      userId: data.userId,
      role: data.role,
    },
  });

  if (existing) {
    await prisma.projectMemberLink.update({
      where: { id: existing.id },
      data: {
        companyId: data.companyId || null,
        permissionLevel: data.permissionLevel,
        customerSafeNotes: data.customerSafeNotes || null,
        internalNotes: data.internalNotes || null,
        isActive: true,
      },
    });
    return;
  }

  await prisma.projectMemberLink.create({ data });
}

async function ensureConstructionTemplates() {
  let projectTemplate = await prisma.projectTemplate.findFirst({
    where: { name: 'Csaladi haz alap sablon', projectType: 'family_house' },
  });

  if (!projectTemplate) {
    projectTemplate = await prisma.projectTemplate.create({
      data: { name: 'Csaladi haz alap sablon', projectType: 'family_house' },
    });
  } else if (!projectTemplate.isActive) {
    projectTemplate = await prisma.projectTemplate.update({
      where: { id: projectTemplate.id },
      data: { isActive: true },
    });
  }

  let rebarTemplate = await prisma.workphaseTemplate.findFirst({
    where: {
      projectTemplateId: projectTemplate.id,
      title: 'Alapozas - vasalas',
      workgroupName: 'Alapozas',
    },
  });

  if (!rebarTemplate) {
    rebarTemplate = await prisma.workphaseTemplate.create({
      data: {
        projectTemplateId: projectTemplate.id,
        title: 'Alapozas - vasalas',
        workgroupName: 'Alapozas',
        requiresInspection: true,
        defaultRequirementsJson: [
          { label: 'Teljes alaptest foto', type: 'PHOTO', minCount: 1 },
          { label: 'Sarokpont foto', type: 'PHOTO', minCount: 4 },
          { label: 'Betonfedes igazolas', type: 'PDF', minCount: 1 },
        ],
      },
    });
  }

  const checkpointTemplate = await prisma.checkpointTemplate.findFirst({
    where: {
      workphaseTemplateId: rebarTemplate.id,
      title: 'Vasalas ellenorzese betonozas elott',
    },
  });

  if (!checkpointTemplate) {
    await prisma.checkpointTemplate.create({
      data: {
        workphaseTemplateId: rebarTemplate.id,
        title: 'Vasalas ellenorzese betonozas elott',
        inspectionType: 'critical_gate',
        description: 'Betonozas inditasat blokkolja.',
      },
    });
  }
}

async function ensureConstructionMvpDemo(adminId: string) {
  await ensureConstructionTemplates();

  const roleUsers = await ensureConstructionRoleUsers();
  const existingCertification = await prisma.projectCertification.findFirst({
    include: { subprojects: { include: { workgroups: { include: { workphases: true } } } } },
  });

  if (existingCertification) {
    await ensureProjectMemberLink({ projectId: existingCertification.projectId, userId: adminId, role: 'super_admin', permissionLevel: 'full' });
    await ensureProjectMemberLink({ projectId: existingCertification.projectId, userId: roleUsers.mainContractor.id, role: 'main_contractor_admin', permissionLevel: 'manage' });
    await ensureProjectMemberLink({ projectId: existingCertification.projectId, userId: roleUsers.subcontractor.id, role: 'subcontractor', permissionLevel: 'contribute' });
    await ensureProjectMemberLink({ projectId: existingCertification.projectId, userId: roleUsers.inspector.id, role: 'inspector', permissionLevel: 'view_approve', internalNotes: 'Demo muszaki ellenor' });
    await ensureProjectMemberLink({ projectId: existingCertification.projectId, userId: roleUsers.customer.id, role: 'customer', permissionLevel: 'view_only', customerSafeNotes: 'Megrendeloi betekintes engedelyezve' });
    return;
  }

  const mainContractorCompany = await prisma.company.create({
    data: {
      name: 'Hazepitok Foepito Kft.',
      type: 'main_contractor',
      taxNumber: '12345678-2-03',
      address: '6000 Kecskemet, Fo utca 18.',
      contactName: 'Nagy Adam',
      contactEmail: 'adam@hazepitok.local',
      contactPhone: '+36301110000',
    },
  });

  const masonryCompany = await prisma.company.create({
    data: {
      name: 'Alap Beton Partner Kft.',
      type: 'subcontractor',
      taxNumber: '87654321-2-03',
      contactName: 'Szabo Peter',
      contactEmail: 'peter@alapbeton.local',
      contactPhone: '+36302223333',
    },
  });

  const mepCompany = await prisma.company.create({
    data: {
      name: 'Preciz Gepeszet Kft.',
      type: 'subcontractor',
      taxNumber: '11223344-2-03',
      contactName: 'Varga Lilla',
      contactEmail: 'lilla@precizgepeszet.local',
      contactPhone: '+36304445555',
    },
  });

  await prisma.partner.createMany({
    data: [
      {
        companyId: masonryCompany.id,
        qualificationStatus: PartnerQualificationStatus.QUALIFIED,
        specialties: 'alapozas, vasalas, betonozas',
        notes: 'Ellenorzott referenciakkal rendelkezo demo partner.',
        joinedAt: new Date(),
      },
      {
        companyId: mepCompany.id,
        qualificationStatus: PartnerQualificationStatus.CONDITIONAL,
        specialties: 'gepeszet, viz, futes',
        notes: 'Feltetelesen elfogadott demo partner.',
        joinedAt: new Date(),
      },
    ],
  });

  const project = await prisma.project.create({
    data: {
      name: 'Minositett csaladi haz - Kecskemet',
      code: 'MKR-2026-01',
      city: 'Kecskemet',
      addressLine: 'Mintahaz utca 7.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-04-15'),
      expectedEndDate: new Date('2026-10-30'),
      customerName: 'Kovacs Janos',
      customerEmail: 'kovacs.janos@example.com',
      customerPhone: '+36305557777',
      description: 'Demo projekt a minositett kivitelezesi rendszer kiprobalasahoz.',
      createdByUserId: adminId,
    },
  });

  const certification = await prisma.projectCertification.create({
    data: {
      projectId: project.id,
      slug: 'minositett-csaladi-haz-kecskemet',
      mainContractorCompanyId: mainContractorCompany.id,
      projectType: 'family_house',
      grossArea: 148,
      netArea: 132,
      status: 'ACTIVE',
      protocolAcceptedAt: new Date(),
    },
  });

  await prisma.projectMemberLink.createMany({
    data: [
      { projectId: project.id, userId: adminId, companyId: mainContractorCompany.id, role: 'super_admin', permissionLevel: 'full' },
      { projectId: project.id, userId: roleUsers.mainContractor.id, companyId: mainContractorCompany.id, role: 'main_contractor_admin', permissionLevel: 'manage' },
      { projectId: project.id, userId: roleUsers.subcontractor.id, companyId: masonryCompany.id, role: 'subcontractor', permissionLevel: 'contribute' },
      { projectId: project.id, userId: roleUsers.inspector.id, role: 'inspector', permissionLevel: 'view_approve', internalNotes: 'Demo muszaki ellenor' },
      { projectId: project.id, userId: roleUsers.customer.id, role: 'customer', permissionLevel: 'view_only', customerSafeNotes: 'Megrendeloi betekintes engedelyezve' },
    ],
  });

  const subproject = await prisma.subproject.create({
    data: {
      certificationId: certification.id,
      name: 'Foepulet',
      type: 'main_building',
      status: 'ACTIVE',
      sortOrder: 1,
    },
  });

  const foundationGroup = await prisma.workgroup.create({
    data: { subprojectId: subproject.id, name: 'Alapozas', category: 'structure', sortOrder: 1 },
  });
  const mepGroup = await prisma.workgroup.create({
    data: { subprojectId: subproject.id, name: 'Gepeszet es elektromos', category: 'mep', sortOrder: 2 },
  });

  const earthwork = await prisma.workphase.create({
    data: {
      workgroupId: foundationGroup.id,
      assignedCompanyId: masonryCompany.id,
      title: 'Foldmunka',
      description: 'Munkagodor es foldkiemeles dokumentalasa.',
      status: 'APPROVED',
      sortOrder: 1,
      actualStartDate: new Date('2026-04-16'),
      actualEndDate: new Date('2026-04-18'),
    },
  });

  const rebar = await prisma.workphase.create({
    data: {
      workgroupId: foundationGroup.id,
      assignedCompanyId: masonryCompany.id,
      title: 'Alapozas - vasalas',
      description: 'Betonozas elotti kotelezo vasalasi dokumentacio.',
      status: 'AWAITING_REVIEW',
      requiresInspection: true,
      sortOrder: 2,
      actualStartDate: new Date('2026-04-19'),
    },
  });

  const electrical = await prisma.workphase.create({
    data: {
      workgroupId: mepGroup.id,
      assignedCompanyId: mepCompany.id,
      title: 'Elektromos alapszereles',
      description: 'Falzaras elotti vezetek nyomvonal dokumentacio.',
      status: 'NOT_STARTED',
      requiresInspection: true,
      sortOrder: 1,
    },
  });

  await prisma.workphaseDependency.create({
    data: { workphaseId: electrical.id, dependsOnWorkphaseId: rebar.id },
  });

  await prisma.uploadRequirement.createMany({
    data: [
      { workphaseId: earthwork.id, label: 'Munkagodor fotok', requiredType: 'PHOTO', minCount: 4, sortOrder: 1 },
      { workphaseId: rebar.id, label: 'Teljes alaptest foto', requiredType: 'PHOTO', minCount: 1, sortOrder: 1 },
      { workphaseId: rebar.id, label: 'Sarokpont fotok', requiredType: 'PHOTO', minCount: 4, sortOrder: 2 },
      { workphaseId: rebar.id, label: 'Kengyelezes foto', requiredType: 'PHOTO', minCount: 2, sortOrder: 3 },
      { workphaseId: rebar.id, label: 'Betonfedes igazolas', requiredType: 'PDF', minCount: 1, sortOrder: 4 },
      { workphaseId: electrical.id, label: 'Vezetek nyomvonal fotok', requiredType: 'PHOTO', minCount: 6, sortOrder: 1 },
    ],
  });

  const requirements = await prisma.uploadRequirement.findMany({
    where: { workphaseId: { in: [earthwork.id, rebar.id] } },
    orderBy: { sortOrder: 'asc' },
  });
  const earthworkRequirement = requirements.find((item) => item.workphaseId === earthwork.id);
  const rebarRequirements = requirements.filter((item) => item.workphaseId === rebar.id);

  if (earthworkRequirement) {
    await prisma.upload.createMany({
      data: Array.from({ length: 4 }, (_, index) => ({
        projectId: project.id,
        workphaseId: earthwork.id,
        uploadRequirementId: earthworkRequirement.id,
        uploadedBy: adminId,
        filePath: `/demo/munkagodor-${index + 1}.jpg`,
        fileType: 'PHOTO',
        title: `Munkagodor foto ${index + 1}`,
        isRequiredEvidence: true,
        capturedAt: new Date('2026-04-18'),
      })),
    });
  }

  for (const requirement of rebarRequirements.slice(0, 3)) {
    await prisma.upload.create({
      data: {
        projectId: project.id,
        workphaseId: rebar.id,
        uploadRequirementId: requirement.id,
        uploadedBy: adminId,
        filePath: `/demo/vasalas-${requirement.sortOrder}.jpg`,
        fileType: String(requirement.requiredType),
        title: requirement.label,
        description: 'Demo bizonyito dokumentacio.',
        isRequiredEvidence: true,
        capturedAt: new Date('2026-04-20'),
      },
    });
  }

  const checkpoint = await prisma.checkpoint.create({
    data: {
      workphaseId: rebar.id,
      title: 'Vasalas ellenorzese betonozas elott',
      description: 'Betonozas nem indithato megfelelt statusz nelkul.',
      status: 'UNDER_REVIEW',
      inspectionType: 'critical_gate',
      dueDate: new Date('2026-04-23'),
    },
  });

  await prisma.checkpoint.create({
    data: {
      workphaseId: electrical.id,
      title: 'Elektromos eltakaras elotti ellenorzes',
      description: 'Falzaras elotti fotodokumentacio es ellenori jovahagyas.',
      status: 'PENDING',
      inspectionType: 'critical_gate',
    },
  });

  await prisma.approval.create({
    data: {
      projectId: project.id,
      workphaseId: earthwork.id,
      approverId: adminId,
      approvalType: 'workphase',
      decision: 'APPROVED',
      notes: 'Demo foldmunka elfogadva.',
    },
  });

  await prisma.constructionAuditLog.createMany({
    data: [
      {
        actorId: adminId,
        certificationId: certification.id,
        projectId: project.id,
        entityType: 'project',
        entityId: project.id,
        action: 'project_created',
        customerVisible: true,
      },
      {
        actorId: adminId,
        certificationId: certification.id,
        projectId: project.id,
        entityType: 'workphase',
        entityId: earthwork.id,
        action: 'workphase_approved',
        customerVisible: true,
      },
      {
        actorId: adminId,
        certificationId: certification.id,
        projectId: project.id,
        entityType: 'checkpoint',
        entityId: checkpoint.id,
        action: 'checkpoint_under_review',
        customerVisible: true,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        certificationId: certification.id,
        userId: adminId,
        type: 'checkpoint_due',
        title: 'Vasalas ellenorzes folyamatban',
        body: 'A betonozas csak megfelelt checkpoint utan indithato.',
        link: `/dashboard/workphases/${rebar.id}`,
      },
      {
        certificationId: certification.id,
        userId: adminId,
        type: 'missing_upload',
        title: 'Betonfedes igazolas hianyzik',
        body: 'A vasalas munkafazisban meg van hianyzo kotelezo dokumentacio.',
        link: `/dashboard/workphases/${rebar.id}`,
      },
    ],
  });

  await ensureConstructionTemplates();
}

async function ensureExportReadyDemoProject(adminId: string) {
  const roleUsers = await ensureConstructionRoleUsers();
  const existing = await prisma.project.findFirst({
    where: { code: 'MKR-READY-01' },
    select: { id: true },
  });
  if (existing) {
    await ensureProjectMemberLink({ projectId: existing.id, userId: adminId, role: 'super_admin', permissionLevel: 'full' });
    await ensureProjectMemberLink({ projectId: existing.id, userId: roleUsers.mainContractor.id, role: 'main_contractor_admin', permissionLevel: 'manage' });
    await ensureProjectMemberLink({ projectId: existing.id, userId: roleUsers.subcontractor.id, role: 'subcontractor', permissionLevel: 'contribute' });
    await ensureProjectMemberLink({ projectId: existing.id, userId: roleUsers.inspector.id, role: 'inspector', permissionLevel: 'view_approve' });
    await ensureProjectMemberLink({ projectId: existing.id, userId: roleUsers.customer.id, role: 'customer', permissionLevel: 'view_only', customerSafeNotes: 'Lezart demo projekt megtekintheto.' });
    return;
  }

  const contractorCompany = await prisma.company.create({
    data: {
      name: 'Export Ready Foepito Kft.',
      type: 'main_contractor',
      taxNumber: '55667788-2-03',
      address: '6000 Kecskemet, Export utca 1.',
      contactName: 'Nagy Adam',
      contactEmail: 'ready@hazepitok.local',
      contactPhone: '+36309990000',
    },
  });

  const partnerCompany = await prisma.company.create({
    data: {
      name: 'Atadas Kesz Partner Kft.',
      type: 'subcontractor',
      taxNumber: '66778899-2-03',
      contactName: 'Szabo Peter',
      contactEmail: 'kesz@partner.local',
      contactPhone: '+36308880000',
    },
  });

  await prisma.partner.create({
    data: {
      companyId: partnerCompany.id,
      qualificationStatus: PartnerQualificationStatus.QUALIFIED,
      specialties: 'szerkezetepites, gepeszet, atadas',
      notes: 'Export-ready demo projekt partnere.',
      joinedAt: new Date('2026-01-15'),
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Lezart minositett demo haz - Szeged',
      code: 'MKR-READY-01',
      city: 'Szeged',
      addressLine: 'Atadas utca 12.',
      status: ProjectStatus.CLOSED,
      startDate: new Date('2026-01-20'),
      expectedEndDate: new Date('2026-04-15'),
      actualEndDate: new Date('2026-04-10'),
      customerName: 'Nemes Anna',
      customerEmail: 'anna.nemes@example.com',
      customerPhone: '+36307770000',
      description: 'Teljesen lezart demo projekt a zaro csomag export kiprobalasahoz.',
      createdByUserId: adminId,
    },
  });

  const certification = await prisma.projectCertification.create({
    data: {
      projectId: project.id,
      slug: 'lezart-minositett-demo-haz-szeged',
      mainContractorCompanyId: contractorCompany.id,
      projectType: 'family_house',
      grossArea: 126,
      netArea: 112,
      status: 'CLOSED',
      protocolAcceptedAt: new Date('2026-01-20'),
    },
  });

  await Promise.all([
    ensureProjectMemberLink({ projectId: project.id, userId: adminId, companyId: contractorCompany.id, role: 'super_admin', permissionLevel: 'full' }),
    ensureProjectMemberLink({ projectId: project.id, userId: roleUsers.mainContractor.id, companyId: contractorCompany.id, role: 'main_contractor_admin', permissionLevel: 'manage' }),
    ensureProjectMemberLink({ projectId: project.id, userId: roleUsers.subcontractor.id, companyId: partnerCompany.id, role: 'subcontractor', permissionLevel: 'contribute' }),
    ensureProjectMemberLink({ projectId: project.id, userId: roleUsers.inspector.id, role: 'inspector', permissionLevel: 'view_approve', internalNotes: 'Export-ready projekt ellenore.' }),
    ensureProjectMemberLink({ projectId: project.id, userId: roleUsers.customer.id, role: 'customer', permissionLevel: 'view_only', customerSafeNotes: 'Lezart demo projekt megtekintheto.' }),
  ]);

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, name: 'Nagy Adam', email: 'fovallalkozo@hazepitok.local', role: ProjectRole.PROJECT_MANAGER, permissionLevel: ProjectPermissionLevel.FULL },
      { projectId: project.id, name: 'Szabo Peter', email: 'alvallalkozo@hazepitok.local', role: ProjectRole.SUBCONTRACTOR, permissionLevel: ProjectPermissionLevel.CONTRIBUTE },
      { projectId: project.id, name: 'Toth Erika', email: 'ellenor@hazepitok.local', role: ProjectRole.TECH_INSPECTOR, permissionLevel: ProjectPermissionLevel.VIEW_APPROVE },
      { projectId: project.id, name: 'Nemes Anna', email: 'anna.nemes@example.com', role: ProjectRole.CUSTOMER, permissionLevel: ProjectPermissionLevel.VIEW_ONLY },
    ],
  });

  const subproject = await prisma.subproject.create({
    data: {
      certificationId: certification.id,
      name: 'Foepulet',
      type: 'main_building',
      status: 'CLOSED',
      sortOrder: 1,
    },
  });

  const foundationGroup = await prisma.workgroup.create({
    data: { subprojectId: subproject.id, name: 'Alapozas', category: 'structure', sortOrder: 1 },
  });
  const mepGroup = await prisma.workgroup.create({
    data: { subprojectId: subproject.id, name: 'Gepeszet es elektromos', category: 'mep', sortOrder: 2 },
  });

  const readyPhases = [
    {
      groupId: foundationGroup.id,
      title: 'Foldmunka',
      sortOrder: 1,
      start: '2026-01-22',
      end: '2026-01-25',
      requirements: [
        { label: 'Munkagodor foto', type: 'PHOTO', min: 4 },
        { label: 'Kituzes jegyzokonyv', type: 'PDF', min: 1 },
      ],
      checkpoint: 'Foldmunka atvetel',
    },
    {
      groupId: foundationGroup.id,
      title: 'Alapozas - vasalas',
      sortOrder: 2,
      start: '2026-01-26',
      end: '2026-01-30',
      requirements: [
        { label: 'Teljes alaptest foto', type: 'PHOTO', min: 1 },
        { label: 'Sarokpont fotok', type: 'PHOTO', min: 4 },
        { label: 'Betonfedes igazolas', type: 'PDF', min: 1 },
      ],
      checkpoint: 'Vasalas ellenorzese betonozas elott',
    },
    {
      groupId: mepGroup.id,
      title: 'Gepeszeti es elektromos eltakaras elott',
      sortOrder: 1,
      start: '2026-03-01',
      end: '2026-03-04',
      requirements: [
        { label: 'Gepeszeti nyomvonal foto', type: 'PHOTO', min: 4 },
        { label: 'Elektromos nyomvonal foto', type: 'PHOTO', min: 4 },
      ],
      checkpoint: 'Eltakaras elotti szakagi ellenorzes',
    },
  ] as const;

  for (const phaseData of readyPhases) {
    const phase = await prisma.workphase.create({
      data: {
        workgroupId: phaseData.groupId,
        assignedCompanyId: partnerCompany.id,
        title: phaseData.title,
        description: 'Export-ready demo munkafazis teljes dokumentacioval.',
        status: 'CLOSED',
        priority: 'medium',
        requiresInspection: true,
        sortOrder: phaseData.sortOrder,
        actualStartDate: new Date(phaseData.start),
        actualEndDate: new Date(phaseData.end),
      },
    });

    for (const [index, requirementData] of phaseData.requirements.entries()) {
      const requirement = await prisma.uploadRequirement.create({
        data: {
          workphaseId: phase.id,
          label: requirementData.label,
          requiredType: requirementData.type as any,
          minCount: requirementData.min,
          isMandatory: true,
          sortOrder: index + 1,
        },
      });

      await prisma.upload.createMany({
        data: Array.from({ length: requirementData.min }, (_, uploadIndex) => ({
          projectId: project.id,
          workphaseId: phase.id,
          uploadRequirementId: requirement.id,
          uploadedBy: adminId,
          filePath: `/demo/export-ready/${phase.id}-${requirement.id}-${uploadIndex + 1}.${requirementData.type === 'PDF' ? 'pdf' : 'jpg'}`,
          fileType: requirementData.type,
          title: `${requirementData.label} ${uploadIndex + 1}`,
          description: 'Export-ready demo bizonyitek.',
          capturedAt: new Date(phaseData.end),
          isRequiredEvidence: true,
        })),
      });
    }

    const checkpoint = await prisma.checkpoint.create({
      data: {
        workphaseId: phase.id,
        title: phaseData.checkpoint,
        description: 'Export-ready demo checkpoint megfelelt eredmennyel.',
        status: 'APPROVED',
        inspectionType: 'critical_gate',
        reviewedBy: roleUsers.inspector.id,
        reviewedAt: new Date(phaseData.end),
        resultNotes: 'Megfelelt, tovabbhaladas engedelyezve.',
      },
    });

    await prisma.approval.create({
      data: {
        projectId: project.id,
        workphaseId: phase.id,
        checkpointId: checkpoint.id,
        approverId: roleUsers.inspector.id,
        approvalType: 'checkpoint',
        decision: 'APPROVED',
        notes: 'Demo jovahagyas export teszthez.',
      },
    });
  }

  await prisma.constructionAuditLog.createMany({
    data: [
      { actorId: adminId, certificationId: certification.id, projectId: project.id, entityType: 'project', entityId: project.id, action: 'project_created', customerVisible: true },
      { actorId: roleUsers.inspector.id, certificationId: certification.id, projectId: project.id, entityType: 'project', entityId: project.id, action: 'all_checkpoints_approved', customerVisible: true },
      { actorId: adminId, certificationId: certification.id, projectId: project.id, entityType: 'project', entityId: project.id, action: 'project_closed', customerVisible: true },
    ],
  });

  await prisma.notification.create({
    data: {
      certificationId: certification.id,
      userId: adminId,
      type: 'export_ready',
      title: 'Export-ready demo projekt kesz',
      body: 'A lezart szegedi demo projekt zaro csomagja generalhato.',
      link: `/dashboard/projects/${project.id}/closing-package`,
    },
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

  await ensureSubcontractorUser();

  const contacts = await ensureContacts();
  await ensureOfficeDemo(admin.id, contacts.map((contact) => contact.id));
  await ensureProjectDemo(admin.id, contacts.map((contact) => contact.id));
  await ensureConstructionMvpDemo(admin.id);
  await ensureExportReadyDemoProject(admin.id);
}

main().finally(async () => {
  await prisma.$disconnect();
});
