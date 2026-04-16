# MyFirstOffice V1 adatmodell terv

## 1. Cel

Ez a dokumentum a jelenlegi [prisma/schema.prisma](./prisma/schema.prisma) melle tesz egy V1-re optimalizalt, tablaszintu domaintervet.

Celja:

- a jelenlegi modellek bovitesenek iranyadasa
- a V1-ben tenylegesen hasznalt entitasok rogzitese
- a kesobbi modulok elokeszitese tultervezes nelkul

## 2. Modellezesi elvek

- A V1-ben a Core legyen eros, a modulok csak annyira bovitsenek, amennyire valos folyamat kell.
- A jelenlegi `Contact`, `Lead`, `Task`, `CalendarEvent`, `User` modellek maradjanak a rendszer gerinceben.
- Ami V1-ben meg nem teljes modul, annal eleg egy egyszerubb adatmodell is, ha a kesobbi bovitesnek mar van helye.
- A V1 SQLite-on fusson, de a modellek legyenek PostgreSQL-kompatibilis logikaval tervezve.

## 3. Core modellek

### 3.1. User

Celpont:

- office felhasznalo
- hitelesites
- szerepkor
- felelosseg rendelese leadhez, taskhoz, esemenyhez

Fo mezok:

- `id`
- `username`
- `email`
- `name`
- `passwordHash`
- `role`
- `isActive`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

Kapcsolatok:

- 1 userhez tobb `Lead`
- 1 userhez tobb `Task`
- 1 userhez tobb `CalendarEvent`
- 1 userhez tobb `ActivityLog`
- 1 userhez tobb `MessageThread` mint assigned operator

V1 megjegyzes:

- az `isActive` es `lastLoginAt` mezoket erdemes felvenni
- kesobb lehet kulon permission tabla, de V1-ben eleg a role-alapu ellenorzes

### 3.2. Contact

Celpont:

- kozponti CRM rekord
- erdeklodo, ugyfel, visszatero ugyfel vagy lezart ugyfel allapot tarolasa

Fo mezok:

- `id`
- `type`
- `name`
- `company`
- `email`
- `phone`
- `secondaryPhone`
- `addressLine`
- `city`
- `postalCode`
- `country`
- `website`
- `source`
- `status`
- `ownerId`
- `notes`
- `tags`
- `createdAt`
- `updatedAt`
- `archivedAt`

Javasolt enumok:

- `ContactType`: `PERSON`, `COMPANY`
- `ContactStatus`: `LEAD`, `ACTIVE_CLIENT`, `RETURNING_CLIENT`, `CLOSED_CLIENT`, `LOST`

Kapcsolatok:

- 1 contacthoz tobb `Lead`
- 1 contacthoz tobb `Task`
- 1 contacthoz tobb `CalendarEvent`
- 1 contacthoz tobb `MessageThread`
- 1 contacthoz tobb `ActivityLog`
- 1 contacthoz tobb `ContactNote`
- 1 contacthoz tobb `ContactAttachment`
- 1 contacthoz tobb `QuoteRequest`

V1 megjegyzes:

- a mostani `statusLabel` helyett erdemes strukturalis `status` enumot tarolni
- a `tags` V1-ben maradhat string alapon, kesobb kulon cimke tabla is lehet

### 3.3. Lead

Celpont:

- konkret erdeklodes vagy uzleti lehetoseg
- statuszfolyamat kezelese
- workflow trigger a taskokra es esemenyekre

Fo mezok:

- `id`
- `contactId`
- `ownerId`
- `title`
- `description`
- `status`
- `source`
- `pipeline`
- `valueLabel`
- `estimatedValue`
- `currency`
- `dueAt`
- `closedAt`
- `lostReason`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `LeadStatus`: `NEW`, `CONTACTED`, `QUALIFYING`, `OFFER_SENT`, `WAITING_FEEDBACK`, `WON`, `LOST`

Kapcsolatok:

- 1 lead egy `Contact`-hoz tartozhat
- 1 leadnek lehet egy `User` felelose
- 1 leadhez tobb `Task`
- 1 leadhez tobb `ActivityLog`
- 1 leadhez 0 vagy 1 `QuoteRequest`

V1 megjegyzes:

- a jelenlegi `IN_PROGRESS` statuszt erdemes konkretabb uzleti statuszokra bontani
- a `WON` allapot utan a contact statusa automatikusan valthat active clientre

### 3.4. Task

Celpont:

- napi operacios teendo
- leadhez, ugyfelhez vagy modulhoz kapcsolt feladat

Fo mezok:

- `id`
- `contactId`
- `leadId`
- `ownerId`
- `title`
- `description`
- `status`
- `priority`
- `moduleKey`
- `dueAt`
- `completedAt`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `TaskStatus`: `TODO`, `IN_PROGRESS`, `WAITING`, `DONE`, `CLOSED`

Kapcsolatok:

- 1 task kapcsolodhat `Contact`-hoz
- 1 task kapcsolodhat `Lead`-hez
- 1 task felelose egy `User`
- 1 taskhoz tobb `TaskComment`
- 1 taskhoz tobb `ActivityLog`

V1 megjegyzes:

- a `leadId` kapcsolat erositi a teljes lead workflow-t
- a `moduleKey` segit modulhoz kapcsolt listakat es filtereket epiteni

### 3.5. CalendarEvent

Celpont:

- minden idobeli esemeny kozos tarolasa

Fo mezok:

- `id`
- `contactId`
- `leadId`
- `ownerId`
- `title`
- `description`
- `type`
- `startsAt`
- `endsAt`
- `location`
- `meetingUrl`
- `isAllDay`
- `reminderAt`
- `moduleKey`
- `createdAt`
- `updatedAt`

