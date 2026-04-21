import Link from 'next/link';
import { ProjectStatus } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectAction } from '@/app/office/actions/core';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Kivitelezes',
  HANDOVER: 'Atadas alatt',
  CLOSED: 'Lezart',
};

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <OfficeShellV2
      title="Uj projekt varazslo"
      description="Lepesrol lepesre hozd letre az uj munkat. A rendszer automatikusan letrehozza az alap szereplot, a munkafazisokat es a kotelezo dokumentumlistat."
      userName={user.name}
      toolbar={<Link href="/office/projects" className="btn-secondary">Vissza a projektlistahoz</Link>}
      focusLabel="Projekt inditasa"
      quickActions={[
        { href: '/office/projects', label: 'Projektlista' },
        { href: '/office/tasks', label: 'Teendok' },
        { href: '/office/calendar', label: 'Idopontok' },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Projekt adatai">
          <form action={createProjectAction} className="grid gap-6">
            <WizardStep number="1" title="Mi ez a munka?" note="Adj neki olyan nevet, amit mindenki azonnal felismer.">
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <Field label="Projekt neve">
                  <Input name="name" placeholder="Pl. Kovacs haz - Kecskemet" required />
                </Field>
                <Field label="Projekt kod">
                  <Input name="code" placeholder="Pl. KOV-2026-01" />
                </Field>
              </div>
              <Field label="Rovid leiras">
                <Textarea name="description" placeholder="Rovid projekt osszefoglalo, aktualis helyzet, kulonleges megjegyzesek." />
              </Field>
            </WizardStep>

            <WizardStep number="2" title="Hol es mikor?" note="A helyszin es a fobb datumok segitenek a napi munkaszervezesben.">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <Field label="Varos">
                  <Input name="city" placeholder="Kecskemet" />
                </Field>
                <Field label="Irsz">
                  <Input name="postalCode" placeholder="6000" />
                </Field>
              </div>
              <Field label="Cim / helyszin">
                <Input name="addressLine" placeholder="Fo utca 12." />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Kezdes">
                  <Input type="date" name="startDate" />
                </Field>
                <Field label="Varhato befejezes">
                  <Input type="date" name="expectedEndDate" />
                </Field>
              </div>
            </WizardStep>

            <WizardStep number="3" title="Ki a megrendelo?" note="Legalabb egy nev vagy telefonszam legyen meg, hogy ne kelljen keresgelni.">
              <Field label="Megrendelo neve">
                <Input name="customerName" placeholder="Kovacs Janos" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Megrendelo telefon">
                  <Input name="customerPhone" placeholder="+36..." />
                </Field>
                <Field label="Megrendelo email">
                  <Input type="email" name="customerEmail" placeholder="email@pelda.hu" />
                </Field>
              </div>
            </WizardStep>

            <WizardStep number="4" title="Inditasi allapot" note="Uj munkanal altalaban az Elokeszites a jo kezdoallapot.">
              <Field label="Projekt statusz">
                <Select name="status" defaultValue={ProjectStatus.PREPARATION}>
                  {Object.entries(projectStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                Mentes utan automatikusan letrejon a projekt tulajdonosi szereploje, az alap szakipari munkafazis-lista, es aktiv lesz a kotelezo tervdokumentacios checklista: alaprajz, metszetek, homlokzatok, gepeszterv, elektromos terv, statikai tervek, helyszinrajz.
              </div>
            </WizardStep>

            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">Projekt letrehozasa</button>
              <Link href="/office/projects" className="btn-secondary">Megsem</Link>
            </div>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel title="Mit csinal a varazslo?">
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <InfoBox title="Nem csak sort hoz letre" text="A mentessel azonnal lesz projekt, tulajdonos es alap munkafazis lista." />
              <InfoBox title="Elokeszitesre optimalizalt" text="Eloszor dokumentumok, emberek es munkafazisok jonnek, csak utana az aktiv kivitelezes." />
              <InfoBox title="Keves kotelezo mezo" text="A projekt neve kotelezo, a tobbi adat kesobb is potolhato." />
            </div>
          </Panel>
        </div>
      </section>
    </OfficeShellV2>
  );
}

function WizardStep({
  number,
  title,
  note,
  children,
}: {
  number: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#1f4f3c] text-sm font-semibold text-white">
          {number}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{note}</p>
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
