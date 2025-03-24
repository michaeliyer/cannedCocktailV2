// const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const db = new sqlite3.Database('./db/cannedCocktailV2.db');

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // --- ROUTES ---

// // Get all products
// app.get('/products', (req, res) => {
//   db.all("SELECT * FROM products", [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // Add new product
// app.post('/products', (req, res) => {
//   const { name, description, category } = req.body;
//   if (!name) return res.status(400).json({ error: "Product name required." });

//   db.run(
//     "INSERT INTO products (name, description, category) VALUES (?, ?, ?)",
//     [name, description, category],
//     function(err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.status(201).json({ message: "Product added!", product_id: this.lastID });
//     }
//   );
// });

// // Update product
// app.put('/products/:id', (req, res) => {
//   const id = req.params.id;
//   const { name, description, category } = req.body;

//   db.run(
//     "UPDATE products SET name = ?, description = ?, category = ? WHERE product_id = ?",
//     [name, description, category, id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ message: "Product updated successfully!" });
//     }
//   );
// });

// // Delete product
// app.delete('/products/:id', (req, res) => {
//   const id = req.params.id;
//   db.run("DELETE FROM products WHERE product_id = ?", [id], function(err) {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Product deleted successfully!" });
//   });
// });

// // Get all variants for a product
// app.get('/products/:id/variants', (req, res) => {
//   const id = req.params.id;
//   db.all("SELECT * FROM product_variants WHERE product_id = ?", [id], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // Add variant
// app.post('/variants', (req, res) => {
//   const { product_id, size, unit_price, units_in_stock, sku } = req.body;
//   if (!product_id || !sku) return res.status(400).json({ error: "Product ID & SKU required." });

//   db.run(
//     `INSERT INTO product_variants (product_id, size, unit_price, units_in_stock, sku) 
//      VALUES (?, ?, ?, ?, ?)`,
//     [product_id, size, unit_price, units_in_stock, sku],
//     function(err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.status(201).json({ message: "Variant added!", variant_id: this.lastID });
//     }
//   );
// });

// // Update variant
// app.put('/variants/:id', (req, res) => {
//   const id = req.params.id;
//   const { size, unit_price, units_in_stock, sku } = req.body;

//   db.run(
//     "UPDATE product_variants SET size = ?, unit_price = ?, units_in_stock = ?, sku = ? WHERE variant_id = ?",
//     [size, unit_price, units_in_stock, sku, id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ message: "Variant updated successfully!" });
//     }
//   );
// });

// // Delete variant
// app.delete('/variants/:id', (req, res) => {
//   const id = req.params.id;
//   db.run("DELETE FROM product_variants WHERE variant_id = ?", [id], function(err) {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Variant deleted successfully!" });
//   });
// });

// // Add stock to variant
// app.put('/variants/:id/addstock', (req, res) => {
//     const id = req.params.id;
//     const { quantity } = req.body;
//     if (!quantity || quantity <= 0) return res.status(400).json({ error: "Quantity must be positive." });
  
//     db.run(
//       "UPDATE product_variants SET units_in_stock = units_in_stock + ? WHERE variant_id = ?",
//       [quantity, id],
//       function (err) {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: "Stock updated successfully!" });
//       }
//     );
//   });

//   app.get('/inventory', (req, res) => {
//   const query = `
//     SELECT p.name AS product_name, v.size, v.sku, v.unit_price, v.units_in_stock, v.units_sold
//     FROM products p
//     JOIN product_variants v ON p.product_id = v.product_id
//     ORDER BY p.name;
//   `;

//   db.all(query, [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // --- CUSTOMERS CRUD ---

// // Get all customers
// app.get('/customers', (req, res) => {
//   db.all("SELECT * FROM customers", [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// // Add new customer
// app.post('/customers', (req, res) => {
//   const { name, email, phone, notes } = req.body;
//   console.log("Received POST /customers:", req.body); // <-- Good

//   if (!name) return res.status(400).json({ error: "Customer name required." });

//   db.run(
//     "INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)",
//     [name, email, phone, notes],
//     function(err) {
//       if (err) {
//         console.error("SQL Error:", err.message); // <<< ADD THIS!
//         return res.status(500).json({ error: err.message });
//       }

//       res.status(201).json({
//         message: "Customer added successfully!",
//         customer_id: this.lastID
//       });
//     }
//   );
// });

// // Update customer
// app.put('/customers/:id', (req, res) => {
//   const id = req.params.id;
//   const { name, email, phone, notes } = req.body;

//   db.run(
//     "UPDATE customers SET name = ?, email = ?, phone = ?, notes = ? WHERE customer_id = ?",
//     [name, email, phone, notes, id],
//     function (err) {
//       if (err) return res.status(500).json({ error: err.message });
//       res.json({ message: "Customer updated successfully!" });
//     }
//   );
// });

// // Delete customer
// app.delete('/customers/:id', (req, res) => {
//   const id = req.params.id;
//   db.run("DELETE FROM customers WHERE customer_id = ?", [id], function(err) {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: "Customer deleted successfully!" });
//   });
// });

