# 🎨 Lovable CRM

**Complete CRM system for managing website redesign sales using Lovable.dev**

A full-stack application for capturing, managing, and selling website redesign previews to local Sydney businesses. Built with FastAPI, Next.js, SQLite, and APScheduler.

## ✨ Features

### Lead Management
- **Automated lead capture** via Google Places API (restaurants, cafes, gyms, etc.)
- **Deduplication** by Google Place ID
- **Email discovery** from websites using BeautifulSoup scraper
- **Manual lead creation**

### Sales Pipeline
- **14-stage Kanban board** (NEW_CAPTURED → DELIVERED/WON/LOST)
- **Drag-drop lead management** between stages
- **Task checklists** per lead
- **Follow-up task automation** for stale leads

### Financial Tracking
- **Deal management** (quoted price, final price, costs)
- **Revenue & profit tracking** with margin analysis
- **Pipeline value forecasting**
- **Conversion funnel metrics**

### Communication
- **Message templates** (Email + Instagram)
- **Template variable substitution**
- **Outbound message tracking** (DRAFT/SENT/FAILED)
- **Prepared for API automation** (Mailgun, SendGrid, Meta Graph API)

### Admin
- **Settings dashboard** (keywords, suburbs, daily limits)
- **Import run history** and logging
- **APScheduler background jobs** (4 automated tasks)
- **JWT authentication** with role-based access

## 🏗️ Architecture

### Backend (FastAPI + SQLite)
```
backend/
├── app/
│   ├── main.py              # FastAPI app + startup
│   ├── config.py            # Pydantic settings
│   ├── database.py          # SQLAlchemy + SQLite
│   ├── models/              # 9 ORM models
│   ├── schemas/             # Pydantic request/response
│   ├── routers/             # 9 REST API routers
│   ├── services/            # Business logic (6 services)
│   └── workers/             # APScheduler jobs (4 jobs)
└── seed.py                  # Database initialization
```

**Key Technologies:**
- FastAPI 0.100+
- SQLAlchemy 2.0
- APScheduler 3.10
- Google Places API
- BeautifulSoup4 + lxml
- httpx (async HTTP)

### Frontend (Next.js + React)
```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── login/          # Login page
│   │   └── dashboard/      # Main app with tabs
│   ├── components/          # React components
│   ├── hooks/              # React Query hooks
│   ├── lib/                # Utilities (API client)
│   └── types/              # TypeScript types
```

**Key Technologies:**
- Next.js 15
- React 19
- React Query 5
- Tailwind CSS
- Recharts (data viz)
- react-beautiful-dnd (drag-drop)

### Database (SQLite)
- 9 tables with relationships
- SQLAlchemy ORM with migrations
- Automatic indexes on key columns
- JSON support for flexible fields (emails, variables)

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Current user info

### Leads (Core)
- `GET /leads` - List with filters
- `POST /leads` - Create lead
- `GET /leads/{id}` - Get details
- `PATCH /leads/{id}` - Update
- `PATCH /leads/{id}/move` - Change stage

### Sub-resources
- `GET/POST /leads/{id}/tasks` - Task CRUD
- `GET/PATCH /leads/{id}/deal` - Deal management
- `GET/POST /leads/{id}/preview` - Preview management
- `GET/POST /leads/{id}/messages` - Message history

### Admin
- `GET/POST /templates` - Message templates
- `GET /dashboard/summary` - Metrics
- `GET /dashboard/pipeline` - Stage counts
- `GET /dashboard/financials` - Revenue/profit
- `POST /jobs/import` - Trigger lead import
- `GET /jobs/runs` - Import history

**Full API docs at:** `http://localhost:8000/docs` (Swagger UI)

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- pnpm 10+

### Installation & Development

```bash
# Clone/enter project
cd ~/Documents/lovable-crm

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic httpx beautifulsoup4
cd ..

# Frontend
cd frontend
pnpm install
cd ..

# Seed database
cd backend && python -m app.seed && cd ..

# Start both (in separate terminals)
# Terminal 1: Backend
cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && pnpm dev
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

### Quick Commands

```bash
# Using Makefile (recommended)
make dev                # Show development guide
make backend-dev        # Run backend only
make frontend-dev       # Run frontend only
make seed              # Seed database
make clean             # Remove generated files
make reset             # Full reset + reinstall

