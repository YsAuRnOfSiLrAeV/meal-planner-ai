# backend_python (FastAPI)

Minimal Python backend scaffold for AI Meal Planner:

- FastAPI app with strict CORS (allowlist by `FRONTEND_ORIGIN`)
- OAuth2/OIDC hook point (current stub in `api/v1/deps.py` requires Bearer token)
- Endpoint `POST /api/v1/plan` returning a minimal deterministic plan
- Placeholders for LLM integration (`app/llm/*`)

## Quickstart

1) Create and activate a virtual environment, then install deps:
```
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r backend_python/requirements.txt
```

2) Configure env (copy `.env.example` → `.env` and set values).

3) Run (port 8008):
```
uvicorn app.main:app --host 0.0.0.0 --port 8008 --reload
```

4) Test:
```
curl -X POST http://localhost:8008/api/v1/plan ^
 -H "Authorization: Bearer demo" ^
 -H "Content-Type: application/json" ^
 -d "{\"aim\":\"HYPERTROPHY\",\"preparationStyle\":\"QUICK\"}"
```

## Environment

- `FRONTEND_ORIGIN` — e.g., `http://localhost:3000`
- `OIDC_ISSUER`, `OIDC_AUDIENCE` — for JWT verification (future step)
- `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_BASE_URL`, `OPENAI_MODEL` — for LLM

## Next steps

- Implement real OIDC verification in `api/v1/deps.py` using issuer JWKs.
- Wire `app.llm.client.chat` to OpenRouter/OpenAI and validate response via `app.llm.validator`.
- Add persistence (PostgreSQL + SQLAlchemy + Alembic) if required.


