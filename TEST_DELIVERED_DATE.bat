@echo off
echo Testing Delivered Date Functionality...
echo.

REM Test 1: Check if delivered_at column exists
echo 1. Checking if delivered_at column exists in order_items table...
mysql -u root -p -e "USE little_bloom_db; DESCRIBE order_items;" | findstr delivered_at
if %errorlevel% equ 0 (
    echo ✅ delivered_at column exists
) else (
    echo ❌ delivered_at column missing - run ADD_DELIVERED_AT_COLUMN.bat first
    pause
    exit /b 1
)

echo.

REM Test 2: Check current delivered orders
echo 2. Checking current delivered orders...
mysql -u root -p -e "USE little_bloom_db; SELECT id, status, created_at, updated_at, delivered_at FROM order_items WHERE status = 'DELIVERED' LIMIT 5;"

echo.

REM Test 3: Show orders without delivered_at (need manual delivery)
echo 3. Orders that need to be marked as delivered to test functionality...
mysql -u root -p -e "USE little_bloom_db; SELECT id, status, created_at, updated_at, delivered_at FROM order_items WHERE status != 'DELIVERED' LIMIT 5;"

echo.
echo Test Instructions:
echo 1. Run the backend server (START_BACKEND.bat)
echo 2. Run the frontend server (START_FRONTEND.bat)
echo 3. Login as a seller
echo 4. Go to Seller Orders page
echo 5. Mark an order as "DELIVERED"
echo 6. Check the Profile page to see the exact delivery date
echo.
echo The delivered_at field should show the exact timestamp when you clicked "Mark as Delivered"
echo.

pause