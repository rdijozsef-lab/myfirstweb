'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { EventType, LeadSource, LeadStatus, ProjectDocumentCategory, ProjectDocumentScope, ProjectEventType, ProjectIssueCategory, ProjectIssueStatus, ProjectPermissionLevel, ProjectPlanChecklistType, ProjectRole, ProjectStatus, ProjectTaskPriority, ProjectTaskStatus, ProjectTaskType, ProjectTechnicalSection, ProjectTechnicalValueType, ProjectWorkflowStatus, ProjectWorkflowTemplate, TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

const requiredPlanChecklist: ProjectPlanChecklistType[] = [
  'ARCHITECTURAL',
  'STRUCTURAL',
  'ELECTRICAL',
  'MECHANICAL',
  'FACADE',
  'INTERIOR',
];

async function hasRequiredProjectDocumentation(projectId: string) {
  const documents = await prisma.projectDocument.findMany({
    where: {
      projectId,
      scope: 'PLAN_PACKAGE',
      planChecklistType: { not: null },
    },
    select: {
      planChecklistType: true,
    },
  });

  const completed = new Set(documents.map((document) => document.planChecklistType).filter(Boolean));
  return requiredPlanChecklist.every((item) => completed.has(item));
}

export async function createContactAction(formData: FormData) {
  await requireUser();
  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  await prisma.contact.create({
    data: {
      name,
      company: String(formData.get('company') || '').trim() || null,
      email: String(formData.get('email') || '').trim() || null,
      phone: String(formData.get('phone') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
      tags: String(formData.get('tags') || '').trim() || null,
      statusLabel: String(formData.get('statusLabel') || '').trim() || 'Új kapcsolat',
      source: (String(formData.get('source') || 'WEBSITE') as LeadSource),
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/contacts');
  redirect('/office/contacts');
}

export async function updateContactStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  const statusLabel = String(formData.get('statusLabel') || '');
  if (!id || !statusLabel) return;
  await prisma.contact.update({ where: { id }, data: { statusLabel } });
  revalidatePath('/office');
  revalidatePath('/office/contacts');
  redirect('/office/contacts');
}

export async function createLeadAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get('title') || '').trim();
  if (!title) return;

  const dueRaw = String(formData.get('dueAt') || '').trim();

  await prisma.lead.create({
    data: {
      title,
      description: String(formData.get('description') || '').trim() || null,
      status: (String(formData.get('status') || 'NEW') as LeadStatus),
      source: (String(formData.get('source') || 'WEBSITE') as LeadSource),
      valueLabel: String(formData.get('valueLabel') || '').trim() || null,
      contactId: String(formData.get('contactId') || '').trim() || null,
      ownerId: user.id,
      dueAt: dueRaw ? new Date(dueRaw) : null,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/leads');
  redirect('/office/leads');
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '') as LeadStatus;
  if (!id || !status) return;
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath('/office');
  revalidatePath('/office/leads');
  redirect('/office/leads');
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  const dueRaw = String(formData.get('dueAt') || '').trim();

  await prisma.task.create({
    data: {
      title,
      description: String(formData.get('description') || '').trim() || null,
      status: (String(formData.get('status') || 'TODO') as TaskStatus),
      priority: (String(formData.get('priority') || 'MEDIUM') as TaskPriority),
      ownerId: user.id,
      contactId: String(formData.get('contactId') || '').trim() || null,
      dueAt: dueRaw ? new Date(dueRaw) : null,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/tasks');
  redirect('/office/tasks');
}

export async function updateTaskStatusAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '') as TaskStatus;
  if (!id || !status) return;
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath('/office');
  revalidatePath('/office/tasks');
  redirect('/office/tasks');
}

export async function createEventAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get('title') || '').trim();
  const startsAt = String(formData.get('startsAt') || '').trim();
  if (!title || !startsAt) return;

  const endsAt = String(formData.get('endsAt') || '').trim();
  await prisma.calendarEvent.create({
    data: {
      title,
      description: String(formData.get('description') || '').trim() || null,
      type: (String(formData.get('type') || 'MEETING') as EventType),
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      location: String(formData.get('location') || '').trim() || null,
      contactId: String(formData.get('contactId') || '').trim() || null,
      ownerId: user.id,
    },
  });
  revalidatePath('/office');
  revalidatePath('/office/calendar');
  redirect('/office/calendar');
}

export async function deleteEventAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath('/office');
  revalidatePath('/office/calendar');
  redirect('/office/calendar');
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get('name') || '').trim();
  if (!name) return;

  const startDateRaw = String(formData.get('startDate') || '').trim();
  const expectedEndDateRaw = String(formData.get('expectedEndDate') || '').trim();

  await prisma.project.create({
    data: {
      name,
      code: String(formData.get('code') || '').trim() || null,
      addressLine: String(formData.get('addressLine') || '').trim() || null,
      city: String(formData.get('city') || '').trim() || null,
      postalCode: String(formData.get('postalCode') || '').trim() || null,
      status: String(formData.get('status') || 'PREPARATION') as ProjectStatus,
      description: String(formData.get('description') || '').trim() || null,
      customerName: String(formData.get('customerName') || '').trim() || null,
      customerPhone: String(formData.get('customerPhone') || '').trim() || null,
      customerEmail: String(formData.get('customerEmail') || '').trim() || null,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      expectedEndDate: expectedEndDateRaw ? new Date(expectedEndDateRaw) : null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  redirect('/office/projects');
}

export async function createProjectTaskAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const returnTo = String(formData.get('returnTo') || '').trim();
  if (!projectId || !title) return;

  const dueAtRaw = String(formData.get('dueAt') || '').trim();
  const assigneeMemberId = String(formData.get('assigneeMemberId') || '').trim();
  const approvedByMemberId = String(formData.get('approvedByMemberId') || '').trim();
  const workflowId = String(formData.get('workflowId') || '').trim();

  await prisma.projectTask.create({
    data: {
      projectId,
      workflowId: workflowId || null,
      title,
      description: String(formData.get('description') || '').trim() || null,
      type: (String(formData.get('type') || 'EXECUTION') as ProjectTaskType),
      status: (String(formData.get('status') || 'NEW') as ProjectTaskStatus),
      priority: (String(formData.get('priority') || 'MEDIUM') as ProjectTaskPriority),
      assigneeMemberId: assigneeMemberId || null,
      dueAt: dueAtRaw ? new Date(dueAtRaw) : null,
      approvalRequired: String(formData.get('approvalRequired') || '') === 'on',
      approvedByMemberId: approvedByMemberId || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  if (workflowId) {
    revalidatePath(`/office/projects/${projectId}/workflows/${workflowId}`);
  }
  redirect(returnTo || `/office/projects/${projectId}`);
}

export async function createProjectMemberAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const name = String(formData.get('name') || '').trim();
  if (!projectId || !name) return;

  await prisma.projectMember.create({
    data: {
      projectId,
      name,
      phone: String(formData.get('phone') || '').trim() || null,
      email: String(formData.get('email') || '').trim() || null,
      role: (String(formData.get('role') || 'SUBCONTRACTOR') as ProjectRole),
      permissionLevel: (String(formData.get('permissionLevel') || 'CONTRIBUTE') as ProjectPermissionLevel),
      notes: String(formData.get('notes') || '').trim() || null,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function createProjectEventAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const startsAtRaw = String(formData.get('startsAt') || '').trim();
  if (!projectId || !title || !startsAtRaw) return;

  const endsAtRaw = String(formData.get('endsAt') || '').trim();
  const taskId = String(formData.get('taskId') || '').trim();

  await prisma.projectEvent.create({
    data: {
      projectId,
      taskId: taskId || null,
      title,
      type: (String(formData.get('type') || 'MEETING') as ProjectEventType),
      startsAt: new Date(startsAtRaw),
      endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
      location: String(formData.get('location') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function updateProjectStatusAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const status = String(formData.get('status') || '').trim() as ProjectStatus;
  const returnTo = String(formData.get('returnTo') || '').trim();
  if (!projectId || !status) return;

  if (status === 'IN_PROGRESS') {
    const docsReady = await hasRequiredProjectDocumentation(projectId);
    if (!docsReady) {
      redirect(`/office/projects/${projectId}?tab=documents&notice=docs-required`);
    }
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(returnTo || `/office/projects/${projectId}`);
}

export async function updateProjectTaskStatusAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const taskId = String(formData.get('taskId') || '').trim();
  const status = String(formData.get('status') || '').trim() as ProjectTaskStatus;
  if (!projectId || !taskId || !status) return;

  await prisma.projectTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === 'DONE' ? new Date() : null,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function createProjectSiteLogEntryAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const entryDateRaw = String(formData.get('entryDate') || '').trim();
  const completedWork = String(formData.get('completedWork') || '').trim();
  if (!projectId || !entryDateRaw || !completedWork) return;

  await prisma.projectSiteLogEntry.create({
    data: {
      projectId,
      entryDate: new Date(entryDateRaw),
      attendees: String(formData.get('attendees') || '').trim() || null,
      completedWork,
      issues: String(formData.get('issues') || '').trim() || null,
      weather: String(formData.get('weather') || '').trim() || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function updateProjectMemberActivityAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const memberId = String(formData.get('memberId') || '').trim();
  const isActive = String(formData.get('isActive') || '').trim() === 'true';
  if (!projectId || !memberId) return;

  await prisma.projectMember.update({
    where: { id: memberId },
    data: { isActive },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function createProjectIssueAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  if (!projectId || !title) return;

  const taskId = String(formData.get('taskId') || '').trim();

  await prisma.projectIssue.create({
    data: {
      projectId,
      taskId: taskId || null,
      title,
      description: String(formData.get('description') || '').trim() || null,
      category: (String(formData.get('category') || 'TECHNICAL') as ProjectIssueCategory),
      status: (String(formData.get('status') || 'OPEN') as ProjectIssueStatus),
      responsibleName: String(formData.get('responsibleName') || '').trim() || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function updateProjectIssueStatusAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const issueId = String(formData.get('issueId') || '').trim();
  const status = String(formData.get('status') || '').trim() as ProjectIssueStatus;
  if (!projectId || !issueId || !status) return;

  await prisma.projectIssue.update({
    where: { id: issueId },
    data: {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function createProjectDocumentAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const linkUrl = String(formData.get('linkUrl') || '').trim();
  const returnTo = String(formData.get('returnTo') || '').trim();
  if (!projectId || !title || !linkUrl) return;

  const taskId = String(formData.get('taskId') || '').trim();
  const workflowId = String(formData.get('workflowId') || '').trim();
  const workflowRequirementKey = String(formData.get('workflowRequirementKey') || '').trim();
  const scope = (String(formData.get('scope') || 'GENERAL') as ProjectDocumentScope);
  const planChecklistType = String(formData.get('planChecklistType') || '').trim();

  await prisma.projectDocument.create({
    data: {
      projectId,
      taskId: taskId || null,
      workflowId: workflowId || null,
      workflowRequirementKey: workflowRequirementKey || null,
      title,
      category: (String(formData.get('category') || 'OTHER') as ProjectDocumentCategory),
      scope,
      planChecklistType: scope === 'PLAN_PACKAGE'
        ? ((planChecklistType || 'OTHER') as ProjectPlanChecklistType)
        : null,
      linkUrl,
      tags: String(formData.get('tags') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
      uploadedByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  if (workflowId) {
    revalidatePath(`/office/projects/${projectId}/workflows/${workflowId}`);
  }
  redirect(returnTo || `/office/projects/${projectId}`);
}

export async function createProjectWorkflowAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const name = String(formData.get('name') || '').trim();
  if (!projectId || !name) return;

  await prisma.projectWorkflow.create({
    data: {
      projectId,
      contractorMemberId: String(formData.get('contractorMemberId') || '').trim() || null,
      name,
      template: (String(formData.get('template') || 'OTHER') as ProjectWorkflowTemplate),
      status: (String(formData.get('status') || 'PLANNED') as ProjectWorkflowStatus),
      contractorCompany: String(formData.get('contractorCompany') || '').trim() || null,
      contractorName: String(formData.get('contractorName') || '').trim() || null,
      contractorPhone: String(formData.get('contractorPhone') || '').trim() || null,
      contractorEmail: String(formData.get('contractorEmail') || '').trim() || null,
      customerSelections: String(formData.get('customerSelections') || '').trim() || null,
      specificationNotes: String(formData.get('specificationNotes') || '').trim() || null,
      createdByUserId: user.id,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}`);
}

export async function updateProjectWorkflowStatusAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const workflowId = String(formData.get('workflowId') || '').trim();
  const status = String(formData.get('status') || '').trim() as ProjectWorkflowStatus;
  if (!projectId || !workflowId || !status) return;

  await prisma.projectWorkflow.update({
    where: { id: workflowId },
    data: { status },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  revalidatePath(`/office/projects/${projectId}/workflows/${workflowId}`);
  redirect(`/office/projects/${projectId}/workflows/${workflowId}`);
}

export async function upsertProjectTechnicalParameterAction(formData: FormData) {
  await requireUser();
  const projectId = String(formData.get('projectId') || '').trim();
  const section = String(formData.get('section') || '').trim() as ProjectTechnicalSection;
  const techSection = String(formData.get('techSection') || '').trim();
  const groupKey = String(formData.get('groupKey') || '').trim();
  const paramKey = String(formData.get('paramKey') || '').trim();
  const label = String(formData.get('label') || '').trim();
  const valueType = String(formData.get('valueType') || '').trim() as ProjectTechnicalValueType;
  const unit = String(formData.get('unit') || '').trim() || null;
  const rawValue = String(formData.get('value') || '').trim();
  const notes = String(formData.get('notes') || '').trim() || null;

  if (!projectId || !section || !groupKey || !paramKey || !label || !valueType) return;

  let textValue: string | null = null;
  let numberValue: number | null = null;
  let booleanValue: boolean | null = null;

  if (valueType === 'NUMBER') {
    numberValue = rawValue ? Number(rawValue.replace(',', '.')) : null;
    if (numberValue !== null && Number.isNaN(numberValue)) {
      numberValue = null;
    }
  } else if (valueType === 'BOOLEAN') {
    booleanValue = rawValue === 'true' ? true : rawValue === 'false' ? false : null;
  } else {
    textValue = rawValue || null;
  }

  await prisma.projectTechnicalParameter.upsert({
    where: {
      projectId_paramKey: {
        projectId,
        paramKey,
      },
    },
    update: {
      section,
      groupKey,
      label,
      valueType,
      unit,
      textValue,
      numberValue,
      booleanValue,
      notes,
    },
    create: {
      projectId,
      section,
      groupKey,
      paramKey,
      label,
      valueType,
      unit,
      textValue,
      numberValue,
      booleanValue,
      notes,
    },
  });

  revalidatePath('/office');
  revalidatePath('/office/projects');
  revalidatePath(`/office/projects/${projectId}`);
  redirect(`/office/projects/${projectId}?tab=technical&techSection=${techSection || section}`);
}
