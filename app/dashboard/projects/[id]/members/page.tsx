import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectPermissionLevel, ProjectRole } from '@prisma/client';
import { addProjectContactAction, addProjectMemberLinkAction, setProjectMemberLinkActiveAction } from '@/app/dashboard/actions';
import { Field, Input, Select, Textarea } from '@/components/forms';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageProject, canViewProject, formatDateTime, getProjectShell } from '@/lib/construction';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';

const roleLabel: Record<string, string> = {
  super_admin: 'Super admin',
  main_contractor_admin: 'Fovallalkozo admin',
  subcontractor: 'Alvallalkozo',
  inspector: 'Muszaki ellenor',
  customer: 'Megrendelo',
};

const permissionLabel: Record<string, string> = {
  view_only: 'Csak betekintes',
  view_approve: 'Betekintes + jovahagyas',
  comment: 'Kommenteles',
  contribute: 'Feltoltes es teljesites',
  manage: 'Projektkezeles',
  full: 'Teljes hozzaferes',
};

const legacyRoleLabel: Record<ProjectRole, string> = {
  OWNER: 'Tulajdonos',
  CUSTOMER: 'Megrendelo',
  TECH_INSPECTOR: 'Muszaki ellenor',
  FMV: 'FMV',
  PROJECT_MANAGER: 'Projektvezeto',
  SUBCONTRACTOR: 'Alvallalkozo',
};

const legacyPermissionLabel: Record<ProjectPermissionLevel, string> = {
  FULL: 'Teljes',
  MANAGE: 'Kezeles',
  CONTRIBUTE: 'Kozremukodes',
  COMMENT: 'Komment',
  VIEW_APPROVE: 'Betekintes + jovahagyas',
  VIEW_ONLY: 'Csak betekintes',
};

