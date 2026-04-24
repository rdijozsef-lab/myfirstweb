import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { badgeTone, formatDateTime, partnerStatusLabel } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id }, include: { company: true } });
  if (!partner) notFound();

  return (
    <OfficeShellV2
      title={partner.company.name}
      description="Partner minositesi adatlap, kapcsolattartas es audit elokeszites."
      userName={user.name}
      focusLabel="Partner"
      toolbar={<Link href="/dashboard/partners" className="btn-secondary">Partnerlista</Link>}
    >
      <Panel title="Partner profil">
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Statusz" value={<Badge tone={badgeTone(partner.qualificationStatus)}>{partnerStatusLabel[partner.qualificationStatus]}</Badge>} />
          <Info label="Szakteruletek" value={partner.specialties || '-'} />
          <Info label="Kapcsolattarto" value={partner.company.contactName || '-'} />
          <Info label="Email" value={partner.company.contactEmail || '-'} />
          <Info label="Telefon" value={partner.company.contactPhone || '-'} />
          <Info label="Frissitve" value={formatDateTime(partner.updatedAt)} />
        </div>
        {partner.notes ? <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">{partner.notes}</p> : null}
      </Panel>
    </OfficeShellV2>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
