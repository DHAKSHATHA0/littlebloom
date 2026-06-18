@echo off
echo ========================================
echo    ASSIGNING ALL USER IDs (BUYER & SELLER)
echo ========================================
echo.

echo Starting backend server check...
timeout /t 2 /nobreak >nul

echo Calling API to assign missing buyer and seller IDs...
curl -X POST "http://localhost:8080/api/users/assign-missing-ids" ^
     -H "Content-Type: application/json" ^
     -w "HTTP Status: %%{http_code}\n"

echo.
echo ========================================
echo    USER ID ASSIGNMENT COMPLETE
echo ========================================
echo.
echo This script assigns:
echo - Buyer IDs (by0001, by0002, etc.) to BUYER users
echo - Seller IDs (se0001, se0002, etc.) to SELLER users
echo.
echo Check the response above for results.
echo If you see HTTP Status: 200, the assignment was successful.
echo.
pause