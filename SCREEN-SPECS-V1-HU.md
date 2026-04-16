# MyFirstOffice V1 kepernyok es urlapok

## 1. Cel

Ez a dokumentum a V1 kotelezo kepernyoit, azok fo elemeit es az alap urlapmezoket rogziti.

A cel:

- egyertelmu implementacios lista
- route-rol route-ra halado fejlesztes
- olyan V1 scope, ami hasznalhato es demozhato

## 2. Globalis UI szabalyok

- Minden office kepernyon legyen mobilon is hasznalhato elrendezes.
- A listaoldalakon legyen keresés, statusz vagy tipus szerinti szures, es alap rendezés.
- A reszletoldalakon legyen jobb oldali vagy also "kapcsolodo elemek" blokk.
- Az urlapoknal a kotelezo mezok legyenek minimalisak, a tobbi fokozatosan bovitheto.
- Minden mentes utan legyen siker-visszajelzes.

## 3. Auth

### 3.1. `/login`

Celpont:

- belepes office rendszerbe

Elemek:

- felhasznalonev vagy email
- jelszo
- belepes gomb
- hibaallapot
- opcionális `next` redirect kezeles

URLap mezok:

- `username`
- `password`
- `next`

## 4. Dashboard

### 4.1. `/office`

Celpont:

- napi operacios attekinto

Fobb blokkok:

- KPI kartyak
- mai feladatok
- kozelgo esemenyek
- friss leadek
- uj uzenetek
- figyelmeztetesek
- gyorsmuveletek

Gyorsmuveletek:

- uj kapcsolat
- uj lead
- uj feladat
- uj esemeny
- uj ajanlatkeres kezeles

## 5. Contacts

### 5.1. `/office/contacts`

Celpont:

- kapcsolatlista kezeles

Lista oszlopok:

- nev
- ceg
- email
- telefon
- forras
- statusz
- felelos
- utolso aktivitas

Szurok:

- statusz
- forras
- felelos
- cimkek

Muveletek:

- uj kapcsolat
- szerkesztes
- reszlet megnyitas
- archivalas

### 5.2. `/office/contacts/[id]`

Celpont:

- teljes ugyfel / kapcsolat adatlap

Fo blokkok:

- alapadatok
- allapot
- belso jegyzet
- kapcsolodo leadek
- kapcsolodo feladatok
- kapcsolodo esemenyek
- kapcsolodo uzenetek
- activity timeline
- csatolt fajlok

Alap szerkesztheto mezok:

- `name`
- `company`
- `email`
- `phone`
- `secondaryPhone`
- `addressLine`
- `city`
- `postalCode`
- `website`
- `source`
- `status`
- `ownerId`
- `notes`
- `tags`

## 6. Leads

### 6.1. `/office/leads`

Celpont:

- lead pipeline es lista

Lista oszlopok:

- cim
- kapcsolat
- statusz
- forras
- felelos
- ertek
- hatarido
- frissitve

Szurok:

- statusz
- forras
- felelos
- hatarido

Muveletek:

- uj lead
- statuszvaltas
- felelos hozzarendeles
- reszlet

### 6.2. `/office/leads/[id]`

Celpont:

- lead eletciklus kezelese

Fo blokkok:

- lead osszegzes
- statusz lepteto
- kapcsolodo kapcsolat
- kapcsolodo feladatok
- kapcsolodo esemenyek
- activity timeline
- ajanlatkeres eredet

Lead szerkesztheto mezok:

- `title`
- `description`
- `status`
- `source`
- `ownerId`
- `valueLabel`
- `estimatedValue`
- `dueAt`
- `lostReason`

Inline muveletek:

- task letrehozas
- esemeny letrehozas
- statusz valtas
- contact megnyitas

## 7. Tasks

### 7.1. `/office/tasks`

Celpont:

- napi es csapat feladatok kezelese

Nezetek:

- minden feladat
- mai feladatok
- sajat feladataim
- lejart

Lista oszlopok:

- cim
- statusz
- prioritas
- felelos
- kapcsolat
- lead
- hatarido

URLap mezok uj feladathoz:

- `title`
- `description`
- `status`
- `priority`
- `ownerId`
- `contactId`
- `leadId`
- `moduleKey`
- `dueAt`

## 8. Calendar

### 8.1. `/office/calendar`

Celpont:

- minden idobeli elem egy helyen

Nezetek:

- napi
- heti
- havi
- lista

Esemeny kartyan:

- cim
- tipus
- kezdes
- vege
- kapcsolat
- helyszin vagy meeting link
- felelos

