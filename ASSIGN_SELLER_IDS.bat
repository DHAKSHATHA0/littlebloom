@echo off
echo ========================================
echo    ASSIGNING SELLER IDs TO EXISTING USERS
echo ========================================
echo.

echo Starting backend server check...
timeout /t 2 /nobreak >nul

echo Calling API to assign missing seller IDs...
curl -X POST "http://localhost:8080/api/users/assign-missing-ids" ^
     -H "Content-Type: application/json" ^
     -w "HTTP Status: %%{http_code}\n"

echo.
echo ========================================
echo    SELLER ID ASSIGNMENT COMPLETE
echo ========================================
echo.
echo Check the response above for results.
echo If you see HTTP Status: 200, the assignment was successful.
echo.
pause