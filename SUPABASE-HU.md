# Supabase / PostgreSQL elokeszites

Ez a projekt jelenleg **lokalis SQLite fejlesztoi modban** fut, hogy azonnal kiprobalhato legyen. A repository most mar tartalmaz kulon PostgreSQL schema-generalasi utvonalat is, igy a Supabase-ra atallas elokeszitve van anelkul, hogy a lokalis demo szetessen.

## Mi tortenik?

- `prisma/schema.prisma` marad a gyors SQLite fejlesztoi schema
- `npm run prisma:sync:pg` legeneralja a `prisma/schema.postgres.prisma` fajlt
- a `:pg` script-ek ezt a PostgreSQL schema valtozatot hasznaljak

## Szükséges `.env`

Pelda Supabase-hoz:

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
AUTH_SECRET="egy-hosszu-eros-titok"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

Ha kulon direct connectiont is hasznalsz migraciokhoz vagy admin muveletekhez, akkor opcionálisan felveheted ezt is:

```env
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

## Parancsok

1. PostgreSQL schema generalasa:

```bash
npm run prisma:sync:pg
```

2. Prisma client generalasa PostgreSQL-hoz:

```bash
npm run prisma:generate:pg
```

3. Schema push:

```bash
npm run prisma:push:pg
```

4. Seed:

```bash
npm run db:seed
```

## Fontos

- A `prisma:generate:pg` parancs utan a Prisma client PostgreSQL connectorrel generalodik.
- Ha ezutan vissza akarsz terni a lokalis SQLite modhoz, futtasd ujra:

```bash
npm run prisma:generate
```

## Mi nincs meg teljesen?

Ez az elokeszites meg nem teljes Supabase-integracio. Tovabbra is hianyzik:

- Supabase Auth tenyleges hasznalata a sajat session auth helyett
- Supabase Storage kozvetlen bekotes a helyi `public/uploads` helyett
- RLS policy-k SQL szinten
- deployment ellenorzes valodi Supabase projekttel

Viszont a Prisma/PostgreSQL atallas technikailag mar el van keszitve, es a lokalis demo kozben nem torik el.
