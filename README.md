# AlphaBox / 韭菜盒子

Private invitation-only investment signal subscription platform. AlphaBox lets users follow experienced traders, read posts, and view trading signals. It does not execute trades and does not connect to broker accounts.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, TanStack Query
- Backend: FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Redis
- Architecture: separated frontend/backend, REST API, OpenAPI, modular monolith backend

## Quick Start

1. Copy environment files:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env.local`
2. If a host port is already in use, edit the root `.env` before starting Docker Compose:
   - `FRONTEND_PORT`
   - `BACKEND_PORT`
   - Postgres and Redis are internal by default in Docker Compose deployment.
3. If `FRONTEND_PORT` changes, also update the local CORS origins in the root `.env`:
   - `BACKEND_CORS_ORIGINS`
4. Start infrastructure and apps:
   - `docker compose up --build`
5. The backend runs migrations and ensures the initial admin on startup.

Default admin credentials:

- Email: `admin@alphabox.com`
- Password: `ChangeMe123!`

Override them in `backend/.env` with:

- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`
- `INITIAL_ADMIN_DISPLAY_NAME`

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
OpenAPI: http://localhost:8000/docs

Docker Compose reads the root `.env` for variable substitution. Values declared under a service's `environment` override values loaded by that service's `env_file`; this is why deployment-specific settings can live in the root `.env` while `.env.example` files keep local defaults.

When serving through Nginx, keep `NEXT_PUBLIC_API_URL=/api/v1`. Public browser requests then stay on the same domain and Nginx routes `/api/` to the backend. `INTERNAL_API_URL` is only used by the Next.js server rewrite; in Docker Compose it should normally be `http://backend:8000`.

## MVP Scope

- Invitation-only registration
- JWT login
- Admin invitation code generation
- Leader profiles, list, detail
- Free subscriptions
- Leader posts and trading signals
- Subscriber feed ordered by newest first
