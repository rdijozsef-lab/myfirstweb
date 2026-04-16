# MyFirstOffice V1 jogosultsagmatrix

## 1. Cel

Ez a dokumentum a V1 szerepkorait es a fo modulokhoz tartozo alapjogosultsagokat rogziti.

V1-ben az ajanlott megkozelites:

- route-szintu vedelem
- oldal-szintu lathatosag
- muvelet-szintu szerepkor-ellenorzes
- nincs meg kulon, adatbazisban szerkesztheto ACL rendszer

## 2. Szerepkorok

### OWNER

- teljes rendszerhozzaferes
- felhasznalok es beallitasok kezelese
- minden modul olvasasa es irasa

### ADMIN

- majdnem teljes hozzaferes
- napi operacios es tartalmi kezeles
- felhasznalo-admin csak korlatozottan vagy owner jovahagyassal

### EDITOR

- tartalom, blog, media, social
- CRM olvasas korlatozottan
- uzleti admin muveletek nelkul

### OPERATOR

- CRM, messages, tasks, calendar napi kezeles
- publikus tartalomhoz nincs vagy csak minimalis jogosultsag

### SALES

- leadek, kapcsolatok, ajanlatkeresek, feladatok kezelese
- tartalomkezeleshez nincs jog

### VIEWER

- csak olvasasi jogosultsag a kijelolt nezetekre

V1 megjegyzes:

- a mostani kodban a `SALES` szerepkor meg nincs benne, de uzletileg erdemes felvenni a tervbe
- ha rovid tavon nem akarunk enumot boviteni, atmenetileg az `OPERATOR` szerep is viselheti ezt a feladatkort

## 3. Modul-szintu matrix

Jelolesek:

- `R` = read
- `W` = create/update
- `D` = delete/archive
- `A` = admin / settings

### 3.1. Dashboard

| Modul | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Dashboard megtekintes | R | R | R | R | R | R |
| Gyorsmuveletek | W | W | korl. | W | W | - |

### 3.2. Contacts

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Lista megtekintes | R | R | korl. | R | R | R |
| Reszlet megtekintes | R | R | korl. | R | R | R |
| Letrehozas | W | W | - | W | W | - |
| Szerkesztes | W | W | - | W | W | - |
| Archivalas | D | D | - | korl. | korl. | - |

### 3.3. Leads

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Lista / reszlet | R | R | korl. | R | R | R |
| Letrehozas | W | W | - | W | W | - |
| Statuszvaltas | W | W | - | W | W | - |
| Felelos hozzarendeles | W | W | - | korl. | W | - |
| Torles / archiv | D | D | - | - | - | - |

### 3.4. Tasks

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Lista / reszlet | R | R | korl. | R | R | R |
| Letrehozas | W | W | korl. | W | W | - |
| Szerkesztes | W | W | sajat | W | W | - |
| Lezaras | W | W | sajat | W | W | - |
| Torles | D | D | - | - | - | - |

### 3.5. Calendar

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Naptar megtekintes | R | R | korl. | R | R | R |
| Esemeny letrehozas | W | W | korl. | W | W | - |
| Esemeny szerkesztes | W | W | korl. | W | W | - |
| Esemeny torles | D | D | - | korl. | korl. | - |

### 3.6. Messages

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Thread lista | R | R | korl. | R | R | R |
| Thread hozzarendeles | W | W | - | W | W | - |
| Valasz / belso jegyzet | W | W | - | W | W | - |
| Spam / zaras | W | W | - | korl. | korl. | - |

### 3.7. Content / Pages

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Oldallista | R | R | R | - | - | R |
| Oldal letrehozas | W | W | W | - | - | - |
| Oldal szerkesztes | W | W | W | - | - | - |
| Publikalas | W | W | korl. | - | - | - |
| SEO mezok szerkesztese | W | W | W | - | - | - |

### 3.8. Blog

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Cikklista | R | R | R | - | - | R |
| Cikk letrehozas | W | W | W | - | - | - |
| Szerkesztes | W | W | W | - | - | - |
| Publikalas | W | W | korl. | - | - | - |

### 3.9. Media

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Megtekintes | R | R | R | korl. | korl. | R |
| Feltoltes | W | W | W | korl. | - | - |
| Metaadat szerkesztes | W | W | W | - | - | - |
| Torles | D | D | korl. | - | - | - |

### 3.10. Social

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Posztlista | R | R | R | - | - | R |
| Poszt letrehozas | W | W | W | - | - | - |
| Jovahagyas | W | W | korl. | - | - | - |
| Publikalas / idozites | W | W | korl. | - | - | - |

### 3.11. Modules

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Modullista | R | R | R | R | R | R |
| Modul statusz / config | A | A | - | - | - | - |
| Modul adat kezeles | W | W | korl. | korl. | korl. | - |

### 3.12. Settings

| Muvelet | OWNER | ADMIN | EDITOR | OPERATOR | SALES | VIEWER |
|---|---|---|---|---|---|---|
| Altalanos beallitasok | A | A | - | - | - | - |
| Felhasznalok | A | korl. | - | - | - | - |
| Role / permission | A | - | - | - | - | - |

## 4. Korlatozasok V1-ben

### Editor

- lathat CRM summary adatokat dashboardon
- nem kezelhet lead statuszfolyamatot
- nem torolhet core uzleti rekordokat

### Operator

- kezelhet napi CRM es message folyamatokat
- nem publikalhat publikus tartalmat
- nem ferhet hozza rendszer-szintu beallitasokhoz

### Sales

- kezelhet leadeket, kapcsolatokat, ajanlatkereseket
- keszithet taskot es esemenyt
- nem kezelhet CMS, blog, media vagy social tartalmat

### Viewer

- csak olvasas
- nincs letrehozas, szerkesztes, publikalas vagy torles

## 5. Technikai bevezetesi javaslat

V1-ben ezt erdemes implementalni:

1. `requireUser()` utan legyen `requireRole()` vagy `can()` helper
2. route-okhoz minimalis hozzaferesi szabalyok
3. server action szinten muveleti ellenorzes
4. UI-ban rejtett vagy disabled gombok a nem engedett muveletekhez
5. minden tiltott muvelet szerveroldalon is blokkolva legyen

## 6. Elso implementalando szabalyok

Az elso korben eleg ezeket levedeni:

- `/office/settings` csak `OWNER` es `ADMIN`
- content/blog/media/social szerkesztes csak `OWNER`, `ADMIN`, `EDITOR`
- contacts/leads/tasks/calendar/messages csak `OWNER`, `ADMIN`, `OPERATOR`, `SALES`
- torlesi muveletek csak `OWNER` es `ADMIN`
- publikalas csak `OWNER`, `ADMIN`, opcionisan `EDITOR`
