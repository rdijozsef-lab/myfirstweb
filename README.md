# MyFirstOffice Tailwind + Prisma starter

Ez a csomag a MyFirstWeb uj iranyanak dolgozhato alapja.

## Mi van benne?

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM
- lokalis SQLite fejlesztoi adatbazis Prisma ORM-mel
- sajat bejelentkezes session cookie-val
- mukodo backend az alabbi modulokhoz:
  - Contacts
  - Leads
  - Tasks
  - Calendar
- Office dashboard valos Prisma adatokkal
- Hazaepitok Minositett Kivitelezesi Rendszer MVP:
  - partner minosites
  - projektinditas sablon munkafazisokkal
  - kotelezo dokumentacios requirementek
  - checkpoint dontesek
  - audit log
  - in-app ertesitesek
  - megrendeloi portal
  - zaro csomag metaadat
- demozhato publikus oldalak es office strukturak

## Elso telepites

1. Csomagold ki a projektet uj mappaba.
2. Nyisd meg VS Code-ban.
3. Hozd letre a `.env` vagy `.env.local` fajlt az `.env.example` alapjan.

Pelda:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="itt-legyen-egy-hosszu-sajat-titok"
```

4. Telepites:

```bash
npm install
```

5. Prisma client generalas:

```bash
npm run prisma:generate
```

6. Adatbazis letrehozas / schema betoltes:

```bash
npm run prisma:push
```

7. Seed adatok feltoltese:

```bash
npm run db:seed
```

8. Fejlesztoi inditas:

```bash
npm run dev
```

## Demo login

- Felhasznalonev: `admin`
- Jelszo: `admin123`

Minositett kivitelezesi szerepkoros demo loginok:

- Super admin: `admin` / `admin123`
- Fovallalkozo admin: `fovallalkozo` / `demo123`
- Alvallalkozo: `alvallalkozo` / `demo123`
- Muszaki ellenor: `ellenor` / `demo123`
- Megrendelo: `megrendelo` / `demo123`

Belepes utan: `http://localhost:3000/office`

Az uj minositett kivitelezesi MVP elerese:

- Admin dashboard: `http://localhost:3000/dashboard`
- Projektek: `http://localhost:3000/dashboard/projects`
- Partnerek: `http://localhost:3000/dashboard/partners`
- Ellenorzesek: `http://localhost:3000/dashboard/checkpoints`
- Megrendeloi portal: `http://localhost:3000/portal`

## Fo route-ok

- `/` publikus fooldal
- `/rendszer` rendszeroldal
- `/demo` demo oldal
- `/login` belepes
- `/office` dashboard
- `/office/contacts` kapcsolatok
- `/office/leads` leadek
- `/office/tasks` feladatok
- `/office/calendar` naptar
- `/dashboard` minositett kivitelezesi admin dashboard
- `/dashboard/projects` minositett projektek
- `/dashboard/partners` partnerkezeles
- `/dashboard/checkpoints` ellenorzesi pontok
- `/portal` megrendeloi portal

## Megjegyzesek

- A mostani fejlesztoi verzio lokalis SQLite adatbazissal fut, hogy azonnal kiprobalhato legyen.
- Supabase/PostgreSQL elokesziteshez kulon PostgreSQL schema-generalas van:
  - `npm run prisma:sync:pg`
  - `npm run prisma:generate:pg`
  - `npm run prisma:push:pg`
  - reszletes leiras: [SUPABASE-HU.md](</j:/Webes melók/myfirstoffice-tailwind-prisma-v1/SUPABASE-HU.md>)
- A munkafazis fajlfeltoltes lokalis MVP-ben a `public/uploads` ala ment.
- A social, messages, content es tobbi office oldal jelenleg UI-vaz / demo szint.
- A Contacts, Leads, Tasks es Calendar modulok mar valodi backenddel mennek.
- A projekt nem statikus oldal, hanem Node.js-t igenylo Next.js alkalmazas.
- Elesitesi lepesek: [DEPLOY-HU.md](</j:/Webes melók/myfirstoffice-tailwind-prisma-v1/DEPLOY-HU.md>)

## Kovetkezo logikus fejlesztes

- Auth finomitas es jogosultsagmatrix
- Contact / Lead / Task reszletes szerkesztes
- Notes timeline es activity log
- Social scheduler adatmodell
- Messages / chat backend
- Multi-tenant ugyfelkezeles
