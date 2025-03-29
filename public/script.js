// Add import/export functionality
function exportData() {
  fetch("/export-data")
    .then((res) => res.json())
    .then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventory-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      fetch("/import-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((result) => {
          alert(result.message);
          loadProducts();
          loadCustomers();
          loadOrders();
        })
        .catch((err) => alert("Error importing data: " + err.message));
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Add import/export buttons to the UI
document.addEventListener("DOMContentLoaded", () => {
  const importExportSection = document.createElement("div");
  importExportSection.innerHTML = `
    <h2 class="subHeads">Import/Export Data</h2>
    <button id="exportBtn">Export Data</button>
    <input type="file" id="importFile" accept=".json" style="display: none;">
    <button id="importBtn">Import Data</button>
  `;
  document.body.insertBefore(
    importExportSection,
    document.querySelector("script")
  );

  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      importData(e.target.files[0]);
    }
  });
});

console.log("Script loaded!");

function loadProducts() {
  fetch("/products")
    .then((res) => res.json())
    .then((products) => {
      const container = document.getElementById("products");
      const variantSelect = document.getElementById("variantProductSelect");
      const salesSelect = document.getElementById("salesProductSelect");

      // Clear existing content
      container.innerHTML = "";
      if (variantSelect)
        variantSelect.innerHTML = '<option value="">Select Product</option>';
      if (salesSelect)
        salesSelect.innerHTML = '<option value="">All Products</option>';

      if (products.length === 0) {
        container.innerHTML = "<p>No products yet.</p>";
        return;
      }

      // Populate product list
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.innerHTML = `
          <h3>${product.name}</h3>
          <p>${product.description || ""}</p>
          <p>Category: ${product.category || "Uncategorized"}</p>
          <button class="edit-btn" data-id="${product.product_id}" data-name="${
          product.name
        }" data-description="${product.description || ""}" data-category="${
          product.category || ""
        }">Edit</button>
          <button class="delete-btn" data-id="${
            product.product_id
          }">Delete</button>
          <button class="view-variants-btn" data-id="${
            product.product_id
          }">View Variants</button>
          <div id="variants-${product.product_id}" class="variants"></div>
          <hr>
        `;
        container.appendChild(productDiv);

        // Populate variant form dropdown
        if (variantSelect) {
          const variantOption = document.createElement("option");
          variantOption.value = product.product_id;
          variantOption.textContent = product.name;
          variantSelect.appendChild(variantOption);
        }

        // Populate sales report dropdown
        if (salesSelect) {
          const salesOption = document.createElement("option");
          salesOption.value = product.product_id;
          salesOption.textContent = product.name;
          salesSelect.appendChild(salesOption);
        }
      });

      // Attach Delete Product Listener
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.getAttribute("data-id");
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
      document.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.getAttribute("data-id");
          const name = e.target.getAttribute("data-name");
          const description = e.target.getAttribute("data-description");
          const category = e.target.getAttribute("data-category");

          // Prefill form
          document.getElementById("name").value = name;
          document.getElementById("description").value = description;
          document.getElementById("category").value = category;

          const form = document.getElementById("productForm");
          form.setAttribute("data-edit-id", productId);
          form.querySelector("button").textContent = "Update Product";
        });
      });

      // Attach View Variants Listener
      document.querySelectorAll(".view-variants-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const productId = e.target.getAttribute("data-id");
          const variantsDiv = document.getElementById(`variants-${productId}`);

          // Toggle view
          if (variantsDiv.innerHTML !== "") {
            variantsDiv.innerHTML = "";
            return;
          }

          fetch(`/products/${productId}/variants`)
            .then((res) => res.json())
            .then((variants) => {
              if (variants.length === 0) {
                variantsDiv.innerHTML = "<p>No variants.</p>";
                return;
              }

              // Show variants
              variants.forEach((variant) => {
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
              const select = document.getElementById(
                `variantSelect-${productId}`
              );
              variants.forEach((variant) => {
                const option = document.createElement("option");
                option.value = variant.variant_id;
                option.textContent = `${variant.size} - ${variant.sku}`;
                select.appendChild(option);
              });

              // Add Stock Button Listener
              variantsDiv
                .querySelector(`.add-stock-btn`)
                .addEventListener("click", () => {
                  const selectedVariant = select.value;
                  const qtyInput = document.getElementById(
                    `addStockQty-${productId}`
                  );
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
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: qty }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      alert(data.message);
                      loadProducts();
                    });
                });

              // Delete Variant Listener
              variantsDiv
                .querySelectorAll(".delete-variant-btn")
                .forEach((vbtn) => {
                  vbtn.addEventListener("click", (e) => {
                    const variantId = e.target.getAttribute("data-id");
                    if (
                      confirm("Are you sure you want to delete this variant?")
                    ) {
                      if (
                        confirm("This will permanently delete the variant.")
                      ) {
                        if (confirm("Final chance! Proceed?")) {
                          deleteVariant(variantId, productId);
                        }
                      }
                    }
                  });
                });

              // Edit Variant Listener
              variantsDiv
                .querySelectorAll(".edit-variant-btn")
                .forEach((ebtn) => {
                  ebtn.addEventListener("click", (e) => {
                    const variantId = e.target.getAttribute("data-vid");
                    document.getElementById("variantProductSelect").value =
                      e.target.getAttribute("data-pid");
                    document.getElementById("size").value =
                      e.target.getAttribute("data-size");
                    document.getElementById("unit_price").value =
                      e.target.getAttribute("data-price");
                    document.getElementById("units_in_stock").value =
                      e.target.getAttribute("data-stock");
                    document.getElementById("sku").value =
                      e.target.getAttribute("data-sku");

                    const variantForm = document.getElementById("variantForm");
                    variantForm.setAttribute("data-edit-id", variantId);
                    variantForm.querySelector("button").textContent =
                      "Update Variant";
                  });
                });
            });
        });
      });
    })
    .catch((err) => console.error("Error loading products:", err));
}

