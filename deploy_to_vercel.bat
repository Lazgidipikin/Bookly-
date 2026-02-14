@echo off
echo Deploying to Vercel...
echo.
echo 1. Installing Vercel CLI (if missing)...
call npm install -g vercel
echo.
echo 2. Starting Deployment...
echo    - You may be asked to Log In.
echo    - Keep pressing ENTER to accept default settings.
echo.
call vercel
echo.
pause
