// frontend/pages/shop/shop-manager.js
import { ProductAPI } from '../APIs/productAPI.js';
import { ShopAPI } from '../APIs/shopAPI.js';
import { formatCurrency, formatTimeAgo } from '../APIs/utils/formatter.js';
import { showNotification } from '../APIs/utils/notification.js';

let currentShopData = null; // To store the fetched shop data

async function initializeShopData() {
    console.log("Initializing shop data...");
    const shopNameElement = document.getElementById("shopName");
    const shopAddressElement = document.getElementById("shopAddress");
    const shopFullAddressElement = document.getElementById("shopFullAddress");
    const shopIntroDescriptionElement = document.getElementById("shopIntroDescription");
    const shopPoliciesListElement = document.getElementById("shopPoliciesList");
    const shopStatusElement = document.getElementById("shopStatus");
    const shopAvatarElement = document.getElementById("shopAvatar");
    const phoneToggle = document.getElementById("phoneToggle");
    const shopPhoneDisplay = document.getElementById("shopPhoneDisplay");

    try {
        const response = await ShopAPI.getMyShop();
        if (response.success && response.data) {
            const shop = response.data;
            currentShopData = shop; // Store fetched data

            // Update Shop Info
            if (shopNameElement) shopNameElement.textContent = shop.name || 'Tên Shop';
            if (shopAddressElement) shopAddressElement.textContent = shop.address || 'Địa chỉ chưa cập nhật';
            if (shopFullAddressElement) shopFullAddressElement.textContent = shop.address || 'Địa chỉ chưa cập nhật';
            if (shopIntroDescriptionElement) shopIntroDescriptionElement.textContent = shop.description || 'Chưa có mô tả.';
            
            // Update Logo
            if (shopAvatarElement && shop.logoUrl) {
                shopAvatarElement.innerHTML = `<img src="${shop.logoUrl}" alt="Shop Avatar">`;
            } else if (shopAvatarElement) {
                shopAvatarElement.textContent = shop.name ? shop.name.substring(0, 2).toUpperCase() : 'NA'; // Fallback to initials
            }

            // Update Phone
            if (shop.phone && shopPhoneDisplay) {
                const fullPhone = shop.phone;
                shopPhoneDisplay.textContent = fullPhone.substring(0, 5) + "***";
                if (phoneToggle) {
                    phoneToggle.dataset.fullPhone = fullPhone;
                    phoneToggle.onclick = (e) => {
                        e.preventDefault();
                        if (shopPhoneDisplay.textContent.includes("***")) {
                            shopPhoneDisplay.textContent = fullPhone;
                            phoneToggle.textContent = "Ẩn số";
                        } else {
                            shopPhoneDisplay.textContent = fullPhone.substring(0, 5) + "***";
                            phoneToggle.textContent = "Hiện số";
                        }
                    };
                }
            }

            // Update Status
            if (shopStatusElement) {
                let statusText = '';
                let statusClass = '';
                switch (shop.shopStatus) {
                    case 'green': statusText = 'Hoạt động'; statusClass = 'status-green'; break;
                    case 'yellow': statusText = 'Hạn chế'; statusClass = 'status-yellow'; break;
                    case 'orange': statusText = 'Cảnh báo'; statusClass = 'status-orange'; break;
                    case 'red': statusText = 'Đã khóa'; statusClass = 'status-red'; break;
                    default: statusText = 'Không xác định'; statusClass = '';
                }
                shopStatusElement.innerHTML = `<i class="fas fa-circle ${statusClass}"></i> ${statusText} ${formatTimeAgo(shop.updatedAt)}`;
            }

            // Update Policies
            if (shopPoliciesListElement && shop.policies && shop.policies.length > 0) {
                shopPoliciesListElement.innerHTML = ''; // Clear existing static policies
                shop.policies.forEach(policy => {
                    const policyItem = document.createElement('li');
                    policyItem.className = 'policy-item';
                    let iconClass = '';
                    switch(policy.type) {
                        case 'shipping': iconClass = 'fas fa-truck'; break;
                        case 'warranty': iconClass = 'fas fa-shield-alt'; break;
                        case 'return': iconClass = 'fas fa-exchange-alt'; break;
                        case 'installment': iconClass = 'fas fa-money-check-alt'; break;
                        case 'tradein': iconClass = 'fas fa-sync-alt'; break;
                        default: iconClass = 'fas fa-file-alt'; // Default icon for custom policies
                    }
                    policyItem.innerHTML = `<i class="${iconClass} policy-icon"></i> ${policy.value}`;
                    shopPoliciesListElement.appendChild(policyItem);
                });
                document.getElementById("noPolicyMessage").classList.add("hidden"); // Hide no policy message
            } else if (shopPoliciesListElement) {
                shopPoliciesListElement.innerHTML = ''; // Ensure it's empty
                document.getElementById("noPolicyMessage").classList.remove("hidden"); // Show no policy message
            }

        } else {
            console.error("Failed to fetch shop data:", response.error);
        }
    } catch (error) {
        console.error("Error fetching shop data:", error);
    }
    updateShopStats();
}

