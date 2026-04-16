import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Panel } from "@/components/office-ui";

const settingsBlocks = [
  "altalanos adatok",
  "brand szinek es logo",
  "ertesitesi szabalyok",
  "social kapcsolatok",
  "felhasznalok es szerepkorok",
  "preset alapbeallitasok",
];

export default function SettingsPage() {
  return (
    <OfficeShellV2 title="Beallitasok" description="A beallitasok oldala fogja ossze az altalanos rendszeradatokat, a brand elemeket, a jogosultsagi logikat es a modulokhoz tartozo kulcs beallitasokat.">
      <Panel title="Rendszerbeallitasok">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {settingsBlocks.map((block) => (
            <div key={block} className="rounded-[20px] border bg-slate-50 p-4 text-sm font-medium text-slate-700">
              {block}
            </div>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}

