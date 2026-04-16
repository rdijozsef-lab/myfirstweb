# MyFirstOffice - teljes rendszerleiras es mukodesi specifikacio

## Fontos iranyvaltas

A projekt aktiv V1 fokusza mar nem az altalanos office/CMS/CRM irany, hanem egy projektkozpontu, kivitelezoi digitalis epitesvezeto rendszer.

Az uj aktiv dokumentumok:

- `BUILDERS-V1-ARCHITECTURE-HU.md`
- `CONSTRUCTION-DOMAIN-V1-HU.md`

Ez a fajl megtarthato referenciaanyagkent a korabbi altalanos rendszeriranyhoz, de a kovetkezo implementacios koroket mar az uj epitoipari V1 szerint erdemes tervezni.

## 1. A rendszer celja

A MyFirstOffice celja, hogy a MyFirstWeb jelenlegi weboldal-kozpontu mukodeset egy valodi, kiprobalhato, modularis uzleti rendszerré alakitsa.

A rendszer nem egyszeruen egy weboldal-admin, hanem egy olyan kozponti platform, amely egy helyen kezeli:

- a publikus weboldalt
- a tartalmakat
- az erdeklodoket
- az ugyfeleket
- a feladatokat
- a naptarat
- az uzeneteket
- a kozossegi media jelenletet
- valamint az iparagi modulokat

A rendszer fo igerete nem az, hogy "weboldalt keszit", hanem az, hogy egyetlen keretrendszeren belul osszufuzi a ceg kulso megjeleneset es belso mukodeset.

## 2. Alapelvek

### 2.1. Modularis felepites

A rendszer kozos magra epul, es erre kapcsolodnak ra az iparagi vagy funkcionalis modulok.

### 2.2. Mobil-first hasznalhatosag

Az admin es office rendszer minden lenyeges eleme mobilon is jol kezelheto legyen.

### 2.3. Egyszeru kezelhetoseg

Nem vallalati monstrumot kell epiteni, hanem olyan rendszert, amit egy atlagos KKV tulajdonos vagy adminisztrator is megert.

### 2.4. Tobbfele cegre alkalmazhatosag

A rendszer alapja tobb ugyfeltipusra is alkalmas legyen, presetekkel es modulokkal testreszabva.

### 2.5. Kiprobalhatosag

A rendszer legyen demozhato frontend es admin oldalon is.

### 2.6. Skalazhatosag

Az elso verzio legyen egyszeru, de az adatmodell es a szerkezet legyen alkalmas kesobbi bovitesre.

## 3. A rendszer fo retegei

### 3.1. Publikus webes reteg

Ez az a resz, amit a latogato lat.

Feladata:

- markajelenlet
- szolgaltatasbemutatas
- tartalomfogyasztas
- bizalomepites
- kapcsolatinditas
- ajanlatkeres
- jelentkezes
- foglalas
- vasarlas vagy mas konverzio

### 3.2. Office reteg

Ez a belso mukodesi kozpont.

Feladata:

- leadek es ugyfelek kezelese
- teendok nyomon kovetese
- esemenyek kezelese
- belso adminisztracio
- kommunikacio
- tartalom es kampanyok iranyitasa

### 3.3. Tartalom- es marketingreteg

Ez biztositja a weboldal es a kozossegi media napi kezeleset.

Feladata:

- oldalak szerkesztese
- blog kezelese
- kozossegi posztok idozitese
- mediatar kezelese
- kampanyjellegu kommunikacio tamogatasa

### 3.4. Modulreteg

Ez tartalmazza az iparag-specifikus bovitmenyeket.

Peldak:

- workshop
- foglalas
- webshop light
- ajanlatkeres
- projekt / referencia
- esemenyek
- kesobb ingatlanos vagy kivitelezo modul

## 4. MyFirstOffice Core

A Core minden ugyfelnel kozos. Ez legyen a platform stabil alapja.

### 4.1. Hitelesites es jogosultsagkezeles

Funkciok:

- bejelentkezes
- kijelentkezes
- jelszo-visszaallitas
- tobb felhasznalo kezelese
- szerepkoralapu jogosultsag
- hozzaferesi szintek
- naplozas

Szerepkorok:

- Tulajdonos
- Admin
- Szerkeszto
- Operator
- Ertekesito / ugyfelkezelo
- Megtekinto

Naplozando muveletek:

- bejelentkezes
- tartalom modositas
- lead statuszvaltas
- ugyfel adatlap modositas
- feladat letrehozas vagy lezaras
- poszt letrehozas vagy publiklas
- rendeles / foglalas / jelentkezes allapotmodositas

### 4.2. Dashboard

A dashboard legyen a napi iranyitopult.

Tartalmazza:

