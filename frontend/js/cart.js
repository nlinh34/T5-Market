document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const selectAllCheckbox = document.getElementById("select-all");

  let discount = 0;
  window.cartIsEmpty = true;

  async function fetchCart() {
    const res = await fetch("http://127.0.0.1:5000/cart/get-current", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    return result.success ? result.data : [];
  }

  async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    await fetch("http://127.0.0.1:5000/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: newQuantity })
    });
    const cart = await fetchCart();
    renderCart(cart);
  }

  async function deleteItem(productId) {
    await fetch(`http://127.0.0.1:5000/cart/delete/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const cart = await fetchCart();
    renderCart(cart);
  }

  function renderCart(cartItems) {
    const totalProductsEl = document.getElementById("total-products");
    if (totalProductsEl) totalProductsEl.textContent = cartItems.length;

    tbody.innerHTML = "";
    window.cartIsEmpty = cartItems.length === 0;

    cartItems.forEach(item => {
      const { _id, name, price, images, shop } = item.product || {};
      const quantity = item.quantity;
      const shopName = shop && shop.name ? shop.name : "Không xác định";

      const rawImage = images && images.length > 0 ? images[0] : null;
      let image = "https://via.placeholder.com/100?text=No+Image";

      if (rawImage) {
        if (rawImage.startsWith("data:image")) {
          image = rawImage;
        } else if (rawImage.startsWith("http")) {
          image = rawImage;
        } else {
          image = `http://127.0.0.1:5000/uploads/${rawImage}`;
        }
      }

      const row = document.createElement("tr");
      // Thêm class cho hàng để dễ dàng xác định hàng của cửa hàng
      row.classList.add('store-section-row');
      row.dataset.storeId = shop ? shop._id : 'unknown'; // Lưu store ID vào dataset
      row.innerHTML = `
        <td colspan="6">
          <div class="cart-store-info">
            <input type="checkbox" class="select-store" data-store-id="${shop ? shop._id : 'unknown'}" />
            <span class="store-name">${shopName}</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <table>
            <tbody>
              <tr>
                <td><input type="checkbox" class="select-product" data-id="${_id}" data-price="${price}" data-qty="${quantity}" /></td>
                <td>
                  <div class="cart-item-info">
                    <img loading="lazy" src="${image}" alt="${name}" class="cart-product-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=Error+Loading+Image';" />
                    <span class="cart-product-name">${name}</span>
                  </div>
                </td>
                <td><span>${price.toLocaleString()}₫</span></td>
                <td>
                  <div class="cart-product-actions">
                    <button class="decrease-btn" data-id="${_id}">−</button>
                    <span class="quantity">${quantity}</span>
                    <button class="increase-btn" data-id="${_id}">+</button>
                  </div>
                </td>
                <td><strong>${(price * quantity).toLocaleString()}₫</strong></td>
                <td><button class="cart-delete-btn" data-id="${_id}"><i class="fas fa-trash"></i></button></td>
              </tr>
            </tbody>
          </table>
        </td>
      `;

      tbody.appendChild(row);
    });

    document.querySelectorAll(".cart-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteItem(btn.dataset.id));
    });

    document.querySelectorAll(".increase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        const currentQty = parseInt(btn.previousElementSibling.textContent);
        updateQuantity(productId, currentQty + 1);
      });
    });

    document.querySelectorAll(".decrease-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        const currentQty = parseInt(btn.nextElementSibling.textContent);
        updateQuantity(productId, currentQty - 1);
      });
    });

    // === START: LOGIC MỚI ĐỂ CHỌN/BỎ CHỌN CỬA HÀNG THEO SẢN PHẨM ===
    document.querySelectorAll(".select-product").forEach(productCb => {
      productCb.addEventListener("change", (event) => {
        const currentProductCb = event.target;
        // Tìm thẻ td lớn nhất chứa cả thông tin cửa hàng và bảng sản phẩm con
        const storeSectionTd = currentProductCb.closest('td[colspan="6"]');
        if (!storeSectionTd) return; // Đảm bảo tìm thấy phần tử cha

        const storeCb = storeSectionTd.querySelector('.select-store');
        if (!storeCb) return; // Đảm bảo tìm thấy checkbox cửa hàng

        if (currentProductCb.checked) {
          // Nếu sản phẩm được tích, thì tích luôn cửa hàng
          storeCb.checked = true;
        } else {
          // Nếu sản phẩm bị bỏ tích, kiểm tra xem còn sản phẩm nào của cửa hàng này được tích không
          const allProductsInStore = storeSectionTd.querySelectorAll('.select-product');
          const anyProductChecked = Array.from(allProductsInStore).some(cb => cb.checked);

          // Nếu không còn sản phẩm nào được tích, thì bỏ tích cửa hàng
          if (!anyProductChecked) {
            storeCb.checked = false;
          }
        }
        // Luôn gọi updateSelectedTotal để cập nhật tổng tiền và trạng thái select-all
        updateSelectedTotal();
      });
    });
    // === END: LOGIC MỚI ===

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        document.querySelectorAll(".select-product").forEach(cb => {
          cb.checked = selectAllCheckbox.checked;
        });
        document.querySelectorAll(".select-store").forEach(cb => {
          cb.checked = selectAllCheckbox.checked;
        });
        updateSelectedTotal();
      });
    }

    document.querySelectorAll(".select-store").forEach(storeCb => {
      storeCb.addEventListener("change", (event) => {
        const currentStoreCb = event.target;
        // Tìm thẻ td lớn nhất chứa cả thông tin cửa hàng và bảng sản phẩm con
        const storeSectionTd = currentStoreCb.closest('td[colspan="6"]');
        if (!storeSectionTd) return;

        const nestedTable = storeSectionTd.querySelector('table');
        if (nestedTable) {
          nestedTable.querySelectorAll('.select-product').forEach(productCb => {
            productCb.checked = currentStoreCb.checked;
          });
        }
        updateSelectedTotal();
      });
    });

    updateSelectedTotal();
  }

  function updateSelectedTotal() {
    const couponCode = document.getElementById("coupon-input")?.value.trim();
    discount = 0;

    const checkboxes = document.querySelectorAll(".select-product:checked");
    let subtotal = 0;
    const selectedIds = [];

    checkboxes.forEach(cb => {
      const price = parseFloat(cb.dataset.price);
      const qty = parseInt(cb.dataset.qty);
      subtotal += price * qty;
      selectedIds.push(cb.dataset.id);
    });

    localStorage.setItem("selectedProductIds", JSON.stringify(selectedIds));

    if (couponCode && couponCode.toLowerCase() === "t5market") {
      discount = subtotal * 0.2;
      localStorage.setItem("appliedCoupon", "t5market");
      localStorage.setItem("appliedDiscount", discount);
    } else {
      localStorage.removeItem("appliedCoupon");
      localStorage.setItem("appliedDiscount", "0");
    }

    const finalTotal = subtotal - discount;

    subtotalEl.textContent = subtotal.toLocaleString() + "₫";
    const discountEl = document.getElementById("discount");
    if (discountEl) discountEl.textContent = discount.toLocaleString() + "₫";
    totalEl.textContent = finalTotal.toLocaleString() + "₫";

    window.cartIsEmpty = checkboxes.length === 0;

    // Cập nhật trạng thái của checkbox "Tất cả" dựa trên tất cả checkbox sản phẩm
    const allProductCheckboxes = document.querySelectorAll(".select-product");
    if (allProductCheckboxes.length > 0) {
      const allProductsAreChecked = Array.from(allProductCheckboxes).every(cb => cb.checked);
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allProductsAreChecked;
      }
    } else {
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = false; // Không có sản phẩm nào, bỏ chọn "Tất cả"
      }
    }
  }

  const cart = await fetchCart();
  renderCart(cart);

  document.getElementById("apply-coupon").addEventListener("click", function () {
    updateSelectedTotal();
  });

  document.getElementById("checkout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (window.cartIsEmpty) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
    } else {
      window.location.href = "./checkout.html";
    }
  });
});