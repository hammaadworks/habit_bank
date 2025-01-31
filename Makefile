.PHONY: dev backend frontend install

# Run both Backend and Frontend in parallel
dev:
	@echo "🚀 Starting Habit Bank (Native)..."
	@make -j 2 backend frontend

# Start FastAPI Backend
backend:
	@echo "🐍 Starting Backend..."
	@cd backend && uv run uvicorn app.main:app --reload --port 8000

# Start Next.js Frontend
frontend:
	@echo "⚛️ Starting Frontend..."
	@cd frontend && pnpm dev

# One-time setup for dependencies
install:
	@echo "📦 Installing all dependencies..."
	@cd backend && uv sync
	@cd frontend && pnpm install
