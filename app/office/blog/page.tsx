import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Badge, DataTable, Panel } from "@/components/office-ui";
import { blogPosts } from "@/lib/data";

export default function BlogPage() {
  const rows = blogPosts.map((post) => [
    <span key={`${post.title}-title`} className="font-semibold text-slate-950">{post.title}</span>,
    <span key={`${post.title}-category`}>{post.category}</span>,
    <Badge key={`${post.title}-date`} tone="slate">{post.date}</Badge>,
  ]);

  return (
    <OfficeShellV2 title="Blog" description="A blog modul kezeli a cikkeket, kategoriakat, listanezeteket es a publikacios utemezest. Kesoobb a social schedulerrel is osszekapcsolhato.">
      <Panel title="Cikkek">
        <DataTable headers={["Cim", "Kategoria", "Datum"]} rows={rows} />
      </Panel>
    </OfficeShellV2>
  );
}

