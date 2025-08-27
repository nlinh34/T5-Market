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
    const pageLoader = document.getElementById('page-loader');
    const pageContainer = document.querySelector('.container');

    try {
        const userResponse = await UserAPI.getCurrentUser();
        if (!userResponse.success) {
            // If user data cannot be fetched, redirect to login or show error
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1>Lỗi xác thực</h1>
                    <p>Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</p>
                    <a href="./login.html">Đăng nhập</a>
                </div>`;
            return;
        }
        const currentUser = userResponse.data;
        localStorage.setItem('user', JSON.stringify(currentUser)); // Ensure local storage is up-to-date

        const shopResponse = await ShopAPI.getMyShop();

        if (shopResponse.success && shopResponse.data) {
            const shop = shopResponse.data;

            // Handle shop status first
            if (shop.status === 'pending') {
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h1>Thông báo</h1>
                        <p>Cửa hàng của bạn đang chờ duyệt. Vui lòng quay lại sau.</p>
                        <a href="./index.html">Quay về trang chủ</a>
                    </div>`;
                return;
            } else if (shop.status === 'rejected') {
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h1>Thông báo</h1>
                        <p>Yêu cầu mở cửa hàng của bạn đã bị từ chối.</p>
                        <p>Lý do: ${shop.rejectionReason || 'Không có lý do cụ thể.'}</p>
                        <a href="./index.html">Quay về trang chủ</a>
                    </div>`;
                return;
            }

            // If shop is approved, proceed to check user's role and status
            if (shop.status === 'approved') {
                if (currentUser.role === Role.STAFF) {
                    if (currentUser.status === 'pending') {
                        document.body.innerHTML = `
                            <div style="text-align: center; padding: 50px;">
                                <h1>Thông báo</h1>
                                <p>Tài khoản nhân viên của bạn đang chờ quản trị viên duyệt. Vui lòng quay lại sau.</p>
                                <a href="./index.html">Quay về trang chủ</a>
                            </div>`;
                        return;
                    } else if (currentUser.status === 'rejected') {
                        document.body.innerHTML = `
                            <div style="text-align: center; padding: 50px;">
                                <h1>Thông báo</h1>
                                <p>Tài khoản nhân viên của bạn đã bị từ chối.</p>
                                <a href="./index.html">Quay về trang chủ</a>
                            </div>`;
                        return;
                    }
                    // If staff account is approved, continue to load shop data
                } else if (currentUser.role === Role.CUSTOMER) {
                    document.body.innerHTML = `
                        <div style="text-align: center; padding: 50px;">
                            <h1>Truy cập bị từ chối</h1>
                            <p>Bạn không có quyền truy cập trang quản lý cửa hàng.</p>
                            <a href="./index.html">Quay về trang chủ</a>
                        </div>`;
                    return;
                }
                
                // If shop is approved and user is SELLER or approved STAFF, populate data
                populateShopData(shop);
                attachEventListeners(shop);
                await loadShopContent();

                // Run data fetching in parallel
                await Promise.all([
                    updateShopStats(),
                    (async () => {
                        const ratingResponse = await ShopAPI.getShopRating(shop._id);
                        if (ratingResponse.success) {
                            updateShopHeaderRating(ratingResponse.data);
                        }
                    })()
                ]);

            }
        } else {
            // No shop found for the user (owner or staff)
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1>Bạn chưa có cửa hàng</h1>
                    <p>Vui lòng đăng ký để bắt đầu bán hàng.</p>
                    <a href="shop-register.html">Đăng ký ngay!</a>
                </div>`;
        }
    } catch (error) {
        console.error("Initialization failed:", error);
        // More specific error message for debug
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1>Đã có lỗi xảy ra khi tải dữ liệu.</h1>
                <p>Chi tiết lỗi: ${error.message || 'Không xác định'}</p>
                <a href="./index.html">Quay về trang chủ</a>
            </div>`;
    } finally {
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => pageLoader.style.display = 'none', 300);
        }
        if (pageContainer) {
            pageContainer.style.visibility = 'visible';
        }
    }
}

function showLoading() {
    // ... existing code ...
}

function hideLoading() {
    // ... existing code ...
}

// Loading helpers used by destructive actions (delete product/staff)
function showLoadingIndicator() {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        pageLoader.style.display = 'flex';
        // force reflow to ensure transition applies when changing opacity
        // eslint-disable-next-line no-unused-expressions
        pageLoader.offsetHeight;
        pageLoader.style.opacity = '1';
    }
}

function hideLoadingIndicator() {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        pageLoader.style.opacity = '0';
        setTimeout(() => {
            pageLoader.style.display = 'none';
        }, 300);
    }
}

function updateShopHeaderRating({ averageRating = 0, totalReviews = 0 }) {
    const starsContainer = document.getElementById('headerShopStars');
    const ratingText = document.getElementById('headerShopRatingText');

    if (!starsContainer || !ratingText) {
        console.error("Header rating elements not found!");
        return;
    }

    starsContainer.innerHTML = ''; // Clear current stars
    
    // Loop to create 5 stars with accurate fractional rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.classList.add('fas', 'star'); // Add base classes for styling

        if (i <= averageRating) {
            // Full star
            star.classList.add('fa-star', 'filled');
        } else if (i - 0.5 <= averageRating) {
            // Half star
            star.classList.add('fa-star-half-alt', 'filled');
        } else {
            // Empty star
            star.classList.add('fa-star');
        }
        starsContainer.appendChild(star);
    }
    
    ratingText.textContent = `${averageRating.toFixed(1)} (${totalReviews} đánh giá)`;
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
        shopAvatarElement.innerHTML = `<img loading="lazy" src="${shop.logoUrl}" alt="Shop Avatar">`;
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
        shopStatusElement.innerHTML = `<i class="fas fa-circle ${statusClass}"></i> ${statusText}`;
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
    const reviewContentCard = document.getElementById('reviewContentCard');
    
    // Get the new section containers
    const topSection = document.querySelector('.top-section');
    const bottomSection = document.querySelector('.bottom-section');

    // Hide all main content cards first
    if(shopIntroCard) shopIntroCard.classList.add('hidden');
    if(productsForSaleCard) productsForSaleCard.classList.add('hidden');
    if(staffManagementCard) staffManagementCard.classList.add('hidden');
    if(reviewContentCard) reviewContentCard.classList.add('hidden');

    // Hide sections by default
    if (topSection) topSection.classList.add('hidden');
    if (bottomSection) bottomSection.classList.add('hidden');

    if (tabName === 'cuaHang') {
        if (topSection) topSection.classList.remove('hidden');
        if (bottomSection) bottomSection.classList.remove('hidden');
        if(shopIntroCard) shopIntroCard.classList.remove('hidden');
        if(productsForSaleCard) productsForSaleCard.classList.remove('hidden');
        loadProductsForSaleContent();
    } else if (tabName === 'nhanVien') {
        if (bottomSection) bottomSection.classList.remove('hidden');
        if(staffManagementCard) staffManagementCard.classList.remove('hidden');
        loadStaffContent();
    } else if (tabName === 'danhGia') {
        if (bottomSection) bottomSection.classList.remove('hidden');
        if(reviewContentCard) reviewContentCard.classList.remove('hidden');
        loadReviewsContent();
    }
}

function loadShopContent() {
    // Content already loaded by default or shown by handleTabSwitch
    console.log("Loading shop content...");
}

async function loadProductsForSaleContent() {
    const productTabs = document.querySelector('.product-tabs');
    const productSearchInput = document.getElementById('productSearchInput'); // New
    const productSortSelectCustom = document.getElementById('productSortSelectCustom'); // New custom select wrapper
    const selectSelectedSort = document.getElementById('selectSelectedSort'); // New custom select chosen value
    const selectItems = productSortSelectCustom ? productSortSelectCustom.querySelector('.select-items') : null; // New custom select options container

    if (!productTabs) return;

    // Event listener for tab clicks (existing)
    productTabs.addEventListener('click', (e) => {
        if (e.target.matches('.product-tab-btn')) {
            productTabs.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            const status = e.target.dataset.status;
            // Pass current search and sort values when switching tabs
            const searchTerm = productSearchInput ? productSearchInput.value : '';
            const sortBy = selectSelectedSort ? selectSelectedSort.dataset.value : 'createdAt-desc'; // New
            renderSellerProducts(status, searchTerm, sortBy);
        }
    });

    // New Event listener for search input (existing)
    if (productSearchInput) {
        let searchTimeout; // Define a timeout variable for debouncing
        productSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout); // Clear previous timeout
            searchTimeout = setTimeout(() => {
                const activeTab = productTabs.querySelector('.product-tab-btn.active').dataset.status;
                const searchTerm = productSearchInput.value;
                const sortBy = selectSelectedSort ? selectSelectedSort.dataset.value : 'createdAt-desc'; // New
                renderSellerProducts(activeTab, searchTerm, sortBy);
            }, 300); // 300ms debounce time
        });
    }

    // Custom dropdown logic (replaces old select change listener)
    if (productSortSelectCustom && selectSelectedSort && selectItems) {
        // Set initial selected value based on the first option or a default
        const initialSelectedOption = selectItems.querySelector('[data-value="createdAt-desc"]');
        if (initialSelectedOption) {
            selectSelectedSort.textContent = initialSelectedOption.textContent;
            selectSelectedSort.dataset.value = initialSelectedOption.dataset.value;
            initialSelectedOption.classList.add('same-as-selected'); // Mark as selected
        }

        selectSelectedSort.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent document click from closing immediately
            closeAllSelect(this);
            selectItems.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');
        });

        // Handle clicks on custom select options
        selectItems.querySelectorAll('div').forEach(function(item) {
            item.addEventListener('click', function() {
                const prevSelected = selectItems.querySelector('.same-as-selected');
                if (prevSelected) {
                    prevSelected.classList.remove('same-as-selected');
                }
                this.classList.add('same-as-selected');

                selectSelectedSort.textContent = this.textContent;
                selectSelectedSort.dataset.value = this.dataset.value; // Store actual value

                // Trigger product re-render
                const activeTab = productTabs.querySelector('.product-tab-btn.active').dataset.status;
                const searchTerm = productSearchInput ? productSearchInput.value : '';
                const sortBy = this.dataset.value; // Use the value from the clicked item
                renderSellerProducts(activeTab, searchTerm, sortBy);

                selectItems.classList.add('select-hide'); // Hide dropdown
                selectSelectedSort.classList.remove('select-arrow-active');
            });
        });
    }

    function closeAllSelect(elmnt) {
        const arrNo = [];
        const x = document.getElementsByClassName("select-items");
        const y = document.getElementsByClassName("select-selected");
        for (let i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }

    // Close all custom selects when clicking elsewhere on the document
    document.addEventListener('click', closeAllSelect);

    // Initial load with potential default search/sort
    // const initialSortBy = productSortSelect ? productSortSelect.value : 'createdAt-desc'; // Old
    const initialSortBy = selectSelectedSort ? selectSelectedSort.dataset.value : 'createdAt-desc'; // New
    renderSellerProducts('approved', '', initialSortBy);
}

async function renderSellerProducts(status, searchTerm = '', sortBy = 'createdAt-desc') {
    const sellerProductsGrid = document.getElementById("sellerProductsGrid");
    const noProductsMessage = document.getElementById("noProductsMessage");

    if (!sellerProductsGrid || !noProductsMessage || !currentShopData) return;

    sellerProductsGrid.innerHTML = '<div>Đang tải sản phẩm...</div>';
    noProductsMessage.classList.add("hidden");

    try {
        // Pass search term and sort by to the API call
        const response = await ProductAPI.getProductsByShop(currentShopData._id, status, searchTerm, sortBy);

        if (response.success && response.data && response.data.length > 0) {
            sellerProductsGrid.innerHTML = '';
            noProductsMessage.classList.add("hidden"); // Ensure message is hidden when products are present
            response.data.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.className = "product-card";
                productCard.dataset.productId = product._id;
                
                    productCard.innerHTML = `
                    <img loading="lazy" src="${product.images[0] || './assests/images/default-product.png'}" alt="${product.name}" class="product-img" loading="lazy">
                        <div class="product-info">
                                <h4 class="product-name">${product.name}</h4>
                            <p class="product-price">${formatCurrency(product.price)}</p>
                            <p class="product-posted-date"><i class="fas fa-clock"></i> ${formatTimeAgo(product.createdAt)}</p>
                            </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-edit-product"><i class="fas fa-edit"></i> Sửa</button>
                        <button class="btn btn-danger btn-delete-product"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </div>
                    `;
                    sellerProductsGrid.appendChild(productCard);
                });
            // Update shop stats after products are loaded
            updateShopStats(response.data); // Pass products data
        } else {
            sellerProductsGrid.innerHTML = '';
            noProductsMessage.classList.remove("hidden");
            updateShopStats([]); // Pass empty array if no products
        }
    } catch (error) {
        console.error(`Error loading products for status ${status}:`, error);
        sellerProductsGrid.innerHTML = '<div class="error-state">Lỗi tải sản phẩm. Vui lòng thử lại.</div>';
        updateShopStats([]); // Pass empty array on error
    }

    // Add event listeners after rendering
    sellerProductsGrid.querySelectorAll('.btn-edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.product-card').dataset.productId;
            handleEditProduct(productId);
            e.stopPropagation(); // Prevent card click from triggering
        });
    });

    sellerProductsGrid.querySelectorAll('.btn-delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('.product-card').dataset.productId;
            showDeleteConfirmModal(productId, 'product'); // Open the confirmation modal
            e.stopPropagation(); // Prevent card click from triggering
        });
    });

    // Add click listener for the product card itself
    sellerProductsGrid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            if (productId) {
                window.location.href = `product.html?id=${productId}`;
            }
        });
    });
}

async function handleEditProduct(productId) {
    console.log("Edit product with ID:", productId);
    // Redirect to product posting/editing page with product ID
    window.location.href = `/frontend/post-products.html?id=${productId}`;
}

// Delete Confirmation Modal elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
let itemToDelete = { id: null, type: null }; // Generic object to store ID and type (product/staff)

// Function to show the delete confirmation modal
function showDeleteConfirmModal(id, type) {
    itemToDelete = { id, type };
    
    const modalTitle = deleteConfirmModal.querySelector('.modal-header h2');
    const modalBody = deleteConfirmModal.querySelector('.modal-body p');
    const confirmButton = deleteConfirmModal.querySelector('#confirmDeleteBtn');
    
    if (type === 'product') {
        if (modalTitle) modalTitle.textContent = 'Xác nhận xóa sản phẩm';
        if (modalBody) modalBody.textContent = 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.';
        if (confirmButton) confirmButton.textContent = 'Xóa';
    } else if (type === 'staff') {
        if (modalTitle) modalTitle.textContent = 'Xác nhận xóa nhân viên';
        if (modalBody) modalBody.textContent = 'Bạn có chắc chắn muốn xóa nhân viên này khỏi cửa hàng? Hành động này không thể hoàn tác.';
        if (confirmButton) confirmButton.textContent = 'Xóa nhân viên';
    }

    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = 'flex';
    }
}

// Function to hide the delete confirmation modal
function hideDeleteConfirmModal() {
    itemToDelete = { id: null, type: null };
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = 'none';
        // Reset modal content to default product deletion state (optional, but good practice)
        const modalTitle = deleteConfirmModal.querySelector('.modal-header h2');
        const modalBody = deleteConfirmModal.querySelector('.modal-body p');
        const confirmButton = deleteConfirmModal.querySelector('#confirmDeleteBtn');
        if (modalTitle) modalTitle.textContent = 'Xác nhận xóa sản phẩm';
        if (modalBody) modalBody.textContent = 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.';
        if (confirmButton) confirmButton.textContent = 'Xóa';
    }
}

// Event listeners for the delete confirmation modal
if (deleteConfirmModal) {
    deleteConfirmModal.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', hideDeleteConfirmModal);
    });

    // Close modal if clicking outside the modal content
    deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) {
            hideDeleteConfirmModal();
        }
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (itemToDelete.id) {
            try {
                showLoadingIndicator();
                let response;
                if (itemToDelete.type === 'product') {
                    response = await ProductAPI.deleteProduct(itemToDelete.id);
                } else if (itemToDelete.type === 'staff') {
                    response = await ShopAPI.removeStaff(itemToDelete.id);
                }

                if (response.success) {
                    showNotification(`${itemToDelete.type} đã được xóa thành công.`, "success");
                    // Re-render the current tab content based on the deleted item's type
                    if (itemToDelete.type === 'product') {
                        const activeTab = document.querySelector('.product-tab-btn.active').dataset.status;
                        const searchTerm = document.getElementById('productSearchInput') ? document.getElementById('productSearchInput').value : '';
                        const sortBy = document.getElementById('selectSelectedSort') ? document.getElementById('selectSelectedSort').dataset.value : 'createdAt-desc';
                        renderSellerProducts(activeTab, searchTerm, sortBy);
                    } else if (itemToDelete.type === 'staff') {
                        loadStaffContent();
                    }
                } else {
                    showNotification(response.error || `Lỗi khi xóa ${itemToDelete.type}.`, "error");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
                showNotification("Đã xảy ra lỗi hệ thống khi xóa.", "error");
            } finally {
                hideLoadingIndicator();
                hideDeleteConfirmModal();
            }
        }
    });
}

async function loadReviewsContent() {
    console.log("Loading reviews content...");
    if (!currentShopData) return;

    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '<p>Đang tải đánh giá...</p>';
    
    try {
        const response = await ShopAPI.getShopRating(currentShopData._id);
        if (response.success) {
            const { averageRating, totalReviews, reviews, reviewCriteria } = response.data;
            
            renderReviewSummary(averageRating, totalReviews, reviewCriteria);
            renderReviewList(reviews);

        } else {
            reviewList.innerHTML = `<p>Lỗi khi tải đánh giá: ${response.error}</p>`;
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
        reviewList.innerHTML = '<p>Đã xảy ra lỗi khi tải đánh giá.</p>';
    }
}

function renderReviewSummary(averageRating, totalReviews, reviewCriteria) {
    document.getElementById('overallRatingScore').textContent = averageRating.toFixed(1);
    const starsContainer = document.getElementById('overallRatingStars');
    starsContainer.innerHTML = '';
    
    // Loop to create 5 stars with accurate fractional rating
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.classList.add('fas', 'star'); // Add base classes for styling

        if (i <= averageRating) {
            // Full star
            star.classList.add('fa-star', 'filled');
        } else if (i - 0.5 <= averageRating) {
            // Half star
            star.classList.add('fa-star-half-alt', 'filled');
        } else {
            // Empty star
            star.classList.add('fa-star');
        }
        starsContainer.appendChild(star);
    }
    
    document.getElementById('overallTotalReviews').textContent = `(${totalReviews} đánh giá)`;

    const filtersContainer = document.getElementById('reviewFilters');
    filtersContainer.innerHTML = '';
    for (const [criteria, count] of Object.entries(reviewCriteria)) {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.textContent = `${criteria} (${count})`;
        filtersContainer.appendChild(filterBtn);
    }
}

function renderReviewList(reviews) {
    // Note: It's crucial to check for `review.user` before accessing its properties
    // because a user associated with a review might have been deleted, leading to null data.
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '';

    if (reviews.length === 0) {
        reviewList.innerHTML = '<p>Chưa có đánh giá nào.</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';

        const userAvatar = (review.user && review.user.avatarUrl) ? review.user.avatarUrl : './assests/images/default-user.png';
        const userName = (review.user && review.user.fullName) ? review.user.fullName : 'Người dùng ẩn danh';
        const productName = review.product ? review.product.name : 'Sản phẩm không tồn tại';
        const productPrice = review.product ? formatCurrency(review.product.price) : 'N/A';
        const productImage = review.product && review.product.images && review.product.images.length > 0 ? review.product.images[0] : './assests/images/default-product.png';

        let criteriaTagsHTML = '';
        if(review.criteria && review.criteria.length > 0) {
            criteriaTagsHTML = review.criteria.map(crit => `<span class="criteria-tag">${crit}</span>`).join('');
        }
        
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i class="fas fa-star ${i <= review.rating ? 'filled' : ''}"></i>`;
        }

        reviewItem.innerHTML = `
            <div class="reviewer-avatar">
                <img  loading="lazy" src="${userAvatar}" alt="${userName}">
            </div>
            <div class="review-content">
                <div class="reviewer-name">${userName}</div>
                <div class="review-criteria-tags">
                    ${criteriaTagsHTML}
                </div>
                <div class="review-meta">
                    <div class="stars">${starsHTML}</div>
                    <span>|</span>
                    <span>${formatTimeAgo(review.createdAt)}</span>
                </div>
                <div class="review-product">
                    <div class="review-product-image">
                        <img  loading="lazy" src="${productImage}" alt="${productName}">
                    </div>
                    <div class="review-product-details">
                        <div class="review-product-name">${productName}</div>
                        <div class="review-product-price">${productPrice}</div>
                    </div>
                </div>
            </div>
        `;
        reviewList.appendChild(reviewItem);
    });
}

async function updateShopStats(productsData) { // Accept productsData as parameter
    const shopProductsCountElement = document.getElementById("shopProductsCount");
    const shopSoldCountElement = document.getElementById("shopSoldCount");

    if (!shopProductsCountElement || !shopSoldCountElement) return;

    // Use provided productsData instead of making a new API call
    if(productsData) {
        shopProductsCountElement.textContent = productsData.length;
        const totalSoldCount = productsData.reduce((acc, product) => acc + (product.sold_count || 0), 0);
        shopSoldCountElement.textContent = totalSoldCount;
    } else {
        // Fallback if productsData is not provided (though it should be now)
        shopProductsCountElement.textContent = 0;
        shopSoldCountElement.textContent = 0;
    }
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
            showDeleteConfirmModal(staffId, 'staff'); // Open the generic confirmation modal for staff
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