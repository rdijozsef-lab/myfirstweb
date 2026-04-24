import Link from 'next/link';
import { createCheckpointTemplateAction } from '@/app/dashboard/actions';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

export default async function CheckpointTemplatesPage() {
  const user = await requireUser();
  const [templates, workphaseTemplates] = await Promise.all([
    prisma.checkpointTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workphaseTemplate.findMany({
      orderBy: [{ workgroupName: 'asc' }, { sortOrder: 'asc' }],
    }),
  ]);
  const criticalCount = templates.filter((template) => template.isCritical).length;

  return (
    <OfficeShellV2
      title="Checkpoint sablonok"
      description="Kritikus ellenorzesi pont sablonok kezelese."
      userName={user.name}
      focusLabel="Sablonok"
      toolbar={<Link href="/dashboard/templates" className="btn-secondary">Sablon attekintes</Link>}
      quickActions={[
        { href: '/dashboard/templates', label: 'Sablonok' },
        { href: '/dashboard/templates/workphases', label: 'Munkafazis sablonok' },
        { href: '/dashboard/checkpoints', label: 'Elo checkpointok' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Checkpoint sablon" value={String(templates.length)} note="Template rekord" />
        <StatCard label="Kritikus" value={String(criticalCount)} note="Blokkolo gate" />
        <StatCard label="Tipus" value={String(new Set(templates.map((item) => item.inspectionType)).size)} note="Inspection type" />
      </section>

      <Panel title="Checkpoint sablon letrehozasa">
        <form action={createCheckpointTemplateAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="returnTo" value="/dashboard/templates/checkpoints" />
          <Field label="Kapcsolodo munkafazis sablon">
            <Select name="workphaseTemplateId" defaultValue="">
              <option value="">Altalanos checkpoint</option>
              {workphaseTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.workgroupName} / {template.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Inspection type">
            <Input name="inspectionType" required placeholder="critical_gate" />
          </Field>
          <Field label="Checkpoint cime">
            <Input name="title" required placeholder="Vasalas ellenorzese betonozas elott" />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="isCritical" defaultChecked className="h-4 w-4 rounded border-slate-300" />
            Kritikus, folyamatot blokkolo ellenorzes
          </label>
          <div className="lg:col-span-2">
            <Field label="Leiras">
              <Textarea name="description" placeholder="Milyen feltetelek mellett kaphat megfelelt statuszt." />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <button type="submit" className="btn-primary">Checkpoint sablon mentese</button>
          </div>
        </form>
      </Panel>

      <Panel title="Checkpoint template lista">
        <div className="grid gap-3 lg:grid-cols-2">
          {templates.map((template) => {
            const workphaseTemplate = workphaseTemplates.find((item) => item.id === template.workphaseTemplateId);
            return (
              <article key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{template.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{template.inspectionType}</div>
                    {workphaseTemplate ? <div className="mt-1 text-xs text-slate-500">{workphaseTemplate.workgroupName} / {workphaseTemplate.title}</div> : null}
                  </div>
                  <Badge tone={template.isCritical ? 'amber' : 'slate'}>{template.isCritical ? 'Kritikus' : 'Normal'}</Badge>
                </div>
                {template.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p> : null}
              </article>
            );
          })}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
