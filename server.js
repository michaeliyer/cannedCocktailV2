const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./db/cannedCocktailV2.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// --- ROUTES ---

// Get all products
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new product
app.post("/products", (req, res) => {
  const { name, description, category } = req.body;
  if (!name) return res.status(400).json({ error: "Product name required." });

  db.run(
    "INSERT INTO products (name, description, category) VALUES (?, ?, ?)",
    [name, description, category],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Product added!", product_id: this.lastID });
    }
  );
});

// Update product
app.put("/products/:id", (req, res) => {
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
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM products WHERE product_id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted successfully!" });
  });
});

// Get all variants for a product
app.get("/products/:id/variants", (req, res) => {
  const id = req.params.id;
  db.all(
    "SELECT * FROM product_variants WHERE product_id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add variant
app.post("/variants", (req, res) => {
  const { product_id, size, unit_price, units_in_stock, sku } = req.body;
  if (!product_id || !sku)
    return res.status(400).json({ error: "Product ID & SKU required." });

  db.run(
    `INSERT INTO product_variants (product_id, size, unit_price, units_in_stock, sku) 
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, size, unit_price, units_in_stock, sku],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Variant added!", variant_id: this.lastID });
    }
  );
});

// Update variant
app.put("/variants/:id", (req, res) => {
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
app.delete("/variants/:id", (req, res) => {
  const id = req.params.id;
  db.run(
    "DELETE FROM product_variants WHERE variant_id = ?",
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Variant deleted successfully!" });
    }
  );
});

// Add stock to variant
app.put("/variants/:id/addstock", (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  if (!quantity || quantity <= 0)
    return res.status(400).json({ error: "Quantity must be positive." });

  db.run(
    "UPDATE product_variants SET units_in_stock = units_in_stock + ? WHERE variant_id = ?",
    [quantity, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Stock updated successfully!" });
    }
  );
});

app.get("/inventory", (req, res) => {
  const query = `
    SELECT p.name AS product_name, v.size, v.sku, v.unit_price, v.units_in_stock, v.units_sold
    FROM products p
    JOIN product_variants v ON p.product_id = v.product_id
    ORDER BY p.name;
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- CUSTOMERS CRUD ---

// Get all customers
app.get("/customers", (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new customer
app.post("/customers", (req, res) => {
  const { name, email, phone, notes } = req.body;
  console.log("Received POST /customers:", req.body); // <-- Good

  if (!name) return res.status(400).json({ error: "Customer name required." });

  db.run(
    "INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)",
    [name, email, phone, notes],
    function (err) {
      if (err) {
        console.error("SQL Error:", err.message); // <<< ADD THIS!
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Customer added successfully!",
        customer_id: this.lastID,
      });
    }
  );
});

// Update customer
app.put("/customers/:id", (req, res) => {
  const id = req.params.id;
  const { name, email, phone, notes } = req.body;

  db.run(
    "UPDATE customers SET name = ?, email = ?, phone = ?, notes = ? WHERE customer_id = ?",
    [name, email, phone, notes, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer updated successfully!" });
    }
  );
});

// Delete customer
app.delete("/customers/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM customers WHERE customer_id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer deleted successfully!" });
  });
});

// --- Orders ---
app.post("/orders", async (req, res) => {
  const { customer_id, items, total_price, payments, balance } = req.body;
  const date = new Date().toISOString();

  try {
    await db.run("BEGIN TRANSACTION");

    // Insert into orders table
    const orderResult = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO orders (customer_id, date, total_price, payments, balance) VALUES (?, ?, ?, ?, ?)",
        [customer_id, date, total_price, payments, balance],
        function (err) {
          if (err) return reject(err);
          resolve(this);
        }
      );
    });

    const orderId = orderResult.lastID;

    // Prepare statement
    const stmt = await new Promise((resolve, reject) => {
      const statement = db.prepare(
        "INSERT INTO order_items (order_id, product_id, variant_id, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
        (err) => {
          if (err) return reject(err);
          resolve(statement);
        }
      );
    });

    // Insert items
    for (const item of items) {
      const { variant_id, quantity } = item;

      // Fetch product_id AND unit_price
      const product = await new Promise((resolve, reject) => {
        db.get(
          "SELECT product_id, unit_price FROM product_variants WHERE variant_id = ?",
          [variant_id],
          (err, row) => {
            if (err) return reject(err);
            if (!row)
              return reject(
                new Error(`No product found for variant_id ${variant_id}`)
              );
            resolve(row);
          }
        );
      });

      const product_id = product.product_id;
      const subtotal = product.unit_price * quantity;
      console.log(
        `Inserted item: product_id ${product_id}, quantity ${quantity}, subtotal ${subtotal}`
      );

      // Insert into order_items
      await new Promise((resolve, reject) => {
        stmt.run(orderId, product_id, variant_id, quantity, subtotal, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Update stock and sold units
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE product_variants 
           SET units_in_stock = units_in_stock - ?, 
               units_sold = units_sold + ? 
           WHERE variant_id = ?`,
          [quantity, quantity, variant_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    }

    // Finalize & commit
    await new Promise((resolve, reject) => {
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await db.run("COMMIT");
    res
      .status(201)
      .json({ message: "Order created successfully!", order_id: orderId });
  } catch (err) {
    await db.run("ROLLBACK");
    console.error("Error processing order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (basic view)
app.get("/orders", (req, res) => {
  const query = `
SELECT 
  o.order_id,
  o.date,
  c.name AS customer_name,
  p.name AS product_name,
  v.size AS variant_size,
  oi.quantity,
  oi.subtotal
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN product_variants v ON oi.variant_id = v.variant_id
JOIN products p ON v.product_id = p.product_id

ORDER BY o.order_id DESC;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get("/sales-report", (req, res) => {
  const { startDate, endDate, customer_id, product_id, variant_id } = req.query;

  let query = `
    SELECT 
      o.order_id,
      o.date,
      c.name AS customer_name,
      p.name AS product_name,
      v.size AS variant_size,
      oi.quantity,
      oi.subtotal,
      o.total_price,
      o.payments,
      o.balance
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN product_variants v ON oi.variant_id = v.variant_id
    JOIN products p ON v.product_id = p.product_id
    WHERE 1=1
  `;

  const params = [];

  if (startDate) {
    query += ` AND DATE(o.date) >= DATE(?)`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND DATE(o.date) <= DATE(?)`;
    params.push(endDate);
  }

  if (customer_id) {
    query += ` AND o.customer_id = ?`;
    params.push(customer_id);
  }

  if (product_id) {
    query += ` AND p.product_id = ?`;
    params.push(product_id);
  }

  if (variant_id) {
    query += ` AND v.variant_id = ?`;
    params.push(variant_id);
  }

  query += ` ORDER BY o.date DESC, o.order_id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching sales report:", err);
      return res.status(500).json({ error: err.message });
    }

    // Calculate totals
    const totals = rows.reduce(
      (acc, row) => {
        acc.totalOrders++;
        acc.totalQuantity += row.quantity;
        acc.totalSales += row.subtotal;
        acc.totalPayments += row.payments || 0;
        acc.totalBalance += row.balance || 0;
        return acc;
      },
      {
        totalOrders: 0,
        totalQuantity: 0,
        totalSales: 0,
        totalPayments: 0,
        totalBalance: 0,
      }
    );

    // Format numbers to 2 decimal places
    rows.forEach((row) => {
      row.subtotal = Number(row.subtotal).toFixed(2);
      row.total_price = Number(row.total_price).toFixed(2);
      row.payments = row.payments ? Number(row.payments).toFixed(2) : "0.00";
      row.balance = row.balance ? Number(row.balance).toFixed(2) : "0.00";
    });

    totals.totalSales = Number(totals.totalSales).toFixed(2);
    totals.totalPayments = Number(totals.totalPayments).toFixed(2);
    totals.totalBalance = Number(totals.totalBalance).toFixed(2);

    res.json({
      orders: rows,
      totals,
    });
  });
});

app.get("/daily-report", (req, res) => {
  const { date } = req.query;

  const query = `
    SELECT 
      o.order_id,
      o.date,
      c.name AS customer_name,
      p.name AS product_name,
      v.size AS variant_size,
      oi.quantity,
      oi.subtotal,
      o.total_price,
      o.payments,
      o.balance
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN product_variants v ON oi.variant_id = v.variant_id
    JOIN products p ON v.product_id = p.product_id
    WHERE DATE(o.date) = DATE(?)
    ORDER BY o.date DESC, o.order_id DESC;
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      console.error("Error fetching daily report:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // Calculate totals
    const totals = rows.reduce(
      (acc, row) => {
        acc.totalOrders++;
        acc.totalQuantity += row.quantity;
        acc.totalSales += row.subtotal;
        acc.totalPayments += row.payments || 0;
        acc.totalBalance += row.balance || 0;
        return acc;
      },
      {
        totalOrders: 0,
        totalQuantity: 0,
        totalSales: 0,
        totalPayments: 0,
        totalBalance: 0,
      }
    );

    // Format numbers to 2 decimal places
    rows.forEach((row) => {
      row.subtotal = Number(row.subtotal).toFixed(2);
      row.total_price = Number(row.total_price).toFixed(2);
      row.payments = row.payments ? Number(row.payments).toFixed(2) : "0.00";
      row.balance = row.balance ? Number(row.balance).toFixed(2) : "0.00";
    });

    totals.totalSales = Number(totals.totalSales).toFixed(2);
    totals.totalPayments = Number(totals.totalPayments).toFixed(2);
    totals.totalBalance = Number(totals.totalBalance).toFixed(2);

    res.json({
      orders: rows,
      totals,
    });
  });
});

// Endpoint to fetch all customers
app.get("/api/customers", (req, res) => {
  const query = "SELECT customer_id, name FROM customers ORDER BY name";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching customers:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to fetch all products
app.get("/api/products", (req, res) => {
  const query = "SELECT product_id, name FROM products ORDER BY name";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to fetch all product variants
app.get("/api/product_variants", (req, res) => {
  const query = `
    SELECT v.variant_id, p.name || ' (' || v.size || ')' AS variant_name
    FROM product_variants v
    JOIN products p ON v.product_id = p.product_id
    ORDER BY p.name, v.size
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching product variants:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Export all data
app.get("/export-data", (req, res) => {
  const data = {
    products: [],
    variants: [],
    customers: [],
    orders: [],
    orderItems: [],
  };

  // Helper function to get all rows from a table
  const getAllRows = (table) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  // Get all data from each table
  Promise.all([
    getAllRows("products"),
    getAllRows("product_variants"),
    getAllRows("customers"),
    getAllRows("orders"),
    getAllRows("order_items"),
  ])
    .then(([products, variants, customers, orders, orderItems]) => {
      data.products = products;
      data.variants = variants;
      data.customers = customers;
      data.orders = orders;
      data.orderItems = orderItems;
      res.json(data);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Import data
app.post("/import-data", (req, res) => {
  const data = req.body;

  // Helper function to insert rows into a table
  const insertRows = (table, rows) => {
    return new Promise((resolve, reject) => {
      // First, get the column names from the first row
      if (rows.length === 0) {
        resolve();
        return;
      }

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => "?").join(", ");
      const query = `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

      // Insert each row
      const insertPromises = rows.map((row) => {
        return new Promise((resolve, reject) => {
          const values = columns.map((col) => row[col]);
          db.run(query, values, function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => resolve())
        .catch(reject);
    });
  };

  // Start a transaction
  db.run("BEGIN TRANSACTION", (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Clear existing data
    db.run("DELETE FROM order_items", (err) => {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }

      db.run("DELETE FROM orders", (err) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        db.run("DELETE FROM product_variants", (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          db.run("DELETE FROM products", (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            db.run("DELETE FROM customers", (err) => {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }

              // Insert new data in the correct order
              Promise.all([
                insertRows("products", data.products),
                insertRows("product_variants", data.variants),
                insertRows("customers", data.customers),
                insertRows("orders", data.orders),
                insertRows("order_items", data.orderItems),
              ])
                .then(() => {
                  db.run("COMMIT", (err) => {
                    if (err) {
                      db.run("ROLLBACK");
                      return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Data imported successfully!" });
                  });
                })
                .catch((err) => {
                  db.run("ROLLBACK");
                  res.status(500).json({ error: err.message });
                });
            });
          });
        });
      });
    });
  });
});

// --- SERVER LISTEN ---
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
