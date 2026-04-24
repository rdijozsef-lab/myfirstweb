import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { badgeTone, canManagePartners, partnerStatusLabel } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';

export default async function PartnersPage() {
  const user = await requireUser();
  const canManage = canManagePartners(user);
  const partners = await prisma.partner.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { company: true },
  });

  return (
    <OfficeShellV2
      title="Partnerkezelo"
      description="Minositesi statuszok, szakteruletek es partneri alapadatok."
      userName={user.name}
      focusLabel="Partnerek"
      toolbar={canManage ? <Link href="/dashboard/partners/new" className="btn-primary">Uj partner</Link> : null}
      quickActions={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/projects', label: 'Projektek' },
      ]}
    >
      <Panel title="Minositett kivitelezoi partnerek">
        <div className="grid gap-3">
          {partners.map((partner) => (
            <Link key={partner.id} href={`/dashboard/partners/${partner.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{partner.company.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{partner.specialties || 'Nincs szakterulet megadva'}</div>
                </div>
                <Badge tone={badgeTone(partner.qualificationStatus)}>{partnerStatusLabel[partner.qualificationStatus]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
