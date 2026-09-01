@echo off
title Above Par Bookkeeping - Local Server
cd /d "%~dp0"
echo.
echo   Starting the Above Par Bookkeeping website...
echo   Keep THIS window open while you view the site.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [!] Node.js is not installed or not on PATH.
  echo       Install it from https://nodejs.org  then run this again.
  echo.
  pause
  exit /b 1
)

rem give the server a moment to boot, then open the browser
start "" /b cmd /c "timeout /t 2 >nul & start "" http://localhost:3110"

node serve.mjs

echo.
echo   Server stopped. Press any key to close.
pause >nul
