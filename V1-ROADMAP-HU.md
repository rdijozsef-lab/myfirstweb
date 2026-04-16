# MyFirstOffice V1 roadmap es backlog

## 1. Cel

Ez a dokumentum az [ARCHITECTURE-HU.md](./ARCHITECTURE-HU.md) strategiai leirasat bontja le konkret, fejlesztheto V1 feladatokra.

## 2. V1 definicio

A V1 akkor tekintheto kesznek, ha:

- a publikus reteg es az office reteg kozos termekelmenyt ad
- a login es vedett office hasznalat stabil
- a CRM alapfolyamat valodi adatokkal mukodik
- legalabb egy modul teljesen vegigvitt uzleti erteket ad
- a tobbi modul hiteles demoallapotban van

## 3. V1 prioritasok

### P0 - kotelezo alap

- hitelesites es session stabilizalasa
- szerepkorok es alap jogosultsagok
- contact / lead / task / calendar domain tisztazasa
- dashboard hasznos napi nezetekkel
- activity log alap
- hibamentes CRUD a core modulokban

### P1 - eros V1 funkciok

- messages alapmodul
- CMS oldalkezeles alap
- media kezelo alap
- dashboard gyorsmuveletek
- elso valodi modul

### P2 - demo vagy kovetkezo koros elemek

- social scheduler alap
- riportok elso verzio
- preset-specifikus kepernyok
- workflow automatizmusok

## 4. Elso teljesen vegigvitt folyamat

Az elso, teljesen mukodo folyamat:

1. publikus kapcsolatfelvetel vagy ajanlatkeres
2. automatikus lead letrehozas
3. kapcsolat rekord letrehozasa vagy osszekapcsolasa
4. felelos hozzarendelese
5. feladat letrehozasa
6. esemeny rogzitese
7. statuszfrissites
8. activity log bejegyzes
9. dashboard visszajelzes

## 5. Elso fejlesztendo modul

Javasolt elso modul: `ajanlatkero`

Indoklas:

- kozvetlenul kapcsolodik a jelenlegi CRM maghoz
- gyors uzleti erteket ad
- jol demozhato publikus es office oldalon is
- kesobb tobb presetbe is beillesztheto
- kisebb kockazatu, mint a workshop vagy webshop elso korben

## 6. Backlog epicek

### Epic 1 - Core domain stabilizalas

- Contact modell bovitese statusz es ugyfelelettel
- Lead eletciklus pontositasa
- Task model bovitese megjegyzes / modul kapcsolat irannyal
- CalendarEvent model bovitese online linkkel es emlekezteto irannyal
- kozponti enumok felulvizsgalata

### Epic 2 - Jogosultsag es audit

- szerepkorok veglegesitese
- route-szintu vedelem
- muvelet-szintu jogosultsag
- activity log tabla
- alap naplozasi hookok a core muveletekhez

### Epic 3 - CRM workflow

- kapcsolat lista szurokkel
- lead lista teljes statuszfolyamattal
- kapcsolat adatlap
- lead reszletoldal
- kapcsolodo taskok es esemenyek
- ugyfelle valtas vagy allapotfrissites

### Epic 4 - Dashboard 2.0

- mai teendok
- mai esemenyek
- friss leadek
- figyelmeztetesek
- gyorsmuveletek
- modulonkenti kiemelt kartyak

### Epic 5 - Ajanlatkero modul alap

- ajanlatkeres publikus urlap
- tobb mezo / lepes tamogatasa
- fajlfeltoltes helye vagy kesobbi helye
- lead automatikus letrehozas
- kapcsolodasi logika contact rekordhoz
- belso admin nezet
- statuszfrissites

### Epic 6 - Messages alap

- beerkezo uzenet rekord
- statuszok
- ugyfelhez / kontakthoz rendeles
- belso megjegyzes
- dashboard jelzes

### Epic 7 - CMS es media alap

- oldal lista
- oldal szerkesztes alap mezoivel
- blokkmodell elso verzio
- mediaelemek listazasa
- kep / dokumentum metaadatok

## 7. V1 kepernyok

Kotelezo kepernyok:

- `/login`
- `/office`
- `/office/contacts`
- `/office/contacts/[id]`
- `/office/leads`
- `/office/leads/[id]`
- `/office/tasks`
- `/office/calendar`
- `/office/messages`
- `/office/content`
- `/office/media`
- `/office/modules`
- `/office/settings`

Kotelezo publikus demo kepernyok:

- `/`
- `/rendszer`
- `/demo`
- elso ajanlatkero demo oldal

## 8. Donesag feltetelek

Egy feature akkor tekintheto kesznek, ha:

- van hozza adatmodell vagy meglovo modellre epul
- van hozza mukodo UI
- mobilon hasznalhato
- a navigacioba ertelmesen illeszkedik
- demoadatokkal kiprobalhato
- nincs nyilvanvalo torott allapot

## 9. Kozvetlen kovetkezo fejlesztesi kor

Az ajanlott kovetkezo konkret implementacios kor:

1. Prisma schema bovitese az activity log es pontosabb CRM eletciklus miatt
2. role / permission ellenorzes bevezetese
3. contact es lead reszletoldalak eroszitese
4. dashboard gyorsmuveletek
5. ajanlatkero modul MVP

## 10. Fontos scope-szabaly

A V1-ben az a cel, hogy kevesebb dolog legyen, de az vegigvitt legyen.

Ezert:

- egy teljes modul tobbet er, mint harom felkesz modul
- egy teljes workflow tobbet er, mint sok ures menupont
- a hiteles demozhatosag fontosabb, mint a funkciok mennyisege
