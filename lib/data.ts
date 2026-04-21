export type NavItem = { href: string; label: string; badge?: string };

export const mainNav: NavItem[] = [
  { href: "/", label: "Fooldal" },
  { href: "/rendszer", label: "Rendszer" },
  { href: "/demo", label: "Demo" },
  { href: "/office", label: "Office" },
];

export const heroMetrics = [
  { label: "kozos mag", value: "1" },
  { label: "aktiv modulterv", value: "10+" },
  { label: "preset irany", value: "4" },
  { label: "office nezet", value: "13" },
];

export const coreFeatures = [
  {
    title: "MyFirstOffice Core",
    text: "Kapcsolatok, leadek, feladatok, naptar, uzenetek, tartalom es media egy kozos rendszerben.",
    bullets: ["dashboard", "crm alap", "cms", "riportok"],
  },
  {
    title: "Modularis bovites",
    text: "A kozos magra kulon modulkent ulnek ra az uzleti funkciok. Nincs minden ugyfelnel ujrakezdes.",
    bullets: ["ajanlatkero", "booking", "social", "workshop"],
  },
  {
    title: "Preset logika",
    text: "Szolgaltato, workshop, webshop light es kivitelezo presetekhez mar elore osszerakott kepernyo- es folyamatlogika tartozik.",
    bullets: ["demozhato", "testreszabhato", "mobilbarat", "skalahato"],
  },
];

export const processSteps = [
  {
    title: "1. Core telepitese",
    text: "A rendszer kozos magja adja a felhasznalokat, jogosultsagokat, dashboardot, kapcsolatkezelest es a tartalomkezelo reteg alapjat.",
  },
  {
    title: "2. Modul aktivitas",
    text: "A kivant uzleti funkciokat modulkent kapcsoljuk ra: ajanlatkero, workshop, social scheduler, foglalas vagy webshop light.",
  },
  {
    title: "3. Preset es design",
    text: "Az ugyfel egy mar mukodo presetbol indul, amire egyedi megjelenes, tartalom es workflow kerul.",
  },
  {
    title: "4. Office hasznalat",
    text: "A publikus weboldal es a belso office ugyanahhoz a rendszerhez kapcsolodik, ezert a napi hasznalat konnyen atlathato marad.",
  },
];

export const presets = [
  {
    name: "Szolgaltato",
    note: "Landing + ajanlatkero + leadkezeles + social.",
    image: "/assets/img/referenciak/desktop-demo-preview.png",
  },
  {
    name: "Workshop",
    note: "Esemenyek, jelentkezesek, ferohely, visszaigazolas, posztok.",
    image: "/assets/img/referenciak/henikonyha-demo.png",
  },
  {
    name: "Webshop light",
    note: "Termekek, rendelesek, atveteli logika, kampanyok.",
    image: "/assets/img/referenciak/akbaba.png",
  },
  {
    name: "Kivitelezo",
    note: "Szolgaltatasok, referencia, fajlfeltolteses ajanlatkeres, follow-up.",
    image: "/assets/img/referenciak/hazepitok.png",
  },
];

export const moduleCards = [
  {
    title: "Core",
    items: ["felhasznalok", "kapcsolatok", "leadek", "feladatok", "uzenetek", "naptar"],
  },
  {
    title: "Content",
    items: ["oldalak", "blokk alap", "blog", "media", "seo mezo", "publikalas"],
  },
  {
    title: "Social",
    items: ["posztiras", "idopzites", "posztnaptar", "sablonok", "naplo", "kampanyok"],
  },
  {
    title: "Sales",
    items: ["ajanlatkero", "elo szures", "statuszok", "jegyzetek", "feladatkapcsolat", "ertesitesek"],
  },
  {
    title: "Events",
    items: ["workshop", "jelentkezes", "ferohely", "varolista", "visszaigazolas", "export"],
  },
  {
    title: "Booking",
    items: ["szolgaltatasok", "idosavok", "kapacitas", "naptar", "visszaigazolas", "ugyfelkapcsolat"],
  },
];

export const dashboardStats = [
  { label: "Uj lead ma", value: "12", note: "3 surgos" },
  { label: "Aktiv ugyfel", value: "38", note: "6 uj ezen a heten" },
  { label: "Idozitett poszt", value: "9", note: "kov. 72 oraban" },
  { label: "Nyitott feladat", value: "27", note: "5 lejart" },
];

export const contacts = [
  { name: "Kiss Gabor", company: "Kecskemet Klima", phone: "+36 30 111 2233", source: "Web urlap", status: "Ajanlatra var" },
  { name: "Toth Eniko", company: "Heni Konyhaja", phone: "+36 70 333 2211", source: "Telefon", status: "Aktiv ugyfel" },
  { name: "Molnar Patrik", company: "EpPont Kft.", phone: "+36 20 567 8899", source: "Facebook", status: "Visszahivando" },
  { name: "Barta Reka", company: "Studio Flora", phone: "+36 30 555 1888", source: "Landing", status: "Uj lead" },
  { name: "Fodor Anna", company: "PulseFrame", phone: "+36 70 111 4444", source: "Blog", status: "Egyeztetes alatt" },
];

