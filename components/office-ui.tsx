import { ReactNode } from "react";

export function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="office-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{note}</div>
    </article>
  );
}

export function Panel({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="office-card">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="office-title">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-slate-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="bg-white">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-slate-100 px-4 py-4 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "amber" | "slate" }) {
  const tones = {
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-orange-50 text-orange-700 border-orange-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function ListCard({ title, items }: { title: string; items: { title: string; meta?: string; note?: string }[] }) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-slate-900">{item.title}</div>
                {item.note ? <div className="mt-1 text-sm text-slate-500">{item.note}</div> : null}
              </div>
              {item.meta ? <div className="text-sm font-medium text-slate-500">{item.meta}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