- mai teendok
- mai esemenyek
- uj erdeklodok
- uj uzenetek
- uj workshop-jelentkezesek vagy rendelesek
- kozelgo posztok
- figyelmeztetesek
- gyorsmuveletek

Gyorsmuveletek:

- uj lead
- uj ugyfel
- uj feladat
- uj esemeny
- uj poszt
- uj oldal
- uj modul elem

### 4.3. Kapcsolatok / CRM alap

Ez a rendszer egyik legerosebb eleme.

Fo listak:

- Erdeklodok
- Ugyfelek
- Lezart ugyfelek
- Elveszett lehetosegek
- Visszatero ugyfelek

Kapcsolat adatlap mezoi:

- nev
- cegnev
- telefonszam
- email
- cim
- weboldal
- forras
- statusz
- cimkek
- kapcsolattarto
- belso jegyzet
- kapcsolodo feladatok
- kapcsolodo esemenyek
- kapcsolodo uzenetek
- kapcsolodo urlapok
- kapcsolodo ajanlatkeresek
- kapcsolodo rendelesek vagy jelentkezesek
- csatolt fajlok
- hivas / email / chat gyorsgombok

Lead statuszok:

- uj
- kapcsolatba lepve
- egyeztetes alatt
- ajanlat elkuldve
- visszajelzesre var
- aktiv ugyfel
- lezarva
- elveszett

### 4.4. Kommunikacios kozpont

Cel:

Minden beerkezo kapcsolatot es belso kommunikaciot egy helyen kezelni.

Tartalmazza:

- kapcsolatfelveteli urlapok
- emailnaplo
- live chat beszelgetesek
- hivasjegyzetek
- belso kommentek
- automata valaszok
- ugyfelhez kapcsolt kommunikacios tortenet

Uzenetnezetek:

- uj
- valaszra var
- folyamatban
- lezart
- spam

### 4.5. Feladatkezelo

Cel:

A napi mukodest egyszeru, gyors teendokezelessel tamogatni.

Minden feladat mezoi:

- cim
- leiras
- felelos
- hatarido
- prioritas
- statusz
- kapcsolodo ugyfel
- kapcsolodo modul
- megjegyzesek
- csatolmanyok

Statuszok:

- uj
- folyamatban
- varakozik
- kesz
- lezarva

Nezetek:

- mai feladatok
- sajat feladataim
- csapatfeladatok
- ugyfelhez kapcsolt feladatok
- lejart feladatok

### 4.6. Naptar

Cel:

A rendszerben minden idoalapu esemeny kozos naptarba keruljon.

Kezelje:

- hivasokat
- talalkozokat
- workshopokat
- foglalasokat
- hataridoket
- tartalomidiziteseket
- belso emlekeztetoket

Nezetek:

- napi
- heti
- havi
- lista

Esemeny mezoik:

- cim
- tipus
- kezdes
- befejezes
- ugyfel
- helyszin
- online link
- felelos
- megjegyzes
- emlekezteto
- kapcsolodo modul

### 4.7. Tartalomkezelo (CMS)

Cel:

A publikus weboldal blokk-alapu, konnyen kezelheto szerkesztese.

Kezelje:

- oldalakat
- menuket
- lablecet
- szekciokat
- mediaelemeket
- SEO mezoket
- publiklalast
- idozitett publiklalast

Alap blokktipusok:

- Hero
- Szoveges blokk
- Kep + szoveg
- Szolgaltataslista
- Referenciak
- CTA blokk
- Velemenyek
- FAQ
- Galeria
- Video blokk
- Bloglista
- Kapcsolat blokk
- Urlap blokk

### 4.8. Media- es fajlkezelo

Funkciok:

- kep feltoltes
- dokumentum feltoltes
- video linkek
- cimkezes
- mappazas
- alt text
- automatikus kepmeret optimalizalas
- felhasznalasi helyek nyomon kovetese

### 4.9. Riportok es alap statisztika

Cel:

Egyszeru uzleti atlatas, nem tulterhelt BI.

Mutatok:

- uj erdeklodok
- valaszido
- feladatallapotok
- workshop jelentkezesek
- rendelesek
- foglalasok
- blogforgalom alap szinten
- nepszeru oldalak
- idozitett posztok

## 5. Modulrendszer

A modulok kulon aktivalhato funkciocsomagok legyenek.

### 5.1. Ajanlatkero modul

Cel:

A kapcsolatfelvetel helyett strukturalt ajanlatkerest adni.

Funkciok:

- tobb lepeses urlap
- egyedi kerdesek
- fajlfeltoltes
- automatikus lead letrehozas
- statuszkezeles
- kapcsolodo ugyfelrekord
- belso megjegyzesek
- kesobb ajanlatgeneralas

### 5.2. Foglalasi modul

