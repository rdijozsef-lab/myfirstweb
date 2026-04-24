import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { badgeTone, checkpointStatusLabel, formatDateTime } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';

export default async function CheckpointsPage() {
  const user = await requireUser();
  const checkpoints = await prisma.checkpoint.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { workphase: { include: { workgroup: { include: { subproject: { include: { certification: true } } } } } } },
  });

  return (
    <OfficeShellV2
      title="Ellenorzesi pontok"
      description="Kritikus gate-ek listaja, ahol a kovetkezo munkafazis csak jovahagyas utan indulhat."
      userName={user.name}
      focusLabel="Audit"
      quickActions={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/projects', label: 'Projektek' },
      ]}
    >
      <Panel title="Checkpoint lista">
        <div className="grid gap-3">
          {checkpoints.map((checkpoint) => (
            <Link key={checkpoint.id} href={`/dashboard/checkpoints/${checkpoint.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{checkpoint.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {checkpoint.workphase.title} | {formatDateTime(checkpoint.reviewedAt)}
                  </div>
                </div>
                <Badge tone={badgeTone(checkpoint.status)}>{checkpointStatusLabel[checkpoint.status]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
