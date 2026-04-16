# MyFirstOffice V1 - epitoipari domainmodell

## 1. Cel

Ez a dokumentum a projektkozpontu, kivitelezoi V1 adatmodelljet irja le.

Az alapelv:

- a kozponti entitas a `Project`
- minden mas ehhez kapcsolodik
- a modellek a napi helyszini hasznalatot tamogatjak

## 2. Kozponti modellek

### 2.1. Project

Ez a rendszer legfontosabb rekordja.

Fo mezok:

- `id`
- `name`
- `code`
- `addressLine`
- `city`
- `postalCode`
- `status`
- `startDate`
- `expectedEndDate`
- `actualEndDate`
- `description`
- `customerName`
- `customerPhone`
- `customerEmail`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `ProjectStatus`: `PREPARATION`, `IN_PROGRESS`, `HANDOVER`, `CLOSED`

Kapcsolatok:

- 1 projekthez tobb `ProjectMember`
- 1 projekthez tobb `ProjectTask`
- 1 projekthez tobb `ProjectThread`
- 1 projekthez tobb `ProjectFile`
- 1 projekthez tobb `SiteLogEntry`
- 1 projekthez tobb `ProjectIssue`
- 1 projekthez tobb `Contract`
- 1 projekthez tobb `ProjectEvent`

### 2.2. ProjectMember

Ez kezeli a projekten beluli szemelyeket es szerepkoruket.

Fo mezok:

- `id`
- `projectId`
- `contactId`
- `name`
- `phone`
- `email`
- `role`
- `permissionLevel`
- `isActive`
- `notes`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `ProjectRole`: `OWNER`, `CUSTOMER`, `TECH_INSPECTOR`, `FMV`, `PROJECT_MANAGER`, `SUBCONTRACTOR`
- `ProjectPermissionLevel`: `FULL`, `MANAGE`, `CONTRIBUTE`, `COMMENT`, `VIEW_APPROVE`, `VIEW_ONLY`

Megjegyzes:

- V1-ben lehet sajat mezokkel is tarolni a nevet/telefont, hogy ne kelljen azonnal teljes kulon CRM-et epiteni
- kesobb a `Contact` modellel osszekapcsolhato

## 3. Operacios modellek

### 3.1. ProjectTask

Ez a napi munka magja.

Ket fo tipus:

- kivitelezesi feladat
- megrendeloi dontes

Fo mezok:

- `id`
- `projectId`
- `title`
- `description`
- `type`
- `status`
- `priority`
- `assigneeMemberId`
- `dueAt`
- `completedAt`
- `approvalRequired`
- `approvedAt`
- `approvedByMemberId`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `ProjectTaskType`: `EXECUTION`, `CUSTOMER_DECISION`
- `ProjectTaskStatus`: `NEW`, `IN_PROGRESS`, `DONE`, `WAITING_APPROVAL`
- `ProjectTaskPriority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

Kapcsolatok:

- 1 taskhoz tobb `TaskComment`
- 1 taskhoz tobb `ProjectFile`
- 1 taskhoz kapcsolodhat kulon `ProjectThread`

### 3.2. TaskComment

Fo mezok:

- `id`
- `taskId`
- `authorMemberId`
- `body`
- `createdAt`

## 4. Kommunikacios modellek

### 4.1. ProjectThread

Chat szal projekt vagy feladat szinten.

Fo mezok:

- `id`
- `projectId`
- `taskId`
- `type`
- `title`
- `createdByMemberId`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `ProjectThreadType`: `PROJECT`, `TASK`

### 4.2. ProjectMessage

Fo mezok:

- `id`
- `threadId`
- `authorMemberId`
- `body`
- `hasReaction`
- `readByJson`
- `createdAt`

V1 megjegyzes:

- a reakcio es olvasottsag lehet egyszerubb JSON/string alapon a kezdeti korben

## 5. Dokumentacio es fajlok

### 5.1. ProjectFile

Fo mezok:

- `id`
- `projectId`
- `taskId`
- `uploadedByMemberId`
- `category`
- `title`
- `fileName`
- `mimeType`
- `filePath`
- `takenAt`
- `notes`
- `createdAt`

Javasolt enum:

- `ProjectFileCategory`: `PLAN`, `EXECUTION_PHOTO`, `HANDOVER`, `CONTRACT`, `OTHER`

V1 megjegyzes:

- a legfontosabb, hogy a fajl projekthez es opcionalisan feladathoz is kotheto legyen

## 6. E-naplo

### 6.1. SiteLogEntry

Ez a V1 egyik fo feature-e.

Fo mezok:

- `id`
- `projectId`
- `entryDate`
- `createdByMemberId`
- `weather`
- `presentMembersJson`
- `workDone`
- `problems`
- `notes`
- `createdAt`
- `updatedAt`

Kapcsolatok:

- 1 bejegyzeshez tobb `ProjectFile`

V1 megjegyzes:

- a jelenlevok V1-ben tarolhatok egyszerubb listakent
- kesobb lehet normalizalt jelenleti modell

## 7. Problemakezeles

### 7.1. ProjectIssue

Fo mezok:

- `id`
- `projectId`
- `taskId`
- `title`
- `description`
- `category`
- `status`
- `assigneeMemberId`
- `reportedByMemberId`
- `resolvedAt`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `ProjectIssueCategory`: `TECHNICAL_ERROR`, `DELAY`, `MISSING_ITEM`, `DECISION_PROBLEM`
- `ProjectIssueStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`

## 8. Szerzodeskezeles

### 8.1. Contract

Fo mezok:

- `id`
- `projectId`
- `memberId`
- `type`
- `title`
- `templateKey`
- `status`
- `pdfPath`
- `signedAt`
- `signedByName`
- `signatureImagePath`
- `createdAt`
- `updatedAt`

Javasolt enumok:

- `ContractType`: `CUSTOMER`, `SUBCONTRACTOR`
- `ContractStatus`: `DRAFT`, `GENERATED`, `SENT`, `SIGNED`, `ARCHIVED`

### 8.2. ContractFieldValue

Dinamikus sablonmezokhoz.

Fo mezok:

- `id`
- `contractId`
- `fieldKey`
- `fieldLabel`
- `value`

## 9. Naptar

### 9.1. ProjectEvent

Fo mezok:

- `id`
- `projectId`
- `taskId`
- `title`
- `type`
- `startsAt`
- `endsAt`
- `location`
- `notes`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Javasolt enum:

- `ProjectEventType`: `TASK_DEADLINE`, `WORK_START`, `MEETING`, `HANDOVER`

## 10. Minimalis V1 schema sorrend

Az elso adatmodell korben csak ezeket erdemes bevezetni:

1. `Project`
2. `ProjectMember`
3. `ProjectTask`
4. `ProjectEvent`

A masodik korben:

5. `ProjectThread`
6. `ProjectMessage`
7. `ProjectFile`
8. `SiteLogEntry`

A harmadik korben:

9. `ProjectIssue`
10. `Contract`
11. `ContractFieldValue`

## 11. Mi maradjon kesobbre

Nem kotelezo azonnal:

- teljes kulon CRM integracio
- fejlett read receipt modell
- push infrastruktura
- digitalis alairas teljes workflow
- AI funkciok
- hivatalos e-naplo megfeleloseg
