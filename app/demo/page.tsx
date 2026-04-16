import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PresetCard } from "@/components/preset-card";
import { SectionTitle } from "@/components/section-title";
import { presets } from "@/lib/data";

const demoCards = [
  {
    title: "Core office demo",
    text: "Kapcsolatok, leadek, feladatok, naptar es a teljes office topologia.",
    href: "/office",
  },
  {
    title: "Social scheduler demo",
    text: "Posztiras, idozites, platform valasztas, kampanynaptar es naplo.",
    href: "/office/social",
  },
  {
    title: "Kapcsolat + ajanlatkero demo",
    text: "Leadek, statuszok, kovetesek es az office oldali kapcsolasi pontok.",
    href: "/office/leads",
  },
];

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-12 lg:py-16">
        <div className="container-shell space-y-14">
          <SectionTitle
            eyebrow="Kiprobalhato belépési pontok"
            title="A demo oldal mar nem helyetteszoveg. Innen lehet valodi preseteket es office reszeket mutatni."
            text="A cel az, hogy ne csak azt lassa az erdeklodo, hogy van egy szep oldal, hanem azt is, hogy hogyan nez ki mogotte a hasznalhato rendszer."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {demoCards.map((card) => (
              <article key={card.title} className="soft-panel flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">{card.title}</h2>
                  <p className="text-sm leading-7">{card.text}</p>
                </div>
                <Link href={card.href} className="btn-primary w-fit">
                  Megnyitom
                </Link>
              </article>
            ))}
          </div>

          <section className="space-y-8">
            <SectionTitle
              eyebrow="Preset mintaoldalak"
              title="A presetek kulon kulon is mutathatoak, de ugyanahhoz a kozos rendszerhez tartoznak."
              text="Ez lesz az egyik legerosebb kulonbseg: az erdeklodo lat egy kesz flow-t, de a mukodes mogotte kozos es modulalhato marad."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {presets.map((preset) => (
                <PresetCard key={preset.name} {...preset} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
