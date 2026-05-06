-- SQL Script to assign seller_id to existing users who don't have one
-- This script assigns seller IDs in the format: se0001, se0002, etc.

-- Update existing SELLER users who don't have a seller_id
UPDATE users 
SET seller_id = CONCAT('se', LPAD(id, 4, '0'))
WHERE role = 'SELLER' 
AND (seller_id IS NULL OR seller_id = '');

-- Verify the updates
SELECT id, name, email, role, seller_id 
FROM users 
WHERE role = 'SELLER'
ORDER BY id;

-- Show count of updated records
SELECT 
    COUNT(*) as total_sellers,
    COUNT(seller_id) as sellers_with_id,
    COUNT(*) - COUNT(seller_id) as sellers_without_id
FROM users 
WHERE role = 'SELLER';