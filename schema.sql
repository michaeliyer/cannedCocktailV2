PRAGMA foreign_keys = ON;

-- Drop tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;

-- Products table
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT
);

-- Product Variants table
CREATE TABLE product_variants (
    variant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    size TEXT,
    unit_price REAL,
    units_in_stock INTEGER,
    units_sold INTEGER DEFAULT 0, -- Add this line
    sku TEXT UNIQUE,
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);


-- Orders table
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    date TEXT,
    total_price REAL,
    payments REAL,
    balance REAL,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

-- Order Items table
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    variant_id INTEGER NOT NULL,
    quantity INTEGER,
    subtotal REAL,
    FOREIGN KEY (order_id) REFERENCES orders (order_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id),
    FOREIGN KEY (variant_id) REFERENCES product_variants (variant_id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT
);

