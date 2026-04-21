'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { officeNav } from '@/lib/data';

type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

function iconFor(href: string) {
  if (href.startsWith('/office/subcontractors')) return <PeopleIcon />;
  if (href.startsWith('/office/projects')) return <FolderIcon />;
  if (href.startsWith('/office/contacts')) return <PeopleIcon />;
  if (href.startsWith('/office/leads')) return <PulseIcon />;
  if (href.startsWith('/office/tasks')) return <CheckIcon />;
  if (href.startsWith('/office/calendar')) return <CalendarIcon />;
  if (href.startsWith('/office/messages')) return <MessageIcon />;
  if (href.startsWith('/office/content')) return <LayersIcon />;
  if (href.startsWith('/office/blog')) return <DocumentIcon />;
  if (href.startsWith('/office/social')) return <ShareIcon />;
  if (href.startsWith('/office/media')) return <ImageIcon />;
  if (href.startsWith('/office/modules')) return <GridIcon />;
  if (href.startsWith('/office/events')) return <CalendarIcon />;
  if (href.startsWith('/office/reports')) return <ChartIcon />;
  if (href.startsWith('/office/settings')) return <GearIcon />;
  return <HomeIcon />;
}

function matchesPath(pathname: string, href: string) {
  if (href === '/office') return pathname === '/office';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      <h4 className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => {
          const active = matchesPath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`group flex items-center gap-3 rounded-[20px] px-3 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-[#1f4f3c] text-white shadow-[0_18px_36px_rgba(31,79,60,0.18)]'
                  : 'bg-[#f7faf5] text-slate-600 hover:bg-white hover:text-[#1f4f3c]'
              }`}
            >
              <span
                className={`flex size-11 items-center justify-center rounded-2xl border transition ${
                  active
                    ? 'border-white/15 bg-white/10 text-white'
                    : 'border-[#dde6d8] bg-white text-slate-700 group-hover:border-emerald-200 group-hover:text-[#1f4f3c]'
                }`}
              >
                {iconFor(item.href)}
              </span>
              <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function OfficeSidebarNav() {
  return (
    <div className="space-y-6">
      <NavSection title="Napi munka" items={officeNav.field} />
      <NavSection title="Iroda es halado" items={officeNav.admin} />
    </div>
  );
}

export function OfficeBottomNav() {
  const pathname = usePathname();
  const mobileItems: NavItem[] = [
    { href: '/office', label: 'Vezerlopult' },
    { href: '/office/projects', label: 'Projektkozpont' },
    { href: '/office/subcontractors', label: 'Szakipar' },
    { href: '/office/tasks', label: 'Feladatok' },
    { href: '/office/calendar', label: 'Naptar' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dde6d8] bg-white/96 px-3 py-2 shadow-[0_-16px_48px_rgba(33,48,39,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-2">
        {mobileItems.map((item) => {
          const active = matchesPath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[68px] flex-col items-center justify-center gap-2 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                active ? 'bg-[#1f4f3c] text-white' : 'text-slate-500'
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl ${
                  active ? 'bg-white/10 text-white' : 'bg-[#f1f5ee] text-slate-700'
                }`}
              >
                {iconFor(item.href)}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return <SvgPath d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />;
}

function FolderIcon() {
  return <SvgPath d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />;
}

function PeopleIcon() {
  return <SvgPath d="M9 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7m7 2a3 3 0 1 0-2.8-4H13a4.8 4.8 0 0 1 .3 1.7c0 .8-.2 1.6-.5 2.3zM4 20a5 5 0 0 1 10 0zM14.5 20c0-1.5-.5-2.9-1.3-4 3 .2 5.3 1.8 5.8 4z" />;
}

function PulseIcon() {
  return <SvgPath d="M3 12h4l2.3-4.5L13 17l2.5-5H21" />;
}

function CheckIcon() {
  return <SvgPath d="M5 12.5 9.5 17 19 7.5" />;
}

function CalendarIcon() {
  return <SvgPath d="M7 3v3m10-3v3M4 8h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2" />;
}

function MessageIcon() {
  return <SvgPath d="M5 6.5h14A1.5 1.5 0 0 1 20.5 8v8A1.5 1.5 0 0 1 19 17.5H10l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 16V8A1.5 1.5 0 0 1 5 6.5" />;
}

function LayersIcon() {
  return <SvgPath d="m12 4 8 4-8 4-8-4zm-8 8 8 4 8-4M4 16l8 4 8-4" />;
}

function DocumentIcon() {
  return <SvgPath d="M7 3.5h7l4.5 4.5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1zm7 0V8h4.5" />;
}

function ShareIcon() {
  return <SvgPath d="M8 12a3 3 0 1 0-2.7-4.3l8-4a3 3 0 1 0 .3 1.3c0-.2 0-.4-.1-.6l-8 4a3 3 0 0 0 0 7.2l8 4c0-.2.1-.4.1-.6a3 3 0 1 0-.3 1.3l-8-4A3 3 0 0 0 8 12" />;
}

function ImageIcon() {
  return <SvgPath d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m2 10 3-3 2.5 2.5L16 11l4 4M8.5 9.2a1.2 1.2 0 1 0 0-.01" />;
}

function GridIcon() {
  return <SvgPath d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />;
}

function ChartIcon() {
  return <SvgPath d="M5 19V9m7 10V5m7 14v-7" />;
}

function GearIcon() {
  return <SvgPath d="m12 3 1.2 2.6 2.9.4.6 2.8 2.3 1.7-1 2.7 1 2.7-2.3 1.7-.6 2.8-2.9.4L12 21l-1.2-2.6-2.9-.4-.6-2.8-2.3-1.7 1-2.7-1-2.7 2.3-1.7.6-2.8 2.9-.4zM12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5" />;
}

function SvgPath({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
