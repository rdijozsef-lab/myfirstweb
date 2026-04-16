import { OfficeShellV2 } from "@/components/office-shell-v2";
import { StatCard } from "@/components/office-ui";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <OfficeShellV2 title="Riportok" description="A riportok nem tulbonyolitott BI nezetek, hanem gyors uzleti visszajelzest adnak: leadek, valaszidok, tartalomaktivitasok es social folyamatok teljesitmenye.">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <StatCard key={report.metric} label={report.metric} value={report.value} note={report.note} />
        ))}
      </div>
    </OfficeShellV2>
  );
}

