import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Badge, DataTable, Panel } from "@/components/office-ui";

const events = [
  { title: "Kovasz workshop - szombat", place: "Kecskemet", slots: "14 / 18", status: "nyitott" },
  { title: "Demo nap - szolgaltatoi preset", place: "Online", slots: "9 / 12", status: "majdnem tele" },
  { title: "Office bemutato", place: "Budapest", slots: "22 / 25", status: "nyitott" },
];

export default function EventsPage() {
  const rows = events.map((event) => [
    <span key={`${event.title}-title`} className="font-semibold text-slate-950">{event.title}</span>,
    <span key={`${event.title}-place`}>{event.place}</span>,
    <span key={`${event.title}-slots`}>{event.slots}</span>,
    <Badge key={`${event.title}-status`} tone={event.status === "nyitott" ? "green" : "amber"}>{event.status}</Badge>,
  ]);

  return (
    <OfficeShellV2 title="Esemenyek" description="Az esemenymodul a workshop, demo nap es foglalasi logikak kozeppontja. Innen lehet ferohelyet, jelentkezeseket es kommunikaciot kapcsolni a naptarhoz.">
      <Panel title="Aktiv esemenyek">
        <DataTable headers={["Esemeny", "Helyszin", "Kapacitas", "Statusz"]} rows={rows} />
      </Panel>
    </OfficeShellV2>
  );
}

