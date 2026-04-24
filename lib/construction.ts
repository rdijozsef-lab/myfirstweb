import {
  CertifiedProjectStatus,
  CheckpointStatus,
  ClosingPackageStatus,
  PartnerQualificationStatus,
  RequiredUploadType,
  UserRole,
  WorkphaseStatus,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';

type ConstructionUser = {
  id: string;
  role: UserRole;
};

const permissionRank: Record<string, number> = {
  view_only: 1,
  view_approve: 2,
  comment: 2,
  contribute: 3,
  manage: 4,
  full: 5,
};

function hasGlobalAdminRole(user: ConstructionUser) {
  return user.role === 'OWNER' || user.role === 'ADMIN';
}

export function canManagePartners(user: ConstructionUser) {
  return hasGlobalAdminRole(user);
}

export function canCreateCertifiedProject(user: ConstructionUser) {
  return user.role === 'OWNER' || user.role === 'ADMIN' || user.role === 'EDITOR';
}

async function getProjectAccessLevel(user: ConstructionUser, projectId: string) {
  if (hasGlobalAdminRole(user)) return 5;

  const [project, memberLink] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { createdByUserId: true },
    }),
    prisma.projectMemberLink.findFirst({
      where: {
        projectId,
        userId: user.id,
        isActive: true,
      },
      select: {
        permissionLevel: true,
      },
    }),
  ]);

  if (project?.createdByUserId === user.id) return 4;
  return permissionRank[memberLink?.permissionLevel || ''] || 0;
}

export async function canViewProject(user: ConstructionUser, projectId: string) {
  return (await getProjectAccessLevel(user, projectId)) >= 1;
}

export async function canApproveProject(user: ConstructionUser, projectId: string) {
  return (await getProjectAccessLevel(user, projectId)) >= 2;
}

export async function canContributeToProject(user: ConstructionUser, projectId: string) {
  return (await getProjectAccessLevel(user, projectId)) >= 3;
}

export async function canManageProject(user: ConstructionUser, projectId: string) {
  return (await getProjectAccessLevel(user, projectId)) >= 4;
}

export async function canContributeToWorkphase(
  user: ConstructionUser,
  input: {
    projectId: string;
    assignedUserId?: string | null;
    assignedCompanyId?: string | null;
  },
) {
  const accessLevel = await getProjectAccessLevel(user, input.projectId);
  if (accessLevel >= 4) return true;
  if (accessLevel < 3) return false;

  if (input.assignedUserId) return input.assignedUserId === user.id;

  if (input.assignedCompanyId) {
    const memberLink = await prisma.projectMemberLink.findFirst({
      where: {
        projectId: input.projectId,
        userId: user.id,
        companyId: input.assignedCompanyId,
        isActive: true,
        permissionLevel: { in: ['contribute', 'manage', 'full'] },
      },
      select: { id: true },
    });

    return Boolean(memberLink);
  }

  return false;
}

export async function getAccessibleProjectIds(user: ConstructionUser) {
  if (hasGlobalAdminRole(user)) return null;

  const [createdProjects, memberLinks] = await Promise.all([
    prisma.project.findMany({
      where: { createdByUserId: user.id },
      select: { id: true },
    }),
    prisma.projectMemberLink.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: { projectId: true },
    }),
  ]);

  return Array.from(new Set([
    ...createdProjects.map((project) => project.id),
    ...memberLinks.map((link) => link.projectId),
  ]));
}

export type FlatWorkphase = {
  id: string;
  title: string;
  status: WorkphaseStatus;
  requiresCustomerVisibility: boolean;
  uploadRequirements: Array<{ id: string; minCount: number; requiredType: RequiredUploadType; isMandatory?: boolean; label?: string }>;
  uploads: Array<{ id?: string; title?: string; filePath?: string; uploadRequirementId: string | null; fileType: string; isRequiredEvidence: boolean }>;
  checkpoints: Array<{ id: string; title?: string; status: CheckpointStatus }>;
  workgroup: { id: string; name: string };
  subproject: { id: string; name: string };
};

