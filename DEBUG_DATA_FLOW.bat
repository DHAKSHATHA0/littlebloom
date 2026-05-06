@echo off
echo ========================================
echo  Little Bloom - Data Flow Debug Test
echo ========================================

echo.
echo 1. Testing Database Data...
echo.
curl -X GET "http://localhost:8080/api/debug/database-check" -H "Content-Type: application/json"

echo.
echo.
echo 2. Testing Specific Seller Data (Seller ID 1)...
echo.
curl -X GET "http://localhost:8080/api/debug/seller/1" -H "Content-Type: application/json"

echo.
echo.
echo 3. Testing Analytics Health Check...
echo.
curl -X GET "http://localhost:8080/api/time-analytics/health" -H "Content-Type: application/json"

echo.
echo.
echo 4. Testing Python Analytics Service...
echo.
curl -X GET "http://localhost:5000/health" -H "Content-Type: application/json"

echo.
echo.
echo 5. Testing Python Analytics with Sample Data...
echo.
curl -X POST "http://localhost:5000/analytics/dashboard" ^
-H "Content-Type: application/json" ^
-d "{\"orders\": [{\"date\": \"2024-01-15\", \"amount\": 1500}, {\"date\": \"2024-01-16\", \"amount\": 2000}]}"

echo.
echo.
echo ========================================
echo  Debug Test Complete
echo ========================================
pause