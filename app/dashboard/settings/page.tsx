import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { OfficeShellV2 } from '@/components/office-shell-v2';
import { Panel } from '@/components/office-ui';

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <OfficeShellV2 title="Beallitasok" description="Rendszerprotokollok, jogosultsagi elvek es mukodesi szabalyzatok helye." userName={user.name} focusLabel="Beallitasok">
      <Panel title="Rendszer beallitasok">
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/dashboard/templates" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-950">Sablonok</Link>
          <Link href="/dashboard/partners" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-950">Partner minosites</Link>
        </div>
      </Panel>
    </OfficeShellV2>
  );
}
