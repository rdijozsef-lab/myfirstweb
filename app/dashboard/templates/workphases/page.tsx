import Link from 'next/link';
import { RequiredUploadType } from '@prisma/client';
import { createWorkphaseTemplateAction } from '@/app/dashboard/actions';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

type RequirementPreview = {
  label?: string;
  type?: string;
  minCount?: number;
};

export default async function WorkphaseTemplatesPage() {
  const user = await requireUser();
  const [templates, projectTemplates] = await Promise.all([
    prisma.workphaseTemplate.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.projectTemplate.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    }),
  ]);

  const criticalCount = templates.filter((template) => template.requiresInspection).length;

  return (
    <OfficeShellV2
      title="Munkafazis sablonok"
      description="Sablon alapu munkafazisok es hozzajuk tartozo dokumentacios requirementek."
      userName={user.name}
      focusLabel="Sablonok"
      toolbar={<Link href="/dashboard/templates" className="btn-secondary">Sablon attekintes</Link>}
      quickActions={[
        { href: '/dashboard/templates', label: 'Sablonok' },
        { href: '/dashboard/templates/checkpoints', label: 'Checkpoint sablonok' },
        { href: '/dashboard/projects/new', label: 'Projekt inditas' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Sablon" value={String(templates.length)} note="Munkafazis template" />
        <StatCard label="Ellenorzeses" value={String(criticalCount)} note="requiresInspection" />
        <StatCard label="Alap workflow" value="Aktiv" note="Projektinditasnal hasznalt logika" />
      </section>

      <Panel title="Munkafazis sablon letrehozasa">
        <form action={createWorkphaseTemplateAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="returnTo" value="/dashboard/templates/workphases" />
          <Field label="Projekt sablon">
            <Select name="projectTemplateId" defaultValue="">
              <option value="">Altalanos sablon</option>
              {projectTemplates.map((template) => (
                <option key={template.id} value={template.id}>{template.name} / {template.projectType}</option>
              ))}
            </Select>
          </Field>
          <Field label="Munkacsoport neve">
            <Input name="workgroupName" required placeholder="Alapozas" />
          </Field>
          <Field label="Munkafazis cime">
            <Input name="title" required placeholder="Vasalas" />
          </Field>
          <Field label="Sorrend">
            <Input name="sortOrder" type="number" defaultValue={0} />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Leiras">
              <Textarea name="description" placeholder="Mit kell dokumentalni, milyen elofeltetelek mellett indithato." />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Requirement sorok">
              <Textarea
                name="requirements"
                placeholder={`Teljes alaptest foto|${RequiredUploadType.PHOTO}|1\nSarokpont foto|${RequiredUploadType.PHOTO}|4\nBetonfedes igazolas|${RequiredUploadType.PDF}|1`}
              />
            </Field>
            <p className="mt-2 text-xs text-slate-500">Formatum: cim|tipus|minimum darab. Tipusok: PHOTO, VIDEO, PDF, NOTE, DRAWING_MARKUP.</p>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" name="requiresInspection" className="h-4 w-4 rounded border-slate-300" />
            Kritikus ellenorzesi pontot igenyel
          </label>
          <div className="flex items-center">
            <button type="submit" className="btn-primary">Munkafazis sablon mentese</button>
          </div>
        </form>
      </Panel>

      <Panel title="Munkafazis template lista">
        <div className="grid gap-3 lg:grid-cols-2">
          {templates.map((template) => {
            const requirements = Array.isArray(template.defaultRequirementsJson)
              ? template.defaultRequirementsJson as RequirementPreview[]
              : [];
            const projectTemplate = projectTemplates.find((item) => item.id === template.projectTemplateId);
            return (
              <article key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{template.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{template.workgroupName}</div>
                    {projectTemplate ? <div className="mt-1 text-xs text-slate-500">{projectTemplate.name}</div> : null}
                  </div>
                  <Badge tone={template.requiresInspection ? 'amber' : 'slate'}>
                    {template.requiresInspection ? 'Ellenorzeses' : 'Normal'}
                  </Badge>
                </div>
                {template.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{template.description}</p> : null}
                <div className="mt-4 space-y-2">
                  {requirements.length ? requirements.map((requirement, index) => (
                    <div key={`${template.id}-${index}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      {requirement.label || 'Requirement'} | {requirement.type || 'TYPE'} | min. {requirement.minCount || 1}
                    </div>
                  )) : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-500">Nincs requirement JSON rogzitve.</div>}
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
