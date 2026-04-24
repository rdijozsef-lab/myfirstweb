# MyFirstOffice - Feltoltesi es Elesitesi Utmutato

Ez a projekt nem statikus HTML oldal, hanem `Next.js + Prisma` alkalmazas.

Ez azt jelenti, hogy a feltolteshez olyan tarhely kell, ahol futtathato:

- `Node.js`
- a szerver oldali `Next.js`
- a `Prisma`

## Milyen tarhelyre jo?

Mukodik:

- VPS
- sajat szerver
- Node.js app hosting
- olyan cPanel/plesk tarhely, ahol kulon Node.js alkalmazas indithato

Nem jo:

- sima statikus webtarhely
- olyan hely, ahova csak HTML/CSS/JS fajlt lehet feltolteni

## Vercelhez ajanlott adatbazis

Vercelen ehhez a projekthez kulso PostgreSQL adatbazis ajanlott.

- jo valasztas: Neon, Supabase, Railway vagy sajat PostgreSQL
- a teljes app ugyanazzal a `DATABASE_URL` kapcsolattal fut
- deploy utan futtasd a schema szinkront es a seedet is

## A projekt most milyen feltoltesre van elokeszitve?

A projekt mar `standalone` buildre van allitva, vagyis az `npm run build` utan a Next.js elo tud allitani egy kulon futtathato szervercsomagot.

Erintett beallitas:

- [next.config.ts](</j:/Webes melók/myfirstoffice-tailwind-prisma-v1/next.config.ts>)
- [package.json](</j:/Webes melók/myfirstoffice-tailwind-prisma-v1/package.json>)

## Szerver oldali minimum fajlok

Ezek kellenek a szerverre:

- teljes projekt vagy standalone build
- `.env`
- `prisma` mappa
- `public` mappa

## Legbiztosabb telepitesi menet

1. A szerveren legyen Node.js telepitve.
2. Masold fel a projektet.
3. Hozd letre a szerveren a `.env` fajlt.
4. Telepitsd a csomagokat:

```bash
npm install
```

5. Generald a Prisma klienst:

```bash
npm run prisma:generate
```

6. Hozd szinkronba az adatbazist:

```bash
npm run db:deploy
```

7. Ha kell demo adat:

```bash
npm run db:seed
```

8. Build:

```bash
npm run build
```

9. Inditas:

```bash
npm run start
```

## Szükséges .env szerveren

Pelda:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="ide-egy-nagyon-hosszu-eros-titok-kell"
RUN_DB_SEED="true"
```

## Fontos megjegyzes PostgreSQL-hez

A mostani projekt `PostgreSQL` kapcsolatra van elokeszitve.

- lokalis fejleszteshez is ugyanilyen kulso DB ajanlott
- Vercelben a `DATABASE_URL` es `AUTH_SECRET` legyen beallitva
- az elso deploy utan szukseges a schema es a seed feltoltese

## Ajánlott indulasi mod

Ha gyorsan akarod elesiteni:

1. Node.js-es tarhely vagy VPS
2. `.env` beallitasa
3. `npm install`
4. `npm run prisma:generate`
5. `npm run db:deploy`
6. `npm run build`
7. `npm run start`

## Mit kell tudni elore?

Ha azt mondod, hogy "weboldalamra feltolteni", akkor itt valojaban nem FTP-s sima feltoltesrol van szo, hanem alkalmazas-inditasrol.

Tehat a helyes kerdes itt inkabb ez:

`van-e olyan tarhelyed, ahol Node.js alkalmazast lehet futtatni?`

Ha igen, ez a projekt most mar arra van elokeszitve.
