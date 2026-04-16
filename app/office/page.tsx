import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, StatCard, Badge, DataTable } from '@/components/office-ui';
import { eventTypeLabel, formatDateTime, leadStatusLabel, priorityLabel, taskStatusLabel } from '@/lib/office';

export default async function OfficeDashboardPage() {
  const user = await requireUser();

  const [contactCount, leadCount, openTaskCount, nextEvents, freshLeads, urgentTasks] = await Promise.all([
    prisma.contact.count(),
    prisma.lead.count({ where: { status: { in: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'OFFER_SENT'] } } }),
    prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'WAITING'] } } }),
    prisma.calendarEvent.findMany({
      orderBy: { startsAt: 'asc' },
      take: 4,
      include: { contact: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { contact: true },
    }),
    prisma.task.findMany({
      where: { priority: { in: ['HIGH', 'URGENT'] }, status: { in: ['TODO', 'IN_PROGRESS', 'WAITING'] } },
      orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
      take: 5,
      include: { contact: true },
    }),
  ]);

  return (
    <OfficeShellV2
      title="Office dashboard"
      description="Ez már nem csak demo nézet: a dashboard valós Prisma adatokból épül fel a Contacts, Leads, Tasks és Calendar modulokból."
      userName={user.name}
      toolbar={<Link href="/office/contacts" className="btn-primary">Kapcsolatok megnyitása</Link>}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kapcsolatok" value={String(contactCount)} note="valódi adatbázisból" />
        <StatCard label="Nyitott lead" value={String(leadCount)} note="követés alatt" />
        <StatCard label="Nyitott feladat" value={String(openTaskCount)} note="teendő és várakozó" />
        <StatCard label="Közelgő esemény" value={String(nextEvents.length)} note="következő 4 tétel" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Friss leadek" actions={<Link href="/office/leads" className="text-sm font-semibold text-blue-700">Mind megnyitása</Link>}>
          <DataTable
            headers={['Lead', 'Kapcsolat', 'Státusz', 'Határidő']}
            rows={freshLeads.map((lead) => [
              <div key={`${lead.id}-title`}>
                <div className="font-medium text-slate-900">{lead.title}</div>
                {lead.description ? <div className="mt-1 text-sm text-slate-500">{lead.description}</div> : null}
              </div>,
              <div key={`${lead.id}-contact`}>{lead.contact ? lead.contact.name : '—'}</div>,
              <Badge key={`${lead.id}-status`} tone={lead.status === 'WON' ? 'green' : lead.status === 'LOST' ? 'amber' : 'blue'}>{leadStatusLabel[lead.status]}</Badge>,
              <div key={`${lead.id}-due`} className="text-sm">{formatDateTime(lead.dueAt)}</div>,
            ])}
          />
        </Panel>

        <Panel title="Sürgős feladatok" actions={<Link href="/office/tasks" className="text-sm font-semibold text-blue-700">Feladatlista</Link>}>
          <div className="space-y-3">
            {urgentTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{task.contact?.name || 'Nincs kapcsolt ügyfél'} • {taskStatusLabel[task.status]}</div>
                  </div>
                  <Badge tone={task.priority === 'URGENT' ? 'amber' : 'blue'}>{priorityLabel[task.priority]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="Közelgő események" actions={<Link href="/office/calendar" className="text-sm font-semibold text-blue-700">Naptár</Link>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {nextEvents.map((event) => (
            <article key={event.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eventTypeLabel[event.type]}</div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{formatDateTime(event.startsAt)}</p>
              <p className="mt-1 text-sm text-slate-500">{event.contact?.name || event.location || 'Belső esemény'}</p>
            </article>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