Funkciok:

- szolgaltatasok kezelese
- idopontsavok
- kapacitaskezeles
- visszaigazolas
- naptarkapcsolat
- ugyfelkapcsolas
- admin jovahagyas opcio

### 5.3. Workshop / esemenymodul

Funkciok:

- esemenyek letrehozasa
- helyszinek
- ferohelyszam
- jelentkezesi lista
- fizetesi statusz
- varolista
- export
- automatikus visszaigazolasok

### 5.4. Webshop light

Funkciok:

- termekek
- kategoriak
- keszlet alap szinten
- rendeleslista
- rendelesi statuszok
- atveteli es szallitasi mod
- egyszeru kedvezmenyek kesobb

### 5.5. Referencia / projekt modul

Funkciok:

- projektek
- kategoriak
- kepgaleria
- reszletes projektoldal
- helyszin
- datum
- ugyfel nev
- kiemelt projekt

### 5.6. Blog / cikk modul

Funkciok:

- cikkek
- kategoriak
- cimkek
- szerzok
- idozitett publiklalas
- kiemeles
- bloglista

### 5.7. Kozossegi media modul

Cel:

Egy helyrol lehessen kezelni a kozossegi kommunikaciot.

Alapfunkciok:

- poszt letrehozas
- platform valasztas
- szoveg
- kep
- video link
- piszkozat
- jovahagyas
- idozites
- publiklalasi naplo
- posztnaptar
- sablonok

Kezelt platformok a kesobbi API lehetosegek szerint:

- Facebook oldal
- Instagram business
- LinkedIn oldal
- Google Business Profile
- kesobb tovabbi csatornak

Poszt allapotok:

- piszkozat
- jovahagyasra var
- idozitve
- publiklalva
- sikertelen
- archivalt

Kesobbi bovitesek:

- kommentfigyeles
- statisztika
- automatikus posztjavaslat
- blogbol poszt keszitese
- termekbol poszt keszitese

### 5.8. Chat modul

Alap:

- weboldali chat widget
- admin beszelgeteslista
- ugyfelhez rendeles
- sablonvalaszok
- operator hozzarendeles

Kesobb:

- AI eloszures
- Messenger / Instagram / WhatsApp integracio, ha uzletileg indokolt

### 5.9. Ertesitesi modul

Funkciok:

- email ertesitesek
- rendszerertesitesek
- esemeny emlekeztetok
- uj lead ertesites
- uj chat ertesites
- poszt idozites visszajelzes
- workshop / rendeles / foglalas ertesites

## 6. Preset rendszerek

A modulok onmagukban meg nem eladhatoak minden ugyfelnek. Ezert kell preset logika.

### 6.1. Szolgaltatoi preset

Tartalma:

- bemutatkozo oldalak
- szolgaltatasoldalak
- ajanlatkero
- leadkezeles
- referencia blokk
- alap social modul

### 6.2. Workshop preset

Tartalma:

- esemenyek
- jelentkezes
- ferohelykezeles
- fizetesi statusz
- resztvevolista
- idozitett kommunikacio

### 6.3. Webshop light preset

Tartalma:

- termekek
- rendelesek
- pickup / szallitas
- tartalomkezeles
- kozossegi kommunikacio

### 6.4. Kivitelezo / szolgaltatoi ajanlatkeros preset

Tartalma:

- szolgaltatasok
- referenciak
- ajanlatkeres
- fajlfeltoltes
- leadkezeles
- naptar + feladatkapcsolat

## 7. Mukodesi folyamatok

### 7.1. Leadbol ugyfel folyamat

1. A latogato kapcsolatba lep az oldalon.
2. A rendszer letrehoz egy lead rekordot.
3. A lead megjelenik a dashboardon es a lead listaban.
4. Hozzarendelheto felelos.
5. Hivas / email / chat tortenik.
6. Jegyzet es feladat jon letre.
7. Statusz valt: uj -> egyeztetes alatt -> ajanlat elkuldve -> aktiv ugyfel.
8. Az ugyfel teljes tortenete nyomon kovetheto.

### 7.2. Tartalomkezelesi folyamat

1. Admin vagy szerkeszto letrehoz oldalt vagy cikket.
2. Blokkokkal felepiti.
3. Kepet es SEO adatokat rendel hozza.
4. Mentes piszkozatkent.
5. Jovahagyas / publiklalas.
6. Szu kseg eseten idozitett publiklalas.

### 7.3. Kozossegi media folyamat

1. Poszt letrehozas a social modulban.
2. Platform kivalasztasa.
3. Szoveg es media feltoltese.
4. Idozites vagy azonnali publiklalas.
5. A poszt bekerul a naptarba.
6. Publiklalas utan naplozas.
7. Kesobb teljesitmeny is merheto.