document.addEventListener("DOMContentLoaded", () => {
    // Tab switching functionality
    const tabLinks = document.querySelectorAll(".tab-link");
    
    tabLinks.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(t => t.classList.remove("active"));
            
            // Add active class to clicked tab
            e.target.classList.add("active");
            
            // Handle tab content switching
            const tabName = e.target.dataset.tab;
            handleTabSwitch(tabName);
        });
    });

    // Get modal elements
    const editShopInfoModal = document.getElementById('editShopInfoModal');
    const editPoliciesModal = document.getElementById('editPoliciesModal');
    const closeButtons = document.querySelectorAll('.modal .close-button');

    // Get edit buttons
    const editShopInfoBtn = document.getElementById('editShopInfoBtn');
    const editPoliciesBtn = document.getElementById('editPoliciesBtn');

    // Get shop info form elements
    const shopInfoEditForm = document.getElementById('shopInfoEditForm');
    const editShopAvatarInput = document.getElementById('editShopAvatar');
    const editShopAvatarPreview = document.getElementById('editShopAvatarPreview');
    const editShopNameInput = document.getElementById('editShopName');
    const editShopDescriptionTextarea = document.getElementById('editShopDescription');
    const editShopAddressInput = document.getElementById('editShopAddress');
    const editShopPhoneInput = document.getElementById('editShopPhone');
    const editShopPhone2Input = document.getElementById('editShopPhone2');
    const editShopPhone3Input = document.getElementById('editShopPhone3');

    // Get policies form elements and toggles
    const editShippingPolicyToggle = document.getElementById('editShippingPolicyToggle');
    const editShippingPolicyInput = document.getElementById('editShippingPolicy');
    const editWarrantyPolicyToggle = document.getElementById('editWarrantyPolicyToggle');
    const editWarrantyPolicyInput = document.getElementById('editWarrantyPolicy');
    const editReturnPolicyToggle = document.getElementById('editReturnPolicyToggle');
    const editReturnPolicyInput = document.getElementById('editReturnPolicy');
    const editInstallmentPolicyToggle = document.getElementById('editInstallmentPolicyToggle');
    const editInstallmentPolicyInput = document.getElementById('editInstallmentPolicy');
    const editTradeinPolicyToggle = document.getElementById('editTradeinPolicyToggle');
    const editTradeinPolicyInput = document.getElementById('editTradeinPolicy');
    const addCustomPolicyBtnModal = document.getElementById('addCustomPolicyBtnModal');
    const customPolicyContainerModal = document.getElementById('customPolicyContainerModal');
    const confirmEditPoliciesBtn = document.getElementById('confirmEditPoliciesBtn');

    // Function to open modal
    const openModal = (modal) => {
        modal.style.display = 'block';
    };

    // Function to close modal
    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // Add event listeners to close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editShopInfoModal) {
            closeModal(editShopInfoModal);
        } else if (e.target === editPoliciesModal) {
            closeModal(editPoliciesModal);
        }
    });

    // Event listener for opening edit shop info modal
    if (editShopInfoBtn) {
        editShopInfoBtn.addEventListener('click', () => {
            if (currentShopData) {
                populateEditShopInfoModal(currentShopData);
            }
            openModal(editShopInfoModal);
        });
    }

    // Event listener for opening edit policies modal
    if (editPoliciesBtn) {
        editPoliciesBtn.addEventListener('click', () => {
            if (currentShopData) {
                populateEditPoliciesModal(currentShopData);
            }
            openModal(editPoliciesModal);
        });
    }

    // Function to populate the Edit Shop Info Modal
    function populateEditShopInfoModal(shop) {
        if (editShopNameInput) editShopNameInput.value = shop.name || '';
        if (editShopDescriptionTextarea) editShopDescriptionTextarea.value = shop.description || '';
        if (editShopAddressInput) editShopAddressInput.value = shop.address || '';
        
        // Handle phone numbers
        const phones = shop.phone ? shop.phone.split(',').map(p => p.trim()) : [];
        if (editShopPhoneInput) editShopPhoneInput.value = phones[0] || '';
        if (editShopPhone2Input) editShopPhone2Input.value = phones[1] || '';
        if (editShopPhone3Input) editShopPhone3Input.value = phones[2] || '';

        // Handle avatar preview
        if (editShopAvatarPreview && shop.logoUrl) {
            editShopAvatarPreview.src = shop.logoUrl;
        } else if (editShopAvatarPreview) {
            editShopAvatarPreview.src = './assests/images/default-product.png'; // Default if no logo
        }
    }

    // Function to populate the Edit Policies Modal
    function populateEditPoliciesModal(shop) {
        // Reset all toggles and inputs first
        const policyToggles = document.querySelectorAll('.policy-item input[type="checkbox"]');
        policyToggles.forEach(toggle => {
            toggle.checked = false;
            const input = toggle.closest('.policy-item').querySelector('.policy-input-group input[type="text"]');
            if (input) input.value = '';
            toggle.closest('.policy-item').querySelector('.policy-input-group').classList.add('hidden');
        });
        customPolicyContainerModal.innerHTML = ''; // Clear custom policies

        if (shop.policies && shop.policies.length > 0) {
            shop.policies.forEach(policy => {
                switch(policy.type) {
                    case 'shipping':
                        if (editShippingPolicyToggle) {
                            editShippingPolicyToggle.checked = true;
                            editShippingPolicyInput.value = policy.value;
                            editShippingPolicyInput.closest('.policy-input-group').classList.remove('hidden');
                        }
                        break;
                    case 'warranty':
                        if (editWarrantyPolicyToggle) {
                            editWarrantyPolicyToggle.checked = true;
                            editWarrantyPolicyInput.value = policy.value;
                            editWarrantyPolicyInput.closest('.policy-input-group').classList.remove('hidden');
                        }
                        break;
                    case 'return':
                        if (editReturnPolicyToggle) {
                            editReturnPolicyToggle.checked = true;
                            editReturnPolicyInput.value = policy.value;
                            editReturnPolicyInput.closest('.policy-input-group').classList.remove('hidden');
                        }
                        break;
                    case 'installment':
                        if (editInstallmentPolicyToggle) {
                            editInstallmentPolicyToggle.checked = true;
                            editInstallmentPolicyInput.value = policy.value;
                            editInstallmentPolicyInput.closest('.policy-input-group').classList.remove('hidden');
                        }
                        break;
                    case 'tradein':
                        if (editTradeinPolicyToggle) {
                            editTradeinPolicyToggle.checked = true;
                            editTradeinPolicyInput.value = policy.value;
                            editTradeinPolicyInput.closest('.policy-input-group').classList.remove('hidden');
                        }
                        break;
                    default: // Custom policies
                        addCustomPolicyField(policy.value);
                        break;
                }
            });
        }
    }

    // Helper to add a custom policy field dynamically
    function addCustomPolicyField(value = '') {
        const newPolicyDiv = document.createElement('div');
        newPolicyDiv.className = 'custom-policy-input';
        newPolicyDiv.innerHTML = `
            <input type="text" class="custom-policy-text-input" placeholder="Nhập chính sách khác" value="${value}">
            <button type="button" class="remove-custom-policy-btn"><i class="fas fa-times"></i></button>
        `;
        customPolicyContainerModal.appendChild(newPolicyDiv);

        // Add event listener to the new remove button
        newPolicyDiv.querySelector('.remove-custom-policy-btn').addEventListener('click', () => {
            newPolicyDiv.remove();
        });
    }

    // Event listener for adding custom policy in modal
    if (addCustomPolicyBtnModal) {
        addCustomPolicyBtnModal.addEventListener('click', () => {
            addCustomPolicyField();
        });
    }

    // Handle shop info form submission
    if (shopInfoEditForm) {
        shopInfoEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = editShopNameInput.value.trim();
            const description = editShopDescriptionTextarea.value.trim();
            const address = editShopAddressInput.value.trim();
            const phone1 = editShopPhoneInput.value.trim();
            const phone2 = editShopPhone2Input.value.trim();
            const phone3 = editShopPhone3Input.value.trim();

            let phones = [phone1, phone2, phone3].filter(p => p !== '');
            // Join phones with comma if there are multiple, otherwise just the first one or empty string
            const phone = phones.join(',');

            let logoUrl = currentShopData ? currentShopData.logoUrl : '';

            if (editShopAvatarInput.files && editShopAvatarInput.files[0]) {
                // Read file as data URL
                const reader = new FileReader();
                reader.onload = async (e) => {
                    logoUrl = e.target.result;
                    await submitShopInfo(name, description, address, phone, logoUrl);
                };
                reader.readAsDataURL(editShopAvatarInput.files[0]);
            } else {
                await submitShopInfo(name, description, address, phone, logoUrl);
            }
        });
    }

    async function submitShopInfo(name, description, address, phone, logoUrl) {
        // Simple validation
        if (!name) { showNotification("Vui lòng nhập tên cửa hàng.", "error"); return; }
        if (!address) { showNotification("Vui lòng nhập địa chỉ cửa hàng.", "error"); return; }
        if (!phone) { showNotification("Vui lòng nhập số điện thoại liên hệ.", "error"); return; }

        const shopData = {
            name,
            description,
            address,
            phone,
            logoUrl
        };

        try {
            const response = await ShopAPI.updateShopProfile(shopData);
            if (response.success) {
                showNotification("Cập nhật thông tin cửa hàng thành công!", "success");
                closeModal(editShopInfoModal);
                await initializeShopData(); // Reload data on page
            } else {
                showNotification(`Lỗi cập nhật thông tin: ${response.error || "Không xác định"}`, "error");
            }
        } catch (error) {
            console.error("Error updating shop profile:", error);
            showNotification("Đã xảy ra lỗi khi cập nhật thông tin cửa hàng.", "error");
        }
    }

    // Handle policies form submission
    if (confirmEditPoliciesBtn) {
        confirmEditPoliciesBtn.addEventListener('click', async () => {
            const policies = [];

            // Collect data from fixed policy types
            if (editShippingPolicyToggle.checked && editShippingPolicyInput.value.trim() !== '') {
                policies.push({ type: 'shipping', value: editShippingPolicyInput.value.trim() });
            }
            if (editWarrantyPolicyToggle.checked && editWarrantyPolicyInput.value.trim() !== '') {
                policies.push({ type: 'warranty', value: editWarrantyPolicyInput.value.trim() });
            }
            if (editReturnPolicyToggle.checked && editReturnPolicyInput.value.trim() !== '') {
                policies.push({ type: 'return', value: editReturnPolicyInput.value.trim() });
            }
            if (editInstallmentPolicyToggle.checked && editInstallmentPolicyInput.value.trim() !== '') {
                policies.push({ type: 'installment', value: editInstallmentPolicyInput.value.trim() });
            }
            if (editTradeinPolicyToggle.checked && editTradeinPolicyInput.value.trim() !== '') {
                policies.push({ type: 'tradein', value: editTradeinPolicyInput.value.trim() });
            }

            // Collect data from custom policies
            document.querySelectorAll('#customPolicyContainerModal .custom-policy-text-input').forEach(input => {
                if (input.value.trim() !== '') {
                    policies.push({ type: 'custom', value: input.value.trim() });
                }
            });

            if (policies.length === 0) {
                showNotification("Vui lòng thêm ít nhất một chính sách hoặc điền đầy đủ nội dung.", "error");
                return;
            }

            try {
                const response = await ShopAPI.updateShopPolicies({ policies });
                if (response.success) {
                    showNotification("Cập nhật chính sách cửa hàng thành công!", "success");
                    closeModal(editPoliciesModal);
                    await initializeShopData(); // Reload data on page
                } else {
                    showNotification(`Lỗi cập nhật chính sách: ${response.error || "Không xác định"}`, "error");
                }
            } catch (error) {
                console.error("Error updating shop policies:", error);
                showNotification("Đã xảy ra lỗi khi cập nhật chính sách cửa hàng.", "error");
            }
        });
    }
    
    // Event listener for policies toggles to show/hide input fields
    document.querySelectorAll('.policy-item input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const inputGroup = this.closest('.policy-item').querySelector('.policy-input-group');
            if (this.checked) {
                inputGroup.classList.remove('hidden');
            } else {
                inputGroup.classList.add('hidden');
                inputGroup.querySelector('input[type="text"]').value = ''; // Clear value when hidden
            }
        });
    });
    
    // Handle avatar image preview in modal
    if (editShopAvatarInput) {
        editShopAvatarInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (editShopAvatarPreview) {
                        editShopAvatarPreview.src = e.target.result;
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    // Initialize shop data
    initializeShopData();
});

