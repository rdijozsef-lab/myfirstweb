import Link from 'next/link';
import { LeadSource, LeadStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { DataTable, Panel, Badge } from '@/components/office-ui';
import { createLeadAction, updateLeadStatusAction } from '@/app/office/actions/core';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { leadStatusLabel, sourceLabel, formatDateTime } from '@/lib/office';

export default async function LeadsPage() {
  const user = await requireUser();
  const [leads, contacts] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, include: { contact: true, owner: true } }),
    prisma.contact.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <OfficeShellV2 title="Leadek" description="Valódi pipeline a beérkező érdeklődésektől az aktív ügyfélig." userName={user.name}>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Lead pipeline">
          <DataTable
            headers={['Lead', 'Kapcsolat', 'Forrás', 'Státusz', 'Határidő', 'Adatlap']}
            rows={leads.map((lead) => [
              <div key={`${lead.id}-title`}>
                <div className="font-medium text-slate-900">{lead.title}</div>
                {lead.valueLabel ? <div className="mt-1 text-xs text-slate-500">Érték: {lead.valueLabel}</div> : null}
              </div>,
              <div key={`${lead.id}-contact`}>{lead.contact?.name || '—'}</div>,
              <div key={`${lead.id}-source`}>{sourceLabel[lead.source]}</div>,
              <form key={`${lead.id}-status`} action={updateLeadStatusAction} className="flex gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select name="status" defaultValue={lead.status} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  {Object.entries(leadStatusLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Mentés</button>
              </form>,
              <div key={`${lead.id}-due`} className="text-sm">{formatDateTime(lead.dueAt)}</div>,
              <Link key={`${lead.id}-link`} href={`/office/leads/${lead.id}`} className="text-sm font-semibold text-blue-700">Megnyitás</Link>,
            ])}
          />
        </Panel>

        <Panel title="Új lead felvétele">
          <form action={createLeadAction} className="grid gap-4">
            <Field label="Lead címe"><Input name="title" placeholder="Például: új szolgáltatói érdeklődés" required /></Field>
            <Field label="Kapcsolódó kapcsolat">
              <Select name="contactId" defaultValue="">
                <option value="">Nincs kiválasztva</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}{contact.company ? ` - ${contact.company}` : ''}</option>)}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Forrás">
                <Select name="source" defaultValue={LeadSource.WEBSITE}>
                  {Object.entries(sourceLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Státusz">
                <Select name="status" defaultValue={LeadStatus.NEW}>
                  {Object.entries(leadStatusLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Érték címke"><Input name="valueLabel" placeholder="pl. magas" /></Field>
              <Field label="Határidő"><Input type="datetime-local" name="dueAt" /></Field>
            </div>
            <Field label="Leírás"><Textarea name="description" placeholder="Miben érdeklődött pontosan?" /></Field>
            <button className="btn-primary" type="submit">Lead mentése</button>
          </form>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

