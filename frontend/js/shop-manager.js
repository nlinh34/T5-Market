// frontend/pages/shop/shop-manager.js
import { ProductAPI } from '../APIs/productAPI.js';
import { ShopAPI } from '../APIs/shopAPI.js';
import { formatCurrency, formatTimeAgo } from '../APIs/utils/formatter.js';
import { showNotification } from '../APIs/utils/notification.js';
import { UserAPI } from '../APIs/userAPI.js';
import { Role } from '../APIs/utils/roleEnum.js';

let currentShopData = null; // To store the fetched shop data

document.addEventListener("DOMContentLoaded", () => {
    initializeShopData();
});

function attachEventListeners(shop) {
    currentShopData = shop; // Make sure currentShopData is set

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
    const addStaffBtn = document.getElementById('addStaffBtn');
    const addStaffModal = document.getElementById('addStaffModal');

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
        modal.style.display = 'flex';
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
    if (editShopInfoBtn && editShopInfoModal) {
        editShopInfoBtn.addEventListener('click', () => {
            populateEditShopInfoModal(shop);
            openModal(editShopInfoModal);
        });
    }

    // Event listener for opening edit policies modal
    if (editPoliciesBtn && editPoliciesModal) {
        editPoliciesBtn.addEventListener('click', () => {
            populateEditPoliciesModal(shop);
            openModal(editPoliciesModal);
        });
    }

    // Event listener for opening add staff modal
    if (addStaffBtn && addStaffModal) {
        addStaffBtn.addEventListener('click', () => openModal(addStaffModal));
    }

    // This is a placeholder for opening the edit permissions modal
    document.querySelectorAll('.btn-icon[title="Sửa quyền"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const editPermissionsModal = document.getElementById('editPermissionsModal');
            // This is static. The dynamic part will be handled in `renderStaffList`
            if (editPermissionsModal) {
                 openModal(editPermissionsModal);
            }
        });
    });

    // Add Staff Form
    const addStaffForm = document.getElementById('addStaffForm');
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', handleAddStaff);
    }

    // Edit Permissions Form
    const editPermissionsForm = document.getElementById('editPermissionsForm');
    if (editPermissionsForm) {
        editPermissionsForm.addEventListener('submit', handleUpdatePermissions);
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
            const inputGroup = toggle.closest('.policy-item').querySelector('.policy-input-group');
            if(inputGroup) inputGroup.classList.add('hidden');
        });
        if(customPolicyContainerModal) customPolicyContainerModal.innerHTML = ''; // Clear custom policies

        if (shop.policies && shop.policies.length > 0) {
            shop.policies.forEach(policy => {
                let policyToggle, policyInput;
                switch(policy.type) {
                    case 'shipping':
                        policyToggle = editShippingPolicyToggle;
                        policyInput = editShippingPolicyInput;
                        break;
                    case 'warranty':
                        policyToggle = editWarrantyPolicyToggle;
                        policyInput = editWarrantyPolicyInput;
                        break;
                    case 'return':
                        policyToggle = editReturnPolicyToggle;
                        policyInput = editReturnPolicyInput;
                        break;
                    case 'installment':
                        policyToggle = editInstallmentPolicyToggle;
                        policyInput = editInstallmentPolicyInput;
                        break;
                    case 'tradein':
                        policyToggle = editTradeinPolicyToggle;
                        policyInput = editTradeinPolicyInput;
                        break;
                    default: // Custom policies
                        addCustomPolicyField(policy.value);
                        return; // continue to next policy
                }
                if (policyToggle && policyInput) {
                    policyToggle.checked = true;
                    policyInput.value = policy.value;
                    const inputGroup = policyInput.closest('.policy-input-group');
                    if(inputGroup) inputGroup.classList.remove('hidden');
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
        if(customPolicyContainerModal) customPolicyContainerModal.appendChild(newPolicyDiv);

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
                if(inputGroup) inputGroup.classList.remove('hidden');
            } else {
                if(inputGroup) inputGroup.classList.add('hidden');
                const input = inputGroup.querySelector('input[type="text"]');
                if (input) input.value = ''; // Clear value when hidden
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
}

async function initializeShopData() {
    try {
        showLoading();
        const response = await ShopAPI.getMyShop();
        hideLoading();

        if (response.success && response.data) {
            const shop = response.data;
            if (shop.status === 'approved') {
                const user = JSON.parse(localStorage.getItem('user'));
                // Nếu role chưa được cập nhật, thì cập nhật và tải lại
                if (user && ![Role.SELLER, Role.STAFF].includes(user.role)) {
                    const freshUserResponse = await UserAPI.getCurrentUser();
                    if (freshUserResponse.success) {
                        localStorage.setItem('user', JSON.stringify(freshUserResponse.data));
                        // Tải lại trang để header cập nhật đúng
                        window.location.reload();
                        return; // Dừng thực thi để trang tải lại
                    }
                }
                // Nếu vai trò đã đúng, tiếp tục hiển thị trang
                populateShopData(shop);
                attachEventListeners(shop);
            } else {
                const statusMessage = shop.status === 'pending'
                    ? 'Cửa hàng của bạn đang chờ duyệt. Vui lòng quay lại sau.'
                    : 'Yêu cầu mở cửa hàng của bạn đã bị từ chối.';
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h1>Thông báo</h1>
                        <p>${statusMessage}</p>
                        <a href="./index.html">Quay về trang chủ</a>
                    </div>`;
            }
        } else {
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1>Bạn chưa có cửa hàng</h1>
                    <p>Vui lòng đăng ký để bắt đầu bán hàng.</p>
                    <a href="shop-register.html">Đăng ký ngay!</a>
                </div>`;
        }
    } catch (error) {
        console.error("Initialization failed:", error);
        hideLoading();
        document.body.innerHTML = "<h1>Đã có lỗi xảy ra khi tải dữ liệu.</h1>";
    }
}

function showLoading() {
    // ... existing code ...
}

function hideLoading() {
    // ... existing code ...
}

function populateShopData(shop) {
    currentShopData = shop; // Store fetched data

    // Update Shop Info
    const shopNameElement = document.getElementById("shopName");
    const shopAddressElement = document.getElementById("shopAddress");
    const shopFullAddressElement = document.getElementById("shopFullAddress");
    const shopIntroDescriptionElement = document.getElementById("shopIntroDescription");
    const shopPoliciesListElement = document.getElementById("shopPoliciesList");
    const shopStatusElement = document.getElementById("shopStatus");
    const shopAvatarElement = document.getElementById("shopAvatar");
    const phoneToggle = document.getElementById("phoneToggle");
    const shopPhoneDisplay = document.getElementById("shopPhoneDisplay");
    const shopJoinedDate = document.getElementById("shopJoinedDate");

    if (shopNameElement) shopNameElement.textContent = shop.name || 'Tên Shop';
    if (shopAddressElement) shopAddressElement.textContent = shop.address || 'Địa chỉ chưa cập nhật';
    if (shopFullAddressElement) shopFullAddressElement.textContent = shop.address || 'Địa chỉ chưa cập nhật';
    if (shopIntroDescriptionElement) shopIntroDescriptionElement.textContent = shop.description || 'Chưa có mô tả.';
    if (shopJoinedDate) shopJoinedDate.textContent = formatTimeAgo(shop.createdAt);
    
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

    updateShopStats();

    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            handleTabSwitch(tabName);
        });
    });

    // Initial load
    handleTabSwitch('cuaHang'); // Default to 'Cửa hàng' tab
}

