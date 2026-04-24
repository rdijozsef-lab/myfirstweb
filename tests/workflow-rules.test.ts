import assert from 'node:assert/strict';
import { validateWorkphaseStatusTransition } from '@/lib/workflow-rules';

const baseInput = {
  nextStatus: 'CLOSED' as const,
  requiresInspection: true,
  uploadRequirements: [
    { id: 'req-photo', label: 'Foto', minCount: 2, isMandatory: true },
    { id: 'req-note', label: 'Megjegyzes', minCount: 1, isMandatory: false },
  ],
  uploads: [
    { uploadRequirementId: 'req-photo' },
    { uploadRequirementId: 'req-photo' },
  ],
  checkpoints: [
    { id: 'checkpoint-1', status: 'APPROVED' as const },
  ],
  dependencies: [
    { dependsOnWorkphase: { id: 'dependency-1', status: 'CLOSED' as const } },
  ],
};

function run() {
  assert.deepEqual(validateWorkphaseStatusTransition(baseInput), { ok: true });

  assert.deepEqual(
    validateWorkphaseStatusTransition({
      ...baseInput,
      nextStatus: 'IN_PROGRESS',
      dependencies: [{ dependsOnWorkphase: { id: 'dependency-1', status: 'IN_PROGRESS' } }],
    }),
    { ok: false, reason: 'dependency' },
  );

  assert.deepEqual(
    validateWorkphaseStatusTransition({
      ...baseInput,
      uploads: [{ uploadRequirementId: 'req-photo' }],
    }),
    { ok: false, reason: 'uploads' },
  );

  assert.deepEqual(
    validateWorkphaseStatusTransition({
      ...baseInput,
      checkpoints: [{ id: 'checkpoint-1', status: 'REVISION_REQUIRED' }],
    }),
    { ok: false, reason: 'checkpoint' },
  );

  assert.deepEqual(
    validateWorkphaseStatusTransition({
      ...baseInput,
      requiresInspection: false,
      checkpoints: [{ id: 'checkpoint-1', status: 'PENDING' }],
    }),
    { ok: true },
  );

  assert.deepEqual(
    validateWorkphaseStatusTransition({
      ...baseInput,
      uploads: [
        { uploadRequirementId: 'req-photo' },
        { uploadRequirementId: 'req-photo' },
      ],
    }),
    { ok: true },
  );

  console.log('workflow-rules.test.ts passed');
}

run();
