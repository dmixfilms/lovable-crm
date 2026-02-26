# 🚀 Lovable CRM - Getting Started

## ✅ What's Completed

This is a **fully functional API backend** + **React frontend foundation** ready for development.

### Backend (100% Complete) ✅
- ✅ FastAPI REST API with 9 routers
- ✅ SQLite database with 9 ORM tables
- ✅ Google Places API integration for lead capture
- ✅ Email discovery from websites (BeautifulSoup)
- ✅ APScheduler jobs (4 automated tasks)
- ✅ JWT authentication with role-based access
- ✅ Dashboard financial metrics endpoint
- ✅ Message templates (5 defaults seeded)
- ✅ Swagger API docs at `/docs`

**Test the API immediately:**
```bash
# Terminal 1: Start backend
cd ~/Documents/lovable-crm/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Test API
curl http://localhost:8000/health
```

**Login endpoint:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lovable.test","password":"admin@123456"}'
```

### Frontend (Foundation Complete) ✅
- ✅ Next.js 15 project setup
- ✅ TypeScript types for all data models
- ✅ Axios API client with JWT auth
- ✅ React Query integration
- ✅ Tailwind CSS configured
- ✅ Home page redirect logic
- ✅ All dependencies installed

**Test the frontend:**
```bash
cd ~/Documents/lovable-crm/frontend
pnpm dev
# Opens http://localhost:3000 - redirects to /login
```

## 🎯 Next: Build the Frontend UI

The frontend needs **React components** to display the data.

**Location:** See `FRONTEND_NEXT_STEPS.md` for detailed build instructions.

**Quick overview of what's needed:**
1. Login page *(easy, 1 form)*
2. Dashboard layout *(sidebar + topbar)*
3. Kanban board *(drag-drop leads between stages)* ⭐ CORE
4. Lead detail page *(tabs for tasks, deal, preview, messages)* ⭐ CORE
5. Financial dashboard *(charts with recharts)*
6. Import page *(Google Places search form)*
7. Templates & settings pages

## 🔧 Development Workflow

### Option 1: Using Makefile (Recommended)
```bash
cd ~/Documents/lovable-crm

# Start both backend + frontend (follow instructions)
make dev

# Or individually
make backend-dev
make frontend-dev

# One-time setup
make seed              # Initialize database
make install          # Install deps
```

### Option 2: Manual Terminal Setup
```bash
# Terminal 1: Backend
cd ~/Documents/lovable-crm/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd ~/Documents/lovable-crm/frontend
pnpm dev

# Terminal 3: Optional - Watch logs
cd ~/Documents/lovable-crm
tail -f backend/app.log
```

## 📚 Key Resources

| Item | Location | Purpose |
|------|----------|---------|
| API Docs | http://localhost:8000/docs | Test endpoints (Swagger UI) |
| Frontend Guide | `FRONTEND_NEXT_STEPS.md` | Step-by-step build instructions |
| Architecture | `README.md` | Full system overview |
| Backend Code | `backend/app/` | FastAPI app |
| Database | `backend/lovable_crm.db` | SQLite file |

## 🔑 Default Login

- **Email:** `admin@lovable.test`
- **Password:** `admin@123456`

⚠️ **Change immediately in production!**

## 💡 Quick Facts

| Component | Tech Stack | Status |
|-----------|-----------|--------|
| **Backend** | FastAPI + SQLAlchemy + SQLite | ✅ Complete |
| **Frontend** | Next.js + React + Tailwind | 🔧 Foundation (UI needed) |
| **Database** | SQLite (9 tables) | ✅ Complete |
| **Auth** | JWT tokens | ✅ Complete |
| **Jobs** | APScheduler (4 tasks) | ✅ Complete |
| **API** | REST with Swagger docs | ✅ Complete |
| **Config** | .env file | ✅ Complete |

## 🎨 Current Database State

- ✅ 9 tables created (leads, deals, tasks, previews, etc.)
- ✅ 5 message templates seeded
- ✅ 1 admin user created
- ✅ Database file: `backend/lovable_crm.db`

**Try listing leads via API:**
```bash
# Get JWT token first (from login endpoint above), then:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/leads
```

## 📊 Sample Workflow

1. **Import leads** (via Google Places API):
   ```
   POST /leads/import/google-places
   Response: 30 leads added to DB
   ```

2. **View leads** in Kanban:
   ```
   GET /leads
   Status: NEW_CAPTURED (ready to create preview)
   ```

3. **Create preview**:
   ```
   POST /leads/{id}/preview
   Stores preview URL + 7-day expiry
   ```

4. **Move through pipeline**:
   ```
   PATCH /leads/{id}/move
   NEW_CAPTURED → PREVIEW_CREATED → SAMPLE_SENT → ...
   ```

5. **Track financials**:
   ```
   PATCH /leads/{id}/deal
   Add: quoted_price, final_price, costs
   Get: profit = final_price - costs
   ```

## ❓ Common Questions

**Q: Where do I start building the frontend?**
A: Read `FRONTEND_NEXT_STEPS.md` - start with the Login page, then Kanban board.

**Q: Can I use the API now?**
A: Yes! All endpoints are ready at http://localhost:8000/docs

**Q: How do I add more leads?**
A: Either import via Google Places API or create manually via POST `/leads`

**Q: Where's the database file?**
A: `backend/lovable_crm.db` (SQLite file)

**Q: Can I change the admin password?**
A: Not via API yet. Manually edit the user or create a /auth/register endpoint.

## 🚀 Next Steps

1. **Start the API**: `make backend-dev` or manual uvicorn command
2. **Test endpoints**: Open http://localhost:8000/docs
3. **Build frontend**: Follow `FRONTEND_NEXT_STEPS.md`
4. **Start frontend**: `make frontend-dev` or `pnpm dev`
5. **Log in**: admin@lovable.test / admin@123456
6. **Begin testing**: Import leads, create Kanban UI, manage pipeline

## 📞 Architecture Support

This is a production-ready **MVP** with:
- ✅ Full REST API
- ✅ Database schema
- ✅ Authentication
- ✅ Background jobs
- ✅ External integrations (Google Places, BeautifulSoup)
- ✅ Financial tracking
- ✅ Message management

All you need to add is the **React components** to display the data!

---

**Happy building! 🎉**

For detailed backend/frontend info, see `README.md`
For step-by-step frontend build guide, see `FRONTEND_NEXT_STEPS.md`
