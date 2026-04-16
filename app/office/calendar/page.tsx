import { EventType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel, Badge } from '@/components/office-ui';
import { createEventAction, deleteEventAction } from '@/app/office/actions/core';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { eventTypeLabel, formatDateTime } from '@/lib/office';

const weekDayLabels = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string; month?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const viewMode = params?.view === 'month' ? 'month' : 'list';
  const monthValue = getMonthValue(params?.month);
  const [year, month] = monthValue.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [events, contacts] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: viewMode === 'month'
        ? {
            startsAt: {
              gte: new Date(year, month - 1, 1),
              lte: monthEnd,
            },
          }
        : undefined,
      orderBy: { startsAt: 'asc' },
      include: { contact: true, owner: true },
    }),
    prisma.contact.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const monthGrid = buildMonthGrid(monthStart);
  const monthLabel = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long' }).format(monthStart);
  const prevMonth = formatMonthParam(new Date(year, month - 2, 1));
  const nextMonth = formatMonthParam(new Date(year, month, 1));
  const eventsByDay = new Map<string, typeof events>();

  for (const day of monthGrid.flat()) {
    eventsByDay.set(day.dateKey, []);
  }

  for (const event of events) {
    const key = formatDayKey(event.startsAt);
    const list = eventsByDay.get(key);
    if (list) list.push(event);
  }

  return (
    <OfficeShellV2
      title="Naptar"
      description="Kozos esemenynaptar megbeszelesekkel, hivasokkal, social idozitessel es hataridokkel."
      userName={user.name}
      focusLabel="Idopontok es hataridok"
      quickActions={[
        { href: '/office/calendar?view=month', label: 'Havi naptar' },
        { href: '/office/calendar?view=list', label: 'Listanezet' },
        { href: '/office/tasks', label: 'Kapcsolodo feladatok' },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title={viewMode === 'month' ? 'Naptarnezet' : 'Listanezet'}
          actions={
            <div className="flex flex-wrap gap-2">
              <ViewLink href="/office/calendar?view=list" active={viewMode === 'list'} label="Lista" />
              <ViewLink href={`/office/calendar?view=month&month=${monthValue}`} active={viewMode === 'month'} label="Naptar" />
            </div>
          }
        >
          {viewMode === 'month' ? (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <a href={`/office/calendar?view=month&month=${prevMonth}`} className="btn-secondary">Elozo</a>
                <div className="text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Aktualis honap</div>
                  <div className="mt-1 text-lg font-semibold text-slate-950">{monthLabel}</div>
                </div>
                <a href={`/office/calendar?view=month&month=${nextMonth}`} className="btn-secondary">Kovetkezo</a>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDayLabels.map((label) => (
                  <div key={label} className="rounded-2xl bg-slate-100 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid gap-2">
                {monthGrid.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-2">
                    {week.map((day) => {
                      const dayEvents = eventsByDay.get(day.dateKey) || [];

                      return (
                        <div
                          key={day.dateKey}
                          className={`min-h-36 rounded-[20px] border p-3 ${
                            day.inCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className={`text-sm font-semibold ${day.isToday ? 'text-orange-700' : 'text-slate-900'}`}>
                              {day.date.getDate()}
                            </div>
                            {dayEvents.length ? (
                              <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                                {dayEvents.length} db
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 space-y-2">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div key={event.id} className="rounded-2xl bg-slate-950 px-3 py-2 text-xs text-white">
                                <div className="font-semibold">{event.title}</div>
                                <div className="mt-1 text-slate-300">
                                  {new Intl.DateTimeFormat('hu-HU', { hour: '2-digit', minute: '2-digit' }).format(event.startsAt)}
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 3 ? (
                              <div className="text-xs font-semibold text-slate-500">+ {dayEvents.length - 3} tovabbi</div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <article key={event.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                        <Badge>{eventTypeLabel[event.type]}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatDateTime(event.startsAt)}
                        {event.endsAt ? ` - ${formatDateTime(event.endsAt)}` : ''}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{event.contact?.name || event.location || 'Belso esemeny'}</p>
                      {event.description ? <p className="mt-3 text-sm text-slate-600">{event.description}</p> : null}
                    </div>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="id" value={event.id} />
                      <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">Torles</button>
                    </form>
                  </div>
                </article>
              ))}
              {!events.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Jelenleg nincs rogzitett esemeny.</div> : null}
            </div>
          )}
        </Panel>

        <Panel title="Uj esemeny rogzitese">
          <form action={createEventAction} className="grid gap-4">
            <Field label="Esemeny cime"><Input name="title" placeholder="Peldaul: workshop egyeztetes" required /></Field>
            <Field label="Kapcsolodo kapcsolat">
              <Select name="contactId" defaultValue="">
                <option value="">Nincs kivalasztva</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipus">
                <Select name="type" defaultValue={EventType.MEETING}>
                  {Object.entries(eventTypeLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Helyszin / link"><Input name="location" placeholder="Meet, telefon, cim" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kezdes"><Input type="datetime-local" name="startsAt" required /></Field>
              <Field label="Befejezes"><Input type="datetime-local" name="endsAt" /></Field>
            </div>
            <Field label="Leiras"><Textarea name="description" placeholder="Rovid leiras vagy emlekezteto" /></Field>
            <button className="btn-primary" type="submit">Esemeny mentese</button>
          </form>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function ViewLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold ${
        active
          ? 'border-orange-300 bg-orange-50 text-orange-700'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      {label}
    </a>
  );
}

function getMonthValue(value?: string) {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  return formatMonthParam(new Date());
}

function formatMonthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildMonthGrid(monthStart: Date) {
  const firstDay = new Date(monthStart);
  const offset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - offset);
  const todayKey = formatDayKey(new Date());

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      return {
        date,
        dateKey: formatDayKey(date),
        inCurrentMonth: date.getMonth() === monthStart.getMonth(),
        isToday: formatDayKey(date) === todayKey,
      };
    }),
  );
}
