import Link from "next/link";
import Image from "next/image";
import { mainNav } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/assets/img/logo-mark-dark.png"
            alt="My First Web"
            width={46}
            height={46}
            className="h-11 w-11 rounded-2xl object-cover"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">My First Web</div>
            <div className="text-sm text-slate-500">MyFirstOffice Tailwind rendszeralap</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/demo" className="hidden rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-700 sm:inline-flex">
            Kiprobálom
          </Link>
          <Link href="/office" className="btn-primary">
            Office demo
          </Link>
        </div>
      </div>
    </header>
  );
}
