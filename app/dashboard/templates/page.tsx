import Link from 'next/link';
import { createProjectTemplateAction } from '@/app/dashboard/actions';
import { Field, Input } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel } from '@/components/office-ui';

export default async function TemplatesPage() {
  const user = await requireUser();
  const [projectTemplates, workphaseTemplates, checkpointTemplates] = await Promise.all([
    prisma.projectTemplate.findMany(),
    prisma.workphaseTemplate.findMany(),
    prisma.checkpointTemplate.findMany(),
  ]);

  return (
    <OfficeShellV2
      title="Sablonok"
      description="Projekt-, munkafazis- es checkpoint sablonok kezelese."
      userName={user.name}
      focusLabel="Sablonok"
      quickActions={[
        { href: '/dashboard/templates/workphases', label: 'Munkafazis sablonok' },
        { href: '/dashboard/templates/checkpoints', label: 'Checkpoint sablonok' },
        { href: '/dashboard/projects/new', label: 'Projekt inditas' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Panel title="Projekt sablonok"><Count value={projectTemplates.length} href="/dashboard/templates" /></Panel>
        <Panel title="Munkafazis sablonok"><Count value={workphaseTemplates.length} href="/dashboard/templates/workphases" /></Panel>
        <Panel title="Checkpoint sablonok"><Count value={checkpointTemplates.length} href="/dashboard/templates/checkpoints" /></Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Projekt sablon letrehozasa">
          <form action={createProjectTemplateAction} className="space-y-4">
            <input type="hidden" name="returnTo" value="/dashboard/templates" />
            <Field label="Sablon neve">
              <Input name="name" required placeholder="Csaladi haz alap workflow" />
            </Field>
            <Field label="Projekt tipus">
              <Input name="projectType" required placeholder="family_house" />
            </Field>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-slate-300" />
              Aktiv sablon
            </label>
            <button type="submit" className="btn-primary">Projekt sablon mentese</button>
          </form>
        </Panel>

        <Panel title="Projekt sablon lista">
          <div className="grid gap-3 lg:grid-cols-2">
            {projectTemplates.map((template) => (
              <article key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{template.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{template.projectType}</div>
                  </div>
                  <Badge tone={template.isActive ? 'green' : 'slate'}>{template.isActive ? 'Aktiv' : 'Inaktiv'}</Badge>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}

function Count({ value, href }: { value: number; href: string }) {
  return <Link href={href} className="block text-4xl font-semibold text-slate-950">{value}</Link>;
}
