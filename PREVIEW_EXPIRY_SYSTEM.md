# Preview Expiry Alert System - Implementation Guide

## Overview

This system tracks Lovable preview expiration and manages a two-phase lifecycle:
- **Phase 1 (Auto)**: Worker auto-archives previews when they expire (Day 7)
- **Phase 2 (Manual)**: Operator confirms deactivation, then after 30 days a deletion task is created

## Complete Lifecycle

```
Dia 0:   Preview criado (expires_at = Dia 7)
         ✨ No badge

Dia 5:   daysLeft = 2
         🟡 Badge amarelo "⏰ 2 dias restantes" on card + banner alert

Dia 6:   daysLeft = 1
         🟠 Badge laranja "⏰ Expira amanhã" on card + banner alert

Dia 7:   Worker: preview.is_archived = True, archived_at = now
         🔴 Badge vermelho "⚠️ Expirado — confirmar desativação"
         ✅ Botão "Confirmar Desativado" appears in PreviewTab

Dia 7+: Operador clica "Confirmar Desativado"
        archive_reason = "manually_deactivated"

Dia 37: Worker detecta archived_at <= (now - 30 dias)
        ✅ Task criada: task_type = "delete_preview_from_lovable"
        📋 Operador verá a tarefa no Kanban
```

## Database Changes

### Migration
Run this SQL migration ONCE after deployment:
```sql
ALTER TABLE lovable_previews ADD COLUMN archived_at DATETIME;
```

File: `backend/migrations/add_archived_at_to_previews.sql`

### Table Schema
```python
# Model: app/models/lovable_preview.py
archived_at = Column(DateTime, nullable=True)  # When preview was archived
```

## Backend Implementation

### 1. Models (`app/models/lovable_preview.py`)
- ✅ Added `archived_at: DateTime` column

### 2. Schemas (`app/schemas/preview.py`)
- ✅ Added `archived_at` to `PreviewResponse`
- ✅ Created new `ActivePreviewSummary` class for summary data in listings

### 3. Lead Schema (`app/schemas/lead.py`)
- ✅ Imported `ActivePreviewSummary`
- ✅ Added `active_preview: Optional[ActivePreviewSummary]` to `LeadResponse`

### 4. Lead Service (`app/services/lead_service.py`)
- ✅ Updated `list_leads()` to batch-load active (non-archived) previews
- ✅ Updated `get_lead()` to load active preview for single lead
- Pattern: Query all leads → Query active previews → Map previews to leads (no N+1)

### 5. Previews Router (`app/routers/previews.py`)
- ✅ Updated `update_preview()` to auto-stamp `archived_at` when `is_archived` transitions from False → True
- Timestamp: `datetime.utcnow()` at moment of archival

### 6. Worker (`app/workers/preview_expiration.py`)
- ✅ Phase 1: Auto-archive expired previews (expires_at <= now)
  - Sets `is_archived = True`
  - Sets `archive_reason = "auto-expired"`
  - Sets `archived_at = now`
- ✅ Phase 2: Create deletion tasks for 30-day-old archived previews
  - Queries: `is_archived = True AND archived_at <= (now - 30 days)`
  - Creates task: `task_type = "delete_preview_from_lovable"`
  - Prevents duplicates: Checks for existing open task before creating

## Frontend Implementation

### 1. Types (`frontend/src/types/index.ts`)
- ✅ Added `ActivePreviewSummary` interface
- ✅ Added `active_preview?: ActivePreviewSummary` to `Lead` interface
- ✅ Added `archived_at?: string` to `LovablePreview` interface

### 2. Hooks (`frontend/src/hooks/usePreviews.ts`)
- ✅ Updated `useArchivePreview()` to invalidate both:
  - `["previews", leadId]` - The preview list for the lead detail page
  - `["leads"]` - The leads list to refresh `active_preview` field on all cards

### 3. Badge Component (`frontend/src/components/kanban/PreviewExpiryBadge.tsx`) **NEW**
- ✅ Helper function: `getPreviewDaysLeft(preview): number`
- ✅ Shows nothing if `daysLeft > 2`
- ✅ Shows based on days left:
  - `daysLeft <= 0`: 🔴 Red "⚠️ Expirado — confirmar desativação"
  - `daysLeft === 1`: 🟠 Orange "⏰ Expira amanhã"
  - `daysLeft === 2`: 🟡 Yellow "⏰ 2 dias restantes"

### 4. Banner Component (`frontend/src/components/kanban/PreviewExpiryBanner.tsx`) **NEW**
- ✅ Shows alert banner if any lead has expiring preview
- ✅ Filters: `active_preview && !is_archived && daysLeft <= 2`
- ✅ Sorted by urgency (expired first, then 1 day, then 2 days)
- ✅ Each row is clickable → navigates to `/dashboard/leads/{id}?tab=preview`
- ✅ Shows `null` if no alerts needed

### 5. Kanban Card (`frontend/src/components/kanban/KanbanCard.tsx`)
- ✅ Imported `PreviewExpiryBadge`
- ✅ Added badge display after notes section:
  ```tsx
  {lead.active_preview && !lead.active_preview.is_archived && (
    <div className="mb-2">
      <PreviewExpiryBadge preview={lead.active_preview} />
    </div>
  )}
  ```

