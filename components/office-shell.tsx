import Link from 'next/link';
import { PropsWithChildren, ReactNode } from 'react';
import { officeNav } from '@/lib/data';
import { LogoutForm } from '@/components/office/logout-form';

type OfficeShellProps = PropsWithChildren<{
  title: string;
  description: string;
  userName?: string;
  toolbar?: ReactNode;
}>;

function NavSection({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OfficeShell({ title, description, children, userName = 'Admin', toolbar }: OfficeShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[290px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950 px-5 py-6 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-4">
        <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">MyFirstOffice</div>
          <div className="mt-3 text-xl font-semibold">Tailwind office v2</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">Prisma alapú Contacts, Leads, Tasks és Calendar backend bevezetve.</p>
        </div>
        <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Belépve</div>
          <div className="mt-2 text-lg font-semibold">{userName}</div>
          <div className="mt-4"><LogoutForm /></div>
        </div>
        <div className="space-y-6">
          <NavSection title="Core" items={officeNav.core} />
          <NavSection title="Content" items={officeNav.content} />
          <NavSection title="Product" items={officeNav.product} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b bg-white/80 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="eyebrow">Office demo</span>
              <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 sm:text-base">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">{toolbar}</div>
          </div>
        </header>
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
