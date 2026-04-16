import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Badge, DataTable, Panel } from "@/components/office-ui";
import { socialPosts } from "@/lib/data";

export default function SocialPage() {
  const rows = socialPosts.map((post) => [
    <span key={`${post.title}-title`} className="font-semibold text-slate-950">{post.title}</span>,
    <span key={`${post.title}-platform`}>{post.platform}</span>,
    <span key={`${post.title}-when`}>{post.when}</span>,
    <Badge key={`${post.title}-status`} tone={post.status === "Idozitve" ? "green" : post.status === "Piszkozat" ? "slate" : "amber"}>{post.status}</Badge>,
  ]);

  return (
    <OfficeShellV2 title="Kozossegi media" description="A social modul egy helyrol kezeli a posztokat, idoziteseket, platformonkénti valtozatokat es a kampanynaptarat. A V1-ben demo szintu, de mar a valodi modul logikajat modellezi.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Posztok">
          <DataTable headers={["Tema", "Platform", "Idozites", "Statusz"]} rows={rows} />
        </Panel>
        <Panel title="Poszt workflow">
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[18px] border bg-slate-50 p-4">1. poszt letrehozas</div>
            <div className="rounded-[18px] border bg-slate-50 p-4">2. platform valtozatok</div>
            <div className="rounded-[18px] border bg-slate-50 p-4">3. idozites vagy azonnali publikacio</div>
            <div className="rounded-[18px] border bg-slate-50 p-4">4. naptarbe kerules es naplozas</div>
          </div>
        </Panel>
      </div>
    </OfficeShellV2>
  );
}

