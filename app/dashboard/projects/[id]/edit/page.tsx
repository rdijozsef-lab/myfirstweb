import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CertifiedProjectStatus, ProjectStatus } from '@prisma/client';
import { updateCertifiedProjectAction } from '@/app/dashboard/actions';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import {
  canManageProject,
  certifiedProjectStatusLabel,
  getProjectShell,
} from '@/lib/construction';

const projectStatusLabel: Record<ProjectStatus, string> = {
  PREPARATION: 'Elokeszites',
  IN_PROGRESS: 'Folyamatban',
  HANDOVER: 'Atadas',
  CLOSED: 'Lezart',
};

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canManageProject(user, project.id))) notFound();

  return (
    <OfficeShellV2
      title={`${project.name} szerkesztese`}
      description="Projekt alapadatok, megrendeloi adatok, statusz es minositett rendszer metaadatok karbantartasa."
      userName={user.name}
      focusLabel="Projekt szerkesztes"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza az adatlapra</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/members`, label: 'Tagok' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      <form action={updateCertifiedProjectAction} className="space-y-6">
        <input type="hidden" name="projectId" value={project.id} />
        <input type="hidden" name="certificationId" value={certification.id} />
        <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/edit`} />

        <Panel title="Projekt alapadatok">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Projekt neve">
              <Input name="name" defaultValue={project.name} required />
            </Field>
            <Field label="Projekt kod">
              <Input name="code" defaultValue={project.code || ''} placeholder="MKR-2026-01" />
            </Field>
            <Field label="Publikus slug">
              <Input name="slug" defaultValue={certification.slug} required />
            </Field>
            <Field label="Projekt tipus">
              <Input name="projectType" defaultValue={certification.projectType || ''} placeholder="family_house" />
            </Field>
            <Field label="Projekt statusz">
              <Select name="projectStatus" defaultValue={project.status}>
                {Object.values(ProjectStatus).map((status) => (
                  <option key={status} value={status}>{projectStatusLabel[status]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Minositett statusz">
              <Select name="certificationStatus" defaultValue={certification.status}>
                {Object.values(CertifiedProjectStatus).map((status) => (
                  <option key={status} value={status}>{certifiedProjectStatusLabel[status]}</option>
                ))}
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Helyszin es meretek">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Telepules">
              <Input name="city" defaultValue={project.city || ''} />
            </Field>
            <Field label="Iranyitoszam">
              <Input name="postalCode" defaultValue={project.postalCode || ''} />
            </Field>
            <Field label="Cim">
              <Input name="addressLine" defaultValue={project.addressLine || ''} />
            </Field>
            <Field label="Brutto alapterulet">
              <Input name="grossArea" type="number" step="0.1" defaultValue={certification.grossArea || ''} />
            </Field>
            <Field label="Netto alapterulet">
              <Input name="netArea" type="number" step="0.1" defaultValue={certification.netArea || ''} />
            </Field>
          </div>
        </Panel>

        <Panel title="Megrendelo es megjegyzes">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Megrendelo neve">
              <Input name="customerName" defaultValue={project.customerName || ''} />
            </Field>
            <Field label="Megrendelo email">
              <Input name="customerEmail" type="email" defaultValue={project.customerEmail || ''} />
            </Field>
            <Field label="Megrendelo telefon">
              <Input name="customerPhone" defaultValue={project.customerPhone || ''} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Projekt leiras">
              <Textarea name="description" defaultValue={project.description || ''} />
            </Field>
          </div>
        </Panel>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Modositasok mentese</button>
        </div>
      </form>
    </OfficeShellV2>
  );
}
