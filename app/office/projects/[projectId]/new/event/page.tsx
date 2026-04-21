import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectEventType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { createProjectEventAction } from '@/app/office/actions/core';

const eventTypeLabel: Record<ProjectEventType, string> = {
  MEETING: 'Megbeszeles',
  WORK_START: 'Munkakezdes',
  TASK_DEADLINE: 'Hatarido',
  HANDOVER: 'Atadas',
};

export default async function NewProjectEventPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { tasks: { orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }] } },
  });

  if (!project) notFound();

  return (
    <OfficeShellV2
      title="Uj idopont varazslo"
      description={`Rogzits megbeszelest, munkakezdest vagy hataridot ehhez a projekthez: ${project.name}.`}
      userName={user.name}
      toolbar={<Link href={`/office/projects/${project.id}?tab=calendar`} className="btn-secondary">Vissza az idopontokhoz</Link>}
      focusLabel="Projektkozpont"
      quickActions={[
        { href: `/office/projects/${project.id}`, label: 'Projektkozpont' },
        { href: `/office/projects/${project.id}/new/person`, label: 'Uj szereplo' },
        { href: `/office/projects/${project.id}/new/task`, label: 'Uj teendo' },
        { href: `/office/projects/${project.id}/new/issue`, label: 'Uj problema' },
      ]}
    >
      <Panel title="Idopont adatai">
        <form action={createProjectEventAction} className="grid gap-5">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="returnTo" value={`/office/projects/${project.id}?tab=calendar`} />
          <Field label="Idopont cime">
            <Input name="title" placeholder="Pl. Hetfoi munkakezdes" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipus">
              <Select name="type" defaultValue={ProjectEventType.MEETING}>
                {Object.entries(eventTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Kapcsolodo teendo">
              <Select name="taskId" defaultValue="">
                <option value="">Nincs hozzakotve teendohoz</option>
                {project.tasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kezdes">
              <Input type="datetime-local" name="startsAt" required />
            </Field>
            <Field label="Vege">
              <Input type="datetime-local" name="endsAt" />
            </Field>
          </div>
          <Field label="Helyszin">
            <Input name="location" placeholder="Pl. Kecskemet, Fo utca 12." />
          </Field>
          <Field label="Megjegyzes">
            <Textarea name="notes" placeholder="Pl. megrendeloi bejaras, anyag atvetel, alapozas ellenorzes." />
          </Field>
          <button className="btn-primary" type="submit">Idopont letrehozasa</button>
        </form>
      </Panel>
    </OfficeShellV2>
  );
}