function handleTabSwitch(tabName) {
    const mainContent = document.querySelector(".main-content");
    const sidebar = document.querySelector(".sidebar");
    
    // Hide all content first
    mainContent.style.opacity = "0.5";
    
    setTimeout(() => {
        // Hide all content cards initially
        document.querySelectorAll(".main-content .card").forEach(card => card.style.display = "none");

        switch(tabName) {
            case "cuaHang":
                document.getElementById("shopIntroCard").style.display = "block";
                break;
            case "sanPhamDangBan":
                document.getElementById("productsForSaleCard").style.display = "block";
                loadProductsForSaleContent();
                break;
            case "danhGia":
                // document.getElementById("reviewsCard").style.display = "block"; // Assuming you have a reviews card
                loadReviewsContent();
                break;
        }
        mainContent.style.opacity = "1";
    }, 150);
}

function loadShopContent() {
    // Content already loaded by default or shown by handleTabSwitch
    console.log("Loading shop content...");
}

async function loadProductsForSaleContent() {
    console.log("Loading products for sale content...");
    const sellerProductsGrid = document.getElementById("sellerProductsGrid");
    const noProductsMessage = document.getElementById("noProductsMessage");

    if (!sellerProductsGrid || !noProductsMessage) {
        console.error("Required elements for products for sale content not found.");
        return;
    }

    sellerProductsGrid.innerHTML = ''; // Clear existing products
    noProductsMessage.classList.add("hidden"); // Hide empty message initially

    try {
        const response = await ProductAPI.getUserProducts();
        if (response.success && response.data) {
            const { approved, pending, total } = response.data;

            // Combine approved and pending products for display if desired
            const allProducts = [...approved, ...pending];

            if (allProducts.length > 0) {
                allProducts.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.className = "product-card";
                    productCard.innerHTML = `
                        <img src="${product.image_url}" alt="${product.name}" class="product-img">
                        <div class="product-info">
                            <div class="product-header">
                                <span class="product-status status-partner">ĐỐI TÁC</span>
                                <h4 class="product-name">${product.name}</h4>
                            </div>
                            <p class="product-price">${formatCurrency(product.price)}</p>
                            <div class="product-footer">
                                <span class="product-time"><i class="fas fa-clock"></i> ${formatTimeAgo(product.createdAt)}</span>
                                <i class="far fa-heart favorite-icon"></i>
                            </div>
                        </div>
                    `;
                    sellerProductsGrid.appendChild(productCard);
                });

            } else {
                noProductsMessage.classList.remove("hidden");
            }
        }
    } catch (error) {
        console.error("Error loading products for sale:", error);
        // Optionally display an error message to the user
        noProductsMessage.classList.remove("hidden");
        noProductsMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i><h3>Lỗi tải sản phẩm</h3><p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>`;
    }
}

async function handleEditProduct(productId) {
    console.log("Edit product with ID:", productId);
    // Redirect to product posting/editing page with product ID
    window.location.href = `/frontend/pages/products/post-products.html?id=${productId}`;
}

async function handleDeleteProduct(productId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
        try {
            const response = await ProductAPI.deleteProduct(productId);
            if (response.success) {
                alert("Sản phẩm đã được xóa thành công!");
                loadProductsForSaleContent(); // Reload products after deletion
            } else {
                alert("Lỗi khi xóa sản phẩm: " + response.error);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Đã xảy ra lỗi khi xóa sản phẩm.");
        }
    }
}

function loadReviewsContent() {
    console.log("Loading reviews content...");
    // Implementation for reviews content
}

function updateShopStats() {
    // Update stats with real data from backend
    // This is placeholder implementation
} 