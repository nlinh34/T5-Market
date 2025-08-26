import CartAPI from "../APIs/cartAPI.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const selectAllCheckbox = document.getElementById("select-all");
  let discount = 0;
  window.cartIsEmpty = true;

  async function fetchCart() {
    try {
const res = await CartAPI.getCart();
const { items, total } = res.cart || { items: [], total: 0 };
      return items || [];
    } catch (err) {
      console.error("❌ Lỗi fetchCart:", err.message);
      alert("Không thể lấy giỏ hàng.");
      return [];
    }
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;

    const quantitySpan = document.querySelector(`.quantity-span[data-id="${productId}"]`);
    if (quantitySpan) quantitySpan.textContent = newQuantity;

    const checkbox = document.querySelector(`.select-product[data-id="${productId}"]`);
    if (checkbox) {
      checkbox.dataset.qty = newQuantity;
      const price = parseFloat(checkbox.dataset.price);
      const totalCell = checkbox.closest("tr").querySelector(".item-total");
      if (totalCell) totalCell.textContent = (price * newQuantity).toLocaleString() + "₫";
    }

    updateSelectedTotal();

    CartAPI.updateQuantity(productId, newQuantity).catch(() => alert("Cập nhật thất bại"));
  }

  async function deleteItem(productId) {
    await CartAPI.removeFromCart(productId);
    const cartItems = await fetchCart();
    renderCart(cartItems);
  }

  function updateSelectedTotal() {
    const checkboxes = document.querySelectorAll(".select-product:checked");
    const allProductCheckboxes = document.querySelectorAll(".select-product");
    let subtotal = 0;
    let discount = 0;
    const selectedItems = [];

    checkboxes.forEach(cb => {
      const qty = parseInt(cb.dataset.qty);
      const price = parseFloat(cb.dataset.price);
      subtotal += price * qty;

      selectedItems.push({
        id: cb.dataset.id,
        name: cb.closest("tr").querySelector(".cart-product-name").textContent.trim(),
        qty,
        price,
        image: cb.closest("tr").querySelector("img").src,
      });
    });

    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));

    const couponCode = document.getElementById("coupon-input")?.value.trim();
    if (couponCode?.toLowerCase() === "t5market") {
      discount = subtotal * 0.2;
      localStorage.setItem("appliedCoupon", "t5market");
      localStorage.setItem("appliedDiscount", discount);
    } else {
      localStorage.removeItem("appliedCoupon");
      localStorage.setItem("appliedDiscount", "0");
    }

    const finalTotal = subtotal - discount;
    subtotalEl.textContent = subtotal.toLocaleString() + "₫";
    totalEl.textContent = finalTotal.toLocaleString() + "₫";
    const discountEl = document.getElementById("discount");
    if (discountEl) discountEl.textContent = discount.toLocaleString() + "₫";

    if (allProductCheckboxes.length > 0) {
      const allChecked = Array.from(allProductCheckboxes).every(cb => cb.checked);
      if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
    } else {
      if (selectAllCheckbox) selectAllCheckbox.checked = false;
    }

    window.cartIsEmpty = checkboxes.length === 0;

    updateSelectedProductIds();
  }

  function updateSelectedProductIds() {
    const selectedIds = Array.from(document.querySelectorAll(".select-product:checked")).map(cb => cb.dataset.id);
    localStorage.setItem("selectedProductIds", JSON.stringify(selectedIds));
  }

  function attachCheckboxListeners() {
    document.querySelectorAll(".select-product").forEach(productCb => {
      productCb.addEventListener("change", () => {
        const storeSection = productCb.closest("tbody");
        const storeCb = storeSection?.querySelector(".select-store");
        if (storeCb) {
          const productCbs = storeSection.querySelectorAll(".select-product");
          const allChecked = Array.from(productCbs).every(cb => cb.checked);
          storeCb.checked = allChecked;
        }
        updateSelectedTotal();
      });
    });

    document.querySelectorAll(".select-store").forEach(storeCb => {
      storeCb.addEventListener("change", () => {
        const storeSection = storeCb.closest("tbody");
        const checked = storeCb.checked;
        storeSection?.querySelectorAll(".select-product").forEach(cb => cb.checked = checked);
        updateSelectedTotal();
      });
    });

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", () => {
        const checked = selectAllCheckbox.checked;
        document.querySelectorAll(".select-product, .select-store").forEach(cb => cb.checked = checked);
        updateSelectedTotal();
      });
    }
  }

  function renderCart(cartItems) {
    const totalProductsEl = document.getElementById("total-products");
    if (totalProductsEl) totalProductsEl.textContent = cartItems.length;
    tbody.innerHTML = "";
    window.cartIsEmpty = cartItems.length === 0;

    cartItems.forEach(item => {
const { _id, name, price, images, shop } = item?.product || {};
      const quantity = item.quantity;
      const shopName = shop?.name || "Không xác định";
      const rawImage = images?.[0];
      const image = rawImage
        ? (rawImage.startsWith("http") || rawImage.startsWith("data:image")
          ? rawImage
          : `https://t5-market.onrender.com/uploads/${rawImage}`)
        : "https://via.placeholder.com/100?text=No+Image";

      const row = document.createElement("tr");
      row.classList.add("store-section-row");
      row.dataset.storeId = shop?._id || "unknown";
      row.innerHTML = `
        <td><input type="checkbox" class="select-product" data-id="${_id}" data-price="${price}" data-qty="${quantity}" /></td>
        <td><div class="cart-item-info"><img loading="lazy" src="${image}" alt="${name}" class="cart-product-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/100?text=No+Image';" /></div></td>
        <td style="min-width: 250px"><div class="cart-product-name">${name}</div></td>  
        <td><span>${price.toLocaleString()}₫</span></td>
        <td>
          <div class="cart-product-actions">
            <button class="decrease-btn" data-id="${_id}">−</button>
            <span class="quantity-span" data-id="${_id}">${quantity}</span>
            <button class="increase-btn" data-id="${_id}">+</button>
          </div>
        </td>
        <td class="item-total" style="color: #DD0000;  font-weight: 600;">${(price * quantity).toLocaleString()}₫</td>
        <td><button class="cart-delete-btn" data-id="${_id}"><i class="fas fa-trash"></i></button></td>
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

    attachCheckboxListeners();
  }

  const initialCart = await fetchCart();
  renderCart(initialCart);

  document.getElementById("apply-coupon").addEventListener("click", updateSelectedTotal);

  document.getElementById("checkout-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (window.cartIsEmpty) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
    } else {
      window.location.href = "./checkout.html";
    }
  });
});