Kapcsolatok:

- 1 esemeny kapcsolodhat `Contact`-hoz
- 1 esemeny kapcsolodhat `Lead`-hez
- 1 esemeny felelose egy `User`
- 1 esemenyhez tobb `ActivityLog`

V1 megjegyzes:

- a `meetingUrl` mezore kesobb biztosan szukseg lesz
- a `moduleKey` itt is fontos a workshop vagy booking események miatt

### 3.6. ActivityLog

Celpont:

- audit es timeline alap
- a V1 egyik legfontosabb hianyzo modellje

Fo mezok:

- `id`
- `actorUserId`
- `entityType`
- `entityId`
- `action`
- `summary`
- `payloadJson`
- `contactId`
- `leadId`
- `taskId`
- `eventId`
- `createdAt`

Javasolt enumok:

- `ActivityEntityType`: `AUTH`, `CONTACT`, `LEAD`, `TASK`, `CALENDAR_EVENT`, `MESSAGE`, `PAGE`, `QUOTE_REQUEST`
- `ActivityActionType`: `CREATED`, `UPDATED`, `STATUS_CHANGED`, `ASSIGNED`, `COMPLETED`, `PUBLISHED`, `LOGIN`

V1 megjegyzes:

- ez adja a kesobbi timeline es audit log alapjat
- a `payloadJson` maradhat egyszeru string vagy JSON field logikaval, kesobb adatbazistipus szerint finomithato

## 4. Kommunikacios modellek

### 4.1. MessageThread

Celpont:

- kapcsolatfelvetesek, email threadek, chat threadek egy kozos logikaban

Fo mezok:

- `id`
- `contactId`
- `assignedToUserId`
- `channel`
- `status`
- `subject`
- `previewText`
- `lastMessageAt`
- `isUnread`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `MessageChannel`: `CONTACT_FORM`, `EMAIL`, `CHAT`, `PHONE_NOTE`, `INTERNAL`
- `MessageStatus`: `NEW`, `WAITING_REPLY`, `IN_PROGRESS`, `CLOSED`, `SPAM`

### 4.2. MessageEntry

Celpont:

- threaden beluli egyedi uzenetek vagy jegyzetek

Fo mezok:

- `id`
- `threadId`
- `direction`
- `authorUserId`
- `senderName`
- `senderEmail`
- `body`
- `sentAt`
- `createdAt`

Javasolt enum:

- `MessageDirection`: `INBOUND`, `OUTBOUND`, `INTERNAL_NOTE`

## 5. Tartalom es media modellek

### 5.1. Page

Fo mezok:

- `id`
- `title`
- `slug`
- `type`
- `status`
- `excerpt`
- `seoTitle`
- `seoDescription`
- `publishedAt`
- `scheduledFor`
- `createdByUserId`
- `updatedByUserId`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `PageType`: `LANDING`, `CONTENT`, `SYSTEM`, `PRESET`
- `PublishStatus`: `DRAFT`, `REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`

### 5.2. PageBlock

Fo mezok:

- `id`
- `pageId`
- `type`
- `position`
- `dataJson`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `PageBlockType`: `HERO`, `TEXT`, `IMAGE_TEXT`, `SERVICES`, `REFERENCES`, `CTA`, `TESTIMONIALS`, `FAQ`, `GALLERY`, `VIDEO`, `BLOG_LIST`, `CONTACT`, `FORM`

### 5.3. MediaAsset

Fo mezok:

- `id`
- `kind`
- `title`
- `fileName`
- `mimeType`
- `filePath`
- `altText`
- `caption`
- `folder`
- `tags`
- `sizeBytes`
- `width`
- `height`
- `uploadedByUserId`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `MediaKind`: `IMAGE`, `DOCUMENT`, `VIDEO_LINK`

## 6. Elso modul: ajanlatkero

### 6.1. QuoteRequest

Celpont:

- publikus ajanlatkeres strukturalt rogzitese
- automatikus lead letrehozas vagy kapcsolas

Fo mezok:

- `id`
- `contactId`
- `leadId`
- `assignedToUserId`
- `status`
- `serviceType`
- `budgetLabel`
- `deadlineLabel`
- `message`
- `sourcePage`
- `submittedAt`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `QuoteRequestStatus`: `NEW`, `REVIEWED`, `QUALIFIED`, `CONVERTED_TO_LEAD`, `CLOSED`

### 6.2. QuoteRequestAnswer

Celpont:

- dinamikus kerdesek valaszainak tarolasa

Fo mezok:

- `id`
- `quoteRequestId`
- `fieldKey`
- `fieldLabel`
- `value`
- `createdAt`

### 6.3. QuoteRequestAttachment

Fo mezok:

- `id`
- `quoteRequestId`
- `mediaAssetId`
- `createdAt`

## 7. Minimalis Prisma-valtoztatasi terv V1-re

Az elso implementacios korben a leghasznosabb bovites:

1. `Contact.status` enum bevezetese
2. `Contact.ownerId`
3. `Lead.leadId` helyett nincs valtozas, de statusz enum bovites
4. `Task.leadId`
5. `CalendarEvent.leadId`
6. `CalendarEvent.meetingUrl`
7. `ActivityLog` uj tabla
8. `MessageThread` es `MessageEntry` uj tablak
9. `QuoteRequest` uj tabla

## 8. Mi maradjon kesobbre

Ezeket nem kotelezo a legelso V1 korben teljes melyseggel bevezetni:

- kulon permission tabla
- osszetett tag rendszer
- teljes file storage absztrakcio
- social post publication engine
- webshop order domain
- booking kapacitasmotor
- multi-tenant tenant tabla
