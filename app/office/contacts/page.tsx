import Link from 'next/link';
import { LeadSource } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { DataTable, Panel } from '@/components/office-ui';
import { createContactAction, updateContactStatusAction } from '@/app/office/actions/core';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { sourceLabel } from '@/lib/office';

const contactStatusOptions = ['Uj kapcsolat', 'Visszahivando', 'Ajanlatra var', 'Aktiv ugyfel', 'Lezart'];

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <OfficeShellV2 title="Emberek" description="Ugyfelek, erdeklodok es kapcsolattartok egy helyen, egyszeruen keresheto formaban." userName={user.name}>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Emberlista">
          <DataTable
            headers={['Nev', 'Ceg', 'Eleres', 'Forras', 'Allapot', 'Adatlap']}
            rows={contacts.map((contact) => [
              <div key={`${contact.id}-name`}>
                <div className="font-medium text-slate-900">{contact.name}</div>
                {contact.tags ? <div className="mt-1 text-xs text-slate-500">{contact.tags}</div> : null}
              </div>,
              <div key={`${contact.id}-company`}>{contact.company || '-'}</div>,
              <div key={`${contact.id}-reach`}>
                <div>{contact.phone || '-'}</div>
                <div className="text-xs text-slate-500">{contact.email || '-'}</div>
              </div>,
              <div key={`${contact.id}-source`}>{sourceLabel[contact.source]}</div>,
              <form key={`${contact.id}-status`} action={updateContactStatusAction} className="flex gap-2">
                <input type="hidden" name="id" value={contact.id} />
                <select name="statusLabel" defaultValue={contact.statusLabel} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  {contactStatusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Mentes</button>
              </form>,
              <Link key={`${contact.id}-link`} href={`/office/contacts/${contact.id}`} className="text-sm font-semibold text-blue-700">Megnyitas</Link>,
            ])}
          />
        </Panel>

        <Panel title="Uj ember felvetele">
          <form action={createContactAction} className="grid gap-4">
            <Field label="Nev"><Input name="name" placeholder="Kapcsolat neve" required /></Field>
            <Field label="Cegnev"><Input name="company" placeholder="Ceg neve" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email"><Input type="email" name="email" placeholder="email@pelda.hu" /></Field>
              <Field label="Telefon"><Input name="phone" placeholder="+36..." /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Forras">
                <Select name="source" defaultValue={LeadSource.WEBSITE}>
                  {Object.entries(sourceLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Allapot"><Input name="statusLabel" defaultValue="Uj kapcsolat" /></Field>
            </div>
            <Field label="Cimkek"><Input name="tags" placeholder="pl. workshop, food" /></Field>
            <Field label="Megjegyzes"><Textarea name="notes" placeholder="Belso megjegyzes" /></Field>
            <button className="btn-primary" type="submit">Ember mentese</button>
          </form>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}
