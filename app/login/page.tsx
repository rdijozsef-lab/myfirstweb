import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { loginAction } from './actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect('/office');

  const params = await searchParams;
  const error = params.error;
  const next = params.next || '/office';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
            MyFirstOffice login
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            A publikus oldal mögött most már valódi office mag dolgozik.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Ez a belépési pont a Contacts, Leads, Tasks és Calendar valódi Prisma alapú rendszeréhez.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {['Prisma adatmodell', 'Valódi mentés', 'Office dashboard'].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Belépés</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">MyFirstOffice</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Első indításnál seedelt adminnal tudsz belépni.
            </p>
          </div>

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Felhasználónév vagy email</label>
              <input name="username" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-blue-400" placeholder="admin" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Jelszó</label>
              <input type="password" name="password" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 transition focus:border-blue-400" placeholder="admin123" />
            </div>
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Belépés
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div><strong>Demo login:</strong> admin</div>
            <div><strong>Demo jelszó:</strong> admin123</div>
          </div>

        </section>
      </div>
    </main>
  );
}
