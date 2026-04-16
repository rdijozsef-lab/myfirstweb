import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionTitle } from "@/components/section-title";
import { moduleCards, processSteps } from "@/lib/data";

const coreColumns = [
  {
    title: "Core alap",
    items: ["felhasznalok es jogosultsagok", "dashboard", "kapcsolatok", "leadek", "feladatkezeles", "naptar"],
  },
  {
    title: "Content es marketing",
    items: ["oldalak", "blokk alapu cms", "blog", "media", "social scheduler", "kampanynaptar"],
  },
  {
    title: "Modulreteg",
    items: ["ajanlatkero", "workshop", "booking", "webshop light", "riportok", "preset logika"],
  },
];

export default function SystemPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12 lg:py-16">
        <div className="container-shell space-y-14">
          <SectionTitle
            eyebrow="Rendszer felépites"
            title="A MyFirstOffice nem ujabb adminpanel. Egy kozos magra epulo uzleti webes rendszer."
            text="A termek szerkezete ugy lett kitalalva, hogy egyszerre tudja kiszolgalni a publikus oldalt, a belso office reteget, a tartalomkezelesi folyamatokat es a modularis uzleti funkciokat."
          />

          <div className="grid gap-5 xl:grid-cols-3">
            {coreColumns.map((column) => (
              <article key={column.title} className="soft-panel">
                <h2 className="text-2xl font-semibold">{column.title}</h2>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 rounded-[28px] border bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <span className="eyebrow">Mukodesi retegek</span>
              <h2 className="text-3xl font-semibold">A publikus web es az office ugyanahhoz a rendszerhez kapcsolodik.</h2>
              <p className="text-base leading-8">
                Nem kulon kulon kezelt eszkozokrol van szo, hanem egy kozos adatretegrol. A lead bejon a publikus oldalrol, az office oldalon task lesz belole, a naptarban megjelenik, a social scheduler pedig ugyanebbol a tartalomhalozatbol dolgozik.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {processSteps.map((step) => (
                  <div key={step.title} className="rounded-[22px] border bg-slate-50 p-5">
                    <h3 className="font-semibold text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {moduleCards.map((module) => (
                <div key={module.title} className="soft-panel">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{module.title}</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {module.items.map((item) => (
                      <div key={item} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
