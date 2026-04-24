import { CheckpointStatus, WorkphaseStatus } from '@prisma/client';

export type WorkphaseCloseRequirement = {
  id: string;
  label?: string | null;
  minCount: number;
  isMandatory: boolean;
};

export type WorkphaseCloseUpload = {
  uploadRequirementId: string | null;
};

export type WorkphaseCloseCheckpoint = {
  id: string;
  status: CheckpointStatus;
};

export type WorkphaseCloseDependency = {
  dependsOnWorkphase: {
    id: string;
    status: WorkphaseStatus;
  };
};

export type WorkphaseStatusGuardInput = {
  nextStatus: WorkphaseStatus;
  requiresInspection: boolean;
  uploadRequirements: WorkphaseCloseRequirement[];
  uploads: WorkphaseCloseUpload[];
  checkpoints: WorkphaseCloseCheckpoint[];
  dependencies: WorkphaseCloseDependency[];
};

export type WorkphaseStatusGuardResult =
  | { ok: true }
  | { ok: false; reason: 'dependency' | 'uploads' | 'checkpoint' };

export function validateWorkphaseStatusTransition(input: WorkphaseStatusGuardInput): WorkphaseStatusGuardResult {
  if (['IN_PROGRESS', 'AWAITING_UPLOADS'].includes(input.nextStatus)) {
    const openDependency = input.dependencies.find((item) => !['APPROVED', 'CLOSED'].includes(item.dependsOnWorkphase.status));
    if (openDependency) return { ok: false, reason: 'dependency' };
  }

  if (input.nextStatus === 'CLOSED') {
    const missingRequirement = input.uploadRequirements.find((requirement) => {
      const count = input.uploads.filter((upload) => upload.uploadRequirementId === requirement.id).length;
      return requirement.isMandatory && count < requirement.minCount;
    });
    if (missingRequirement) return { ok: false, reason: 'uploads' };

    const openCheckpoint = input.checkpoints.find((checkpoint) => checkpoint.status !== 'APPROVED');
    if (input.requiresInspection && openCheckpoint) return { ok: false, reason: 'checkpoint' };
  }

  return { ok: true };
}
