import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, Badge } from '@/components/office-ui';
import { formatDateTime, leadStatusLabel, sourceLabel } from '@/lib/office';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { contact: true, owner: true } });
  if (!lead) notFound();

  return (
    <OfficeShellV2 title={lead.title} description="Lead adatlap a teljes követési logikával." userName={user.name} toolbar={<Link href="/office/leads" className="btn-secondary">Vissza a leadekhez</Link>}>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Lead adatok">
          <div className="space-y-3 text-sm text-slate-700">
            <div><strong>Kapcsolat:</strong> {lead.contact?.name || '—'}</div>
            <div><strong>Forrás:</strong> {sourceLabel[lead.source]}</div>
            <div><strong>Státusz:</strong> <Badge>{leadStatusLabel[lead.status]}</Badge></div>
            <div><strong>Határidő:</strong> {formatDateTime(lead.dueAt)}</div>
            <div><strong>Felelős:</strong> {lead.owner?.name || '—'}</div>
            <div><strong>Érték:</strong> {lead.valueLabel || '—'}</div>
          </div>
        </Panel>
        <Panel title="Leírás és időbélyegek">
          <div className="space-y-4 text-sm text-slate-700">
            <div><strong>Leírás:</strong><div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">{lead.description || 'Nincs leírás.'}</div></div>
            <div><strong>Létrehozva:</strong> {formatDateTime(lead.createdAt)}</div>
            <div><strong>Frissítve:</strong> {formatDateTime(lead.updatedAt)}</div>
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