function handleTabSwitch(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    const shopIntroCard = document.getElementById('shopIntroCard');
    const productsForSaleCard = document.getElementById('productsForSaleCard');
    const staffManagementCard = document.getElementById('staffManagementCard');

    // Hide all main content cards first
    if(shopIntroCard) shopIntroCard.classList.add('hidden');
    if(productsForSaleCard) productsForSaleCard.classList.add('hidden');
    if(staffManagementCard) staffManagementCard.classList.add('hidden');

    if (tabName === 'cuaHang') {
        if(shopIntroCard) shopIntroCard.classList.remove('hidden');
        if(productsForSaleCard) productsForSaleCard.classList.remove('hidden');
                loadProductsForSaleContent();
    } else if (tabName === 'nhanVien') {
        if(staffManagementCard) staffManagementCard.classList.remove('hidden');
        loadStaffContent();
    }
     else if (tabName === 'danhGia') {
                loadReviewsContent();
        }
}

function loadShopContent() {
    // Content already loaded by default or shown by handleTabSwitch
    console.log("Loading shop content...");
}

async function loadProductsForSaleContent() {
    const productTabs = document.querySelector('.product-tabs');
    if (!productTabs) return;

    productTabs.addEventListener('click', (e) => {
        if (e.target.matches('.product-tab-btn')) {
            productTabs.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            const status = e.target.dataset.status;
            renderSellerProducts(status);
        }
    });

    // Initial load
    renderSellerProducts('all');
}

