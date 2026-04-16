import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Panel } from "@/components/office-ui";
import { moduleCards } from "@/lib/data";

export default function ModulesPage() {
  return (
    <OfficeShellV2 title="Modulok" description="A modulkezelo nezet mutatja, hogy a kozos magra milyen bovitmenyek ulnek ra. Innen lathato a rendszer skalahatosaga es a presetekhez rendelt funkciologika is.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {moduleCards.map((module) => (
          <Panel key={module.title} title={module.title}>
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              {module.items.map((item) => (
                <div key={item} className="rounded-2xl border bg-slate-50 px-4 py-3">{item}</div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </OfficeShellV2>
  );
}

