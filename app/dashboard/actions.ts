'use server';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CertifiedProjectStatus,
  CheckpointStatus,
  PartnerQualificationStatus,
  ProjectPermissionLevel,
  ProjectRole,
  ProjectStatus,
  RequiredUploadType,
  WorkphaseStatus,
} from '@prisma/client';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  auditLog,
  canApproveProject,
  canContributeToWorkphase,
  canContributeToProject,
  canCreateCertifiedProject,
  canManagePartners,
  canManageProject,
} from '@/lib/construction';
import { validateWorkphaseStatusTransition } from '@/lib/workflow-rules';

const partnerSchema = z.object({
  companyName: z.string().min(2),
  companyType: z.string().default('contractor'),
  taxNumber: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  qualificationStatus: z.nativeEnum(PartnerQualificationStatus).default('APPLIED'),
  specialties: z.string().optional(),
  notes: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  projectTemplateId: z.string().optional(),
  location: z.string().optional(),
  projectType: z.string().default('family_house'),
  grossArea: z.coerce.number().optional(),
  netArea: z.coerce.number().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
});

const projectUpdateSchema = z.object({
  projectId: z.string().min(1),
  certificationId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().optional(),
  slug: z.string().min(2),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  addressLine: z.string().optional(),
  projectStatus: z.nativeEnum(ProjectStatus),
  certificationStatus: z.nativeEnum(CertifiedProjectStatus),
  projectType: z.string().optional(),
  grossArea: z.coerce.number().optional(),
  netArea: z.coerce.number().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),
  description: z.string().optional(),
  returnTo: z.string().optional(),
});

const projectMemberLinkSchema = z.object({
  projectId: z.string().min(1),
  certificationId: z.string().min(1),
  userId: z.string().optional(),
  companyId: z.string().optional(),
  role: z.enum(['super_admin', 'main_contractor_admin', 'subcontractor', 'inspector', 'customer']),
  permissionLevel: z.enum(['view_only', 'view_approve', 'comment', 'contribute', 'manage', 'full']),
  customerSafeNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  returnTo: z.string().optional(),
});

const projectMemberActiveSchema = z.object({
  projectId: z.string().min(1),
  certificationId: z.string().min(1),
  memberLinkId: z.string().min(1),
  isActive: z.enum(['true', 'false']),
  returnTo: z.string().optional(),
});

const projectContactSchema = z.object({
  projectId: z.string().min(1),
  certificationId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.nativeEnum(ProjectRole),
  permissionLevel: z.nativeEnum(ProjectPermissionLevel),
  notes: z.string().optional(),
  returnTo: z.string().optional(),
});

const projectTemplateSchema = z.object({
  name: z.string().min(2),
  projectType: z.string().min(2),
  isActive: z.string().optional(),
  returnTo: z.string().optional(),
});

const workphaseTemplateSchema = z.object({
  projectTemplateId: z.string().optional(),
  title: z.string().min(2),
  workgroupName: z.string().min(2),
  description: z.string().optional(),
  requiresInspection: z.string().optional(),
  requirements: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  returnTo: z.string().optional(),
});

const checkpointTemplateSchema = z.object({
  workphaseTemplateId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  inspectionType: z.string().min(2),
  isCritical: z.string().optional(),
  returnTo: z.string().optional(),
});

const workphaseAssignmentSchema = z.object({
  workphaseId: z.string().min(1),
  projectId: z.string().min(1),
  assignedUserId: z.string().optional(),
  assignedCompanyId: z.string().optional(),
  requiresCustomerVisibility: z.string().optional(),
  returnTo: z.string().optional(),
});

const notificationReadSchema = z.object({
  notificationId: z.string().min(1),
  returnTo: z.string().optional(),
});

const notificationsReadAllSchema = z.object({
  returnTo: z.string().optional(),
});

const workphaseCommentSchema = z.object({
  workphaseId: z.string().min(1),
  projectId: z.string().min(1),
  body: z.string().min(2),
  isInternal: z.string().optional(),
  returnTo: z.string().optional(),
});

const workphaseRevisionSchema = z.object({
  workphaseId: z.string().min(1),
  projectId: z.string().min(1),
  body: z.string().min(2),
  notifyAssignee: z.string().optional(),
  returnTo: z.string().optional(),
});

const contractSchema = z.object({
  certificationId: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(2),
  contractType: z.string().min(2),
  filePath: z.string().optional(),
  status: z.string().min(2),
  signedAt: z.string().optional(),
  returnTo: z.string().optional(),
});

function safeFileName(name: string) {
  const extension = path.extname(name).toLowerCase();
  const baseName = path.basename(name, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'upload';
  return `${baseName}-${Date.now()}${extension}`;
}

function mapMimeToUploadType(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'PHOTO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType === 'application/pdf') return 'PDF';
  return 'DOCUMENT';
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatExportDate(value?: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

function cleanSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `projekt-${Date.now()}`;
}

function parseRequirementLines(value?: string) {
  const lines = (value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const [label, type = 'PHOTO', minCount = '1'] = line.split('|').map((part) => part.trim());
    const normalizedType = type.toUpperCase();
    const validType = Object.values(RequiredUploadType).includes(normalizedType as RequiredUploadType)
      ? normalizedType as RequiredUploadType
      : RequiredUploadType.PHOTO;

    return {
      label: label || 'Dokumentacios requirement',
      type: validType,
      minCount: Math.max(1, Number(minCount) || 1),
    };
  });
}

function normalizeTemplateRequirements(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const source = typeof item === 'object' && item !== null ? item as Record<string, unknown> : {};
    const type = String(source.type || source.requiredType || 'PHOTO').toUpperCase();
    const validType = Object.values(RequiredUploadType).includes(type as RequiredUploadType)
      ? type as RequiredUploadType
      : RequiredUploadType.PHOTO;

    return {
      label: String(source.label || 'Dokumentacios requirement'),
      description: source.description ? String(source.description) : null,
      requiredType: validType,
      minCount: Math.max(1, Number(source.minCount || source.min || 1) || 1),
    };
  });
}