async function renderSellerProducts(status) {
    const sellerProductsGrid = document.getElementById("sellerProductsGrid");
    const noProductsMessage = document.getElementById("noProductsMessage");

    if (!sellerProductsGrid || !noProductsMessage || !currentShopData) return;

    sellerProductsGrid.innerHTML = '<div>Đang tải sản phẩm...</div>';
    noProductsMessage.classList.add("hidden");

    try {
        const response = await ProductAPI.getProductsByShop(currentShopData._id, status);

        if (response.success && response.data && response.data.length > 0) {
            sellerProductsGrid.innerHTML = '';
            response.data.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.className = "product-card";
                productCard.dataset.productId = product._id;
                
                const getStatusInfo = (status) => {
                    switch (status) {
                        case 'approved': return { text: 'Đang bán', class: 'status-approved' };
                        case 'pending': return { text: 'Chờ duyệt', class: 'status-pending' };
                        case 'rejected': return { text: 'Bị từ chối', class: 'status-rejected' };
                        default: return { text: 'Không xác định', class: 'status-unknown' };
                    }
                };
                const statusInfo = getStatusInfo(product.status);

                    productCard.innerHTML = `
                    <div class="product-status-badge ${statusInfo.class}">${statusInfo.text}</div>
                    <img src="${product.images[0] || './assests/images/default-product.png'}" alt="${product.name}" class="product-img">
                        <div class="product-info">
                                <h4 class="product-name">${product.name}</h4>
                            <p class="product-price">${formatCurrency(product.price)}</p>
                            </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-edit-product"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-danger btn-delete-product"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    `;
                    sellerProductsGrid.appendChild(productCard);
                });
            } else {
            sellerProductsGrid.innerHTML = '';
                noProductsMessage.classList.remove("hidden");
        }
    } catch (error) {
        console.error(`Error loading products for status ${status}:`, error);
        sellerProductsGrid.innerHTML = '<div class="error-state">Lỗi tải sản phẩm. Vui lòng thử lại.</div>';
    }

    // Add event listeners after rendering
    sellerProductsGrid.querySelectorAll('.btn-edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.product-card').dataset.productId;
            handleEditProduct(productId);
        });
    });

    sellerProductsGrid.querySelectorAll('.btn-delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.product-card').dataset.productId;
            handleDeleteProduct(productId);
        });
    });
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
                showNotification("Sản phẩm đã được xóa thành công!", "success");
                const activeTab = document.querySelector('.product-tab-btn.active').dataset.status;
                renderSellerProducts(activeTab); // Reload products for the current tab
            } else {
                showNotification("Lỗi khi xóa sản phẩm: " + response.error, "error");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            showNotification("Đã xảy ra lỗi khi xóa sản phẩm.", "error");
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

let currentlyEditingStaffId = null;

async function loadStaffContent() {
    console.log("Loading staff content...");
    const staffListContainer = document.getElementById('staffList');
    const noStaffMessage = document.getElementById('noStaffMessage');
    const staffTableBody = document.querySelector('.staff-table tbody');

    if (!staffTableBody || !noStaffMessage) return;

    staffTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Đang tải danh sách nhân viên...</td></tr>';
    noStaffMessage.classList.add('hidden');

    try {
        const response = await ShopAPI.getShopStaff();
        if (response.success && response.data) {
            renderStaffList(response.data);
        } else {
            staffTableBody.innerHTML = '';
            noStaffMessage.textContent = 'Không thể tải danh sách nhân viên.';
            noStaffMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error loading staff:", error);
        staffTableBody.innerHTML = '';
        noStaffMessage.textContent = 'Đã xảy ra lỗi khi tải danh sách nhân viên.';
        noStaffMessage.classList.remove('hidden');
    }
}

function renderStaffList(staff) {
    const staffTableBody = document.querySelector('.staff-table tbody');
    const noStaffMessage = document.getElementById('noStaffMessage');
    
    staffTableBody.innerHTML = ''; 

    if (staff.length === 0) {
        noStaffMessage.classList.remove('hidden');
        const staffTable = document.querySelector('.staff-table');
        if (staffTable) staffTable.classList.add('hidden');
        return;
    }

    noStaffMessage.classList.add('hidden');
    const staffTable = document.querySelector('.staff-table');
    if (staffTable) staffTable.classList.remove('hidden');

    staff.forEach(member => {
        const row = document.createElement('tr');
        row.dataset.staffId = member._id;

        const userExists = member.user;

        // If user is null, mark the row for special styling and disable unsupported actions
        if (!userExists) {
            row.classList.add('deleted-user');
        }

        const joinedDate = new Date(member.joinedAt).toLocaleDateString('vi-VN');
        const avatarInitial = userExists && member.user.fullName ? member.user.fullName.substring(0, 2).toUpperCase() : 'X';
        const staffName = userExists && member.user.fullName ? member.user.fullName : '[Người dùng không tồn tại]';
        
        row.innerHTML = `
            <td>
                <div class="staff-info">
                    <div class="staff-avatar">${avatarInitial}</div>
                    <span class="staff-name">${staffName}</span>
                </div>
            </td>
            <td>Nhân viên</td>
            <td>${joinedDate}</td>
            <td>
                <div class="staff-actions">
                    <button class="btn btn-icon btn-edit-perms" title="Sửa quyền" data-staff-id="${member._id}" ${!userExists ? 'disabled' : ''}><i class="fas fa-user-shield"></i></button>
                    <button class="btn btn-icon btn-danger btn-remove-staff" title="Xóa" data-staff-id="${member._id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        staffTableBody.appendChild(row);
    });

    attachStaffActionListeners(staff);
}

function attachStaffActionListeners(staff) {
    document.querySelectorAll('.btn-remove-staff').forEach(button => {
        button.addEventListener('click', (e) => {
            const staffId = e.currentTarget.dataset.staffId;
            handleRemoveStaff(staffId);
        });
    });

    document.querySelectorAll('.btn-edit-perms').forEach(button => {
        button.addEventListener('click', (e) => {
            const staffId = e.currentTarget.dataset.staffId;
            const staffMember = staff.find(s => s._id === staffId);
            if (staffMember) {
                handleOpenEditPermissionsModal(staffMember);
            }
        });
    });
}

async function handleAddStaff(e) {
    e.preventDefault();
    const addStaffForm = document.getElementById('addStaffForm');
    const fullNameInput = document.getElementById('staffFullName');
    const emailInput = document.getElementById('staffEmail');
    const passwordInput = document.getElementById('staffPassword');

    // Get error span elements
    const fullNameError = document.getElementById('staffFullNameError');
    const emailError = document.getElementById('staffEmailError');
    const passwordError = document.getElementById('staffPasswordError');

    // Helper to clear errors
    const clearErrors = () => {
        fullNameError.style.display = 'none';
        emailError.style.display = 'none';
        passwordError.style.display = 'none';
        fullNameInput.classList.remove('input-error');
        emailInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
    };

    clearErrors();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;

    // --- Validation ---
    if (!fullName) {
        fullNameError.textContent = 'Vui lòng nhập họ tên.';
        fullNameError.style.display = 'block';
        fullNameInput.classList.add('input-error');
        hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        emailError.textContent = 'Vui lòng nhập email.';
        emailError.style.display = 'block';
        emailInput.classList.add('input-error');
        hasError = true;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = 'Vui lòng nhập email hợp lệ.';
        emailError.style.display = 'block';
        emailInput.classList.add('input-error');
        hasError = true;
    }

    if (!password) {
        passwordError.textContent = 'Vui lòng nhập mật khẩu.';
        passwordError.style.display = 'block';
        passwordInput.classList.add('input-error');
        hasError = true;
    } else if (password.length < 6) {
        passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        passwordError.style.display = 'block';
        passwordInput.classList.add('input-error');
        hasError = true;
    }

    if (hasError) {
        return; // Stop if there are validation errors
    }
    // --- End Validation ---

    const staffData = { fullName, email, password };

    try {
        const response = await ShopAPI.createStaff(staffData);
        if (response.success) {
            showNotification('Tài khoản nhân viên đã được tạo và đang chờ duyệt!', 'success');
            document.getElementById('addStaffModal').style.display = 'none';
            addStaffForm.reset(); // Reset form fields
            loadStaffContent(); // Reload the staff list
        } else {
            // Handle specific server-side errors
            if (response.message && response.message.includes("Email này đã được sử dụng")) {
                emailError.textContent = response.message;
                emailError.style.display = 'block';
                emailInput.classList.add('input-error');
            } else {
                showNotification(`Lỗi: ${response.message || 'Không thể tạo tài khoản.'}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error creating staff account:', error);
        const errorMessage = error.responseJSON?.message || 'Đã xảy ra lỗi máy chủ khi tạo tài khoản.';
        showNotification(errorMessage, 'error');
    }
}

async function handleRemoveStaff(staffId) {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
        try {
            const response = await ShopAPI.removeStaff(staffId);
            if (response.success) {
                showNotification('Xóa nhân viên thành công!', 'success');
                loadStaffContent();
            } else {
                showNotification(`Lỗi: ${response.message || 'Không thể xóa nhân viên.'}`, 'error');
            }
        } catch (error) {
            console.error('Error removing staff:', error);
            showNotification('Đã xảy ra lỗi máy chủ.', 'error');
        }
    }
}

function handleOpenEditPermissionsModal(staffMember) {
    currentlyEditingStaffId = staffMember._id;
    const modal = document.getElementById('editPermissionsModal');
    const staffNameSpan = document.getElementById('permissionStaffName');
    const form = document.getElementById('editPermissionsForm');

    if (!modal || !staffNameSpan || !form) return;

    staffNameSpan.textContent = staffMember.user.fullName;

    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    const permissionMap = {
        'manage_products': 'permManageProducts',
        'manage_orders': 'permManageOrders',
        'view_reports': 'permViewReports',
    };

    staffMember.permissions.forEach(permission => {
        const checkboxId = permissionMap[permission];
        if (checkboxId) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) checkbox.checked = true;
        }
    });

    modal.style.display = 'flex';
}

async function handleUpdatePermissions(e) {
    e.preventDefault();
    if (!currentlyEditingStaffId) return;

    const permissions = [];
    if (document.getElementById('permManageProducts').checked) permissions.push('manage_products');
    if (document.getElementById('permManageOrders').checked) permissions.push('manage_orders');
    if (document.getElementById('permViewReports').checked) permissions.push('view_reports');

    try {
        const response = await ShopAPI.updateStaffPermissions(currentlyEditingStaffId, permissions);
        if (response.success) {
            showNotification('Cập nhật quyền thành công!', 'success');
            document.getElementById('editPermissionsModal').style.display = 'none';
            loadStaffContent();
        } else {
            showNotification(`Lỗi: ${response.message || 'Không thể cập nhật quyền.'}`, 'error');
        }
    } catch (error) {
        console.error('Error updating permissions:', error);
        showNotification('Đã xảy ra lỗi máy chủ.', 'error');
    }
} 