# Lovable CRM - Frontend Next Steps

## ✅ Completed Foundation
- ✅ Next.js 15 project structure
- ✅ TypeScript types defined (`src/types/index.ts`)
- ✅ Axios API client with JWT auth (`src/lib/api.ts`)
- ✅ React Query setup (`src/lib/queryClient.ts`)
- ✅ Tailwind CSS configured
- ✅ Root layout and home page redirect

## 🚀 Next Tasks (in order)

### 1. Create React Query Hooks (HIGH PRIORITY)
Location: `src/hooks/`

Files needed:
- `useLeads.ts` - List, get, create, move leads
- `useAuth.ts` - Login, logout, get current user
- `useTasks.ts` - CRUD tasks per lead
- `useDeals.ts` - CRUD deals per lead
- `usePreviews.ts` - CRUD previews per lead
- `useMessages.ts` - CRUD outbound messages
- `useTemplates.ts` - List, get, create templates
- `useDashboard.ts` - Fetch dashboard metrics

Each should use axios + react-query patterns.

### 2. Login Page
Location: `src/app/login/page.tsx`

Features:
- Email + password form
- Login button with loading state
- Store JWT in localStorage
- Redirect to /dashboard on success
- Error display

### 3. Dashboard Layout
Location: `src/app/dashboard/`

Files needed:
- `layout.tsx` - Root dashboard layout with Sidebar + Topbar
- `components/Sidebar.tsx` - Navigation links
- `components/Topbar.tsx` - User info, logout
- `page.tsx` - Overview page with metric cards

### 4. Leads - Kanban Board (CORE FEATURE)
Location: `src/app/dashboard/leads/page.tsx`

Files needed:
- `KanbanBoard.tsx` - Main board layout
- `KanbanColumn.tsx` - Single column with cards
- `LeadCard.tsx` - Draggable lead card
- `MoveLeadDialog.tsx` - Confirm stage move

Use `react-beautiful-dnd` for drag-drop.

### 5. Lead Detail Page
Location: `src/app/dashboard/leads/[id]/page.tsx`

Files needed:
- `LeadDetailPanel.tsx` - Main detail view with tabs:
  - Overview (company info)
  - Tasks (checklist)
  - Deal (pricing)
  - Preview (Lovable URL + expiry)
  - Messages (history + send)
- `TaskChecklist.tsx` - Task list with checkboxes
- `DealCard.tsx` - Pricing/profit display
- `PreviewCard.tsx` - Preview URL + expiry countdown
- `MessageHistory.tsx` - Message log + send form

### 6. Import Page
Location: `src/app/dashboard/leads/import/page.tsx`

Files needed:
- `PlacesSearchForm.tsx` - Keywords, suburb, radius inputs
- `ImportResultTable.tsx` - Preview of fetched places
- `ImportRunHistory.tsx` - Past imports table

Features:
- Form to trigger Google Places import
- Polling for job status
- Display results
- Show past import runs

### 7. Financial Dashboard
Location: `src/app/dashboard/financials/page.tsx`

Components (use `recharts`):
- `RevenueChart.tsx` - Monthly bar chart
- `ConversionFunnel.tsx` - Funnel chart
- `PipelineValueCard.tsx` - Value by stage
- `ProfitMarginCard.tsx` - Margin % + deals

### 8. Templates & Settings Pages
Location: `src/app/dashboard/templates/page.tsx` & `src/app/dashboard/settings/page.tsx`

Templates:
- Table of message templates with CRUD buttons
- Create/edit form

Settings:
- Daily lead limit
- Keywords list
- Suburbs
- Preview expiry days
- Lovable cost estimate

### 9. Utility Components
Location: `src/components/ui/`

Need shadcn/ui components:
- Button
- Card
- Input
- Select
- Dialog
- Tabs
- Badge
- Table

Can use shadcn/ui CLI:
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input select dialog tabs badge table
```

## 🔗 Backend Integration

All hooks should call `api` from `src/lib/api.ts`:

```typescript
export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get("/leads").then(r => r.data),
  })
}
```

## 📋 Testing Flow

1. Start backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && pnpm dev`
3. Open http://localhost:3000
4. Login with: `admin@lovable.test` / `admin@123456`
5. Test importing leads → viewing Kanban → editing lead detail

## 📚 Key Files Reference

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Database**: `backend/lovable_crm.db` (SQLite)
- **Config**: `.env` file in root

## 💡 Tips

- Use React Query devtools: `npm i @tanstack/react-query-devtools`
- Test API endpoints with Swagger before building UI
- Each page should have a loading state and error fallback
- Use `useCallback` for handlers to avoid unnecessary re-renders
- Store auth token in localStorage + Context/Zustand for global auth state

Good luck! 🚀
