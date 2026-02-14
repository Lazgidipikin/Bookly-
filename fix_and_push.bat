@echo off
echo ==========================================
echo  Finalizing Bookly App Update
echo ==========================================
echo.
echo 1. Ensuring TailwindCSS is installed...
call npm install -D tailwindcss postcss autoprefixer
echo.
echo 2. Committing changes...
git add .
git commit -m "fix: ensure tailwindcss dependencies are installed"
echo.
echo 3. Pushing to GitHub...
git push
echo.
echo 4. Verifying Build...
call npm run build
echo.
echo ==========================================
echo  Status Check:
echo  - If Build says "Done", you are ready to Deploy on Vercel!
echo  - If GitHub push says "Everything up-to-date", you are good!
echo ==========================================
pause
