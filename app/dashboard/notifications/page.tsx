import Link from 'next/link';
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/app/dashboard/actions';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Badge, Panel, StatCard } from '@/components/office-ui';
import { requireUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/construction';
import { prisma } from '@/lib/prisma';

const notificationTypeLabel: Record<string, string> = {
  project_created: 'Projekt',
  project_membership_added: 'Hozzaferes',
  workphase_assigned: 'Munkafazis',
  checkpoint_due: 'Checkpoint',
  missing_upload: 'Dokumentacio',
  closing_package_ready: 'Zaro csomag',
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: user.id },
        { userId: null },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const unread = notifications.filter((notification) => !notification.isRead);
  const read = notifications.filter((notification) => notification.isRead);

  return (
    <OfficeShellV2
      title="Ertesitesi kozpont"
      description="Projektmeghivasok, munkafazis kiosztasok, hianypotlasok, checkpoint es zaro csomag ertesitesek."
      userName={user.name}
      focusLabel="Ertesitesek"
      toolbar={unread.length ? (
        <form action={markAllNotificationsReadAction}>
          <input type="hidden" name="returnTo" value="/dashboard/notifications" />
          <button type="submit" className="btn-secondary">Osszes olvasottra</button>
        </form>
      ) : null}
      quickActions={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/projects', label: 'Projektek' },
        { href: '/dashboard/checkpoints', label: 'Ellenorzesek' },
        { href: '/portal', label: 'Portal' },
      ]}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Osszes" value={String(notifications.length)} note="Lathato ertesites" />
        <StatCard label="Olvasatlan" value={String(unread.length)} note="Beavatkozast igenyelhet" />
        <StatCard label="Olvasott" value={String(read.length)} note="Mar kezelt" />
      </section>

      <Panel title="Olvasatlan ertesitesek">
        <NotificationList notifications={unread} />
      </Panel>

      <Panel title="Korabbi ertesitesek">
        <NotificationList notifications={read} />
      </Panel>
    </OfficeShellV2>
  );
}

function NotificationList({
  notifications,
}: {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
  }>;
}) {
  if (!notifications.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Nincs ide tartozo ertesites.</div>;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <article key={notification.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={notification.isRead ? 'slate' : 'blue'}>
                  {notificationTypeLabel[notification.type] || notification.type}
                </Badge>
                <span className="text-xs text-slate-500">{formatDateTime(notification.createdAt)}</span>
              </div>
              <h2 className="mt-3 font-semibold text-slate-950">{notification.title}</h2>
              {notification.body ? <p className="mt-2 text-sm leading-6 text-slate-600">{notification.body}</p> : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {notification.link ? (
                <Link href={notification.link} className="btn-secondary">Megnyitas</Link>
              ) : null}
              {!notification.isRead ? (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <input type="hidden" name="returnTo" value="/dashboard/notifications" />
                  <button type="submit" className="btn-secondary">Olvasottra</button>
                </form>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
