import { ProductAPI } from "../../APIs/productAPI.js";

document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        // Tên
        document.getElementById('user-fullname').innerHTML = `<i class="fas fa-user"></i> Tên: ${user.fullName || user.name || 'Người dùng'}`;
        // Ảnh đại diện
        document.getElementById('user-avatar').src = user.avatar || '../../assests/images/logo.png';
        // Địa chỉ
        document.getElementById('user-address').innerHTML = `<i class="fas fa-map-marker-alt"></i> Địa chỉ: ${user.address || 'Chưa cập nhật'}`;
        // Trạng thái tài khoản
        let statusText = 'Đang hoạt động';
        if (user.status === false || user.status === 'inactive') statusText = 'Đã khóa';
        document.getElementById('user-status').innerHTML = `<i class="fas fa-user-check"></i> Trạng thái: ${statusText}`;
        // Xác thực
        let verifiedText = 'Chưa xác thực';
        if (user.isVerified) verifiedText = 'Đã xác thực';
        document.getElementById('user-verified').innerHTML = `<i class="fas fa-shield-alt"></i> Xác thực: ${verifiedText}`;
    }

    // Load thông tin sản phẩm của user
    loadUserProductInfo();

    // Tab switching chỉ đổi tab, không load lại dữ liệu
    const tabButtons = document.querySelectorAll('.sidebar-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            // KHÔNG loadTabData(tabId) nữa
        });
    });

    // KHÔNG loadTabData khi vừa vào trang
    // const activeTab = document.querySelector('.tab-content.active').id;
    // loadTabData(activeTab);
});

// Load thông tin sản phẩm của user
async function loadUserProductInfo() {
    try {
        const response = await ProductAPI.getUserProducts();
        if (response.success) {
            const { approvedCount, pendingCount, rejectedCount } = response.data;
            // Tổng số sản phẩm đã đăng = chờ duyệt + đã duyệt + bị từ chối
            const total = (approvedCount || 0) + (pendingCount || 0) + (rejectedCount || 0);
            document.getElementById('user-product-count').innerHTML = `<i class="fas fa-box"></i> Số sản phẩm đã đăng: ${total}`;
            document.getElementById('product-count').textContent = approvedCount || 0;
        }
    } catch (error) {
        console.error('Error loading user product info:', error);
        document.getElementById('user-product-count').innerHTML = `<i class="fas fa-box"></i> Số sản phẩm đã đăng: 0`;
        document.getElementById('product-count').textContent = '0';
    }
}

// Các hàm loadTabData, fetchPendingProducts, fetchApprovedProducts, renderProducts sẽ không còn được gọi