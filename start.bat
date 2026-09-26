@echo off
REM Starts the API (port 8000) and the website (port 5173) in two windows.
REM First run only: installs dependencies.
cd /d "%~dp0"

if not exist "frontend\node_modules" (
  echo Installing website dependencies...
  pushd frontend && call npm install && popd
)
python -c "import sqlmodel" 2>nul || (
  echo Installing API dependencies...
  python -m pip install -r backend\requirements.txt
)

start "Vaccination API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
start "Vaccination website" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Website: http://localhost:5173
echo API:     http://127.0.0.1:8000/docs
timeout /t 5 >nul
start "" http://localhost:5173
