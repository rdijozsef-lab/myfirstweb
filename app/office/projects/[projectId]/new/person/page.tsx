import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectPermissionLevel, ProjectRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectMemberAction } from '@/app/office/actions/core';

const memberRoleLabel: Record<ProjectRole, string> = {
  OWNER: 'Tulajdonos',
  CUSTOMER: 'Megrendelo',
  TECH_INSPECTOR: 'Muszaki ellenor',
  FMV: 'FMV',
  PROJECT_MANAGER: 'Projektvezeto',
  SUBCONTRACTOR: 'Alvallalkozo',
};

const permissionLevelLabel: Record<ProjectPermissionLevel, string> = {
  FULL: 'Teljes hozzaferes',
  MANAGE: 'Kezeles',
  CONTRIBUTE: 'Szerkesztes',
  COMMENT: 'Kommentelhet',
  VIEW_APPROVE: 'Megtekint es jovahagy',
  VIEW_ONLY: 'Csak megtekintes',
};

export default async function NewProjectPersonPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true } });

  if (!project) notFound();

  return (
    <OfficeShellV2
      title="Uj szereplo varazslo"
      description={`Add meg, ki milyen szerepben kapcsolodik ehhez a projekthez: ${project.name}.`}
      userName={user.name}
      toolbar={<Link href={`/office/projects/${project.id}?tab=team`} className="btn-secondary">Vissza a szereplokhoz</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: `/office/projects/${project.id}`, label: 'Projektkozpont' },
        { href: `/office/projects/${project.id}/new/task`, label: 'Uj teendo' },
        { href: `/office/projects/${project.id}/new/event`, label: 'Uj idopont' },
        { href: `/office/projects/${project.id}/new/issue`, label: 'Uj problema' },
      ]}
    >
      <Panel title="Szereplo adatai">
        <form action={createProjectMemberAction} className="grid gap-5">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="returnTo" value={`/office/projects/${project.id}?tab=team`} />
          <Field label="Nev">
            <Input name="name" placeholder="Pl. Kiss Peter" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Szerepkor">
              <Select name="role" defaultValue={ProjectRole.SUBCONTRACTOR}>
                {Object.entries(memberRoleLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Jogosultsag">
              <Select name="permissionLevel" defaultValue={ProjectPermissionLevel.CONTRIBUTE}>
                {Object.entries(permissionLevelLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefonszam">
              <Input name="phone" placeholder="+36..." />
            </Field>
            <Field label="Email">
              <Input type="email" name="email" placeholder="email@pelda.hu" />
            </Field>
          </div>
          <Field label="Megjegyzes">
            <Textarea name="notes" placeholder="Pl. villanyszerelo, kulcs nala van, csak hetfon es szerdan elerheto." />
          </Field>
          <button className="btn-primary" type="submit">Szereplo hozzaadasa</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