// // --- Orders ---
// app.post('/orders', async (req, res) => {
//   const { customer_id, items, total_price, payments, balance } = req.body;
//   const date = new Date().toISOString();

//   try {
//     await db.run('BEGIN TRANSACTION');

//     // Insert into orders table
//     const orderResult = await new Promise((resolve, reject) => {
//       db.run(
//         "INSERT INTO orders (customer_id, date, total_price, payments, balance) VALUES (?, ?, ?, ?, ?)",
//         [customer_id, date, total_price, payments, balance],
//         function (err) {
//           if (err) return reject(err);
//           resolve(this);
//         }
//       );
//     });

//     const orderId = orderResult.lastID;

//     // Prepare statement
//     const stmt = await new Promise((resolve, reject) => {
//       const statement = db.prepare(
//         "INSERT INTO order_items (order_id, product_id, variant_id, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
//         (err) => {
//           if (err) return reject(err);
//           resolve(statement);
//         }
//       );
//     });

//     // Insert items
//     for (const item of items) {
//       const { variant_id, quantity } = item;

//       // Fetch product_id AND unit_price
//       const product = await new Promise((resolve, reject) => {
//         db.get(
//           "SELECT product_id, unit_price FROM product_variants WHERE variant_id = ?",
//           [variant_id],
//           (err, row) => {
//             if (err) return reject(err);
//             if (!row) return reject(new Error(`No product found for variant_id ${variant_id}`));
//             resolve(row);
//           }
//         );
//       });

//       const product_id = product.product_id;
//       const subtotal = product.unit_price * quantity;
//       console.log(`Inserted item: product_id ${product_id}, quantity ${quantity}, subtotal ${subtotal}`);

//       // Insert into order_items
//       await new Promise((resolve, reject) => {
//         stmt.run(orderId, product_id, variant_id, quantity, subtotal, (err) => {
//           if (err) return reject(err);
//           resolve();
//         });
//       });

//       // Update stock and sold units
//       await new Promise((resolve, reject) => {
//         db.run(
//           `UPDATE product_variants 
//            SET units_in_stock = units_in_stock - ?, 
//                units_sold = units_sold + ? 
//            WHERE variant_id = ?`,
//           [quantity, quantity, variant_id],
//           (err) => {
//             if (err) return reject(err);
//             resolve();
//           }
//         );
//       });
//     }

//     // Finalize & commit
//     await new Promise((resolve, reject) => {
//       stmt.finalize((err) => {
//         if (err) return reject(err);
//         resolve();
//       });
//     });

//     await db.run('COMMIT');
//     res.status(201).json({ message: "Order created successfully!", order_id: orderId });
//   } catch (err) {
//     await db.run('ROLLBACK');
//     console.error("Error processing order:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get all orders (basic view)
// app.get('/orders', (req, res) => {
//   const query = `
// SELECT 
//   o.order_id,
//   o.date,
//   c.name AS customer_name,
//   p.name AS product_name,
//   v.size AS variant_size,
//   oi.quantity,
//   oi.subtotal
// FROM orders o
// JOIN customers c ON o.customer_id = c.customer_id
// JOIN order_items oi ON o.order_id = oi.order_id
// JOIN product_variants v ON oi.variant_id = v.variant_id
// JOIN products p ON v.product_id = p.product_id

// ORDER BY o.order_id DESC;
//   `;

//   db.all(query, [], (err, rows) => {
//     if (err) {
//       console.error("Error fetching orders:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   });
// });

// app.get('/sales-report', (req, res) => {
//   const { startDate, endDate } = req.query;

//   console.log("Received sales report request for:", startDate, "to", endDate);

//   // Temporary dummy data to test front end
//   res.json([
//     { order_id: 1, customer_name: "Test Customer", total_price: 123.45, date: startDate },
//     { order_id: 2, customer_name: "Another Customer", total_price: 67.89, date: endDate }
//   ]);
// });


// app.get('/daily-report', (req, res) => {
//   const { date } = req.query;

//   const query = `
//     SELECT 
//       o.order_id,
//       o.date,
//       c.name AS customer_name,
//       p.name AS product_name,
//       v.size AS variant_size,
//       oi.quantity,
//       oi.subtotal
//     FROM orders o
//     JOIN customers c ON o.customer_id = c.customer_id
//     JOIN order_items oi ON o.order_id = oi.order_id
//     JOIN product_variants v ON oi.variant_id = v.variant_id
//     JOIN products p ON v.product_id = p.product_id
//     WHERE DATE(o.date) = DATE(?)
//     ORDER BY o.order_id DESC;
//   `;

//   db.all(query, [date], (err, rows) => {
//     if (err) {
//       console.error("Error fetching daily report:", err.message);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   }); // ✅ Correct closure here
// }); // ✅ Only ONE closing brace needed for route


