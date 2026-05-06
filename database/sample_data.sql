-- Sample data for testing analytics
-- Run this in your PostgreSQL database

-- Insert sample users (if not exists)
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES 
    ('Test Seller', 'seller@test.com', '$2a$10$example', 'SELLER', NOW(), NOW()),
    ('Test Buyer', 'buyer@test.com', '$2a$10$example', 'BUYER', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample products (if not exists)
INSERT INTO products (name, description, price, quantity, category, image_url, seller_id, created_at, updated_at)
VALUES 
    ('Baby Toy Car', 'Colorful toy car for babies', 1500.00, 50, 'Toys', 'toy-car.jpg', 1, NOW(), NOW()),
    ('Baby Clothes Set', 'Soft cotton clothes for babies', 2500.00, 30, 'Clothing', 'clothes.jpg', 1, NOW(), NOW()),
    ('Baby Bottle', 'BPA-free baby bottle', 800.00, 100, 'Feeding', 'bottle.jpg', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (buyer_id, status, payment_method, total_price, created_at, updated_at)
VALUES 
    (2, 'DELIVERED', 'COD', 4800.00, '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
    (2, 'DELIVERED', 'COD', 3200.00, '2024-01-16 14:20:00', '2024-01-16 14:20:00'),
    (2, 'DELIVERED', 'COD', 1600.00, '2024-01-17 09:15:00', '2024-01-17 09:15:00'),
    (2, 'PENDING', 'COD', 2400.00, '2024-01-18 16:45:00', '2024-01-18 16:45:00')
ON CONFLICT DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, seller_id, quantity, price, status, created_at, updated_at)
VALUES 
    (1, 1, 1, 2, 1500.00, 'DELIVERED', '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
    (1, 3, 1, 2, 800.00, 'DELIVERED', '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
    (2, 2, 1, 1, 2500.00, 'DELIVERED', '2024-01-16 14:20:00', '2024-01-16 14:20:00'),
    (2, 3, 1, 1, 800.00, 'DELIVERED', '2024-01-16 14:20:00', '2024-01-16 14:20:00'),
    (3, 1, 1, 1, 1500.00, 'DELIVERED', '2024-01-17 09:15:00', '2024-01-17 09:15:00'),
    (4, 2, 1, 1, 2500.00, 'PENDING', '2024-01-18 16:45:00', '2024-01-18 16:45:00')
ON CONFLICT DO NOTHING;

-- Add more recent data for better analytics
INSERT INTO order_items (order_id, product_id, seller_id, quantity, price, status, created_at, updated_at)
VALUES 
    (1, 1, 1, 1, 1500.00, 'DELIVERED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (2, 2, 1, 1, 2500.00, 'DELIVERED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (3, 3, 1, 2, 800.00, 'DELIVERED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (4, 1, 1, 1, 1500.00, 'DELIVERED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    (1, 2, 1, 1, 2500.00, 'DELIVERED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (2, 3, 1, 1, 800.00, 'DELIVERED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    (3, 1, 1, 2, 1500.00, 'DELIVERED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items;

-- Check seller orders
SELECT 
    oi.seller_id,
    COUNT(*) as total_orders,
    SUM(oi.price * oi.quantity) as total_revenue,
    MIN(oi.created_at) as first_order,
    MAX(oi.created_at) as last_order
FROM order_items oi
GROUP BY oi.seller_id;