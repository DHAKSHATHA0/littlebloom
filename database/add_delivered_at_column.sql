-- Add deliveredAt column to order_items table
-- This migration adds the delivered_at column to track when sellers mark orders as delivered

ALTER TABLE order_items 
ADD COLUMN delivered_at DATETIME NULL;

-- Add comment to the column
ALTER TABLE order_items 
MODIFY COLUMN delivered_at DATETIME NULL COMMENT 'Timestamp when seller marked order as delivered';

-- Create index for better query performance
CREATE INDEX idx_order_items_delivered_at ON order_items(delivered_at);

-- Update existing delivered orders to set delivered_at = updated_at for historical data
UPDATE order_items 
SET delivered_at = updated_at 
WHERE status = 'DELIVERED' AND delivered_at IS NULL;

-- Verify the changes
SELECT 
    id,
    status,
    created_at,
    updated_at,
    delivered_at
FROM order_items 
WHERE status = 'DELIVERED'
LIMIT 10;