export default async function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { project, certification } = await getProjectShell(id);
  if (!project || !certification) notFound();
  if (!(await canViewProject(user, project.id))) notFound();
  const canManage = await canManageProject(user, project.id);

  const [memberLinks, legacyMembers] = await Promise.all([
    prisma.projectMemberLink.findMany({
      where: { projectId: project.id },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.projectMember.findMany({
      where: { projectId: project.id },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
  ]);
  const users = await prisma.user.findMany({
    where: { id: { in: memberLinks.map((member) => member.userId).filter(Boolean) as string[] } },
    select: { id: true, name: true, email: true, username: true, role: true },
  });
  const [availableUsers, companies] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, email: true, username: true, role: true },
    }),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true },
    }),
  ]);
  const userMap = new Map(users.map((item) => [item.id, item]));

  return (
    <OfficeShellV2
      title={`${project.name} szereploi`}
      description="Projekt-hozzaferesek, szerepkorok, jogosultsagi szintek es kapcsolattartok."
      userName={user.name}
      focusLabel="Tagok"
      toolbar={<Link href={`/dashboard/projects/${project.id}`} className="btn-secondary">Vissza a projekthez</Link>}
      quickActions={[
        { href: `/dashboard/projects/${project.id}`, label: 'Attekintes' },
        { href: `/dashboard/projects/${project.id}/documents`, label: 'Dokumentumok' },
        { href: `/dashboard/projects/${project.id}/timeline`, label: 'Idovonal' },
        { href: `/dashboard/projects/${project.id}/closing-package`, label: 'Zaro csomag' },
      ]}
    >
      {canManage ? (
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Szerepkoros hozzaferes hozzaadasa">
            <form action={addProjectMemberLinkAction} className="grid gap-4 lg:grid-cols-2">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="certificationId" value={certification.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/members`} />
              <Field label="Felhasznalo">
                <Select name="userId" defaultValue="">
                  <option value="">Felhasznalo nelkuli szerep</option>
                  {availableUsers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} / {item.username} / {item.role}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ceg">
                <Select name="companyId" defaultValue="">
                  <option value="">Nincs ceghez kotve</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name} / {company.type}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Projekt szerepkor">
                <Select name="role" defaultValue="subcontractor">
                  {Object.entries(roleLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Jogosultsagi szint">
                <Select name="permissionLevel" defaultValue="contribute">
                  {Object.entries(permissionLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Megrendelonek lathato megjegyzes">
                <Input name="customerSafeNotes" placeholder="Pl. atadasi dokumentumok megtekintese engedelyezve" />
              </Field>
              <Field label="Belso megjegyzes">
                <Input name="internalNotes" placeholder="Pl. csak alapozasi fazisokban aktiv" />
              </Field>
              <div className="lg:col-span-2">
                <button type="submit" className="btn-primary">Hozzaferes mentese</button>
              </div>
            </form>
          </Panel>

          <Panel title="Kapcsolattarto rogzitese">
            <form action={addProjectContactAction} className="space-y-4">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="certificationId" value={certification.id} />
              <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/members`} />
              <Field label="Nev">
                <Input name="name" required />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email">
                  <Input name="email" type="email" />
                </Field>
                <Field label="Telefon">
                  <Input name="phone" />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Szerep">
                  <Select name="role" defaultValue={ProjectRole.SUBCONTRACTOR}>
                    {Object.values(ProjectRole).map((role) => (
                      <option key={role} value={role}>{legacyRoleLabel[role]}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Jog">
                  <Select name="permissionLevel" defaultValue={ProjectPermissionLevel.CONTRIBUTE}>
                    {Object.values(ProjectPermissionLevel).map((permission) => (
                      <option key={permission} value={permission}>{legacyPermissionLabel[permission]}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Megjegyzes">
                <Textarea name="notes" />
              </Field>
              <button type="submit" className="btn-secondary">Kapcsolattarto hozzaadasa</button>
            </form>
          </Panel>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Aktiv hozzaferes" value={String(memberLinks.filter((member) => member.isActive).length)} note="ProjectMemberLink" />
        <StatCard label="Kapcsolattarto" value={String(legacyMembers.length)} note="Korabbi projektmember rekord" />
        <StatCard label="Kezelheto" value={canManage ? 'Igen' : 'Nem'} note="A bejelentkezett user joga" />
      </section>

      <Panel title="Szerepkoros hozzaferesek">
        <div className="grid gap-3 lg:grid-cols-2">
          {memberLinks.map((member) => {
            const linkedUser = member.userId ? userMap.get(member.userId) : null;
            return (
              <article key={member.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-950">{linkedUser?.name || member.customerSafeNotes || roleLabel[member.role] || member.role}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {linkedUser?.email || linkedUser?.username || 'Nincs felhasznalo hozzakotve'}
                    </div>
                  </div>
                  <Badge tone={member.isActive ? 'green' : 'slate'}>{member.permissionLevel}</Badge>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <div>Szerep: {roleLabel[member.role] || member.role}</div>
                  <div>Letrehozva: {formatDateTime(member.createdAt)}</div>
                  {canManage && member.internalNotes ? <div>Belso megjegyzes: {member.internalNotes}</div> : null}
                  {member.customerSafeNotes ? <div>Ugyfelnek lathato: {member.customerSafeNotes}</div> : null}
                </div>
                {canManage ? (
                  <form action={setProjectMemberLinkActiveAction} className="mt-4">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="certificationId" value={certification.id} />
                    <input type="hidden" name="memberLinkId" value={member.id} />
                    <input type="hidden" name="isActive" value={member.isActive ? 'false' : 'true'} />
                    <input type="hidden" name="returnTo" value={`/dashboard/projects/${project.id}/members`} />
                    <button type="submit" className="btn-secondary">
                      {member.isActive ? 'Hozzaferes felfuggesztese' : 'Hozzaferes aktivalasa'}
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel title="Projekt kapcsolattartok">
        <div className="grid gap-3 lg:grid-cols-2">
          {legacyMembers.length ? legacyMembers.map((member) => (
            <article key={member.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{member.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{member.email || member.phone || 'Nincs elerhetoseg'}</div>
                </div>
                <Badge tone={member.isActive ? 'green' : 'slate'}>{member.role}</Badge>
              </div>
              {member.notes ? <p className="mt-3 text-sm leading-6 text-slate-600">{member.notes}</p> : null}
            </article>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Nincs kulon kapcsolattarto rogzitve.</div>}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
