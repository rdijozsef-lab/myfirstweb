import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requestWorkphaseRevisionAction, updateCheckpointStatusAction } from '@/app/dashboard/actions';
import { Field, Select, Textarea } from '@/components/forms';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import {
  badgeTone,
  canApproveProject,
  canViewProject,
  checkpointStatusLabel,
  formatDateTime,
  workphaseStatusLabel,
} from '@/lib/construction';
import { prisma } from '@/lib/prisma';

export default async function WorkphaseCheckpointsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const phase = await prisma.workphase.findUnique({
    where: { id },
    include: {
      checkpoints: { orderBy: { createdAt: 'asc' } },
      approvals: { orderBy: { createdAt: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
      workgroup: { include: { subproject: { include: { certification: true } } } },
    },
  });
  if (!phase) notFound();

  const certification = phase.workgroup.subproject.certification;
  if (!(await canViewProject(user, certification.projectId))) notFound();
  const canApprove = await canApproveProject(user, certification.projectId);
  const approvedCount = phase.checkpoints.filter((checkpoint) => checkpoint.status === 'APPROVED').length;
  const revisionComments = phase.comments.filter((comment) => !comment.isInternal).slice(0, 6);

  return (
    <OfficeShellV2
      title={`${phase.title} checkpointjai`}
      description="Ellenorzesi pontok, szakertoi dontesek, javitasi igenyek es hiánypotlasi kerelmek munkafazis szinten."
      userName={user.name}
      focusLabel="Checkpointok"
      toolbar={<Link href={`/dashboard/workphases/${phase.id}`} className="btn-secondary">Vissza a munkafazishoz</Link>}
      quickActions={[
        { href: `/dashboard/workphases/${phase.id}`, label: 'Attekintes' },
        { href: `/dashboard/workphases/${phase.id}/uploads`, label: 'Feltoltesek' },
        { href: `/dashboard/workphases/${phase.id}/checkpoints`, label: 'Checkpointok' },
        { href: `/dashboard/checkpoints`, label: 'Osszes checkpoint' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Munkafazis statusz" value={workphaseStatusLabel[phase.status]} note={`${phase.workgroup.subproject.name} / ${phase.workgroup.name}`} />
        <StatCard label="Checkpoint" value={`${approvedCount}/${phase.checkpoints.length}`} note="Megfelelt ellenorzes" />
        <StatCard label="Javitas alatt" value={String(phase.checkpoints.filter((item) => item.status === 'REVISION_REQUIRED').length)} note="Ujraellenorzes szukseges" />
        <StatCard label="Dontesnaplo" value={String(phase.approvals.length)} note="Approval rekord" />
      </section>

      <Panel title="Checkpoint dontesek">
        <div className="grid gap-3 lg:grid-cols-2">
          {phase.checkpoints.map((checkpoint) => (
            <form key={checkpoint.id} action={updateCheckpointStatusAction} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="checkpointId" value={checkpoint.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}/checkpoints`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{checkpoint.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{checkpoint.inspectionType}</div>
                  {checkpoint.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{checkpoint.description}</p> : null}
                  <div className="mt-2 text-xs text-slate-500">Utolso ellenorzes: {formatDateTime(checkpoint.reviewedAt)}</div>
                </div>
                <Badge tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
              </div>
              {canApprove ? (
                <div className="mt-4 grid gap-3">
                  <Field label="Dontes">
                    <Select name="status" defaultValue={checkpoint.status}>
                      {Object.entries(checkpointStatusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ellenori megjegyzes">
                    <Textarea name="resultNotes" defaultValue={checkpoint.resultNotes || ''} />
                  </Field>
                  <button className="btn-secondary" type="submit">Dontes mentese</button>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">Checkpoint donteshez ellenori vagy jovahagyoi jogosultsag kell.</p>
              )}
            </form>
          ))}
          {!phase.checkpoints.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Ehhez a munkafazishoz nincs checkpoint.</div> : null}
        </div>
      </Panel>

      {canApprove ? (
        <Panel title="Hianypotlas kerese">
          <form action={requestWorkphaseRevisionAction} className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <input type="hidden" name="workphaseId" value={phase.id} />
            <input type="hidden" name="projectId" value={certification.projectId} />
            <input type="hidden" name="returnTo" value={`/dashboard/workphases/${phase.id}/checkpoints`} />
            <Field label="Hianypotlas oka">
              <Textarea name="body" required placeholder="Pontosan mi hianyzik vagy mit kell javitani?" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium text-amber-950">
              <input name="notifyAssignee" type="checkbox" className="size-4" defaultChecked />
              Felelos kivitelezo ertesitese
            </label>
            <button type="submit" className="btn-secondary">Hianypotlas kerese</button>
          </form>
        </Panel>
      ) : null}

      <Panel title="Lathato javitasi megjegyzesek">
        <div className="space-y-3">
          {revisionComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.body}</p>
            </article>
          ))}
          {!revisionComments.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Meg nincs lathato javitasi megjegyzes.</div> : null}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