async function createDefaultStructure(certificationId: string, actorId: string, projectId: string) {
  const subproject = await prisma.subproject.create({
    data: {
      certificationId,
      name: 'Foepulet',
      type: 'main_building',
      status: 'PREPARING',
      sortOrder: 1,
    },
  });

  const groups = [
    {
      name: 'Alapozas',
      category: 'structure',
      phases: [
        { title: 'Foldmunka', inspection: false, requirements: [['Munkagodor foto', 'PHOTO', 4]] },
        {
          title: 'Vasalas',
          inspection: true,
          requirements: [
            ['Teljes alaptest foto', 'PHOTO', 1],
            ['Sarokpont foto', 'PHOTO', 4],
            ['Kengyelezes foto', 'PHOTO', 2],
            ['Betonfedes igazolasa', 'PDF', 1],
          ],
          checkpoint: 'Vasalas ellenorzese betonozas elott',
        },
        { title: 'Betonozas', inspection: true, requirements: [['Betonozasi foto', 'PHOTO', 3], ['Szallitolevel', 'PDF', 1]], checkpoint: 'Betonozasi atvetel' },
      ],
    },
    {
      name: 'Falazas es szerkezet',
      category: 'masonry',
      phases: [
        { title: 'Falazas', inspection: false, requirements: [['Soronkenti fotodokumentacio', 'PHOTO', 6]] },
        { title: 'Fodem vasalas', inspection: true, requirements: [['Fodemvas foto', 'PHOTO', 4]], checkpoint: 'Fodem ellenorzes onts elott' },
      ],
    },
    {
      name: 'Gepeszet es elektromos',
      category: 'mep',
      phases: [
        { title: 'Gepeszeti alapszereles', inspection: true, requirements: [['Eltakaras elotti foto', 'PHOTO', 6]], checkpoint: 'Gepeszeti eltakaras elotti ellenorzes' },
        { title: 'Elektromos alapszereles', inspection: true, requirements: [['Vezetek nyomvonal foto', 'PHOTO', 6]], checkpoint: 'Elektromos eltakaras elotti ellenorzes' },
      ],
    },
  ] as const;

  for (const [groupIndex, group] of groups.entries()) {
    const workgroup = await prisma.workgroup.create({
      data: {
        subprojectId: subproject.id,
        name: group.name,
        category: group.category,
        sortOrder: groupIndex + 1,
      },
    });

    for (const [phaseIndex, phase] of group.phases.entries()) {
      const workphase = await prisma.workphase.create({
        data: {
          workgroupId: workgroup.id,
          title: phase.title,
          description: 'Sablonbol generalt kotelezoen dokumentalt munkafazis.',
          status: phaseIndex === 0 && groupIndex === 0 ? 'AWAITING_UPLOADS' : 'NOT_STARTED',
          requiresInspection: phase.inspection,
          sortOrder: phaseIndex + 1,
        },
      });

      await prisma.uploadRequirement.createMany({
        data: phase.requirements.map(([label, type, minCount], requirementIndex) => ({
          workphaseId: workphase.id,
          label,
          requiredType: type as RequiredUploadType,
          minCount,
          isMandatory: true,
          sortOrder: requirementIndex + 1,
        })),
      });

      if ('checkpoint' in phase) {
        await prisma.checkpoint.create({
          data: {
            workphaseId: workphase.id,
            title: phase.checkpoint,
            inspectionType: 'critical_gate',
            description: 'Kritikus ellenorzesi pont: a kovetkezo munkafazis csak megfelelt eredmeny utan indithato.',
            status: 'PENDING',
          },
        });
      }
    }
  }

  await auditLog({
    actorId,
    certificationId,
    projectId,
    entityType: 'project',
    entityId: projectId,
    action: 'generated_default_workphase_structure',
    customerVisible: true,
  });
}