export const leads = [
  { title: "Kivitelezoi ajanlatkeres", owner: "Admin", due: "ma 11:00", stage: "uj" },
  { title: "Workshop landing kerdes", owner: "Tulaj", due: "ma 14:30", stage: "egyeztetes" },
  { title: "Webshop light demo erdeklodes", owner: "Ertekesito", due: "holnap", stage: "ajanlat" },
  { title: "Office social modul", owner: "Admin", due: "holnap", stage: "kovetes" },
];

export const tasks = [
  { title: "Ajanlat kikuldese", owner: "Admin", due: "ma 11:00", priority: "Magas" },
  { title: "Kapcsolat oldal frissites", owner: "Szerkeszto", due: "ma 14:30", priority: "Kozepes" },
  { title: "Instagram poszt jovahagyas", owner: "Tulaj", due: "holnap", priority: "Normal" },
  { title: "Demo admin atnezes", owner: "Admin", due: "holnap", priority: "Magas" },
];

export const calendarEvents = [
  { time: "09:00", title: "Ugyfelhivas - EpPont Kft.", kind: "Call" },
  { time: "11:30", title: "Uj poszt idozitese", kind: "Social" },
  { time: "14:00", title: "Workshop landing egyeztetes", kind: "Meeting" },
  { time: "16:30", title: "Lead statuszok atnezese", kind: "Office" },
];

export const messages = [
  { from: "Kiss Gabor", subject: "Ajanlat utan erdeklodnek", preview: "At tudjuk nezni a jovo heti indulast?", active: true },
  { from: "Studio Flora", subject: "Demo hozzaferes", preview: "Meg tudjuk mutatni a social scheduler reszt?" },
  { from: "Heni Konyhaja", subject: "Workshop lista export", preview: "Kene egy gyors export a hetvegi turnushoz." },
];

export const socialPosts = [
  { title: "Miert nem eleg a szep weboldal?", platform: "Facebook", when: "2026-04-16 09:00", status: "Idozitve" },
  { title: "Admin demo rovid video", platform: "Instagram", when: "2026-04-16 18:00", status: "Piszkozat" },
  { title: "Uj referencia kiemeles", platform: "LinkedIn", when: "2026-04-17 08:30", status: "Jovahagyasra var" },
];

export const contentPages = [
  { title: "Fooldal", type: "landing", status: "publikalt", updated: "ma" },
  { title: "Rendszer oldal", type: "product", status: "publikalt", updated: "ma" },
  { title: "Workshop preset landing", type: "preset", status: "piszkozat", updated: "tegnap" },
  { title: "Ajanlatkero minta", type: "landing", status: "piszkozat", updated: "2 napja" },
];

export const blogPosts = [
  { title: "A jo webes rendszer nem a headernel dol el", category: "strategia", date: "2026-04-15" },
  { title: "Mitol hasznalhato egy admin felulet mobilon?", category: "office", date: "2026-04-12" },
  { title: "Mi a kulonbseg weboldal es rendszer kozott?", category: "termek", date: "2026-04-10" },
];

export const reports = [
  { metric: "Valaszido", value: "1 ora 24 perc", note: "utolso 7 nap" },
  { metric: "Leadbol ugyfel", value: "31%", note: "utolso 30 nap" },
  { metric: "Posztok pontosan kimentek", value: "96%", note: "utolso 14 nap" },
  { metric: "Uj tartalom", value: "8 oldal / 3 cikk", note: "aktualis honap" },
];

export const blueprintSections = [
  "Core adatmodell",
  "Jogosultsagmatrix",
  "Demo presetek",
  "Office route-terkep",
  "Social scheduler logika",
  "V1 - V3 fejlesztesi utem",
];

export const officeNav = {
  field: [
    { href: "/office", label: "Vezerlopult" },
    { href: "/office/projects", label: "Projektkozpont" },
    { href: "/office/subcontractors", label: "Szakipar" },
    { href: "/office/tasks", label: "Teendok" },
    { href: "/office/calendar", label: "Idopontok" },
    { href: "/office/messages", label: "Uzenetek" },
  ],
  admin: [
    { href: "/office/contacts", label: "Emberek" },
    { href: "/office/leads", label: "Erdeklodok" },
    { href: "/office/content", label: "Oldalak" },
    { href: "/office/blog", label: "Blog" },
    { href: "/office/social", label: "Kozossegi posztok" },
    { href: "/office/media", label: "Media" },
    { href: "/office/modules", label: "Halado modulok" },
    { href: "/office/events", label: "Esemenyek" },
    { href: "/office/reports", label: "Riportok" },
    { href: "/office/blueprint", label: "Rendszerterv" },
    { href: "/office/settings", label: "Beallitasok" },
  ],
};
