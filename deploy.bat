@echo off
echo ====================================================
echo Deploying frontend to GitHub Pages...
echo ====================================================
git subtree push --prefix frontend origin gh-pages
echo.
echo ====================================================
echo Deployment push complete!
echo Your live site will update shortly at:
echo https://muskanagrahari2604-sys.github.io/Edu-manager/
echo ====================================================
pause
