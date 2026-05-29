@echo off
set "SECRET_KEY=change-me-in-production"
set "DATABASE_URL=sqlite:///C:/Users/Administrator/OneDrive/Desktop/AlphaBox/backend/alphabox_dev.db"
set "BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000"
set "INITIAL_ADMIN_EMAIL=admin@alphabox.com"

pushd "%~dp0..\..\backend"
python -m alembic upgrade head
if errorlevel 1 (
  popd
  exit /b 1
)
python -m uvicorn app.main:app
popd