// Delete Product Function
function deleteProduct(id) {
  fetch(`/products/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      loadProducts();
    });
}

// Delete Variant Function
function deleteVariant(id, productId) {
  fetch(`/variants/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      loadProducts();
    });
}

// Product Form Submission
const form = document.getElementById("productForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
  };

  const editId = form.getAttribute("data-edit-id");

  if (editId) {
    fetch(`/products/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        form.reset();
        form.removeAttribute("data-edit-id");
        form.querySelector("button").textContent = "Add Product";
        loadProducts();
      });
  } else {
    fetch("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        form.reset();
        loadProducts();
      })
      .catch((err) => console.error(err));
  }
});

// Variant Form Submission
const variantForm = document.getElementById("variantForm");

variantForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newVariant = {
    product_id: parseInt(document.getElementById("variantProductSelect").value),
    size: document.getElementById("size").value,
    unit_price: parseFloat(document.getElementById("unit_price").value),
    units_in_stock: parseInt(document.getElementById("units_in_stock").value),
    sku: document.getElementById("sku").value,
  };

  const editId = variantForm.getAttribute("data-edit-id");

  if (editId) {
    fetch(`/variants/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVariant),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        variantForm.reset();
        variantForm.removeAttribute("data-edit-id");
        variantForm.querySelector("button").textContent = "Add Variant";
        loadProducts();
      });
  } else {
    fetch("/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVariant),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        variantForm.reset();
        loadProducts();
      })
      .catch((err) => console.error(err));
  }
});

