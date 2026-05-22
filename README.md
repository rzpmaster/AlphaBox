# AlphaBox / 韭菜盒子

Private invitation-only investment signal subscription platform. AlphaBox lets users follow experienced traders, read posts, and view trading signals. It does not execute trades and does not connect to broker accounts.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, TailwindCSS, TanStack Query
- Backend: FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Redis
- Architecture: separated frontend/backend, REST API, OpenAPI, modular monolith backend

## Quick Start

1. Copy environment files:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env.local`
2. Start infrastructure and apps:
   - `docker compose up --build`
3. The backend runs migrations and ensures the initial admin on startup.

Default admin credentials:

- Email: `admin@alphabox.local`
- Password: `ChangeMe123!`

Override them in `backend/.env` with:

- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`
- `INITIAL_ADMIN_DISPLAY_NAME`

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
OpenAPI: http://localhost:8000/docs

## MVP Scope

- Invitation-only registration
- JWT login
- Admin invitation code generation
- Leader profiles, list, detail
- Free subscriptions
- Leader posts and trading signals
- Subscriber feed ordered by newest first
