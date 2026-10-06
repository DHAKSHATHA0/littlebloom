-- ============================================================================
-- Little Bloom E-commerce - Analytics Data Layer & Star Schema for Power BI
-- Database: PostgreSQL
-- ============================================================================

-- ============================================================================
-- 1. FLAT ANALYTICS VIEW: sales_analytics
-- Direct flat denormalized view connecting orders, order_items, products, and users
-- ============================================================================
CREATE OR REPLACE VIEW sales_analytics AS
SELECT 
    oi.id AS sale_id,
    o.id AS order_id,
    o.created_at AS order_date,
    CAST(o.created_at AS DATE) AS order_date_only,
    TO_CHAR(o.created_at, 'YYYYMMDD')::INT AS date_key,
    p.id AS product_id,
    p.name AS product_name,
    p.category AS category,
    oi.seller_id AS seller_id,
    s.name AS seller_name,
    s.email AS seller_email,
    o.user_id AS buyer_id,
    b.name AS buyer_name,
    b.email AS buyer_email,
    b.city AS buyer_city,
    b.state AS buyer_state,
    oi.quantity AS quantity,
    oi.price AS unit_price,
    (oi.quantity * oi.price) AS total_price,
    o.status AS order_status,
    o.payment_method AS payment_method,
    oi.status AS item_status,
    oi.delivered_at AS delivered_at,
    o.created_at AS created_at
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
JOIN users s ON oi.seller_id = s.id
JOIN users b ON o.user_id = b.id
WHERE o.status != 'CANCELLED';

-- ============================================================================
-- 2. STAR SCHEMA DIMENSIONS & FACT VIEWS
-- ============================================================================

-- DIM_DATE VIEW
CREATE OR REPLACE VIEW dim_date AS
SELECT DISTINCT
    TO_CHAR(d, 'YYYYMMDD')::INT AS date_key,
    d AS full_date,
    EXTRACT(DAY FROM d)::INT AS day_of_month,
    TO_CHAR(d, 'Day') AS day_name,
    EXTRACT(DOW FROM d)::INT AS day_of_week,
    EXTRACT(WEEK FROM d)::INT AS week_of_year,
    EXTRACT(MONTH FROM d)::INT AS month_number,
    TO_CHAR(d, 'Month') AS month_name,
    TO_CHAR(d, 'Mon') AS month_short,
    EXTRACT(QUARTER FROM d)::INT AS quarter,
    EXTRACT(YEAR FROM d)::INT AS year,
    CASE WHEN EXTRACT(DOW FROM d) IN (0, 6) THEN TRUE ELSE FALSE END AS is_weekend
FROM (
    SELECT generate_series(
        DATE '2020-01-01', 
        DATE '2030-12-31', 
        INTERVAL '1 day'
    )::DATE AS d
) dates;

-- DIM_PRODUCT VIEW
CREATE OR REPLACE VIEW dim_product AS
SELECT 
    id AS product_id,
    name AS product_name,
    category AS category_name,
    price AS unit_price,
    quantity AS stock_quantity,
    size AS product_size,
    seller_id AS seller_id,
    created_at AS created_at
FROM products;

-- DIM_CUSTOMER VIEW
CREATE OR REPLACE VIEW dim_customer AS
SELECT 
    id AS buyer_id,
    name AS customer_name,
    email AS customer_email,
    buyer_id AS buyer_code,
    city AS city,
    state AS state,
    postal_code AS postal_code,
    phone AS phone,
    created_at AS registration_date
FROM users
WHERE role = 'BUYER';

-- DIM_SELLER VIEW
CREATE OR REPLACE VIEW dim_seller AS
SELECT 
    id AS seller_id,
    name AS seller_name,
    email AS seller_email,
    seller_id AS seller_code,
    city AS city,
    state AS state,
    phone AS phone,
    created_at AS registration_date
FROM users
WHERE role = 'SELLER';

-- DIM_CATEGORY VIEW
CREATE OR REPLACE VIEW dim_category AS
SELECT 
    category AS category_name,
    COUNT(id) AS total_products,
    AVG(price) AS avg_product_price
FROM products
GROUP BY category;

-- FACT_SALES VIEW
CREATE OR REPLACE VIEW fact_sales AS
SELECT 
    oi.id AS sales_key,
    o.id AS order_id,
    TO_CHAR(o.created_at, 'YYYYMMDD')::INT AS date_key,
    oi.product_id AS product_id,
    oi.seller_id AS seller_id,
    o.user_id AS buyer_id,
    oi.quantity AS quantity,
    oi.price AS unit_price,
    (oi.quantity * oi.price) AS total_price,
    o.shipping_cost AS shipping_cost,
    o.gst AS gst,
    o.payment_method AS payment_method,
    o.status AS order_status,
    oi.status AS item_status,
    oi.delivered_at AS delivered_at,
    o.created_at AS transaction_timestamp
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'CANCELLED';
