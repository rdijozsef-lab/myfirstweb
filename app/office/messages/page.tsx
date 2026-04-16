import { OfficeShellV2 } from "@/components/office-shell-v2";
import { Panel } from "@/components/office-ui";
import { messages } from "@/lib/data";

export default function MessagesPage() {
  return (
    <OfficeShellV2 title="Uzenetek" description="A kommunikacios kozeppont egy helyre gyujti a webes megkereseseket, chateket es kesobb az email naplot is. Innen lehet ugyfelhez kapcsolni es koveto feladatot inditani.">
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Panel title="Beszelgetesek">
          <div className="space-y-3">
            {messages.map((message) => (
              <button key={message.subject} type="button" className={`w-full rounded-[20px] border p-4 text-left ${message.active ? "border-blue-200 bg-blue-50" : "bg-slate-50"}`}>
                <div className="font-semibold text-slate-950">{message.from}</div>
                <div className="mt-1 text-sm text-slate-600">{message.subject}</div>
                <div className="mt-2 text-sm text-slate-500">{message.preview}</div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Aktiv beszelgetes">
          <div className="rounded-[20px] border bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            Ez a nezet a kesobbi uzenetkezelo modul helye. Itt latszanak majd a teljes threadek, az ugyfelkapcsolat, a belso megjegyzesek es a gyors muveletek.
          </div>
        </Panel>
      </div>
    </OfficeShellV2>
  );
}

