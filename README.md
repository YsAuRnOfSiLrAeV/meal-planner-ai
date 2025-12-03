# AI Meal Planner

Full-stack application that generates tailored weekly meal plans from user inputs. The project consists of a FastAPI backend backed by PostgreSQL (SQLAlchemy + Alembic) and a Next.js 15 frontend with NextAuth.js Google OAuth. An OpenRouter LLM call produces the plan, and CI/CD pipelines ship the frontend to Vercel and the backend to Render.

## Repository Layout

`backend/` FastAPI app, Alembic migrations, pytest suite, GitHub Actions workflow.
`frontend/` Next.js App Router UI, NextAuth configuration, Tailwind styles, Vercel configs.
`docker-compose.yml` Convenience service for local PostgreSQL (port `5432`).

## Prerequisites

- Python 3.11+ and `pip`
- Node.js 20+ with `npm`
- Docker Desktop (for local PostgreSQL)  
- OpenRouter API key and Google OAuth credentials

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql+psycopg://meal:mealpass@localhost:5432/ai_meal_planner
FRONTEND_ORIGIN=http://localhost:3000
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=optional-if-using-openai
OPENROUTER_BASE_URL=https://openrouter.ai/api
OPENAI_MODEL=google/gemini-2.5-flash
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_BACKEND_BASE=http://localhost:8008
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=a-random-long-string
NEXTAUTH_URL=http://localhost:3000
```

## Local Development Setup

1. **Start PostgreSQL**
   ```bash
   docker compose up -d postgres
   ```

2. **Backend**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --port 8008
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend automatically proxies user sign-ins to the backend (`/api/v1/users/upsert`) and meal generation requests to `/api/v1/plan`.

## Running Tests

- **Backend**: `cd backend && .venv\Scripts\activate && pytest`
- **Frontend**: `cd frontend && npm run lint && npm run test` (placeholder test exits successfully)

CI mirrors these commands inside GitHub Actions.

## Deployment Notes

- **Backend (Render)**: Deploy the `backend` directory as a Python web service using `uvicorn app.main:app --host 0.0.0.0 --port 10000`. Provision a managed PostgreSQL instance or supply a hosted `DATABASE_URL`, then set the same environment variables as the local `.env` plus the production `FRONTEND_ORIGIN` (e.g., `https://meal-planner-ai-front.vercel.app`). Run `alembic upgrade head` on each release (Render “Deploy Hook” or manual shell).

- **Frontend (Vercel)**: Connect the repo, set the `.env.local` variables in the Vercel dashboard, and ensure `NEXT_PUBLIC_BACKEND_BASE` points to the Render backend URL. Every push to `main` triggers `npm run build` automatically.

Both services rely on the GitHub Actions workflows in `.github/workflows/` for linting, tests, and deploy validation.

