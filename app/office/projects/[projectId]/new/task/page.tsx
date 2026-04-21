import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectRole, ProjectTaskPriority, ProjectTaskStatus, ProjectTaskType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectTaskAction } from '@/app/office/actions/core';

const memberRoleLabel: Record<ProjectRole, string> = {
  OWNER: 'Tulajdonos',
  CUSTOMER: 'Megrendelo',
  TECH_INSPECTOR: 'Muszaki ellenor',
  FMV: 'FMV',
  PROJECT_MANAGER: 'Projektvezeto',
  SUBCONTRACTOR: 'Alvallalkozo',
};

const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  NEW: 'Uj',
  IN_PROGRESS: 'Folyamatban',
  DONE: 'Kesz',
  WAITING_APPROVAL: 'Jovahagyasra var',
};

const taskTypeLabel: Record<ProjectTaskType, string> = {
  EXECUTION: 'Kivitelezesi',
  CUSTOMER_DECISION: 'Megrendeloi dontes',
};

const taskPriorityLabel: Record<ProjectTaskPriority, string> = {
  LOW: 'Alacsony',
  MEDIUM: 'Normal',
  HIGH: 'Magas',
  URGENT: 'Surgos',
};

export default async function NewProjectTaskPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { isActive: true }, orderBy: [{ role: 'asc' }, { name: 'asc' }] },
      workflows: { orderBy: [{ createdAt: 'desc' }] },
    },
  });

  if (!project) notFound();

  return (
    <OfficeShellV2
      title="Uj teendo varazslo"
      description={`Rogzits egy kioszthato, kovetheto teendot ehhez a projekthez: ${project.name}.`}
      userName={user.name}
      toolbar={<Link href={`/office/projects/${project.id}?tab=tasks`} className="btn-secondary">Vissza a teendokhoz</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: `/office/projects/${project.id}`, label: 'Projektkozpont' },
        { href: `/office/projects/${project.id}/new/person`, label: 'Uj szereplo' },
        { href: `/office/projects/${project.id}/new/event`, label: 'Uj idopont' },
        { href: `/office/projects/${project.id}/new/issue`, label: 'Uj problema' },
      ]}
    >
      <Panel title="Teendo adatai">
        <form action={createProjectTaskAction} className="grid gap-5">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="returnTo" value={`/office/projects/${project.id}?tab=tasks`} />
          <Field label="Teendo cime">
            <Input name="title" placeholder="Pl. Aljzatbeton elokeszitese" required />
          </Field>
          <Field label="Teendo tipusa">
            <Select name="type" defaultValue={ProjectTaskType.EXECUTION}>
              {Object.entries(taskTypeLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prioritas">
              <Select name="priority" defaultValue={ProjectTaskPriority.MEDIUM}>
                {Object.entries(taskPriorityLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Statusz">
              <Select name="status" defaultValue={ProjectTaskStatus.NEW}>
                {Object.entries(taskStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Felelos">
              <Select name="assigneeMemberId" defaultValue="">
                <option value="">Nincs kiosztva</option>
                {project.members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name} - {memberRoleLabel[member.role]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Munkafazis">
              <Select name="workflowId" defaultValue="">
                <option value="">Nincs munkafazishoz kotve</option>
                {project.workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Hatarido">
            <Input type="datetime-local" name="dueAt" />
          </Field>
          <Field label="Leiras">
            <Textarea name="description" placeholder="Mit kell elvegezni, milyen anyaggal, milyen dontes vagy feltetel kapcsolodik hozza?" />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" name="approvalRequired" className="size-4 rounded border-slate-300" />
            Jovahagyast igenyel
          </label>
          <Field label="Jovahagyo">
            <Select name="approvedByMemberId" defaultValue="">
              <option value="">Nincs kijelolve</option>
              {project.members.map((member) => (
                <option key={member.id} value={member.id}>{member.name} - {memberRoleLabel[member.role]}</option>
              ))}
            </Select>
          </Field>
          <button className="btn-primary" type="submit">Teendo letrehozasa</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
