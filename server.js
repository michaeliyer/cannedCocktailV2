const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db/cannedCocktailV2.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- ROUTES ---

// Get all products
app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new product
app.post('/products', (req, res) => {
  const { name, description, category } = req.body;
  if (!name) return res.status(400).json({ error: "Product name required." });

  db.run(
    "INSERT INTO products (name, description, category) VALUES (?, ?, ?)",
    [name, description, category],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Product added!", product_id: this.lastID });
    }
  );
});

// Update product
app.put('/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, category } = req.body;

  db.run(
    "UPDATE products SET name = ?, description = ?, category = ? WHERE product_id = ?",
    [name, description, category, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Product updated successfully!" });
    }
  );
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM products WHERE product_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted successfully!" });
  });
});

// Get all variants for a product
app.get('/products/:id/variants', (req, res) => {
  const id = req.params.id;
  db.all("SELECT * FROM product_variants WHERE product_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add variant
app.post('/variants', (req, res) => {
  const { product_id, size, unit_price, units_in_stock, sku } = req.body;
  if (!product_id || !sku) return res.status(400).json({ error: "Product ID & SKU required." });

  db.run(
    `INSERT INTO product_variants (product_id, size, unit_price, units_in_stock, sku) 
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, size, unit_price, units_in_stock, sku],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Variant added!", variant_id: this.lastID });
    }
  );
});

// Update variant
app.put('/variants/:id', (req, res) => {
  const id = req.params.id;
  const { size, unit_price, units_in_stock, sku } = req.body;

  db.run(
    "UPDATE product_variants SET size = ?, unit_price = ?, units_in_stock = ?, sku = ? WHERE variant_id = ?",
    [size, unit_price, units_in_stock, sku, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Variant updated successfully!" });
    }
  );
});

// Delete variant
app.delete('/variants/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM product_variants WHERE variant_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Variant deleted successfully!" });
  });
});

// Add stock to variant
app.put('/variants/:id/addstock', (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ error: "Quantity must be positive." });
  
    db.run(
      "UPDATE product_variants SET units_in_stock = units_in_stock + ? WHERE variant_id = ?",
      [quantity, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Stock updated successfully!" });
      }
    );
  });

  app.get('/inventory', (req, res) => {
  const query = `
    SELECT p.name AS product_name, v.size, v.sku, v.unit_price, v.units_in_stock
    FROM products p
    JOIN product_variants v ON p.product_id = v.product_id
    ORDER BY p.name;
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- SERVER LISTEN ---
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});