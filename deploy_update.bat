@echo off
echo ==========================================
echo  Deploying Bookly v2.2 (Inventory Linking)
echo ==========================================
echo.
echo 1. Adding inventory linking features...
git add .
git commit -m "feat: link manual sale items to inventory products"
echo.
echo 2. Pushing to GitHub (Triggers Vercel)...
git push
echo.
echo ==========================================
echo  DEPLOYMENT SENT!
echo  Check Vercel dashboard in 1-2 minutes.
echo ==========================================
pause