// === LOAD CUSTOMERS ===
function loadCustomers() {
  fetch("/customers")
    .then((res) => res.json())
    .then((customers) => {
      const container = document.getElementById("customers");
      container.innerHTML = "";

      if (customers.length === 0) {
        container.innerHTML = "<p>No customers yet.</p>";
        return;
      }

      customers.forEach((cust) => {
        const custDiv = document.createElement("div");
        custDiv.classList.add("customer");
        custDiv.innerHTML = `
          <h3>${cust.name}</h3>
          <p>Email: ${cust.email || "-"}</p>
          <p>Phone: ${cust.phone || "-"}</p>
          <p>Notes: ${cust.notes || "-"}</p>
          <button class="edit-cust-btn" data-id="${
            cust.customer_id
          }" data-name="${cust.name}" data-email="${cust.email}" data-phone="${
          cust.phone
        }" data-notes="${cust.notes}">Edit</button>
          <button class="delete-cust-btn" data-id="${
            cust.customer_id
          }">Delete</button>
          <hr>
        `;
        container.appendChild(custDiv);
      });

      // === DELETE CUSTOMER LISTENER ===
      document.querySelectorAll(".delete-cust-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Delete this customer?")) {
            deleteCustomer(id);
          }
        });
      });

      // === EDIT CUSTOMER LISTENER ===
      document.querySelectorAll(".edit-cust-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          document.getElementById("cust_name").value =
            e.target.getAttribute("data-name");
          document.getElementById("cust_email").value =
            e.target.getAttribute("data-email");
          document.getElementById("cust_phone").value =
            e.target.getAttribute("data-phone");
          document.getElementById("cust_notes").value =
            e.target.getAttribute("data-notes");

          custForm.setAttribute("data-edit-id", id);
          custForm.querySelector("button").textContent = "Update Customer";
        });
      });
    })
    .catch((err) => console.error("Error loading customers:", err));
}

// === DELETE CUSTOMER FUNCTION ===
function deleteCustomer(id) {
  fetch(`/customers/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      loadCustomers();
    })
    .catch((err) => console.error("Error deleting customer:", err));
}

// === CUSTOMER FORM HANDLING ===
const custForm = document.getElementById("customerForm");

custForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const custData = {
    name: document.getElementById("cust_name").value,
    email: document.getElementById("cust_email").value,
    phone: document.getElementById("cust_phone").value,
    notes: document.getElementById("cust_notes").value,
  };

  const editId = custForm.getAttribute("data-edit-id");

  if (editId) {
    // === EDIT CUSTOMER ===
    fetch(`/customers/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(custData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response (Edit):", data);
        alert(data.message);
        custForm.reset();
        custForm.removeAttribute("data-edit-id");
        custForm.querySelector("button").textContent = "Add Customer";
        loadCustomers();
      })
      .catch((err) => console.error("Error editing customer:", err));
  } else {
    // === ADD CUSTOMER ===
    console.log("Sending to server:", custData); // Debug log
    fetch("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(custData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Server response (Add):", data);
        alert(data.message);
        custForm.reset();
        loadCustomers();
      })
      .catch((err) => console.error("Error adding customer:", err));
  }
});

// === INITIAL LOAD ===
loadCustomers();

function loadOrders() {
  fetch("/orders")
    .then((res) => res.json())
    .then((orders) => {
      const container = document.getElementById("orders");
      container.innerHTML = "<h3>All Orders</h3>";

      if (orders.length === 0) {
        container.innerHTML += "<p>No orders yet.</p>";
        return;
      }

      orders.forEach((order) => {
        container.innerHTML += `
          <p>Order #${order.order_id}: ${order.customer_name} ordered ${
          order.quantity
        } x ${order.product_name} (${
          order.variant_size || "Unknown size"
        }) totaling $${order.subtotal} on ${new Date(
          order.date
        ).toLocaleDateString()}</p>        `;
      });
    });
}
//       orders.forEach(order => {
//         container.innerHTML += `
//           <p>Order #${order.order_id}: ${order.customer_name} ordered ${order.quantity} x ${order.product_name} (${order.variant_size || 'Unknown size'}) totaling $${order.subtotal ? order.subtotal.toFixed(2) : '0.00'} on ${new Date(order.date).toLocaleDateString()}</p>        `;
//       });
//     });
// }

// function loadOrderFormDropdowns() {
//   // Load customers
//   fetch("/customers")
//     .then((res) => res.json())
//     .then((customers) => {
//       const custSelect = document.getElementById("orderCustomerSelect");
//       customers.forEach((cust) => {
//         const opt = document.createElement("option");
//         opt.value = cust.customer_id;
//         opt.textContent = cust.name;
//         custSelect.appendChild(opt);
//       });
//     });