// // // Endpoint to fetch all customers
// // app.get('/api/customers', (req, res) => {
// //   const query = 'SELECT customer_id, name FROM customers ORDER BY name';
// //   db.all(query, [], (err, rows) => {
// //     if (err) {
// //       console.error('Error fetching customers:', err.message);
// //       res.status(500).json({ error: err.message });
// //     } else {
// //       res.json(rows);
// //     }
// //   });
// // });

// // // Endpoint to fetch all products
// // // Get all products
// // app.get('/api/products', (req, res) => {
// //   db.all("SELECT * FROM products", [], (err, rows) => {
// //     if (err) return res.status(500).json({ error: err.message });
// //     res.json(rows);
// //   });
// // });

// // // Endpoint to fetch all product variants
// // app.get('/api/product_variants', (req, res) => {
// //   const query = `
// //     SELECT v.variant_id, p.name || ' (' || v.size || ')' AS variant_name
// //     FROM product_variants v
// //     JOIN products p ON v.product_id = p.product_id
// //     ORDER BY p.name, v.size
// //   `;
// //   db.all(query, [], (err, rows) => {
// //     if (err) {
// //       console.error('Error fetching product variants:', err.message);
// //       res.status(500).json({ error: err.message });
// //     } else {
// //       res.json(rows);
// //     }
// //   });
// // });

// app.get('/api/sales-report', (req, res) => {
//   const query = `
//     SELECT
//       p.product_id,
//       p.name AS product_name,
//       SUM(oi.quantity) AS total_quantity_sold,
//       SUM(oi.subtotal) AS total_sales
//     FROM
//       order_items oi
//       JOIN product_variants pv ON oi.variant_id = pv.variant_id
//       JOIN products p ON pv.product_id = p.product_id
//     GROUP BY
//       p.product_id
//     ORDER BY
//       total_sales DESC
//   `;
//   db.all(query, [], (err, rows) => {
//     if (err) {
//       console.error('Error fetching sales report:', err.message);
//       res.status(500).json({ error: err.message });
//     } else {
//       res.json(rows);
//     }
//   });
// });





// // --- SERVER LISTEN ---
// app.listen(3000, () => {
//   console.log('Server running at http://localhost:3000');
// });

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
app.get('/customers', (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new customer
app.post('/customers', (req, res) => {
  const { name, email, phone, notes } = req.body;
  console.log("Received POST /customers:", req.body); // <-- Good

  if (!name) return res.status(400).json({ error: "Customer name required." });

  db.run(
    "INSERT INTO customers (name, email, phone, notes) VALUES (?, ?, ?, ?)",
    [name, email, phone, notes],
    function(err) {
      if (err) {
        console.error("SQL Error:", err.message); // <<< ADD THIS!
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Customer added successfully!",
        customer_id: this.lastID
      });
    }
  );
});

// Update customer
app.put('/customers/:id', (req, res) => {
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
app.delete('/customers/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM customers WHERE customer_id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Customer deleted successfully!" });
  });
});

// --- Orders ---
app.post('/orders', async (req, res) => {
  const { customer_id, items, total_price, payments, balance } = req.body;
  const date = new Date().toISOString();

  try {
    await db.run('BEGIN TRANSACTION');

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
            if (!row) return reject(new Error(`No product found for variant_id ${variant_id}`));
            resolve(row);
          }
        );
      });

      const product_id = product.product_id;
      const subtotal = product.unit_price * quantity;
      console.log(`Inserted item: product_id ${product_id}, quantity ${quantity}, subtotal ${subtotal}`);

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

    await db.run('COMMIT');
    res.status(201).json({ message: "Order created successfully!", order_id: orderId });
  } catch (err) {
    await db.run('ROLLBACK');
    console.error("Error processing order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (basic view)
app.get('/orders', (req, res) => {
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

app.get('/sales-report', (req, res) => {
  const { startDate, endDate } = req.query;

  console.log("Received sales report request for:", startDate, "to", endDate);

  // Temporary dummy data to test front end
  res.json([
    { order_id: 1, customer_name: "Test Customer", total_price: 123.45, date: startDate },
    { order_id: 2, customer_name: "Another Customer", total_price: 67.89, date: endDate }
  ]);
});


app.get('/daily-report', (req, res) => {
  const { date } = req.query;

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
    WHERE DATE(o.date) = DATE(?)
    ORDER BY o.order_id DESC;
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      console.error("Error fetching daily report:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  }); // ✅ Correct closure here
}); // ✅ Only ONE closing brace needed for route







// Endpoint to fetch all customers
app.get('/api/customers', (req, res) => {
  const query = 'SELECT customer_id, name FROM customers ORDER BY name';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching customers:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to fetch all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT product_id, name FROM products ORDER BY name';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to fetch all product variants
app.get('/api/product_variants', (req, res) => {
  const query = `
    SELECT v.variant_id, p.name || ' (' || v.size || ')' AS variant_name
    FROM product_variants v
    JOIN products p ON v.product_id = p.product_id
    ORDER BY p.name, v.size
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching product variants:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});



// --- SERVER LISTEN ---
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});