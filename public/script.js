console.log("Script loaded!");

function loadProducts() {
  fetch('/products')
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById('products');
      const select = document.getElementById('productSelect');
      container.innerHTML = ''; 
      select.innerHTML = '<option value="">Select Product</option>';

      if (products.length === 0) {
        container.innerHTML = "<p>No products yet.</p>";
        return;
      }

      products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p>Category: ${product.category}</p>
          <button class="edit-btn" data-id="${product.product_id}" data-name="${product.name}" data-description="${product.description}" data-category="${product.category}">Edit</button>
          <button class="delete-btn" data-id="${product.product_id}">Delete</button>
          <button class="view-variants-btn" data-id="${product.product_id}">View Variants</button>
          <div id="variants-${product.product_id}" class="variants"></div>
          <hr>
        `;
        container.appendChild(productDiv);

        // Populate dropdown for variant form
        const option = document.createElement('option');
        option.value = product.product_id;
        option.textContent = `${product.name} (ID: ${product.product_id})`;
        select.appendChild(option);
      });

      // Attach Delete Product Listener
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-id');
          if (confirm("Are you sure you want to delete this product?")) {
            if (confirm("This will permanently delete the product.")) {
              if (confirm("Final chance! Proceed?")) {
                deleteProduct(productId);
              }
            }
          }
        });
      });

      // Attach Edit Product Listener
      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-id');
          const name = e.target.getAttribute('data-name');
          const description = e.target.getAttribute('data-description');
          const category = e.target.getAttribute('data-category');

          // Prefill form
          document.getElementById('name').value = name;
          document.getElementById('description').value = description;
          document.getElementById('category').value = category;

          form.setAttribute('data-edit-id', productId);
          form.querySelector('button').textContent = "Update Product";
        });
      });

      // Attach View Variants Listener
      document.querySelectorAll('.view-variants-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-id');
          const variantsDiv = document.getElementById(`variants-${productId}`);

          // Toggle view
          if (variantsDiv.innerHTML !== '') {
            variantsDiv.innerHTML = '';
            return;
          }

          fetch(`/products/${productId}/variants`)
            .then(res => res.json())
            .then(variants => {
              if (variants.length === 0) {
                variantsDiv.innerHTML = "<p>No variants.</p>";
                return;
              }

              // Show variants
              variants.forEach(variant => {
                variantsDiv.innerHTML += `
                  <p>
                    Size: ${variant.size}, Price: $${variant.unit_price}, Stock: ${variant.units_in_stock}, SKU: ${variant.sku}
                    <button class="edit-variant-btn" 
                      data-vid="${variant.variant_id}" 
                      data-pid="${productId}" 
                      data-size="${variant.size}" 
                      data-price="${variant.unit_price}" 
                      data-stock="${variant.units_in_stock}" 
                      data-sku="${variant.sku}">
                      Edit
                    </button>
                    <button class="delete-variant-btn" data-id="${variant.variant_id}">Delete</button>
                  </p>
                `;
              });

              // Add dropdown + Add Stock inputs
              variantsDiv.innerHTML += `
                <div style="margin-top:1rem;">
                  <select class="variant-select" id="variantSelect-${productId}">
                    <option value="">Select Variant</option>
                  </select>
                  <input type="number" min="1" placeholder="Quantity" id="addStockQty-${productId}" style="width:80px;">
                  <button class="add-stock-btn" data-id="${productId}">Add Stock</button>
                </div>
              `;

              // Populate dropdown
              const select = document.getElementById(`variantSelect-${productId}`);
              variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.variant_id;
                option.textContent = `${variant.size} - ${variant.sku}`;
                select.appendChild(option);
              });

              // Add Stock Button Listener
              variantsDiv.querySelector(`.add-stock-btn`).addEventListener('click', () => {
                const selectedVariant = select.value;
                const qtyInput = document.getElementById(`addStockQty-${productId}`);
                const qty = parseInt(qtyInput.value);

                if (!selectedVariant) {
                  alert("Please select a variant.");
                  return;
                }

                if (!qty || qty <= 0) {
                  alert("Enter valid positive quantity!");
                  return;
                }

                fetch(`/variants/${selectedVariant}/addstock`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ quantity: qty })
                })
                  .then(res => res.json())
                  .then(data => {
                    alert(data.message);
                    loadProducts();
                  });
              });

              // Delete Variant Listener
              variantsDiv.querySelectorAll('.delete-variant-btn').forEach(vbtn => {
                vbtn.addEventListener('click', (e) => {
                  const variantId = e.target.getAttribute('data-id');
                  if (confirm("Are you sure you want to delete this variant?")) {
                    if (confirm("This will permanently delete the variant.")) {
                      if (confirm("Final chance! Proceed?")) {
                        deleteVariant(variantId, productId);
                      }
                    }
                  }
                });
              });

              // Edit Variant Listener
              variantsDiv.querySelectorAll('.edit-variant-btn').forEach(ebtn => {
                ebtn.addEventListener('click', (e) => {
                  const variantId = e.target.getAttribute('data-vid');
                  document.getElementById('productSelect').value = e.target.getAttribute('data-pid');
                  document.getElementById('size').value = e.target.getAttribute('data-size');
                  document.getElementById('unit_price').value = e.target.getAttribute('data-price');
                  document.getElementById('units_in_stock').value = e.target.getAttribute('data-stock');
                  document.getElementById('sku').value = e.target.getAttribute('data-sku');

                  variantForm.setAttribute('data-edit-id', variantId);
                  variantForm.querySelector('button').textContent = "Update Variant";
                });
              });
            });
        });
      });
    });
}

// Delete Product Function
function deleteProduct(id) {
  fetch(`/products/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadProducts(); 
    });
}

