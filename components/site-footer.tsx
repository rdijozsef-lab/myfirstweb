import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white/80 py-14">
      <div className="container-shell grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">MyFirstOffice</div>
          <h3 className="text-2xl font-semibold">A frontend csak a felszin. A valodi termek a mogotte levo rendszer.</h3>
          <p>
            Ez a csomag mar a modularis termeklogikat mutatja: kozos mag, office reteg, tartalom es social kezeles, presetek es bovitheto modulok.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Fo elemek</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>MyFirstOffice Core</li>
            <li>modulok es presetek</li>
            <li>Tailwind UI rendszer</li>
            <li>demozhato office nezet</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Gyors utak</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link href="/rendszer">Rendszer felépites</Link></li>
            <li><Link href="/demo">Preset demok</Link></li>
            <li><Link href="/office">Office dashboard</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