async function createStructureFromProjectTemplate(input: {
  certificationId: string;
  actorId: string;
  projectId: string;
  projectTemplateId?: string | null;
}) {
  if (!input.projectTemplateId) {
    await createDefaultStructure(input.certificationId, input.actorId, input.projectId);
    return;
  }

  const [projectTemplate, workphaseTemplates] = await Promise.all([
    prisma.projectTemplate.findUnique({ where: { id: input.projectTemplateId } }),
    prisma.workphaseTemplate.findMany({
      where: { projectTemplateId: input.projectTemplateId },
      orderBy: [{ workgroupName: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  if (!projectTemplate || !projectTemplate.isActive || !workphaseTemplates.length) {
    await createDefaultStructure(input.certificationId, input.actorId, input.projectId);
    return;
  }

  const checkpointTemplates = await prisma.checkpointTemplate.findMany({
    where: { workphaseTemplateId: { in: workphaseTemplates.map((template) => template.id) } },
    orderBy: { createdAt: 'asc' },
  });
  const checkpointsByWorkphaseTemplate = new Map<string, typeof checkpointTemplates>();
  for (const checkpointTemplate of checkpointTemplates) {
    const key = checkpointTemplate.workphaseTemplateId || '';
    checkpointsByWorkphaseTemplate.set(key, [
      ...(checkpointsByWorkphaseTemplate.get(key) || []),
      checkpointTemplate,
    ]);
  }

  const subproject = await prisma.subproject.create({
    data: {
      certificationId: input.certificationId,
      name: 'Foepulet',
      type: projectTemplate.projectType,
      status: 'PREPARING',
      sortOrder: 1,
    },
  });

  const groups = Array.from(new Set(workphaseTemplates.map((template) => template.workgroupName)));
  for (const [groupIndex, groupName] of groups.entries()) {
    const workgroup = await prisma.workgroup.create({
      data: {
        subprojectId: subproject.id,
        name: groupName,
        category: groupName.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'general',
        sortOrder: groupIndex + 1,
      },
    });

    const groupTemplates = workphaseTemplates.filter((template) => template.workgroupName === groupName);
    for (const [phaseIndex, template] of groupTemplates.entries()) {
      const isFirstPhase = groupIndex === 0 && phaseIndex === 0;
      const workphase = await prisma.workphase.create({
        data: {
          workgroupId: workgroup.id,
          title: template.title,
          description: template.description || 'Projekt sablonbol generalt munkafazis.',
          status: isFirstPhase ? 'AWAITING_UPLOADS' : 'NOT_STARTED',
          requiresInspection: template.requiresInspection,
          sortOrder: template.sortOrder || phaseIndex + 1,
        },
      });

      const requirements = normalizeTemplateRequirements(template.defaultRequirementsJson);
      if (requirements.length) {
        await prisma.uploadRequirement.createMany({
          data: requirements.map((requirement, requirementIndex) => ({
            workphaseId: workphase.id,
            label: requirement.label,
            description: requirement.description,
            requiredType: requirement.requiredType,
            minCount: requirement.minCount,
            isMandatory: true,
            sortOrder: requirementIndex + 1,
          })),
        });
      }

      const phaseCheckpointTemplates = checkpointsByWorkphaseTemplate.get(template.id) || [];
      if (phaseCheckpointTemplates.length) {
        await prisma.checkpoint.createMany({
          data: phaseCheckpointTemplates.map((checkpointTemplate) => ({
            workphaseId: workphase.id,
            title: checkpointTemplate.title,
            description: checkpointTemplate.description,
            inspectionType: checkpointTemplate.inspectionType,
            status: 'PENDING',
          })),
        });
      } else if (template.requiresInspection) {
        await prisma.checkpoint.create({
          data: {
            workphaseId: workphase.id,
            title: `${template.title} ellenorzese`,
            description: 'Sablonbol generalt kritikus ellenorzesi pont.',
            inspectionType: 'critical_gate',
            status: 'PENDING',
          },
        });
      }
    }
  }

  await auditLog({
    actorId: input.actorId,
    certificationId: input.certificationId,
    projectId: input.projectId,
    entityType: 'project_template',
    entityId: projectTemplate.id,
    action: 'generated_structure_from_project_template',
    newValueJson: {
      templateName: projectTemplate.name,
      workphaseTemplateCount: workphaseTemplates.length,
      checkpointTemplateCount: checkpointTemplates.length,
    },
    customerVisible: true,
  });
}

export async function createPartnerAction(formData: FormData) {
  const user = await requireUser();
  if (!canManagePartners(user)) redirect('/dashboard?error=forbidden');
  const parsed = partnerSchema.parse(Object.fromEntries(formData));

  const company = await prisma.company.create({
    data: {
      name: parsed.companyName,
      type: parsed.companyType,
      taxNumber: parsed.taxNumber || null,
      contactName: parsed.contactName || null,
      contactEmail: parsed.contactEmail || null,
      contactPhone: parsed.contactPhone || null,
    },
  });

  const partner = await prisma.partner.create({
    data: {
      companyId: company.id,
      qualificationStatus: parsed.qualificationStatus,
      specialties: parsed.specialties || null,
      notes: parsed.notes || null,
      joinedAt: parsed.qualificationStatus === 'QUALIFIED' ? new Date() : null,
    },
  });

  await auditLog({
    actorId: user.id,
    entityType: 'partner',
    entityId: partner.id,
    action: 'created_partner',
    newValueJson: { company: company.name, status: partner.qualificationStatus },
  });

  revalidatePath('/dashboard/partners');
  redirect('/dashboard/partners');
}

export async function createCertifiedProjectAction(formData: FormData) {
  const user = await requireUser();
  if (!canCreateCertifiedProject(user)) redirect('/dashboard?error=forbidden');
  const parsed = projectSchema.parse(Object.fromEntries(formData));
  const project = await prisma.project.create({
    data: {
      name: parsed.name,
      city: parsed.location || null,
      status: 'PREPARATION',
      customerName: parsed.customerName || null,
      customerEmail: parsed.customerEmail || null,
      customerPhone: parsed.customerPhone || null,
      description: 'Minositett kivitelezesi workflow rendszerben inditott projekt.',
      createdByUserId: user.id,
    },
  });

  const certification = await prisma.projectCertification.create({
    data: {
      projectId: project.id,
      slug: cleanSlug(parsed.slug),
      projectType: parsed.projectType,
      grossArea: parsed.grossArea || null,
      netArea: parsed.netArea || null,
      status: 'PREPARING',
    },
  });

  await prisma.projectMemberLink.createMany({
    data: [
      { projectId: project.id, userId: user.id, role: 'main_contractor_admin', permissionLevel: 'manage' },
      { projectId: project.id, role: 'customer', permissionLevel: 'view_approve', customerSafeNotes: parsed.customerName || null },
    ],
  });

  await createStructureFromProjectTemplate({
    certificationId: certification.id,
    actorId: user.id,
    projectId: project.id,
    projectTemplateId: parsed.projectTemplateId || null,
  });
  await prisma.notification.create({
    data: {
      certificationId: certification.id,
      userId: user.id,
      type: 'project_created',
      title: 'Projekt letrehozva',
      body: 'A sablon munkafazis-struktura elkeszult.',
      link: `/dashboard/projects/${project.id}`,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/projects');
  redirect(`/dashboard/projects/${project.id}`);
}

export async function updateCertifiedProjectAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectUpdateSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/projects/${parsed.projectId}/edit`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const existing = await prisma.projectCertification.findUnique({
    where: { id: parsed.certificationId },
    include: { subprojects: { select: { id: true } } },
  });
  if (!existing || existing.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-project');
  }

  const project = await prisma.project.update({
    where: { id: parsed.projectId },
    data: {
      name: parsed.name,
      code: parsed.code || null,
      city: parsed.city || null,
      postalCode: parsed.postalCode || null,
      addressLine: parsed.addressLine || null,
      status: parsed.projectStatus,
      customerName: parsed.customerName || null,
      customerEmail: parsed.customerEmail || null,
      customerPhone: parsed.customerPhone || null,
      description: parsed.description || null,
    },
  });

  const certification = await prisma.projectCertification.update({
    where: { id: parsed.certificationId },
    data: {
      slug: cleanSlug(parsed.slug),
      projectType: parsed.projectType || null,
      grossArea: parsed.grossArea || null,
      netArea: parsed.netArea || null,
      status: parsed.certificationStatus,
    },
  });

  await prisma.subproject.updateMany({
    where: { certificationId: certification.id },
    data: { status: certification.status },
  });

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: project.id,
    entityType: 'project',
    entityId: project.id,
    action: 'updated_project_profile',
    oldValueJson: { status: existing.status },
    newValueJson: {
      name: project.name,
      projectStatus: project.status,
      certificationStatus: certification.status,
      slug: certification.slug,
    },
    customerVisible: true,
  });

  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${project.id}`);
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function addProjectMemberLinkAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectMemberLinkSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/projects/${parsed.projectId}/members`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const certification = await prisma.projectCertification.findUnique({ where: { id: parsed.certificationId } });
  if (!certification || certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-project');
  }

  const userId = parsed.userId || null;
  const companyId = parsed.companyId || null;
  const existing = userId
    ? await prisma.projectMemberLink.findFirst({
        where: { projectId: parsed.projectId, userId, role: parsed.role },
      })
    : null;

  const memberLink = existing
    ? await prisma.projectMemberLink.update({
        where: { id: existing.id },
        data: {
          companyId,
          permissionLevel: parsed.permissionLevel,
          customerSafeNotes: parsed.customerSafeNotes || null,
          internalNotes: parsed.internalNotes || null,
          isActive: true,
        },
      })
    : await prisma.projectMemberLink.create({
        data: {
          projectId: parsed.projectId,
          userId,
          companyId,
          role: parsed.role,
          permissionLevel: parsed.permissionLevel,
          customerSafeNotes: parsed.customerSafeNotes || null,
          internalNotes: parsed.internalNotes || null,
          isActive: true,
        },
      });

  if (userId) {
    await prisma.notification.create({
      data: {
        certificationId: certification.id,
        userId,
        type: 'project_membership_added',
        title: 'Projekt hozzaferes frissult',
        body: `Uj vagy frissitett szerepkor: ${parsed.role}.`,
        link: `/dashboard/projects/${parsed.projectId}`,
      },
    });
  }

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: parsed.projectId,
    entityType: 'project_member_link',
    entityId: memberLink.id,
    action: existing ? 'updated_project_member_access' : 'added_project_member_access',
    newValueJson: {
      userId,
      companyId,
      role: parsed.role,
      permissionLevel: parsed.permissionLevel,
      isActive: true,
    },
    customerVisible: false,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function setProjectMemberLinkActiveAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectMemberActiveSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/projects/${parsed.projectId}/members`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const [certification, memberLink] = await Promise.all([
    prisma.projectCertification.findUnique({ where: { id: parsed.certificationId } }),
    prisma.projectMemberLink.findUnique({ where: { id: parsed.memberLinkId } }),
  ]);
  if (!certification || certification.projectId !== parsed.projectId || !memberLink || memberLink.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-member');
  }
  if (memberLink.userId === user.id && parsed.isActive === 'false') {
    redirect(`${returnTo}?error=self-deactivate`);
  }

  const updated = await prisma.projectMemberLink.update({
    where: { id: memberLink.id },
    data: { isActive: parsed.isActive === 'true' },
  });

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: parsed.projectId,
    entityType: 'project_member_link',
    entityId: updated.id,
    action: updated.isActive ? 'activated_project_member_access' : 'deactivated_project_member_access',
    oldValueJson: { isActive: memberLink.isActive },
    newValueJson: { isActive: updated.isActive, role: updated.role, permissionLevel: updated.permissionLevel },
    customerVisible: false,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function addProjectContactAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectContactSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/projects/${parsed.projectId}/members`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const certification = await prisma.projectCertification.findUnique({ where: { id: parsed.certificationId } });
  if (!certification || certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-project');
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId: parsed.projectId,
      name: parsed.name,
      email: parsed.email || null,
      phone: parsed.phone || null,
      role: parsed.role,
      permissionLevel: parsed.permissionLevel,
      notes: parsed.notes || null,
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: parsed.projectId,
    entityType: 'project_member',
    entityId: member.id,
    action: 'added_project_contact',
    newValueJson: { name: member.name, role: member.role, permissionLevel: member.permissionLevel },
    customerVisible: false,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function createProjectTemplateAction(formData: FormData) {
  const user = await requireUser();
  if (!canManagePartners(user)) redirect('/dashboard?error=forbidden');
  const parsed = projectTemplateSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || '/dashboard/templates';

  const template = await prisma.projectTemplate.create({
    data: {
      name: parsed.name,
      projectType: parsed.projectType,
      isActive: parsed.isActive === 'on',
    },
  });

  await auditLog({
    actorId: user.id,
    entityType: 'project_template',
    entityId: template.id,
    action: 'created_project_template',
    newValueJson: { name: template.name, projectType: template.projectType, isActive: template.isActive },
  });

  revalidatePath('/dashboard/templates');
  redirect(returnTo);
}

export async function createWorkphaseTemplateAction(formData: FormData) {
  const user = await requireUser();
  if (!canManagePartners(user)) redirect('/dashboard?error=forbidden');
  const parsed = workphaseTemplateSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || '/dashboard/templates/workphases';
  const requirements = parseRequirementLines(parsed.requirements);

  const template = await prisma.workphaseTemplate.create({
    data: {
      projectTemplateId: parsed.projectTemplateId || null,
      title: parsed.title,
      workgroupName: parsed.workgroupName,
      description: parsed.description || null,
      requiresInspection: parsed.requiresInspection === 'on',
      defaultRequirementsJson: requirements,
      sortOrder: parsed.sortOrder,
    },
  });

  await auditLog({
    actorId: user.id,
    entityType: 'workphase_template',
    entityId: template.id,
    action: 'created_workphase_template',
    newValueJson: {
      title: template.title,
      workgroupName: template.workgroupName,
      requiresInspection: template.requiresInspection,
      requirements,
    },
  });

  revalidatePath('/dashboard/templates');
  revalidatePath('/dashboard/templates/workphases');
  redirect(returnTo);
}

export async function createCheckpointTemplateAction(formData: FormData) {
  const user = await requireUser();
  if (!canManagePartners(user)) redirect('/dashboard?error=forbidden');
  const parsed = checkpointTemplateSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || '/dashboard/templates/checkpoints';

  const template = await prisma.checkpointTemplate.create({
    data: {
      workphaseTemplateId: parsed.workphaseTemplateId || null,
      title: parsed.title,
      description: parsed.description || null,
      inspectionType: parsed.inspectionType,
      isCritical: parsed.isCritical === 'on',
    },
  });

  await auditLog({
    actorId: user.id,
    entityType: 'checkpoint_template',
    entityId: template.id,
    action: 'created_checkpoint_template',
    newValueJson: {
      title: template.title,
      inspectionType: template.inspectionType,
      isCritical: template.isCritical,
    },
  });

  revalidatePath('/dashboard/templates');
  revalidatePath('/dashboard/templates/checkpoints');
  redirect(returnTo);
}

export async function updateWorkphaseAssignmentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = workphaseAssignmentSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/workphases/${parsed.workphaseId}`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const workphase = await prisma.workphase.findUnique({
    where: { id: parsed.workphaseId },
    include: {
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!workphase || workphase.workgroup.subproject.certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-workphase');
  }

  const assignedUserId = parsed.assignedUserId || null;
  const assignedCompanyId = parsed.assignedCompanyId || null;

  if (assignedUserId) {
    const userLink = await prisma.projectMemberLink.findFirst({
      where: {
        projectId: parsed.projectId,
        userId: assignedUserId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!userLink) redirect(`${returnTo}?error=assignee`);
  }

  if (assignedCompanyId) {
    const companyLink = await prisma.projectMemberLink.findFirst({
      where: {
        projectId: parsed.projectId,
        companyId: assignedCompanyId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!companyLink) redirect(`${returnTo}?error=assignee`);
  }

  const updated = await prisma.workphase.update({
    where: { id: workphase.id },
    data: {
      assignedUserId,
      assignedCompanyId,
      requiresCustomerVisibility: parsed.requiresCustomerVisibility === 'on',
    },
  });

  if (assignedUserId) {
    await prisma.notification.create({
      data: {
        certificationId: workphase.workgroup.subproject.certification.id,
        userId: assignedUserId,
        type: 'workphase_assigned',
        title: 'Munkafazis hozzarendelve',
        body: `${workphase.title} munkafazis hozzad lett rendelve.`,
        link: `/dashboard/workphases/${workphase.id}`,
      },
    });
  }

  await auditLog({
    actorId: user.id,
    certificationId: workphase.workgroup.subproject.certification.id,
    projectId: parsed.projectId,
    entityType: 'workphase',
    entityId: workphase.id,
    action: 'updated_workphase_assignment',
    oldValueJson: {
      assignedUserId: workphase.assignedUserId,
      assignedCompanyId: workphase.assignedCompanyId,
      requiresCustomerVisibility: workphase.requiresCustomerVisibility,
    },
    newValueJson: {
      assignedUserId: updated.assignedUserId,
      assignedCompanyId: updated.assignedCompanyId,
      requiresCustomerVisibility: updated.requiresCustomerVisibility,
    },
    customerVisible: false,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUser();
  const parsed = notificationReadSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || '/dashboard/notifications';

  const notification = await prisma.notification.findUnique({
    where: { id: parsed.notificationId },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification || (notification.userId && notification.userId !== user.id)) {
    redirect('/dashboard?error=forbidden');
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true },
  });

  revalidatePath('/dashboard/notifications');
  redirect(returnTo);
}

export async function markAllNotificationsReadAction(formData: FormData) {
  const user = await requireUser();
  const parsed = notificationsReadAllSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || '/dashboard/notifications';

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  revalidatePath('/dashboard/notifications');
  redirect(returnTo);
}

export async function addWorkphaseCommentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = workphaseCommentSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/workphases/${parsed.workphaseId}`;

  const workphase = await prisma.workphase.findUnique({
    where: { id: parsed.workphaseId },
    include: {
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!workphase || workphase.workgroup.subproject.certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-workphase');
  }

  const canComment = await canContributeToWorkphase(user, {
    projectId: parsed.projectId,
    assignedUserId: workphase.assignedUserId,
    assignedCompanyId: workphase.assignedCompanyId,
  });
  const canInternal = await canApproveProject(user, parsed.projectId);
  const isInternal = parsed.isInternal === 'on';

  if (!canComment && !canInternal) redirect('/dashboard?error=forbidden');
  if (isInternal && !canInternal) redirect('/dashboard?error=forbidden');

  const comment = await prisma.constructionComment.create({
    data: {
      workphaseId: workphase.id,
      authorId: user.id,
      body: parsed.body,
      isInternal,
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId: workphase.workgroup.subproject.certification.id,
    projectId: parsed.projectId,
    entityType: 'workphase_comment',
    entityId: comment.id,
    action: isInternal ? 'added_internal_comment' : 'added_customer_visible_comment',
    newValueJson: { workphaseId: workphase.id, isInternal },
    customerVisible: !isInternal,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function requestWorkphaseRevisionAction(formData: FormData) {
  const user = await requireUser();
  const parsed = workphaseRevisionSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/workphases/${parsed.workphaseId}`;

  const workphase = await prisma.workphase.findUnique({
    where: { id: parsed.workphaseId },
    include: {
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!workphase || workphase.workgroup.subproject.certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-workphase');
  }
  if (!(await canApproveProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const [updated, comment] = await prisma.$transaction([
    prisma.workphase.update({
      where: { id: workphase.id },
      data: { status: 'REVISION_REQUIRED' },
    }),
    prisma.constructionComment.create({
      data: {
        workphaseId: workphase.id,
        authorId: user.id,
        body: parsed.body,
        isInternal: false,
      },
    }),
  ]);

  const notificationUserIds = new Set<string>();
  if (parsed.notifyAssignee === 'on' && workphase.assignedUserId) {
    notificationUserIds.add(workphase.assignedUserId);
  }
  if (parsed.notifyAssignee === 'on' && workphase.assignedCompanyId) {
    const memberLinks = await prisma.projectMemberLink.findMany({
      where: {
        projectId: parsed.projectId,
        companyId: workphase.assignedCompanyId,
        isActive: true,
        permissionLevel: { in: ['contribute', 'manage', 'full'] },
        userId: { not: null },
      },
      select: { userId: true },
    });
    for (const memberLink of memberLinks) {
      if (memberLink.userId) notificationUserIds.add(memberLink.userId);
    }
  }

  if (notificationUserIds.size) {
    await prisma.notification.createMany({
      data: Array.from(notificationUserIds).map((userId) => ({
        certificationId: workphase.workgroup.subproject.certification.id,
        userId,
        type: 'revision_required',
        title: 'Hianypotlas szukseges',
        body: `${workphase.title}: ${parsed.body.slice(0, 160)}`,
        link: `/dashboard/workphases/${workphase.id}`,
      })),
    });
  }

  await auditLog({
    actorId: user.id,
    certificationId: workphase.workgroup.subproject.certification.id,
    projectId: parsed.projectId,
    entityType: 'workphase',
    entityId: workphase.id,
    action: 'revision_requested',
    oldValueJson: { status: workphase.status },
    newValueJson: { status: updated.status, commentId: comment.id },
    customerVisible: true,
  });

  revalidatePath('/dashboard');
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function createContractAction(formData: FormData) {
  const user = await requireUser();
  const parsed = contractSchema.parse(Object.fromEntries(formData));
  const returnTo = parsed.returnTo || `/dashboard/projects/${parsed.projectId}/closing-package`;

  if (!(await canManageProject(user, parsed.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const certification = await prisma.projectCertification.findUnique({
    where: { id: parsed.certificationId },
    select: { id: true, projectId: true },
  });
  if (!certification || certification.projectId !== parsed.projectId) {
    redirect('/dashboard?error=invalid-project');
  }

  const contract = await prisma.contract.create({
    data: {
      certificationId: parsed.certificationId,
      title: parsed.title,
      contractType: parsed.contractType,
      filePath: parsed.filePath || null,
      status: parsed.status,
      signedAt: parsed.signedAt ? new Date(parsed.signedAt) : null,
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId: parsed.certificationId,
    projectId: parsed.projectId,
    entityType: 'contract',
    entityId: contract.id,
    action: 'created_contract',
    newValueJson: {
      title: contract.title,
      contractType: contract.contractType,
      status: contract.status,
      signedAt: contract.signedAt,
    },
    customerVisible: false,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function updateWorkphaseStatusAction(formData: FormData) {
  const user = await requireUser();
  const workphaseId = String(formData.get('workphaseId') || '');
  const status = String(formData.get('status') || '') as WorkphaseStatus;
  const returnTo = String(formData.get('returnTo') || `/dashboard/workphases/${workphaseId}`);
  if (!workphaseId || !status) return;

  const workphase = await prisma.workphase.findUnique({
    where: { id: workphaseId },
    include: {
      uploadRequirements: true,
      uploads: true,
      checkpoints: true,
      workgroup: { include: { subproject: { include: { certification: true } } } },
      dependencies: { include: { dependsOnWorkphase: true } },
    },
  });
  if (!workphase) return;
  const certification = workphase.workgroup.subproject.certification;

  if (!(await canContributeToWorkphase(user, {
    projectId: certification.projectId,
    assignedUserId: workphase.assignedUserId,
    assignedCompanyId: workphase.assignedCompanyId,
  }))) {
    redirect('/dashboard?error=forbidden');
  }

  const transitionGuard = validateWorkphaseStatusTransition({
    nextStatus: status,
    requiresInspection: workphase.requiresInspection,
    uploadRequirements: workphase.uploadRequirements,
    uploads: workphase.uploads,
    checkpoints: workphase.checkpoints,
    dependencies: workphase.dependencies,
  });
  if (!transitionGuard.ok) redirect(`${returnTo}?error=${transitionGuard.reason}`);

  await prisma.workphase.update({
    where: { id: workphaseId },
    data: {
      status,
      actualStartDate: status === 'IN_PROGRESS' && !workphase.actualStartDate ? new Date() : workphase.actualStartDate,
      actualEndDate: status === 'CLOSED' ? new Date() : workphase.actualEndDate,
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: certification.projectId,
    entityType: 'workphase',
    entityId: workphase.id,
    action: 'status_changed',
    oldValueJson: { status: workphase.status },
    newValueJson: { status },
    customerVisible: true,
  });

  revalidatePath('/dashboard');
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function addUploadMetadataAction(formData: FormData) {
  const user = await requireUser();
  const workphaseId = String(formData.get('workphaseId') || '');
  const projectId = String(formData.get('projectId') || '');
  const title = String(formData.get('title') || '').trim();
  const filePath = String(formData.get('filePath') || '').trim();
  const fileType = String(formData.get('fileType') || 'PHOTO').trim();
  const returnTo = String(formData.get('returnTo') || `/dashboard/workphases/${workphaseId}`);
  if (!workphaseId || !projectId || !title || !filePath) return;

  const workphase = await prisma.workphase.findUnique({
    where: { id: workphaseId },
    include: {
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!workphase || workphase.workgroup.subproject.certification.projectId !== projectId) {
    redirect('/dashboard?error=invalid-workphase');
  }
  if (!(await canContributeToWorkphase(user, {
    projectId,
    assignedUserId: workphase.assignedUserId,
    assignedCompanyId: workphase.assignedCompanyId,
  }))) {
    redirect('/dashboard?error=forbidden');
  }

  await prisma.upload.create({
    data: {
      projectId,
      workphaseId,
      checkpointId: String(formData.get('checkpointId') || '').trim() || null,
      uploadRequirementId: String(formData.get('uploadRequirementId') || '').trim() || null,
      uploadedBy: user.id,
      title,
      filePath,
      fileType,
      description: String(formData.get('description') || '').trim() || null,
      capturedAt: new Date(),
      isRequiredEvidence: String(formData.get('isRequiredEvidence') || '') === 'on',
    },
  });

  await auditLog({
    actorId: user.id,
    projectId,
    entityType: 'upload',
    entityId: workphaseId,
    action: 'file_metadata_added',
    newValueJson: { title, filePath, fileType },
    customerVisible: true,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function uploadEvidenceFileAction(formData: FormData) {
  const user = await requireUser();
  const workphaseId = String(formData.get('workphaseId') || '');
  const projectId = String(formData.get('projectId') || '');
  const title = String(formData.get('title') || '').trim();
  const returnTo = String(formData.get('returnTo') || `/dashboard/workphases/${workphaseId}`);
  const file = formData.get('file');
  if (!workphaseId || !projectId || !title || !(file instanceof File) || file.size === 0) return;

  const workphase = await prisma.workphase.findUnique({
    where: { id: workphaseId },
    include: {
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!workphase || workphase.workgroup.subproject.certification.projectId !== projectId) {
    redirect('/dashboard?error=invalid-workphase');
  }
  if (!(await canContributeToWorkphase(user, {
    projectId,
    assignedUserId: workphase.assignedUserId,
    assignedCompanyId: workphase.assignedCompanyId,
  }))) {
    redirect('/dashboard?error=forbidden');
  }

  const maxSizeBytes = 25 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    redirect(`${returnTo}?error=file-too-large`);
  }

  const fileName = safeFileName(file.name || title);
  const relativePath = `/uploads/${projectId}/${workphaseId}/${fileName}`;
  const absoluteDir = path.join(process.cwd(), 'public', 'uploads', projectId, workphaseId);
  const absolutePath = path.join(absoluteDir, fileName);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  await prisma.upload.create({
    data: {
      projectId,
      workphaseId,
      checkpointId: String(formData.get('checkpointId') || '').trim() || null,
      uploadRequirementId: String(formData.get('uploadRequirementId') || '').trim() || null,
      uploadedBy: user.id,
      title,
      filePath: relativePath,
      fileType: mapMimeToUploadType(file.type),
      description: String(formData.get('description') || '').trim() || null,
      capturedAt: new Date(),
      isRequiredEvidence: true,
    },
  });

  await auditLog({
    actorId: user.id,
    projectId,
    entityType: 'upload',
    entityId: workphaseId,
    action: 'file_uploaded',
    newValueJson: { title, filePath: relativePath, fileType: file.type, size: file.size },
    customerVisible: true,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function updateCheckpointStatusAction(formData: FormData) {
  const user = await requireUser();
  const checkpointId = String(formData.get('checkpointId') || '');
  const status = String(formData.get('status') || '') as CheckpointStatus;
  const returnTo = String(formData.get('returnTo') || `/dashboard/checkpoints/${checkpointId}`);
  if (!checkpointId || !status) return;

  const existingCheckpoint = await prisma.checkpoint.findUnique({
    where: { id: checkpointId },
    include: { workphase: { include: { workgroup: { include: { subproject: { include: { certification: true } } } } } } },
  });
  if (!existingCheckpoint) return;
  const existingCertification = existingCheckpoint.workphase.workgroup.subproject.certification;
  if (!(await canApproveProject(user, existingCertification.projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const checkpoint = await prisma.checkpoint.update({
    where: { id: checkpointId },
    data: {
      status,
      reviewedBy: user.id,
      reviewedAt: ['APPROVED', 'REJECTED', 'REVISION_REQUIRED'].includes(status) ? new Date() : null,
      resultNotes: String(formData.get('resultNotes') || '').trim() || null,
    },
    include: { workphase: { include: { workgroup: { include: { subproject: { include: { certification: true } } } } } } },
  });

  const certification = checkpoint.workphase.workgroup.subproject.certification;
  await prisma.approval.create({
    data: {
      projectId: certification.projectId,
      workphaseId: checkpoint.workphaseId,
      checkpointId,
      approverId: user.id,
      approvalType: 'checkpoint',
      decision: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : status === 'REVISION_REQUIRED' ? 'REVISION_REQUIRED' : 'PENDING',
      notes: checkpoint.resultNotes,
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId: certification.id,
    projectId: certification.projectId,
    entityType: 'checkpoint',
    entityId: checkpoint.id,
    action: 'checkpoint_decision',
    newValueJson: { status, notes: checkpoint.resultNotes },
    customerVisible: true,
  });

  revalidatePath('/dashboard/checkpoints');
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function generateClosingPackageAction(formData: FormData) {
  const user = await requireUser();
  const certificationId = String(formData.get('certificationId') || '');
  const projectId = String(formData.get('projectId') || '');
  const returnTo = String(formData.get('returnTo') || `/dashboard/projects/${projectId}/closing-package`);
  if (!certificationId || !projectId) return;
  if (!(await canManageProject(user, projectId))) {
    redirect('/dashboard?error=forbidden');
  }

  const openPhaseCount = await prisma.workphase.count({
    where: {
      workgroup: { subproject: { certificationId } },
      status: { notIn: ['APPROVED', 'CLOSED'] },
    },
  });
  const openCheckpointCount = await prisma.checkpoint.count({
    where: {
      workphase: { workgroup: { subproject: { certificationId } } },
      status: { not: 'APPROVED' },
    },
  });
  if (openPhaseCount || openCheckpointCount) redirect(`${returnTo}?error=not-ready`);

  const lastPackage = await prisma.closingPackage.findFirst({
    where: { certificationId },
    orderBy: { version: 'desc' },
  });
  const version = (lastPackage?.version || 0) + 1;
  const exportDir = path.join(process.cwd(), 'public', 'exports', 'closing-packages');
  const generatedFilePath = `/exports/closing-packages/${projectId}-v${version}.html`;

  const [project, certification] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.projectCertification.findUnique({
      where: { id: certificationId },
      include: {
        subprojects: {
          orderBy: { sortOrder: 'asc' },
          include: {
            workgroups: {
              orderBy: { sortOrder: 'asc' },
              include: {
                workphases: {
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    uploadRequirements: { orderBy: { sortOrder: 'asc' } },
                    uploads: { orderBy: { createdAt: 'asc' } },
                    checkpoints: { orderBy: { createdAt: 'asc' } },
                    approvals: { orderBy: { createdAt: 'asc' } },
                  },
                },
              },
            },
          },
        },
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    }),
  ]);

  if (!project || !certification || certification.projectId !== projectId) {
    redirect(`${returnTo}?error=not-found`);
  }

  const phases = certification.subprojects.flatMap((subproject) =>
    subproject.workgroups.flatMap((workgroup) =>
      workgroup.workphases.map((phase) => ({ ...phase, workgroup, subproject })),
    ),
  );
  const uploads = phases.flatMap((phase) => phase.uploads.map((upload) => ({ ...upload, phase })));
  const checkpoints = phases.flatMap((phase) => phase.checkpoints.map((checkpoint) => ({ ...checkpoint, phase })));
  const requirementRows = phases.flatMap((phase) =>
    phase.uploadRequirements.map((requirement) => {
      const count = phase.uploads.filter((upload) => upload.uploadRequirementId === requirement.id).length;
      return { requirement, phase, count, complete: count >= requirement.minCount };
    }),
  );

  const html = `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.name)} - zaro csomag v${version}</title>
  <style>
    :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; color: #162033; background: #f5f7f3; }
    body { margin: 0; padding: 32px; }
    main { max-width: 1120px; margin: 0 auto; background: white; border: 1px solid #dfe7da; border-radius: 18px; padding: 32px; }
    h1 { margin: 0; font-size: 34px; letter-spacing: -0.02em; }
    h2 { margin: 36px 0 14px; font-size: 20px; }
    h3 { margin: 22px 0 10px; font-size: 16px; }
    p { color: #536174; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border-bottom: 1px solid #e6ebdf; padding: 10px; text-align: left; vertical-align: top; }
    th { color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: .08em; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin: 24px 0; }
    .card { border: 1px solid #e1e8dc; background: #f8faf6; border-radius: 14px; padding: 16px; }
    .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; }
    .value { margin-top: 8px; font-size: 20px; font-weight: 700; }
    .badge { display: inline-block; border: 1px solid #d8e2d2; border-radius: 999px; padding: 4px 9px; font-size: 12px; font-weight: 700; background: #f8faf6; }
    .ok { color: #047857; border-color: #a7f3d0; background: #ecfdf5; }
    .warn { color: #b45309; border-color: #fed7aa; background: #fff7ed; }
    a { color: #c2410c; font-weight: 700; }
    @media print { body { padding: 0; background: white; } main { border: 0; border-radius: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <main>
    <div class="no-print"><button onclick="window.print()">Nyomtatas / PDF mentes</button></div>
    <p class="label">Hazepitok Minositett Kivitelezesi Rendszer</p>
    <h1>${escapeHtml(project.name)} - zaro dokumentacios csomag</h1>
    <p>Verzio ${version}. Generalva: ${escapeHtml(formatExportDate(new Date()))}. Generalta: ${escapeHtml(user.name)}.</p>

    <section class="grid">
      <div class="card"><div class="label">Projekt statusz</div><div class="value">${escapeHtml(certification.status)}</div></div>
      <div class="card"><div class="label">Munkafazis</div><div class="value">${phases.length}</div></div>
      <div class="card"><div class="label">Checkpoint</div><div class="value">${checkpoints.length}</div></div>
      <div class="card"><div class="label">Feltoltes</div><div class="value">${uploads.length}</div></div>
    </section>

    <h2>Projekt alapadatok</h2>
    <table>
      <tbody>
        <tr><th>Helyszin</th><td>${escapeHtml([project.city, project.addressLine].filter(Boolean).join(', ') || '-')}</td></tr>
        <tr><th>Megrendelo</th><td>${escapeHtml(project.customerName || '-')} | ${escapeHtml(project.customerEmail || '-')} | ${escapeHtml(project.customerPhone || '-')}</td></tr>
        <tr><th>Projekt tipus</th><td>${escapeHtml(certification.projectType || '-')}</td></tr>
        <tr><th>Alapterulet</th><td>Brutto: ${escapeHtml(certification.grossArea || '-')} m2, Netto: ${escapeHtml(certification.netArea || '-')} m2</td></tr>
      </tbody>
    </table>

    <h2>Munkafazisok</h2>
    <table>
      <thead><tr><th>Alprojekt</th><th>Munkacsoport</th><th>Munkafazis</th><th>Statusz</th><th>Inditas</th><th>Zaras</th></tr></thead>
      <tbody>
        ${phases.map((phase) => `<tr><td>${escapeHtml(phase.subproject.name)}</td><td>${escapeHtml(phase.workgroup.name)}</td><td>${escapeHtml(phase.title)}</td><td><span class="badge">${escapeHtml(phase.status)}</span></td><td>${escapeHtml(formatExportDate(phase.actualStartDate))}</td><td>${escapeHtml(formatExportDate(phase.actualEndDate))}</td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Dokumentacios requirementek</h2>
    <table>
      <thead><tr><th>Munkafazis</th><th>Requirement</th><th>Tipus</th><th>Elvart</th><th>Feltoltve</th><th>Allapot</th></tr></thead>
      <tbody>
        ${requirementRows.map((row) => `<tr><td>${escapeHtml(row.phase.title)}</td><td>${escapeHtml(row.requirement.label)}</td><td>${escapeHtml(row.requirement.requiredType)}</td><td>${row.requirement.minCount}</td><td>${row.count}</td><td><span class="badge ${row.complete ? 'ok' : 'warn'}">${row.complete ? 'Teljesult' : 'Hianyos'}</span></td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Checkpoint eredmenyek</h2>
    <table>
      <thead><tr><th>Munkafazis</th><th>Checkpoint</th><th>Statusz</th><th>Ellenorzes ideje</th><th>Megjegyzes</th></tr></thead>
      <tbody>
        ${checkpoints.map((checkpoint) => `<tr><td>${escapeHtml(checkpoint.phase.title)}</td><td>${escapeHtml(checkpoint.title)}</td><td><span class="badge ${checkpoint.status === 'APPROVED' ? 'ok' : 'warn'}">${escapeHtml(checkpoint.status)}</span></td><td>${escapeHtml(formatExportDate(checkpoint.reviewedAt))}</td><td>${escapeHtml(checkpoint.resultNotes || '-')}</td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Dokumentumlista</h2>
    <table>
      <thead><tr><th>Munkafazis</th><th>Cim</th><th>Tipus</th><th>Utvonal</th><th>Ido</th></tr></thead>
      <tbody>
        ${uploads.map((upload) => `<tr><td>${escapeHtml(upload.phase.title)}</td><td>${escapeHtml(upload.title)}</td><td>${escapeHtml(upload.fileType)}</td><td><a href="${escapeHtml(upload.filePath)}">${escapeHtml(upload.filePath)}</a></td><td>${escapeHtml(formatExportDate(upload.createdAt))}</td></tr>`).join('')}
      </tbody>
    </table>

    <h2>Audit esemenynaplo</h2>
    <table>
      <thead><tr><th>Ido</th><th>Muvelet</th><th>Entitas</th><th>Ugyfelnek lathato</th></tr></thead>
      <tbody>
        ${certification.auditLogs.map((log) => `<tr><td>${escapeHtml(formatExportDate(log.createdAt))}</td><td>${escapeHtml(log.action)}</td><td>${escapeHtml(`${log.entityType} / ${log.entityId}`)}</td><td>${log.customerVisible ? 'Igen' : 'Nem'}</td></tr>`).join('')}
      </tbody>
    </table>
  </main>
</body>
</html>`;

  await mkdir(exportDir, { recursive: true });
  await writeFile(path.join(exportDir, `${projectId}-v${version}.html`), html, 'utf8');

  await prisma.closingPackage.create({
    data: {
      certificationId,
      version,
      status: 'READY',
      generatedFilePath,
      generatedAt: new Date(),
      generatedBy: user.id,
      summaryJson: {
        openPhaseCount,
        openCheckpointCount,
        generatedFilePath,
        phaseCount: phases.length,
        checkpointCount: checkpoints.length,
        uploadCount: uploads.length,
      },
    },
  });

  await auditLog({
    actorId: user.id,
    certificationId,
    projectId,
    entityType: 'closing_package',
    entityId: certificationId,
    action: 'generated_closing_package',
    newValueJson: { version, generatedFilePath },
    customerVisible: true,
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}
