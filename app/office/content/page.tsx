import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Badge, DataTable, Panel } from "@/components/office-ui";
import { contentPages } from "@/lib/data";

export default function ContentPage() {
  const rows = contentPages.map((page) => [
    <span key={`${page.title}-title`} className="font-semibold text-slate-950">{page.title}</span>,
    <span key={`${page.title}-type`}>{page.type}</span>,
    <Badge key={`${page.title}-status`} tone={page.status === "publikalt" ? "green" : "slate"}>{page.status}</Badge>,
    <span key={`${page.title}-updated`}>{page.updated}</span>,
  ]);

  return (
    <OfficeShellV2 title="Oldalak" description="A blokk alapu CMS itt kezeli a publikus oldalak szerkezetet, a landingeket, a preset oldalak tartalmait es a publikacios allapotokat.">
      <Panel title="Publikus oldalak">
        <DataTable headers={["Oldal", "Tipus", "Statusz", "Frissitve"]} rows={rows} />
      </Panel>
    </OfficeShellV2>
  );
}

