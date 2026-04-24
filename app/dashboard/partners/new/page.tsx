import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { canManagePartners, partnerStatusLabel } from '@/lib/construction';
import { createPartnerAction } from '@/app/dashboard/actions';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';

export default async function NewPartnerPage() {
  const user = await requireUser();
  if (!canManagePartners(user)) redirect('/dashboard?error=forbidden');

  return (
    <OfficeShellV2
      title="Uj partner felvetele"
      description="Partner onboarding es minositesi alapadatok rogzitese."
      userName={user.name}
      focusLabel="Partner onboarding"
      toolbar={<Link href="/dashboard/partners" className="btn-secondary">Vissza</Link>}
    >
      <Panel title="Partneradatok">
        <form action={createPartnerAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ceg neve">
              <Input name="companyName" required />
            </Field>
            <Field label="Cegtipus">
              <Input name="companyType" defaultValue="contractor" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Adoszam">
              <Input name="taxNumber" />
            </Field>
            <Field label="Kapcsolattarto">
              <Input name="contactName" />
            </Field>
            <Field label="Email">
              <Input name="contactEmail" type="email" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Telefon">
              <Input name="contactPhone" />
            </Field>
            <Field label="Minositesi statusz">
              <Select name="qualificationStatus" defaultValue="SCREENING">
                {Object.entries(partnerStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Szakteruletek">
            <Input name="specialties" placeholder="alapozas, falazas, gepeszet..." />
          </Field>
          <Field label="Jegyzet">
            <Textarea name="notes" />
          </Field>
          <button className="btn-primary" type="submit">Partner mentese</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
