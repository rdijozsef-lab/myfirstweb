import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { canCreateCertifiedProject } from '@/lib/construction';
import { prisma } from '@/lib/prisma';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createCertifiedProjectAction } from '@/app/dashboard/actions';

export default async function NewCertifiedProjectPage() {
  const user = await requireUser();
  if (!canCreateCertifiedProject(user)) redirect('/dashboard?error=forbidden');
  const projectTemplates = await prisma.projectTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <OfficeShellV2
      title="Uj minositett projekt"
      description="Projektinditas sablonbol generalt munkafazisokkal, kotelezo dokumentacios listaval es checkpointokkal."
      userName={user.name}
      focusLabel="Projektinditas"
      toolbar={<Link href="/dashboard/projects" className="btn-secondary">Vissza</Link>}
    >
      <Panel title="Projekt letrehozasa">
        <form action={createCertifiedProjectAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Projekt neve">
              <Input name="name" required placeholder="Csaladi haz epites - Kecskemet" />
            </Field>
            <Field label="Slug">
              <Input name="slug" required placeholder="kecskemet-csaladi-haz" />
            </Field>
          </div>
          <Field label="Projekt sablon">
            <Select name="projectTemplateId" defaultValue="">
              <option value="">Alap beepitett munkafazis-struktura</option>
              {projectTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} / {template.projectType}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Helyszin">
              <Input name="location" placeholder="Kecskemet" />
            </Field>
            <Field label="Projekt tipus">
              <Input name="projectType" defaultValue="family_house" />
            </Field>
            <Field label="Brutto alapterulet">
              <Input name="grossArea" type="number" step="0.1" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Megrendelo neve">
              <Input name="customerName" />
            </Field>
            <Field label="Megrendelo email">
              <Input name="customerEmail" type="email" />
            </Field>
            <Field label="Megrendelo telefon">
              <Input name="customerPhone" />
            </Field>
          </div>
          <Field label="Megjegyzes">
            <Textarea name="notes" placeholder="Indulasi megjegyzesek, specialis korulmenyek..." />
          </Field>
          <button className="btn-primary" type="submit">Projekt inditasa</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
