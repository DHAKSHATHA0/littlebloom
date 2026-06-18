@echo off
echo ============================================================================
echo Running Database Migration to Assign Buyer/Seller IDs
echo ============================================================================
echo.
echo Please run the following SQL commands in your PostgreSQL database:
echo.
echo -- Assign buyer_ids for all existing buyers
echo UPDATE users 
echo SET buyer_id = 'by' ^|^| LPAD(id::text, 4, '0')
echo WHERE role = 'BUYER' AND buyer_id IS NULL;
echo.
echo -- Assign seller_ids for all existing sellers  
echo UPDATE users
echo SET seller_id = 'se' ^|^| LPAD(id::text, 4, '0')
echo WHERE role = 'SELLER' AND seller_id IS NULL;
echo.
echo -- Verify the migration
echo SELECT id, name, email, role, buyer_id, seller_id FROM users;
echo.
echo ============================================================================
echo After running these SQL commands, restart your backend server
echo ============================================================================
pause