import { ProjectRole, ProjectWorkflowTemplate, type User } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const workflowTemplateLabel: Record<ProjectWorkflowTemplate, string> = {
  EARTHWORK: 'Foldmunka',
  MASONRY: 'Szerkezetepites',
  ROOFING: 'Tetofedes',
  FACADE: 'Homlokzat',
  OPENINGS: 'Nyilaszarok',
  ELECTRICAL: 'Villanyszereles',
  MECHANICAL: 'Gepeszet',
  INTERIOR: 'Belso munkak',
  PAINTING: 'Festes',
  TILING: 'Burkolas',
  OTHER: 'Egyeb',
};

export function isPrivilegedOfficeUser(user: Pick<User, 'role'>) {
  return user.role === 'OWNER' || user.role === 'ADMIN';
}

export async function getAccessibleSubcontractorMembers(user: Pick<User, 'id' | 'email' | 'role'>) {
  const privileged = isPrivilegedOfficeUser(user);

  return prisma.projectMember.findMany({
    where: {
      role: ProjectRole.SUBCONTRACTOR,
      isActive: true,
      ...(privileged ? {} : { email: user.email }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
          customerName: true,
        },
      },
      ownedWorkflows: {
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
              dueAt: true,
            },
          },
          documents: {
            select: {
              id: true,
            },
          },
        },
      },
      assignedTasks: {
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              template: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ updatedAt: 'desc' }],
  });
}

