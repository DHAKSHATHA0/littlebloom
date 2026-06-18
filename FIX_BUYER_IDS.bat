@echo off
echo ============================================================================
echo QUICK FIX: Assigning Buyer IDs to Existing Users
echo ============================================================================
echo.
echo OPTION 1: Run SQL Migration (Recommended)
echo ------------------------------------------
echo Copy and paste this SQL into your PostgreSQL database:
echo.
echo UPDATE users SET buyer_id = 'by' ^|^| LPAD(id::text, 4, '0') WHERE role = 'BUYER' AND buyer_id IS NULL;
echo UPDATE users SET seller_id = 'se' ^|^| LPAD(id::text, 4, '0') WHERE role = 'SELLER' AND seller_id IS NULL;
echo.
echo OPTION 2: Use API Endpoint (Alternative)
echo ----------------------------------------
echo 1. Start your backend server
echo 2. Open browser and go to: http://localhost:8080/users/assign-missing-ids
echo 3. This will automatically assign IDs to all existing users
echo.
echo OPTION 3: Manual Database Update
echo --------------------------------
echo 1. Connect to your PostgreSQL database
echo 2. Run: SELECT * FROM users WHERE buyer_id IS NULL OR seller_id IS NULL;
echo 3. Run the UPDATE statements above
echo.
echo ============================================================================
echo After running any option above:
echo 1. Restart your backend server
echo 2. Refresh your browser (Ctrl+F5)
echo 3. Check the seller dashboard - buyer IDs should now display correctly
echo ============================================================================
pause