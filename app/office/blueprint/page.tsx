import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Panel } from "@/components/office-ui";
import { blueprintSections } from "@/lib/data";

export default function BlueprintPage() {
  return (
    <OfficeShellV2 title="Blueprint" description="Ez a route a rendszerterv belso nezete. Itt lehet a fejlesztesi specifikaciot, route-terkepeket, adatmodelleket es a V1-V3 bontast strukturaltan kezelni.">
      <Panel title="Aktiv tervezesi blokkok">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {blueprintSections.map((section) => (
            <div key={section} className="rounded-[20px] border bg-slate-50 p-4 text-sm font-medium text-slate-700">
              {section}
            </div>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}

