# Canned Cocktail Inventory

A simple inventory and order tracking system for a canned cocktail business.

## Features

- Add/Edit/Delete Products
- Add/Edit/Delete Product Variants
- Auto-generated SKU numbers
- Add stock per variant
- View full inventory summary
- SQLite + Node.js + Express backend
- Simple HTML/CSS/JS front-end

## Setup

1. Clone repo
2. Install dependencies:
3. Start server:
4. Open `index.html` in browser.

## Folder Structure

PAYMENTS TABLE:

-- CREATE TABLE payments (
-- payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
-- customer_id INTEGER NOT NULL,
-- order_id INTEGER,
-- amount REAL NOT NULL,
-- payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
-- notes TEXT,
-- FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
-- FOREIGN KEY (order_id) REFERENCES orders(order_id)
-- );
