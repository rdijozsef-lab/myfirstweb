'use client';

import Link from 'next/link';

export default function OfficeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center">
        <section className="w-full rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Office hiba</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Az office felulet egy futasi hibaba utkozott.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Ez lehet adatbazis-kapcsolati problema, de ugyanugy okozhatja regi adat, enum-eltres, hianyzo schema-frissites vagy egy szerveroldali renderelesi hiba is.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Gyors ellenorzes: `DATABASE_URL`, `npm run db:deploy`, `npm run db:seed`, valamint az utolso adatmodell-valtoztatasok es a helyi seedelt adatok osszhangja.
          </p>
          {error.digest ? (
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
              Digest: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Ujraprobalas
            </button>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Vissza a loginhoz
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
