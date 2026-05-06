@echo off
echo Adding delivered_at column to order_items table...
echo.

REM Change to the database directory
cd /d "%~dp0database"

REM Run the migration
mysql -u root -p little_bloom_db < add_delivered_at_column.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully added delivered_at column to order_items table!
    echo.
    echo The migration has:
    echo - Added delivered_at column to order_items table
    echo - Created index for better performance
    echo - Updated existing delivered orders with historical data
    echo.
) else (
    echo.
    echo ❌ Error running migration. Please check your database connection.
    echo.
)

pause