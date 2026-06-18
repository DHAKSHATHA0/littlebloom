@echo off
echo Closing all Chrome instances...
taskkill /f /im chrome.exe >nul 2>&1

echo Creating temp directory...
if not exist "c:\temp\chrome-dev" mkdir "c:\temp\chrome-dev"

echo Starting Chrome with dev flags...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--disable-web-security ^
--user-data-dir="c:\temp\chrome-dev" ^
--allow-running-insecure-content ^
--disable-features=VizDisplayCompositor ^
--disable-site-isolation-trials ^
--disable-features=BlockInsecurePrivateNetworkRequests ^
--allow-insecure-localhost ^
--ignore-certificate-errors ^
--ignore-ssl-errors ^
--ignore-certificate-errors-spki-list ^
--disable-extensions ^
http://localhost:3000

echo Chrome started in dev mode
pause