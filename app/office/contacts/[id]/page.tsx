import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, Badge } from '@/components/office-ui';
import { formatDateTime, leadStatusLabel, priorityLabel, taskStatusLabel, eventTypeLabel, sourceLabel } from '@/lib/office';

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { leads: true, tasks: true, events: true },
  });
  if (!contact) notFound();

  return (
    <OfficeShellV2 title={contact.name} description="Kapcsolati adatlap: leadek, feladatok és események egy helyen." userName={user.name} toolbar={<Link href="/office/contacts" className="btn-secondary">Vissza a listához</Link>}>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Alapadatok">
          <div className="space-y-3 text-sm text-slate-700">
            <div><strong>Cég:</strong> {contact.company || '—'}</div>
            <div><strong>Email:</strong> {contact.email || '—'}</div>
            <div><strong>Telefon:</strong> {contact.phone || '—'}</div>
            <div><strong>Forrás:</strong> {sourceLabel[contact.source]}</div>
            <div><strong>Státusz:</strong> {contact.statusLabel}</div>
            <div><strong>Címkék:</strong> {contact.tags || '—'}</div>
            <div><strong>Megjegyzés:</strong> {contact.notes || '—'}</div>
          </div>
        </Panel>
        <Panel title="Kapcsolati áttekintés">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm text-slate-500">Leadek</div><div className="mt-2 text-3xl font-semibold">{contact.leads.length}</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm text-slate-500">Feladatok</div><div className="mt-2 text-3xl font-semibold">{contact.tasks.length}</div></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm text-slate-500">Események</div><div className="mt-2 text-3xl font-semibold">{contact.events.length}</div></div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Leadek">
          <div className="space-y-3">
            {contact.leads.length === 0 ? <p>Nincs kapcsolt lead.</p> : contact.leads.map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{lead.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDateTime(lead.dueAt)}</div>
                  </div>
                  <Badge>{leadStatusLabel[lead.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Feladatok">
          <div className="space-y-3">
            {contact.tasks.length === 0 ? <p>Nincs kapcsolt feladat.</p> : contact.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{taskStatusLabel[task.status]}</div>
                  </div>
                  <Badge tone={task.priority === 'URGENT' ? 'amber' : 'blue'}>{priorityLabel[task.priority]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Események">
          <div className="space-y-3">
            {contact.events.length === 0 ? <p>Nincs kapcsolt esemény.</p> : contact.events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-medium text-slate-900">{event.title}</div>
                <div className="mt-1 text-sm text-slate-500">{eventTypeLabel[event.type]} • {formatDateTime(event.startsAt)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