# Or individual commands
make install           # Install all deps
make docs             # Open API docs
```

## 🔐 Default Credentials

**Admin User:**
- Email: `admin@lovable.test`
- Password: `admin@123456`

⚠️ **Change in production!**

## 📦 Database Schema

### Core Tables
- `leads` - Business leads (Google Places data + custom fields)
- `deals` - Pricing & financials per lead
- `pipeline_events` - Audit trail of all status changes
- `tasks` - Checklists and follow-ups

### Communication Tables
- `message_templates` - Email + Instagram templates
- `outbound_messages` - Sent/drafted messages history

### Lovable Tables
- `lovable_previews` - Preview URLs + expiry tracking

### System Tables
- `lead_import_runs` - Google Places import history
- `users` - Team accounts

## 🔄 Scheduled Jobs (APScheduler)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `daily_import` | 07:00 Sydney | Import new leads from Google Places |
| `email_discovery` | Every 2h | Scrape websites for contact emails |
| `preview_expiration` | 08:00 Sydney | Mark 7-day-old previews as archived |
| `followup_scheduler` | 09:00 Sydney | Create follow-up tasks for stale leads |

## 🌍 Configuration

Create `.env` in project root:

```bash
# Security
SECRET_KEY=your_super_secret_key_min_32_chars
GOOGLE_PLACES_API_KEY=AIzaSy...

# URLs
NEXT_PUBLIC_API_URL=http://localhost:8000

# Defaults
DEFAULT_DAILY_LEAD_LIMIT=30
DEFAULT_SUBURBS=Surry Hills,Newtown,Bondi
DEFAULT_KEYWORDS=restaurant,cafe,gym

# Schedule (Sydney timezone)
DAILY_IMPORT_HOUR=7
EMAIL_DISCOVERY_INTERVAL_HOURS=2
```

## 📊 Pipeline Stages

```
NEW_CAPTURED
    ↓
PREVIEW_PENDING → PREVIEW_CREATED → SAMPLE_SENT
    ↓
WAITING_REPLY → LINK_SENT → PRICE_SENT → PAYMENT_SENT
    ↓
PAID → DELIVERED → WON
                   ↓
            LOST / NO_RESPONSE / ARCHIVED
```

## 🎯 Roadmap

### Phase 1 ✅ (Current)
- ✅ Lead capture & pipeline management
- ✅ Dashboard & reporting
- ✅ Manual message operations
- ✅ Basic financial tracking

### Phase 2 (Next - Stripe Integration)
- Stripe payment links
- Payment webhook handling
- Automatic "PAID" status updates

### Phase 3 (Later - Email/IG Automation)
- Mailgun/SendGrid email API
- Meta Graph API for Instagram DMs
- Rate limiting & delivery tracking

### Phase 4 (Future - AI Enhancement)
- Claude API for lead scoring
- AI-generated pitch personalization
- Predictive conversion analysis

## 📝 Project Structure

```
lovable-crm/
├── .env                    # Config (create from .env.example)
├── Makefile               # Development commands
├── README.md              # This file
├── FRONTEND_NEXT_STEPS.md # Frontend build guide
│
├── backend/
│   ├── pyproject.toml
│   ├── app/
│   │   ├── main.py
│   │   ├── models/        # SQLAlchemy ORM (9 tables)
│   │   ├── schemas/       # Pydantic models
│   │   ├── routers/       # REST endpoints
│   │   ├── services/      # Business logic
│   │   └── workers/       # APScheduler jobs
│   └── seed.py
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── src/
        ├── app/           # Next.js app router
        ├── components/    # React components
        ├── hooks/         # React Query hooks
        ├── lib/           # API client + utilities
        └── types/         # TypeScript interfaces
```

## 🧪 Testing

### Manual API Testing
```bash
# Using Swagger UI
open http://localhost:8000/docs

# Or with curl
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lovable.test","password":"admin@123456"}'
```

### Frontend Testing
1. Login: admin@lovable.test / admin@123456
2. Navigate to Dashboard
3. View Kanban board
4. Click "Import Leads" and test Google Places search
5. Create a test lead manually
6. Move it through pipeline stages

## 🐛 Troubleshooting

### "Address already in use" on port 8000
```bash
# Kill existing process
lsof -i :8000 | tail -1 | awk '{print $2}' | xargs kill -9
```

### Database locked error
```bash
# Remove and recreate database
cd backend && rm lovable_crm.db && python -m app.seed
```

### Frontend can't reach API
```bash
# Verify backend is running on 8000
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
```

## 📚 Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **Database Schema**: See `backend/app/models/` for 9 ORM models
- **Frontend Build Guide**: See `FRONTEND_NEXT_STEPS.md`
- **Implementation Plan**: See `.claude/plans/parsed-napping-frost.md`

## 🤝 Contributing

This is a single-operator CRM system. For enhancements:

1. Check the Phase roadmap above
2. Test changes locally before deploying
3. Update documentation as needed

## 📄 License

Private project for personal use.

---

**Built with ❤️ using FastAPI + Next.js + SQLite**

Started: Feb 2026 | Status: MVP Complete ✅
