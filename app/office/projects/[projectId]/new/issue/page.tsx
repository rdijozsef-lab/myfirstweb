import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectIssueCategory, ProjectIssueStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectIssueAction } from '@/app/office/actions/core';

const issueCategoryLabel: Record<ProjectIssueCategory, string> = {
  TECHNICAL: 'Muszaki hiba',
  DELAY: 'Csuszas',
  MISSING: 'Hiany',
  DECISION: 'Dontesi problema',
};

const issueStatusLabel: Record<ProjectIssueStatus, string> = {
  OPEN: 'Nyitott',
  IN_PROGRESS: 'Folyamatban',
  RESOLVED: 'Megoldva',
};

export default async function NewProjectIssuePage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: { orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }] } },
  });

  if (!project) notFound();

  return (
    <OfficeShellV2
      title="Uj problema varazslo"
      description={`Rogzits blokkolot, hibat vagy dontesi helyzetet ehhez a projekthez: ${project.name}.`}
      userName={user.name}
      toolbar={<Link href={`/office/projects/${project.id}?tab=issues`} className="btn-secondary">Vissza a problemakhoz</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: `/office/projects/${project.id}`, label: 'Projektkozpont' },
        { href: `/office/projects/${project.id}/new/person`, label: 'Uj szereplo' },
        { href: `/office/projects/${project.id}/new/task`, label: 'Uj teendo' },
        { href: `/office/projects/${project.id}/new/event`, label: 'Uj idopont' },
      ]}
    >
      <Panel title="Problema adatai">
        <form action={createProjectIssueAction} className="grid gap-5">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="returnTo" value={`/office/projects/${project.id}?tab=issues`} />
          <Field label="Cim">
            <Input name="title" placeholder="Pl. betonminosegi problema az alapnal" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategoria">
              <Select name="category" defaultValue={ProjectIssueCategory.TECHNICAL}>
                {Object.entries(issueCategoryLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Statusz">
              <Select name="status" defaultValue={ProjectIssueStatus.OPEN}>
                {Object.entries(issueStatusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kapcsolodo teendo">
              <Select name="taskId" defaultValue="">
                <option value="">Nincs hozzakotve teendohoz</option>
                {project.tasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Felelos / kapcsolattarto">
              <Input name="responsibleName" placeholder="Pl. projektvezeto vagy alvallalkozo neve" />
            </Field>
          </div>
          <Field label="Leiras">
            <Textarea name="description" placeholder="Mi a problema, mi latszik a helyszinen, mi blokkolodik miatta, kell-e dontes vagy uj anyag?" />
          </Field>
          <button className="btn-primary" type="submit">Problema letrehozasa</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
