# Preview Expiry Alert System - Deployment Steps

## ✅ Implementation Complete

All code changes have been implemented. This document outlines the deployment sequence.

## Phase 1: Database Migration (MUST DO FIRST)

```bash
cd backend
sqlite3 data/tokio_dashboard.sqlite  # Or your actual database path
```

Then run the migration:
```sql
ALTER TABLE lovable_previews ADD COLUMN archived_at DATETIME;
```

Or run the migration file:
```bash
sqlite3 data/tokio_dashboard.sqlite < migrations/add_archived_at_to_previews.sql
```

**Verify the column was added:**
```sql
SELECT sql FROM sqlite_master WHERE type='table' AND name='lovable_previews';
```

Expected output should show: `archived_at DATETIME`

## Phase 2: Backend Deployment

### Option A: Direct Restart (if running from source)
```bash
# Kill existing process
pkill -f "uvicorn.*app.main:app"

# Install/update dependencies (if using requirements.txt)
pip install -r requirements.txt

# Restart backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option B: Docker Restart
```bash
docker compose down
docker compose up -d
```

### Verify Backend Changes
After restart, test:
```bash
curl http://localhost:8000/api/leads/YOUR_LEAD_ID
```

Should include `active_preview` field in response with the latest non-archived preview for the lead.

## Phase 3: Frontend Deployment

```bash
cd frontend
npm install  # (if needed)
npm run build
npm run start
```

Or if using development:
```bash
npm run dev
```

## Phase 4: Verify Implementation

### 1. Check Badge System
- Go to Leads dashboard
- Create/find a lead with a preview set to expire in 2-3 days
- Card should show yellow badge: "⏰ 2 dias restantes"

### 2. Check Banner System
- Dashboard should show preview expiry banner above Kanban columns
- Banner shows all leads with expiring previews
- Click banner row → navigates to lead's Preview tab

### 3. Check Manual Confirmation Flow
- Set a preview's `expires_at` to yesterday in the database
- Refresh page
- Card shows red badge: "⚠️ Expirado — confirmar desativação"
- PreviewTab shows "Confirmar Desativado" button
- Click button → confirmation dialog appears
- Confirm → message: "Desativação confirmada. Tarefa de exclusão será criada em 30 dias."

### 4. Check Worker (Preview Expiration)
The worker should be configured to run periodically (usually daily). Test manually:

```python
# From backend directory, in Python shell:
from app.workers.preview_expiration import expire_old_previews
expire_old_previews()
```

Expected output:
```
🚀 Checking for expired and expired-to-delete previews...
✓ Phase 1: X previews auto-archived
✓ Phase 2: Y deletion tasks created
```

### 5. Database Verification
```sql
-- Check archived previews have archived_at timestamp
SELECT id, is_archived, archive_reason, archived_at FROM lovable_previews
WHERE is_archived = true LIMIT 5;

-- Check deletion tasks were created
SELECT * FROM tasks
WHERE task_type = 'delete_preview_from_lovable'
LIMIT 5;
```

## Phase 5: Schedule Worker (Optional but Recommended)

The worker needs to run daily to:
1. Auto-archive expired previews
2. Create deletion tasks for 30-day-old archived previews

### Using APScheduler (if already installed)
Edit your main app initialization:

```python
# In app/main.py or startup handler
from apscheduler.schedulers.background import BackgroundScheduler
from app.workers.preview_expiration import expire_old_previews

scheduler = BackgroundScheduler()
scheduler.add_job(expire_old_previews, 'cron', hour=0, minute=0)  # Daily at midnight
scheduler.start()
```

### Using system cron
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * cd /path/to/lovable-crm/backend && python -c "from app.workers.preview_expiration import expire_old_previews; expire_old_previews()"
```

### Using systemd timer (Linux)
Create `/etc/systemd/system/preview-expiration.service`:
```ini
[Unit]
Description=Lovable Preview Expiration Worker
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/lovable-crm/backend
ExecStart=/usr/bin/python3 -c "from app.workers.preview_expiration import expire_old_previews; expire_old_previews()"
```

Create `/etc/systemd/system/preview-expiration.timer`:
```ini
[Unit]
Description=Lovable Preview Expiration Worker Timer
Requires=preview-expiration.service

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:00:00

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable preview-expiration.timer
sudo systemctl start preview-expiration.timer
sudo systemctl status preview-expiration.timer
```

## Rollback Plan (if needed)

### Remove archived_at column (not recommended, data loss)
```sql
-- SQLite doesn't support DROP COLUMN directly, would need table recreation
-- Better: Just leave the column, revert code changes only
```

### Revert Code Changes
1. Git revert the relevant commits
2. Redeploy backend and frontend
3. No database cleanup needed - just unused column

## Files Modified Summary

**Backend (6 files)**
- `app/models/lovable_preview.py`
- `app/schemas/preview.py`
- `app/schemas/lead.py`
- `app/services/lead_service.py`
- `app/routers/previews.py`
- `app/workers/preview_expiration.py`

**Frontend (7 files)**
- `src/types/index.ts`
- `src/hooks/usePreviews.ts`
- `src/components/kanban/PreviewExpiryBadge.tsx` (NEW)
- `src/components/kanban/PreviewExpiryBanner.tsx` (NEW)
- `src/components/kanban/KanbanCard.tsx`
- `src/app/dashboard/leads/page.tsx`
- `src/app/dashboard/leads/[id]/_tabs/PreviewTab.tsx`

**Migrations (1 file)**
- `backend/migrations/add_archived_at_to_previews.sql`

**Documentation (2 files)**
- `PREVIEW_EXPIRY_SYSTEM.md` - Detailed technical documentation
- `DEPLOYMENT_STEPS.md` - This file

## Testing Checklist Before Going Live

- [ ] Database migration applied successfully
- [ ] Backend starts without errors
- [ ] Frontend builds without errors
- [ ] Badge displays for previews expiring in 2 days
- [ ] Banner shows and is clickable
- [ ] "Confirm Deactivated" button appears for expired previews
- [ ] Confirmation dialog works correctly
- [ ] Worker runs and auto-archives expired previews
- [ ] Worker creates deletion tasks after 30 days
- [ ] No duplicate deletion tasks created on second worker run
- [ ] Leads list updates after archive confirmation
- [ ] Preview detail page shows correct timestamps

## Support & Troubleshooting

### Issue: Badge not showing
- Check: Is `active_preview` being loaded? Check network tab for `/api/leads` response
- Check: Does preview have `expires_at` in the future?

### Issue: Banner not showing
- Check: Any leads with expiring previews? Query the leads endpoint
- Check: Is `daysLeft <= 2`?

### Issue: Worker not running
- Check: Is scheduler started?
- Check: Try running manually: `expire_old_previews()`
- Check: Database permissions - can it write to tasks table?

### Issue: Archived_at not stamped
- Check: Is the router code updated? (Should auto-stamp on archive)
- Check: Using the new PATCH endpoint? (Not DELETE)

### Performance Concerns
- **Query optimization**: Using batch queries (no N+1)
- **Worker performance**: Queries indexed on `is_archived` and `expires_at`
- **Frontend**: Badge component is stateless, no re-renders

## Next Steps

1. ✅ **Code Implementation** - COMPLETE
2. 🔄 **Database Migration** - Apply migration now
3. 🔄 **Backend Restart** - Deploy and verify
4. 🔄 **Frontend Deployment** - Build and deploy
5. 🔄 **Worker Scheduling** - Configure daily execution
6. 🔄 **Testing** - Verify all features work
7. 🔄 **Monitoring** - Watch for any issues in production

Good luck! 🚀
