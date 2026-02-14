@echo off
echo ==========================================
echo  Deploying Bookly v2.3 (Complete Rebrand)
echo ==========================================
echo.
echo Updates included:
echo - Itemized sales cart
echo - Inventory linking
echo - Teal rebrand (Tumm design)
echo - Logo consistency
echo.
echo 1. Adding all changes...
git add .
git commit -m "feat: complete rebrand with teal theme, itemized sales, and inventory linking"
echo.
echo 2. Pushing to GitHub (Triggers Vercel)...
git push
echo.
echo ==========================================
echo  DEPLOYMENT COMPLETE!
echo  Check Vercel in 1-2 minutes.
echo ==========================================
pause