//   // Load variants
//   fetch("/products")
//     .then((res) => res.json())
//     .then((products) => {
//       const variantSelect = document.getElementById("orderVariantSelect");
//       products.forEach((prod) => {
//         fetch(`/products/${prod.product_id}/variants`)
//           .then((res) => res.json())
//           .then((variants) => {
//             variants.forEach((variant) => {
//               const opt = document.createElement("option");
//               opt.value = variant.variant_id;
//               opt.textContent = `${prod.name} - ${variant.size} (${variant.units_in_stock} in stock)`;
//               variantSelect.appendChild(opt);
//             });
//           });
//       });
//     });
// }

const populateSelect = (selectElement, data, valueKey, textKey) => {
  selectElement.innerHTML = '<option value="">Select</option>';
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = item[textKey];
    selectElement.appendChild(option);
  });
};

// Handle Order Form Submit
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const customerId = parseInt(
    document.getElementById("orderCustomerSelect").value
  );
  const variantId = parseInt(
    document.getElementById("orderVariantSelect").value
  );
  const quantity = parseInt(document.getElementById("orderQuantity").value);

  // Simple version: One variant per order
  const orderData = {
    customer_id: customerId,
    items: [
      {
        variant_id: variantId,
        quantity: quantity,
      },
    ],
  };

  console.log("Submitting order:", orderData);

  fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Server responded:", data);
      alert(data.message);
      document.getElementById("orderForm").reset();
      loadOrders();
      loadProducts();
    })
    .catch((err) => console.error("Error submitting order:", err));
});
// Initial load
loadOrderFormDropdowns();
loadOrders();

