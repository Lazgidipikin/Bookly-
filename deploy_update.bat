@echo off
echo ==========================================
echo  Deploying Itemized Sales Feature (Bookly v2.1)
echo ==========================================
echo.
echo 1. Adding simplified cart features...
git add .
git commit -m "feat: implement itemized sales cart (manual & AI)"
echo.
echo 2. Pushing to GitHub (Triggers Vercel)...
git push
echo.
echo ==========================================
echo  DEPLOYMENT SENT!
echo  Check Vercel dashboard in 1-2 minutes.
echo ==========================================
pause
