import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Panel } from "@/components/office-ui";

const mediaBlocks = ["Hero kepek", "Referenciak", "Blog kepek", "Social poszt assetek", "Video linkek", "Dokumentumok"];

export default function MediaPage() {
  return (
    <OfficeShellV2 title="Media" description="A mediatar kezeli a kep- es fajlallomanyokat, a kivalasztott assetek hasznalati helyeit es a kesobbi optimalizalt feltoltesi folyamatokat.">
      <Panel title="Mediatar kategoriak">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mediaBlocks.map((block) => (
            <div key={block} className="flex min-h-32 items-center justify-center rounded-[20px] border border-dashed bg-slate-50 p-4 text-center text-sm font-medium text-slate-600">
              {block}
            </div>
          ))}
        </div>
      </Panel>
    </OfficeShellV2>
  );
}

