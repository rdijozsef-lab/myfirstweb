import { TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { DataTable, Panel, Badge } from '@/components/office-ui';
import { createTaskAction, updateTaskStatusAction } from '@/app/office/actions/core';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { formatDateTime, priorityLabel, taskStatusLabel } from '@/lib/office';

export default async function TasksPage() {
  const user = await requireUser();
  const [tasks, contacts] = await Promise.all([
    prisma.task.findMany({ orderBy: [{ status: 'asc' }, { dueAt: 'asc' }], include: { contact: true, owner: true } }),
    prisma.contact.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <OfficeShellV2 title="Teendok" description="Minden olyan dolog, amit valakinek meg kell csinalnia, hataridovel es felelossel." userName={user.name}>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Teendolista">
          <DataTable
            headers={['Teendo', 'Ember', 'Prioritas', 'Allapot', 'Hatarido']}
            rows={tasks.map((task) => [
              <div key={`${task.id}-title`}>
                <div className="font-medium text-slate-900">{task.title}</div>
                {task.description ? <div className="mt-1 text-sm text-slate-500">{task.description}</div> : null}
              </div>,
              <div key={`${task.id}-contact`}>{task.contact?.name || '-'}</div>,
              <Badge key={`${task.id}-priority`} tone={task.priority === 'URGENT' ? 'amber' : task.priority === 'HIGH' ? 'blue' : 'slate'}>{priorityLabel[task.priority]}</Badge>,
              <form key={`${task.id}-status`} action={updateTaskStatusAction} className="flex gap-2">
                <input type="hidden" name="id" value={task.id} />
                <select name="status" defaultValue={task.status} className="rounded-xl border border-slate-200 px-3 py-2 text-xs">
                  {Object.entries(taskStatusLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">Mentes</button>
              </form>,
              <div key={`${task.id}-due`} className="text-sm">{formatDateTime(task.dueAt)}</div>,
            ])}
          />
        </Panel>

        <Panel title="Uj teendo">
          <form action={createTaskAction} className="grid gap-4">
            <Field label="Teendo cime"><Input name="title" placeholder="Peldaul: ajanlat kikuldese" required /></Field>
            <Field label="Kapcsolodo ember">
              <Select name="contactId" defaultValue="">
                <option value="">Nincs kivalasztva</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prioritas">
                <Select name="priority" defaultValue={TaskPriority.MEDIUM}>
                  {Object.entries(priorityLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Allapot">
                <Select name="status" defaultValue={TaskStatus.TODO}>
                  {Object.entries(taskStatusLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Hatarido"><Input type="datetime-local" name="dueAt" /></Field>
            <Field label="Leiras"><Textarea name="description" placeholder="Mit kell megcsinalni?" /></Field>
            <button className="btn-primary" type="submit">Teendo mentese</button>
          </form>
        </Panel>
      </section>
    </OfficeShellV2>
  );
}
