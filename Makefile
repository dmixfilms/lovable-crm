.PHONY: help dev backend-dev frontend-dev install seed clean reset docs

help:
	@echo "Lovable CRM - Development Commands"
	@echo "=================================="
	@echo ""
	@echo "make dev              - Start both backend and frontend (in separate terminals)"
	@echo "make backend-dev      - Start FastAPI backend only"
	@echo "make frontend-dev     - Start Next.js frontend only"
	@echo "make install          - Install all dependencies"
	@echo "make seed             - Seed database with templates and admin user"
	@echo "make clean            - Remove node_modules, venv, .db files"
	@echo "make reset            - Full reset (clean + reinstall + seed)"
	@echo "make docs             - Open API docs (http://localhost:8000/docs)"
	@echo ""

install:
	@echo "Installing backend..."
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -q -r <(grep -v '^#' pyproject.toml | grep -oP '"\K[^"]+' | head -20)
	@echo "✓ Backend installed"
	@echo ""
	@echo "Installing frontend..."
	cd frontend && pnpm install
	@echo "✓ Frontend installed"

seed:
	@echo "Seeding database..."
	cd backend && source venv/bin/activate && python -m app.seed
	@echo "✓ Database seeded"

backend-dev:
	cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000

frontend-dev:
	cd frontend && pnpm dev

dev:
	@echo "Starting Lovable CRM development environment..."
	@echo "=========================================="
	@echo ""
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "Open 2 terminals and run:"
	@echo "  Terminal 1: make backend-dev"
	@echo "  Terminal 2: make frontend-dev"
	@echo ""

clean:
	@echo "Cleaning up..."
	rm -rf backend/venv backend/.venv backend/lovable_crm.db
	rm -rf frontend/node_modules frontend/.next
	@echo "✓ Cleaned"

reset: clean install seed
	@echo "✓ Full reset complete!"

docs:
	@which open > /dev/null && open http://localhost:8000/docs || echo "Open http://localhost:8000/docs in your browser"

# Quick lint (if needed later)
lint:
	cd backend && source venv/bin/activate && python -m pytest app/ --tb=short || true
	cd frontend && pnpm lint || true