Uj esemeny mezok:

- `title`
- `description`
- `type`
- `startsAt`
- `endsAt`
- `contactId`
- `leadId`
- `ownerId`
- `location`
- `meetingUrl`
- `moduleKey`

## 9. Messages

### 9.1. `/office/messages`

Celpont:

- beerkezo kommunikacio kozponti kezelese

Fo felulet:

- bal oldali thread lista
- kozepso beszelgetes nezet
- jobb oldali kapcsolat / statusz panel

Thread lista mezok:

- csatorna
- targy vagy kivonat
- kapcsolat
- statusz
- unread jelzes
- utolso aktivitas

Muveletek:

- hozzarendeles
- statusz valtas
- belso jegyzet
- valasz
- spam

Thread mezok:

- `channel`
- `status`
- `contactId`
- `assignedToUserId`
- `subject`

Uzenet mezok:

- `body`
- `direction`
- `authorUserId`

## 10. Content

### 10.1. `/office/content`

Celpont:

- oldalak listaja es alap kezeles

Lista oszlopok:

- cim
- slug
- tipus
- statusz
- frissitve
- publiklalas ideje

Muveletek:

- uj oldal
- szerkesztes
- duplikalas
- publiklalas

### 10.2. javasolt kovetkezo route: `/office/content/[id]`

Fo blokkok:

- oldal alapadatok
- SEO mezok
- blokklista
- publiklalasi allapot

Oldal mezok:

- `title`
- `slug`
- `type`
- `excerpt`
- `seoTitle`
- `seoDescription`
- `status`
- `scheduledFor`

Block editor minimum:

- blokk tipus valasztas
- sorrend
- blokk adat szerkesztes

## 11. Blog

### 11.1. `/office/blog`

Celpont:

- cikklista es publikacios workflow

Lista oszlopok:

- cim
- kategoria
- szerzo
- statusz
- datum

Uj cikk minimum mezok:

- `title`
- `slug`
- `excerpt`
- `body`
- `category`
- `authorId`
- `status`
- `publishedAt`

## 12. Media

### 12.1. `/office/media`

Celpont:

- mediaelemek listazasa es metaadat kezelese

Lista vagy grid elemei:

- elonezet
- cim
- tipus
- meret
- mappa
- feltolto

Muveletek:

- feltoltes
- atnevezes
- alt text szerkesztes
- torles / archiv

Media mezok:

- `title`
- `kind`
- `altText`
- `caption`
- `folder`
- `tags`

## 13. Social

### 13.1. `/office/social`

Celpont:

- social posztok demozhato, de hiteles alapkezelese

Lista oszlopok:

- cim vagy kivonat
- platform
- statusz
- idozites
- felelos

Uj poszt minimum mezok:

- `platform`
- `text`
- `mediaAssetId`
- `status`
- `scheduledFor`

## 14. Modules

### 14.1. `/office/modules`

Celpont:

- aktiv es tervezett modulok attekintese

Kartyaelemek:

- modul neve
- rovid leiras
- statusz
- preset kapcsolat
- fo route-ok

V1-ben eleg:

- informacios kartyanezet
- aktiv / tervezett jeloles

## 15. Settings

### 15.1. `/office/settings`

Celpont:

- rendszer beallitasok es alap admin

V1 szekciok:

- profil
- altalanos rendszeradatok
- felhasznalok
- szerepkorok csak megjelenitve

Felhasznalo mezok:

- `name`
- `username`
- `email`
- `role`
- `isActive`

## 16. Elso modul: ajanlatkero

### 16.1. publikus oldal

Javasolt route:

- `/ajanlatkeres`

Fo blokkok:

- bemutato hero
- rovid szolgaltatas valaszto
- ajanlatkero urlap
- sikeres bekuldes allapot

Minimum mezok:

- `name`
- `company`
- `email`
- `phone`
- `serviceType`
- `budgetLabel`
- `deadlineLabel`
- `message`

### 16.2. office nezet

Javasolt route:

- `/office/modules/quote-requests`

Lista oszlopok:

- bekuldes ideje
- nev
- ceg
- szolgaltatas
- statusz
- kapcsolodo lead
- felelos

Muveletek:

- statuszfrissites
- lead letrehozas vagy kapcsolas
- kapcsolat megnyitas

## 17. Elso fejlesztesi sorrend a kepernyokhoz

1. `contacts/[id]` erosites
2. `leads/[id]` erosites
3. `messages` alap
4. `content` lista + alap szerkeszto
5. `ajanlatkeres` publikus oldal
6. `quote-requests` office lista