### 6. Leads Dashboard (`frontend/src/app/dashboard/leads/page.tsx`)
- ✅ Imported `PreviewExpiryBanner`
- ✅ Added banner ABOVE DragDropContext:
  ```tsx
  <PreviewExpiryBanner leads={data} />
  ```

### 7. Preview Tab (`frontend/src/app/dashboard/leads/[id]/_tabs/PreviewTab.tsx`)
- ✅ Imported `getPreviewDaysLeft` from badge component
- ✅ Added state: `confirmDeactivated` for tracking deactivation confirmation
- ✅ Added handler: `handleConfirmDeactivated()` → calls `archivePreview` with `reason: "manually_deactivated"`
- ✅ Button shows when: `daysLeft <= 0 && !is_archived`
- ✅ Button label: "Confirmar Desativado" (red button)
- ✅ Confirmation dialog explains 30-day deletion workflow
- ✅ Success message: "Desativação confirmada. Tarefa de exclusão será criada em 30 dias."

## Testing Checklist

- [ ] **Database Migration**: Run SQL migration to add `archived_at` column
- [ ] **Phase 1 - Auto-expiration**:
  - [ ] Create preview with `expires_at = tomorrow`
  - [ ] Card shows yellow badge "⏰ 1 dia restante"
  - [ ] Banner shows this lead
  - [ ] Run worker (manually or wait for schedule)
  - [ ] Verify preview auto-archived: `is_archived = True, archive_reason = "auto-expired"`
  - [ ] Verify `archived_at` populated
  - [ ] Card shows red badge "⚠️ Expirado — confirmar desativação"
  - [ ] Button "Confirmar Desativado" appears in PreviewTab

- [ ] **Phase 2 - Manual confirmation**:
  - [ ] Click "Confirmar Desativado" button
  - [ ] Confirmation dialog shows: "Confirme que você desativou o site no Lovable..."
  - [ ] Click "Confirmar"
  - [ ] Message appears: "Desativação confirmada. Tarefa de exclusão será criada em 30 dias."
  - [ ] Verify in DB: `archive_reason = "manually_deactivated"`
  - [ ] Leads list refreshes, badge disappears

- [ ] **Phase 2 - Deletion task creation**:
  - [ ] Simulate `archived_at = 31 days ago` in database
  - [ ] Run worker
  - [ ] Verify task created:
     - `task_type = "delete_preview_from_lovable"`
     - `notes` contains preview URL
     - `is_done = False`
  - [ ] Verify no duplicate task created on second worker run

- [ ] **Banner functionality**:
  - [ ] Multiple expiring previews → ordered by urgency
  - [ ] Expired previews first, then 1 day, then 2 days
  - [ ] Click banner row → navigates to `/dashboard/leads/{id}?tab=preview`
  - [ ] No previews expiring → banner hidden

- [ ] **UI Edge cases**:
  - [ ] Card with active_preview displays badge correctly
  - [ ] Card without active_preview (null) → no badge shown
  - [ ] Lead with archived preview → no badge shown
  - [ ] Timezone handling: Uses UTC (`datetime.utcnow()`)

## Files Changed Summary

### Backend (6 files)
1. `app/models/lovable_preview.py` - Added `archived_at` column
2. `app/schemas/preview.py` - Added `ActivePreviewSummary`, updated `PreviewResponse`
3. `app/schemas/lead.py` - Added `active_preview` field to `LeadResponse`
4. `app/services/lead_service.py` - Batch-loading of active previews
5. `app/routers/previews.py` - Auto-stamp `archived_at` on archive
6. `app/workers/preview_expiration.py` - Two-phase expiration + deletion task creation

### Frontend (7 files)
1. `src/types/index.ts` - Added `ActivePreviewSummary`, updated `Lead` and `LovablePreview`
2. `src/hooks/usePreviews.ts` - Added leads cache invalidation on archive
3. `src/components/kanban/PreviewExpiryBadge.tsx` - **NEW** Badge component
4. `src/components/kanban/PreviewExpiryBanner.tsx` - **NEW** Banner component
5. `src/components/kanban/KanbanCard.tsx` - Integrated badge
6. `src/app/dashboard/leads/page.tsx` - Integrated banner
7. `src/app/dashboard/leads/[id]/_tabs/PreviewTab.tsx` - Added confirmation button + flow

### Migrations (1 file)
1. `backend/migrations/add_archived_at_to_previews.sql` - Database migration

## Notes

- **No N+1 queries**: Lead service uses batch queries (2 queries: leads + previews)
- **Timezone**: All timestamps use UTC (`datetime.utcnow()`)
- **Idempotent worker**: Deletion task creation checks for duplicates before inserting
- **User-friendly flow**: Clear messaging, confirmation dialogs, visual feedback
- **Responsive UI**: Badge colors change with urgency, banner auto-hides when not needed
- **Mobile-friendly**: Button sizing, text truncation, readable on small screens