export const certifiedProjectStatusLabel: Record<CertifiedProjectStatus, string> = {
  DRAFT: 'Vazlat',
  PREPARING: 'Elokeszites alatt',
  READY_TO_START: 'Indulasra var',
  ACTIVE: 'Aktiv',
  UNDER_REVIEW: 'Ellenorzes alatt',
  PARTIALLY_CLOSED: 'Reszlegesen lezart',
  CLOSED: 'Lezart',
  SUSPENDED: 'Felfuggesztett',
};

export const partnerStatusLabel: Record<PartnerQualificationStatus, string> = {
  APPLIED: 'Jelentkezett',
  SCREENING: 'Szures alatt',
  CONDITIONAL: 'Felteteles',
  QUALIFIED: 'Minositett',
  SUSPENDED: 'Felfuggesztett',
  EXCLUDED: 'Kizart',
};

export const workphaseStatusLabel: Record<WorkphaseStatus, string> = {
  NOT_STARTED: 'Nem indult',
  IN_PROGRESS: 'Folyamatban',
  AWAITING_UPLOADS: 'Feltoltes alatt',
  AWAITING_REVIEW: 'Ellenorzesre var',
  REVISION_REQUIRED: 'Hianypotlas szukseges',
  APPROVED: 'Jovahagyva',
  CLOSED: 'Lezart',
};

export const checkpointStatusLabel: Record<CheckpointStatus, string> = {
  PENDING: 'Fuggoben',
  SUBMITTED: 'Beadva',
  UNDER_REVIEW: 'Ellenorzes alatt',
  APPROVED: 'Megfelelt',
  REJECTED: 'Elutasitva',
  REVISION_REQUIRED: 'Ujraellenorzes szukseges',
};

export const uploadTypeLabel: Record<RequiredUploadType, string> = {
  PHOTO: 'Foto',
  VIDEO: 'Video',
  PDF: 'PDF',
  NOTE: 'Megjegyzes',
  DRAWING_MARKUP: 'Rajzi jeloles',
};

export const closingPackageStatusLabel: Record<ClosingPackageStatus, string> = {
  DRAFT: 'Piszkozat',
  GENERATING: 'Generalas alatt',
  READY: 'Elkeszult',
  FAILED: 'Hibas',
};

export function badgeTone(status: string): 'blue' | 'green' | 'amber' | 'slate' {
  if (['QUALIFIED', 'APPROVED', 'CLOSED', 'READY'].includes(status)) return 'green';
  if (['SUSPENDED', 'EXCLUDED', 'REJECTED', 'REVISION_REQUIRED'].includes(status)) return 'amber';
  if (['DRAFT', 'NOT_STARTED', 'PENDING'].includes(status)) return 'slate';
  return 'blue';
}

export function formatDate(value?: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}

export function formatDateTime(value?: Date | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

export async function getDashboardStats() {
  const [
    projects,
    activeProjects,
    openCheckpoints,
    revisionWorkphases,
    partners,
    recentAuditLogs,
    recentUploads,
  ] = await Promise.all([
    prisma.projectCertification.count(),
    prisma.projectCertification.count({ where: { status: { in: ['ACTIVE', 'UNDER_REVIEW', 'READY_TO_START'] } } }),
    prisma.checkpoint.count({ where: { status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED'] } } }),
    prisma.workphase.count({ where: { status: 'REVISION_REQUIRED' } }),
    prisma.partner.count({ where: { qualificationStatus: 'QUALIFIED' } }),
    prisma.constructionAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.upload.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  return { projects, activeProjects, openCheckpoints, revisionWorkphases, partners, recentAuditLogs, recentUploads };
}

export async function getProjectShell(projectId: string) {
  const [project, certification] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.projectCertification.findUnique({
      where: { projectId },
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
                    uploads: true,
                    checkpoints: { orderBy: { createdAt: 'asc' } },
                    comments: { orderBy: { createdAt: 'desc' } },
                    approvals: { orderBy: { createdAt: 'desc' } },
                  },
                },
              },
            },
          },
        },
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
        closingPackages: { orderBy: { version: 'desc' } },
        contracts: { orderBy: { createdAt: 'desc' } },
      },
    }),
  ]);

  return { project, certification };
}

