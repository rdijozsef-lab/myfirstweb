# Statikus Publikus Csomag

Ez a mappa a MyFirstOffice publikus, sima tarhelyre feltoltheto valtozata.

## Mire jo

- mukodik Node.js nelkul
- FTP-vel vagy tarhelykezelo felulettel feltoltheto
- tartalmazza a publikus oldalakat:
  - `index.html`
  - `rendszer.html`
  - `demo.html`

## Mire nem jo

Ez a csomag nem tartalmaz mukodo szerveroldali office rendszert.

Nem fog mukodni benne:

- login
- admin
- projektek belso kezelese
- adatbazis
- Prisma
- dokumentacio feltoltes
- workflow-k

## Feltoltes

1. Nyisd meg a `static-public` mappat.
2. Toltsd fel a benne levo osszes fajlt es mappat a tarhely gyokerkonyvtaraba.
3. Figyelj ra, hogy az `assets` mappa is felkeruljon.
4. A nyitooldal az `index.html` legyen.

## Fontos

Ha a domain gyokerbe toltod fel, akkor ezek az oldalak lesznek elerhetok:

- `https://teoldalad.hu/`
- `https://teoldalad.hu/rendszer.html`
- `https://teoldalad.hu/demo.html`

## Kesobbi bovites

Ha kesobb lesz Node.js-es tarhely vagy VPS:

- a teljes Next.js + Prisma app kulon is elesitheto
- ez a statikus csomag megtarthato publikus bemutato retegnek