### 7.4. Workshop folyamat

1. Esemeny letrehozas.
2. Ferohely es helyszin beallitas.
3. Jelentkezes fogadasa.
4. A jelentkezok listaba kerulnek.
5. Fizetesi statusz rogzitese.
6. Resztvevok exportalhatok.
7. Visszaigazolas kuldheto.

## 8. Admin menustruktura javaslat

Fomenu:

- Dashboard
- Kapcsolatok
- Leadek
- Feladatok
- Naptar
- Uzenetek
- Oldalak
- Blog
- Media
- Kozossegi media
- Modulok
- Riportok
- Beallitasok

Modulonkent megjeleno almenuk:

Peldak workshop esetere:

- Esemenyek
- Jelentkezok
- Varolista
- Exportok

Peldak webshop esetere:

- Termekek
- Kategoriak
- Rendelesek
- Szallitas / atvetel

## 9. Technikai mukodes magas szinten

Ajánlott technikai alap:

- Next.js + React + TypeScript
- kozos app, kulon publikus es office reszekkel
- PostgreSQL adatbazis a kesobbi elesitett verziohoz
- Prisma ORM
- jogosultsagi rendszer
- kesobb multi-tenant architektura

Jelenlegi projektallapot:

- Next.js App Router
- React 19
- Tailwind 4
- Prisma ORM
- SQLite starter adatbazis
- sajat JWT session cookie

Route logika:

- `/` publikus fooldal
- `/rendszer` termekoldal
- `/demo` kiprobalhato demok
- `/login` belepes
- `/office` office dashboard
- `/office/contacts`
- `/office/leads`
- `/office/tasks`
- `/office/calendar`
- `/office/messages`
- `/office/content`
- `/office/social`
- `/office/media`
- `/office/modules`
- `/office/reports`
- `/office/settings`

## 10. Jelenlegi V1 allapot

Valodi backend modullal rendelkezo reszek:

- auth / login
- contacts
- leads
- tasks
- calendar
- dashboard statisztika

UI / demo szintu reszek:

- content
- blog
- social
- media
- modules
- reports
- events special modul
- settings
- messages alap

## 11. Fejlesztesi utemezes

### V1 - mukodo alap

Tartalmazza:

- auth es jogosultsag
- dashboard
- kapcsolatok / leadek
- feladatok
- naptar
- CMS alap
- media kezelo
- uzenetkezeles alap
- social idozito alap
- workshop vagy ajanlatkero modul elsokent

### V2 - uzleti melyites

Tartalmazza:

- automatizmusok
- reszletesebb riportok
- fejlettebb social
- chat fejlesztes
- PDF / ajanlat alap
- ertesitesi logika
- tovabbi presetek

### V3 - termekesites es skalazas

Tartalmazza:

- tobbtenantos mukodes
- demo admin
- konfigurator
- ugyfelenkent aktivalhato modulok
- melyebb API integraciok
- mobil / PWA funkciok

## 12. Vegso uzleti ertek

A MyFirstOffice vegso celja, hogy a MyFirstWeb ne egy "weboldalt epito szolgaltatas" legyen, hanem egy olyan platform, amely:

- kezzelfoghato
- kiprobalhato
- modularis
- konnyen ertheto
- gyorsan testreszabhato
- valos uzleti mukodest tamogat

A rendszer valodi ereje nem a dizajnban lesz, hanem abban, hogy egyetlen egysegbe fogja ossze:

- a megjelenest
- a tartalmat
- a leadeket
- a napi mukodest
- es a kommunikaciot

Ez lesz az a pont, ahol a MyFirstWeb mar nem "egyedi weboldalakat keszit", hanem sajat platformra epulo rendszereket ad.

## 13. Kovetkezo konkret lepesek

A kovetkezo fejlesztesi szinthez ezeket kell reszletezni:

1. pontos menustruktura kepernyonkent
2. adatmodellek tablaszinten
3. jogosultsagmatrix
4. V1 kepernyok es urlapok
5. elsokent fejlesztendo modul kivalasztasa
6. demo logika meghatarozasa

## 14. Aktualis strategiai ajanlas

A jelenlegi kodbazis alapjan a kovetkezo fejlesztesi sorrend javasolt:

1. Core domainmodell tisztazasa
2. jogosultsagmatrix bevezetese
3. activity log / audit log
4. teljes lead -> ugyfel workflow vegigvitele
5. dashboard gyorsmuveletek
6. messages alap kiepitese
7. CMS alap adatmodell
8. social scheduler alap
9. elso teljes modul: ajanlatkero

Az elso vegigvitt uzleti folyamat ajanlott iranya:

`lead -> kapcsolat -> feladat -> esemeny -> statuszvaltas -> naplozas`