// Delete Variant Function
function deleteVariant(id, productId) {
  fetch(`/variants/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadProducts();
    });
}

// Product Form Submission
const form = document.getElementById('productForm');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value
  };

  const editId = form.getAttribute('data-edit-id');

  if (editId) {
    fetch(`/products/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        form.reset();
        form.removeAttribute('data-edit-id');
        form.querySelector('button').textContent = "Add Product";
        loadProducts();
      });
  } else {
    fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        form.reset();
        loadProducts();
      })
      .catch(err => console.error(err));
  }
});

// Variant Form Submission
const variantForm = document.getElementById('variantForm');

variantForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newVariant = {
    product_id: parseInt(document.getElementById('productSelect').value),
    size: document.getElementById('size').value,
    unit_price: parseFloat(document.getElementById('unit_price').value),
    units_in_stock: parseInt(document.getElementById('units_in_stock').value),
    sku: document.getElementById('sku').value
  };

  const editId = variantForm.getAttribute('data-edit-id');

  if (editId) {
    fetch(`/variants/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVariant)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        variantForm.reset();
        variantForm.removeAttribute('data-edit-id');
        variantForm.querySelector('button').textContent = "Add Variant";
        loadProducts();
      });
  } else {
    fetch('/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVariant)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        variantForm.reset();
        loadProducts();
      })
      .catch(err => console.error(err));
  }
});

// Initial Load
loadProducts();





document.getElementById('viewInventory').addEventListener('click', () => {
    fetch('/inventory')
      .then(res => res.json())
      .then(data => {
        const tableDiv = document.getElementById('inventoryTable');
        tableDiv.innerHTML = `
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>SKU</th>
                <th>Unit Price ($)</th>
                <th>Units In Stock</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        `;
  
        let totalStock = 0;
        const tbody = tableDiv.querySelector('tbody');
  
        data.forEach(row => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row.product_name}</td>
            <td>${row.size}</td>
            <td>${row.sku}</td>
            <td>${row.unit_price.toFixed(2)}</td>
            <td>${row.units_in_stock}</td>
          `;
          tbody.appendChild(tr);
          totalStock += row.units_in_stock;
        });
  
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
          <td colspan="4" style="text-align: right;"><strong>Total Stock:</strong></td>
          <td><strong>${totalStock}</strong></td>
        `;
        tbody.appendChild(totalRow);
      });
  });


  // === LOAD CUSTOMERS ===
function loadCustomers() {
  fetch('/customers')
    .then(res => res.json())
    .then(customers => {
      const container = document.getElementById('customers');
      container.innerHTML = '';

      if (customers.length === 0) {
        container.innerHTML = "<p>No customers yet.</p>";
        return;
      }

      customers.forEach(cust => {
        const custDiv = document.createElement('div');
        custDiv.classList.add('customer');
        custDiv.innerHTML = `
          <h3>${cust.name}</h3>
          <p>Email: ${cust.email || '-'}</p>
          <p>Phone: ${cust.phone || '-'}</p>
          <p>Notes: ${cust.notes || '-'}</p>
          <button class="edit-cust-btn" data-id="${cust.customer_id}" data-name="${cust.name}" data-email="${cust.email}" data-phone="${cust.phone}" data-notes="${cust.notes}">Edit</button>
          <button class="delete-cust-btn" data-id="${cust.customer_id}">Delete</button>
          <hr>
        `;
        container.appendChild(custDiv);
      });

      // === DELETE CUSTOMER LISTENER ===
      document.querySelectorAll('.delete-cust-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          if (confirm("Delete this customer?")) {
            deleteCustomer(id);
          }
        });
      });

      // === EDIT CUSTOMER LISTENER ===
      document.querySelectorAll('.edit-cust-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          document.getElementById('cust_name').value = e.target.getAttribute('data-name');
          document.getElementById('cust_email').value = e.target.getAttribute('data-email');
          document.getElementById('cust_phone').value = e.target.getAttribute('data-phone');
          document.getElementById('cust_notes').value = e.target.getAttribute('data-notes');

          custForm.setAttribute('data-edit-id', id);
          custForm.querySelector('button').textContent = "Update Customer";
        });
      });
    })
    .catch(err => console.error("Error loading customers:", err));
}

// === DELETE CUSTOMER FUNCTION ===
function deleteCustomer(id) {
  fetch(`/customers/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadCustomers();
    })
    .catch(err => console.error("Error deleting customer:", err));
}

// === CUSTOMER FORM HANDLING ===
const custForm = document.getElementById('customerForm');

custForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const custData = {
    name: document.getElementById('cust_name').value,
    email: document.getElementById('cust_email').value,
    phone: document.getElementById('cust_phone').value,
    notes: document.getElementById('cust_notes').value
  };

  const editId = custForm.getAttribute('data-edit-id');

  if (editId) {
    // === EDIT CUSTOMER ===
    fetch(`/customers/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Server response (Edit):", data);
        alert(data.message);
        custForm.reset();
        custForm.removeAttribute('data-edit-id');
        custForm.querySelector('button').textContent = "Add Customer";
        loadCustomers();
      })
      .catch(err => console.error("Error editing customer:", err));
  } else {
    // === ADD CUSTOMER ===
    console.log("Sending to server:", custData); // Debug log
    fetch('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custData)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Server response (Add):", data);
        alert(data.message);
        custForm.reset();
        loadCustomers();
      })
      .catch(err => console.error("Error adding customer:", err));
  }
});

// === INITIAL LOAD ===
loadCustomers();