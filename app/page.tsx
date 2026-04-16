import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PresetCard } from "@/components/preset-card";
import { SectionTitle } from "@/components/section-title";
import { coreFeatures, heroMetrics, moduleCards, presets, processSteps } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
          <div className="container-shell">
            <div className="glass-panel grid gap-10 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10 xl:p-12">
              <div className="flex flex-col justify-center gap-6">
                <span className="eyebrow">My First Web uj korszak</span>
                <div className="space-y-5">
                  <h1 className="max-w-4xl text-4xl font-semibold sm:text-5xl xl:text-6xl">Nem egy ujabb weboldal. Egy kiprobalhato rendszeralap, amire uzleti logikat lehet epiteni.</h1>
                  <p className="max-w-3xl text-base leading-8 sm:text-lg">
                    A MyFirstOffice a My First Web uj termekalapja: publikus web, office reteg, tartalomkezeles, kozossegi media idozites es presetek egy kozos keretrendszerben.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/rendszer" className="btn-primary">Rendszer felépites</Link>
                  <Link href="/office" className="btn-secondary">Office demo megnyitasa</Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {heroMetrics.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white/80 p-4">
                      <div className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-rows-[1fr_auto]">
                <div className="relative overflow-hidden rounded-[28px] border bg-slate-950 p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-blue-200">Live demo vibe</div>
                      <div className="mt-1 text-lg font-semibold">MyFirstOffice dashboard scene</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">Tailwind UI</div>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10">
                    <Image src="/assets/img/referenciak/admin-demo-preview.png" alt="Office preview" fill className="object-cover opacity-95" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="soft-panel">
                    <div className="text-xs uppercase tracking-[0.22em] text-blue-700">Core</div>
                    <h3 className="mt-3 text-xl font-semibold">Kozeppontban a hasznalhato admin</h3>
                    <p className="mt-3 text-sm leading-6">Kapcsolatok, leadek, feladatok, naptar, oldalak, media es social egyetlen feluleten.</p>
                  </div>
                  <div className="soft-panel">
                    <div className="text-xs uppercase tracking-[0.22em] text-blue-700">Modulok</div>
                    <h3 className="mt-3 text-xl font-semibold">Nem nullarol ujra, hanem preset logikabol</h3>
                    <p className="mt-3 text-sm leading-6">Szolgaltato, workshop, webshop light es kivitelezo presetek ugyanarra a motorra ulnek.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16 lg:pb-24">
          <div className="container-shell">
            <SectionTitle
              eyebrow="Mibol all most a termek"
              title="A termek mar nem a frontend. A frontend csak a lathato reteg a rendszer folott."
              text="A kozos mag, a modulok es a preset logika adja azt a stabil alapot, amit mar meg lehet mutatni, kiprobalni es ra lehet huzni kulonbozo cegekre."
              align="center"
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {coreFeatures.map((feature) => (
                <article key={feature.title} className="soft-panel flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-7">{feature.text}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feature.bullets.map((bullet) => (
                      <span key={bullet} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                        {bullet}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-24">
          <div className="container-shell">
            <SectionTitle
              eyebrow="Preset demok"
              title="Az ugyfel ne semmit vegyen. Lassa, milyen rendszerre epul a sajat verzioja."
              text="Minden preset ugyanahhoz a kozos rendszerhez kapcsolodik, csak a publikus flow es a modulkapcsolatok valtoznak."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {presets.map((preset) => (
                <PresetCard key={preset.name} {...preset} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="soft-panel overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                <Image src="/assets/img/real-workspace-source.jpg" alt="Workspace" fill className="object-cover" />
              </div>
            </div>
            <div className="space-y-6">
              <SectionTitle
                eyebrow="Mukodesi logika"
                title="Igy epul ra a teljes rendszer a mostani My First Web alapra."
                text="Eloszor a kozos mag es az office reteg keszul el, utana jonnek a modulok, presetek es az egyedi flow-k. Ezzel mar nem szolgaltatasigéret van, hanem valos termekalap."
              />
              <div className="grid gap-4">
                {processSteps.map((step) => (
                  <div key={step.title} className="rounded-[24px] border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-24">
          <div className="container-shell">
            <SectionTitle
              eyebrow="Aktiv modulkep"
              title="A MyFirstOffice mar most ugy van felepítve, hogy egy office rendszernek nezzen ki es ugy is lehessen tovabbfejleszteni."
              text="A Tailwindes ujrarendezes celja az volt, hogy ugyanarra a projektalapra ra lehessen epiteni a teljes office logikat kulon backend kor nelkul is."
              align="center"
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {moduleCards.map((module) => (
                <article key={module.title} className="soft-panel">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{module.title}</div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                    {module.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