export async function getCustomerProjectShell(projectId: string) {
  const [project, certification] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        customerName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.projectCertification.findUnique({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        projectType: true,
        grossArea: true,
        netArea: true,
        status: true,
        updatedAt: true,
        subprojects: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            sortOrder: true,
            workgroups: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                category: true,
                sortOrder: true,
                workphases: {
                  where: { requiresCustomerVisibility: true },
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    requiresCustomerVisibility: true,
                    sortOrder: true,
                    uploadRequirements: {
                      where: { isMandatory: true },
                      orderBy: { sortOrder: 'asc' },
                      select: {
                        id: true,
                        label: true,
                        minCount: true,
                        requiredType: true,
                        isMandatory: true,
                      },
                    },
                    uploads: {
                      where: { isRequiredEvidence: true },
                      orderBy: { createdAt: 'desc' },
                      select: {
                        id: true,
                        title: true,
                        filePath: true,
                        fileType: true,
                        uploadRequirementId: true,
                        isRequiredEvidence: true,
                      },
                    },
                    checkpoints: {
                      orderBy: { createdAt: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        auditLogs: {
          where: { customerVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            entityType: true,
            entityId: true,
            action: true,
            customerVisible: true,
            createdAt: true,
          },
        },
        closingPackages: {
          where: { status: 'READY' },
          orderBy: { version: 'desc' },
          select: {
            id: true,
            version: true,
            status: true,
            generatedFilePath: true,
            generatedAt: true,
          },
        },
      },
    }),
  ]);

  return { project, certification };
}

export function flattenWorkphases(certification: {
  subprojects: Array<{
    id: string;
    name: string;
    workgroups: Array<{
      id: string;
      name: string;
      workphases: Array<{
        id: string;
        title: string;
        status: WorkphaseStatus;
        requiresCustomerVisibility?: boolean;
        uploadRequirements?: FlatWorkphase['uploadRequirements'];
        uploads?: FlatWorkphase['uploads'];
        checkpoints?: FlatWorkphase['checkpoints'];
      }>;
    }>;
  }>;
} | null): FlatWorkphase[] {
  if (!certification) return [];
  return certification.subprojects.flatMap((subproject) =>
    subproject.workgroups.flatMap((workgroup) =>
      workgroup.workphases.map((workphase) => ({
        ...workphase,
        requiresCustomerVisibility: workphase.requiresCustomerVisibility ?? true,
        uploadRequirements: workphase.uploadRequirements || [],
        uploads: workphase.uploads || [],
        checkpoints: workphase.checkpoints || [],
        workgroup: { id: workgroup.id, name: workgroup.name },
        subproject: { id: subproject.id, name: subproject.name },
      })),
    ),
  );
}

export function requirementProgress(
  requirement: { id: string; minCount: number; requiredType: RequiredUploadType },
  uploads: Array<{ uploadRequirementId: string | null; fileType: string; isRequiredEvidence: boolean }>,
) {
  const count = uploads.filter((upload) => {
    if (upload.uploadRequirementId) return upload.uploadRequirementId === requirement.id;
    return upload.isRequiredEvidence && upload.fileType.toUpperCase().includes(requirement.requiredType);
  }).length;

  return { count, missing: Math.max(0, requirement.minCount - count), complete: count >= requirement.minCount };
}

export function projectCompletion(workphases: Array<{ status: WorkphaseStatus }>) {
  if (!workphases.length) return 0;
  const weighted = workphases.reduce((sum, phase) => {
    if (phase.status === 'CLOSED') return sum + 1;
    if (phase.status === 'APPROVED') return sum + 0.85;
    if (phase.status === 'AWAITING_REVIEW') return sum + 0.65;
    if (phase.status === 'IN_PROGRESS' || phase.status === 'AWAITING_UPLOADS') return sum + 0.35;
    return sum;
  }, 0);
  return Math.round((weighted / workphases.length) * 100);
}

export async function auditLog(input: {
  actorId?: string | null;
  certificationId?: string | null;
  projectId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValueJson?: unknown;
  newValueJson?: unknown;
  customerVisible?: boolean;
}) {
  await prisma.constructionAuditLog.create({
    data: {
      actorId: input.actorId || null,
      certificationId: input.certificationId || null,
      projectId: input.projectId || null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      oldValueJson: input.oldValueJson === undefined ? undefined : input.oldValueJson as object,
      newValueJson: input.newValueJson === undefined ? undefined : input.newValueJson as object,
      customerVisible: input.customerVisible || false,
    },
  });
}
