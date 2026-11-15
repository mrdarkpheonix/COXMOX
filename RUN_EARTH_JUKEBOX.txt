@echo off
setlocal
pushd "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found on PATH.
  echo Install the current Node.js LTS release from https://nodejs.org/
  echo Then close and reopen this window and run this file again.
  pause
  popd
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS with npm enabled.
  pause
  popd
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. See the npm output above.
    pause
    popd
    exit /b 1
  )
)

echo Starting The Coxmox at http://127.0.0.1:5173
call npm run dev -- --open
set "APP_EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %APP_EXIT_CODE%
