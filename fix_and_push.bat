@echo off
echo ==========================================
echo  Finalizing Bookly App Update (Fixing Build Error)
echo ==========================================
echo.
echo 1. Fixing TailwindCSS Version (Downgrading to v3)...
call npm install -D tailwindcss@3.4.17 postcss autoprefixer
echo.
echo 2. Committing changes...
git add .
git commit -m "fix: downgrade to tailwindcss v3 to fix build error"
echo.
echo 3. Pushing to GitHub...
git push
echo.
echo 4. Verifying Build...
call npm run build
echo.
echo ==========================================
echo  Status Check:
echo  - If verify build says "Done", you are ready!
echo  - The "Red X" on GitHub should turn Green.
echo ==========================================
pause