// Function to display report data
function displayReportData(data, targetDiv) {
  if (!data.orders || data.orders.length === 0) {
    targetDiv.innerHTML = "<p>No orders found for the selected criteria.</p>";
    return;
  }

  // Create the report table
  let html = `
    <table class="report-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Variant</th>
          <th>Quantity</th>
          <th>Subtotal</th>
          <th>Total Price</th>
          <th>Payments</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.orders.forEach((order) => {
    html += `
      <tr>
        <td>${order.order_id}</td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td>${order.customer_name}</td>
        <td>${order.product_name}</td>
        <td>${order.variant_size}</td>
        <td>${order.quantity}</td>
        <td>$${order.subtotal}</td>
        <td>$${order.total_price}</td>
        <td>$${order.payments}</td>
        <td>$${order.balance}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="report-totals">
      <h3>Summary</h3>
      <p>Total Orders: ${data.totals.totalOrders}</p>
      <p>Total Quantity: ${data.totals.totalQuantity}</p>
      <p>Total Sales: $${data.totals.totalSales}</p>
      <p>Total Payments: $${data.totals.totalPayments}</p>
      <p>Total Balance: $${data.totals.totalBalance}</p>
    </div>
  `;

  targetDiv.innerHTML = html;
}

// Initialize report functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get all select elements
  const customerSelect = document.getElementById("orderCustomerSelect");
  const variantSelect = document.getElementById("orderVariantSelect");
  const variantProductSelect = document.getElementById("variantProductSelect");
  const customerReportSelect = document.getElementById("customerReportSelect");
  const productReportSelect = document.getElementById("productReportSelect");
  const variantReportSelect = document.getElementById("variantReportSelect");

  // Get all date inputs
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const customerStartDate = document.getElementById("customerStartDate");
  const customerEndDate = document.getElementById("customerEndDate");
  const productStartDate = document.getElementById("productStartDate");
  const productEndDate = document.getElementById("productEndDate");
  const variantStartDate = document.getElementById("variantStartDate");
  const variantEndDate = document.getElementById("variantEndDate");
  const reportDate = document.getElementById("reportDate");

  // Get all buttons
  const fetchDateRangeBtn = document.getElementById("fetchDateRangeBtn");
  const fetchCustomerReportBtn = document.getElementById(
    "fetchCustomerReportBtn"
  );
  const fetchProductReportBtn = document.getElementById(
    "fetchProductReportBtn"
  );
  const fetchVariantReportBtn = document.getElementById(
    "fetchVariantReportBtn"
  );
  const fetchDailyBtn = document.getElementById("fetchDailyBtn");

  // Get all report containers
  const dateRangeReport = document.getElementById("dateRangeReport");
  const customerReport = document.getElementById("customerReport");
  const productReport = document.getElementById("productReport");
  const variantReport = document.getElementById("variantReport");
  const dailyReport = document.getElementById("dailyReport");

  // Function to populate dropdowns
  const populateSelect = (selectElement, data, valueKey, textKey) => {
    selectElement.innerHTML = '<option value="">Select</option>';
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[valueKey];
      option.textContent = item[textKey];
      selectElement.appendChild(option);
    });
  };

  // Fetch and populate customers
  fetch("/api/customers")
    .then((res) => res.json())
    .then((data) => {
      populateSelect(customerSelect, data, "customer_id", "name");
      populateSelect(customerReportSelect, data, "customer_id", "name");
    })
    .catch((err) => console.error("Error loading customers:", err));

  // Fetch and populate products
  fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      populateSelect(variantProductSelect, data, "product_id", "name");
      populateSelect(productReportSelect, data, "product_id", "name");
    })
    .catch((err) => console.error("Error loading products:", err));

  // Fetch and populate variants
  fetch("/api/product_variants")
    .then((res) => res.json())
    .then((data) => {
      populateSelect(variantSelect, data, "variant_id", "variant_name");
      populateSelect(variantReportSelect, data, "variant_id", "variant_name");
    })
    .catch((err) => console.error("Error loading variants:", err));

  // Date Range Report
  fetchDateRangeBtn.addEventListener("click", () => {
    if (!startDate.value || !endDate.value) {
      alert("Please select both start and end dates!");
      return;
    }

    const params = new URLSearchParams();
    params.append("startDate", startDate.value);
    params.append("endDate", endDate.value);

    fetch(`/sales-report?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => displayReportData(data, dateRangeReport))
      .catch((err) => {
        console.error("Error fetching date range report:", err);
        dateRangeReport.innerHTML = "<p>Error loading date range report.</p>";
      });
  });

  // Customer Report
  fetchCustomerReportBtn.addEventListener("click", () => {
    const customerId = customerReportSelect.value;
    const params = new URLSearchParams();

    if (customerId) {
      params.append("customer_id", customerId);
    }

    if (customerStartDate.value && customerEndDate.value) {
      params.append("startDate", customerStartDate.value);
      params.append("endDate", customerEndDate.value);
    }

    fetch(`/sales-report?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => displayReportData(data, customerReport))
      .catch((err) => {
        console.error("Error fetching customer report:", err);
        customerReport.innerHTML = "<p>Error loading customer report.</p>";
      });
  });

  // Product Report
  fetchProductReportBtn.addEventListener("click", () => {
    const productId = productReportSelect.value;
    const params = new URLSearchParams();

    if (productId) {
      params.append("product_id", productId);
    }

    if (productStartDate.value && productEndDate.value) {
      params.append("startDate", productStartDate.value);
      params.append("endDate", productEndDate.value);
    }

    fetch(`/sales-report?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => displayReportData(data, productReport))
      .catch((err) => {
        console.error("Error fetching product report:", err);
        productReport.innerHTML = "<p>Error loading product report.</p>";
      });
  });

  // Variant Report
  fetchVariantReportBtn.addEventListener("click", () => {
    const variantId = variantReportSelect.value;
    const params = new URLSearchParams();

    if (variantId) {
      params.append("variant_id", variantId);
    }

    if (variantStartDate.value && variantEndDate.value) {
      params.append("startDate", variantStartDate.value);
      params.append("endDate", variantEndDate.value);
    }

    fetch(`/sales-report?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => displayReportData(data, variantReport))
      .catch((err) => {
        console.error("Error fetching variant report:", err);
        variantReport.innerHTML = "<p>Error loading variant report.</p>";
      });
  });

  // Daily Report
  fetchDailyBtn.addEventListener("click", () => {
    if (!reportDate.value) {
      alert("Please select a date. Now!");
      return;
    }

    fetch(`/daily-report?date=${reportDate.value}`)
      .then((res) => res.json())
      .then((data) => displayReportData(data, dailyReport))
      .catch((err) => {
        console.error("Error fetching daily report:", err);
        dailyReport.innerHTML = "<p>Error loading daily report.</p>";
      });
  });

  // Initial load of data
  loadProducts();
  loadCustomers();
  loadOrders();
  loadOrderFormDropdowns();
});