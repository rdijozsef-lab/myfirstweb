import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';
import { LogoutForm } from '@/components/office/logout-form';
import { OfficeBottomNav, OfficeSidebarNav } from '@/components/office-nav';

type OfficeShellV2Props = PropsWithChildren<{
  title: string;
  description: string;
  userName?: string;
  toolbar?: ReactNode;
  focusLabel?: string;
  quickActions?: { href: string; label: string }[];
}>;

export function OfficeShellV2({
  title,
  description,
  children,
  userName = 'Admin',
  toolbar,
  focusLabel = 'Mai fokusz',
  quickActions = [
    { href: '/office/projects', label: 'Projekt inditasa' },
    { href: '/office/tasks', label: 'Gyors feladat' },
    { href: '/office/calendar', label: 'Uj esemeny' },
  ],
}: OfficeShellV2Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_18%),#f5f4ef] lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="hidden border-r border-slate-200/80 bg-[#f7f4ec]/90 px-5 py-6 lg:block lg:min-h-screen">
        <Link href="/office" className="mb-6 block rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">MyFirstOffice</div>
          <div className="mt-3 text-xl font-semibold text-slate-950">Digitalis epitesvezeto</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gyors, terepen is hasznalhato munkafelulet projektekhez, feladatokhoz es napi helyszini dokumentaciohoz.</p>
        </Link>

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_20px_44px_rgba(15,23,42,0.22)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">Belepve</div>
          <div className="mt-3 text-xl font-semibold">{userName}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">A mai cel: gyors rogzithetoseg, atlathato kovetkezo lepesek, minimalis keresgeles.</p>
          <div className="mt-4">
            <LogoutForm />
          </div>
        </div>

        <OfficeSidebarNav />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f5f4ef]/88 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Link href="/office" className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-700">MyFirstOffice</div>
              <div className="truncate text-lg font-semibold text-slate-950">{title}</div>
            </Link>
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              {userName}
            </div>
          </div>

          <div className="hidden flex-col gap-5 lg:flex lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <span className="eyebrow">{focusLabel}</span>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 sm:text-base">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">{toolbar}</div>
          </div>
        </header>

        <main className="space-y-6 px-4 py-5 pb-28 sm:px-6 lg:px-8 lg:pb-8">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.14)] sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">{focusLabel}</div>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[2rem]">{title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
              <div className="mt-5 flex flex-wrap gap-3">{toolbar}</div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Gyors muveletek</div>
              <div className="mt-4 grid gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-slate-950"
                  >
                    <span>{action.label}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Nyitas</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {children}
        </main>
      </div>

      <OfficeBottomNav />
    </div>
  );
}
