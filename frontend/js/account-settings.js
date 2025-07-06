import { UserAPI } from "../APIs/userAPI.js";
import { showNotification } from "../APIs/utils/notification.js";

document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.settings-sidebar a');
    const personalInfoSection = document.getElementById('personal-info-section');
    const changePasswordSection = document.getElementById('change-password-section');

    // Personal Info Form elements
    const personalInfoForm = document.getElementById('personalInfoForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const genderSelect = document.getElementById('gender');
    const dobInput = document.getElementById('dob');
    const addressInput = document.getElementById('address');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');

    // Change Password Form elements
    const changePasswordForm = document.getElementById('changePasswordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    const showSection = (sectionId) => {
        // Hide all sections
        personalInfoSection.classList.add('hidden');
        changePasswordSection.classList.add('hidden');

        // Show the requested section
        if (sectionId === 'personal-info') {
            personalInfoSection.classList.remove('hidden');
            loadPersonalInfo();
        } else if (sectionId === 'change-password') {
            changePasswordSection.classList.remove('hidden');
        }
    };

    // Function to load personal info from API
    const loadPersonalInfo = async () => {
        try {
            const response = await UserAPI.getCurrentUser();
            if (response.success) {
                const user = response.data;
                fullNameInput.value = user.fullName || '';
                emailInput.value = user.email || '';
                phoneInput.value = user.phone || '';
                genderSelect.value = user.gender || '';
                dobInput.value = user.dateofbirth ? new Date(user.dateofbirth).toISOString().split('T')[0] : '';
                addressInput.value = user.address || '';

                if (user.avatarUrl) {
                    avatarPreview.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                } else {
                    avatarPreview.innerHTML = '<div class="default-avatar">NA</div>'; // Default avatar if none
                }
            } else {
                showNotification(`Lỗi tải thông tin: ${response.error || 'Không xác định'}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi tải thông tin người dùng:", error);
            showNotification("Không thể tải thông tin người dùng. Vui lòng thử lại.", 'error');
        }
    };

    // Handle Personal Info Form submission
    personalInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            gender: genderSelect.value,
            dateofbirth: dobInput.value,
            address: addressInput.value.trim(),
        };

        // Handle avatar upload if a new file is selected
        if (avatarInput.files.length > 0) {
            const file = avatarInput.files[0];
            const reader = new FileReader();

            reader.onloadend = async () => {
                updatedData.avatarUrl = reader.result; // Base64 string
                try {
                    const response = await UserAPI.updateProfile(updatedData);
                    if (response.success) {
                        showNotification("Cập nhật thông tin thành công!", 'success');
                        // Optionally update local storage user info
                        const user = JSON.parse(localStorage.getItem("user"));
                        if (user) {
                            localStorage.setItem("user", JSON.stringify({ ...user, ...response.data }));
                        }
                    } else {
                        showNotification(`Cập nhật thất bại: ${response.error || 'Không xác định'}`, 'error');
                    }
                } catch (error) {
                    console.error("Lỗi cập nhật profile:", error);
                    showNotification("Không thể cập nhật thông tin. Vui lòng thử lại.", 'error');
                }
            };
            reader.readAsDataURL(file);
        } else {
            // If no new avatar is selected, send existing avatarUrl or empty string
            updatedData.avatarUrl = avatarPreview.querySelector('img') ? avatarPreview.querySelector('img').src : '';
            try {
                const response = await UserAPI.updateProfile(updatedData);
                if (response.success) {
                    showNotification("Cập nhật thông tin thành công!", 'success');
                    const user = JSON.parse(localStorage.getItem("user"));
                    if (user) {
                        localStorage.setItem("user", JSON.stringify({ ...user, ...response.data }));
                    }
                } else {
                    showNotification(`Cập nhật thất bại: ${response.error || 'Không xác định'}`, 'error');
                }
            } catch (error) {
                console.error("Lỗi cập nhật profile:", error);
                showNotification("Không thể cập nhật thông tin. Vui lòng thử lại.", 'error');
            }
        }
    });

    // Handle Change Password Form submission
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (newPassword !== confirmNewPassword) {
            showNotification("Mật khẩu mới và xác nhận mật khẩu mới không khớp.", 'error');
            return;
        }

        try {
            const response = await UserAPI.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword
            });
            if (response.success) {
                showNotification("Đổi mật khẩu thành công!", 'success');
                changePasswordForm.reset();
            } else {
                showNotification(`Đổi mật khẩu thất bại: ${response.error || 'Không xác định'}`, 'error');
            }
        } catch (error) {
            console.error("Lỗi đổi mật khẩu:", error);
            showNotification("Không thể đổi mật khẩu. Vui lòng thử lại.", 'error');
        }
    });

    // Initial load: show personal info section
    showSection('personal-info');

    // Add event listeners for sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            const section = e.target.dataset.section;
            showSection(section);
        });
    });

    // Avatar preview for file input
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            };
            reader.readAsDataURL(file);
        } else {
            avatarPreview.innerHTML = '<div class="default-avatar">NA</div>'; // Reset to default if no file
        }
    });
}); 