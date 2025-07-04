document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.settings-sidebar a');
    const personalInfoSection = document.getElementById('personal-info-section');
    const changePasswordSection = document.getElementById('change-password-section');

    const showSection = (sectionId) => {
        // Hide all sections
        personalInfoSection.classList.add('hidden');
        changePasswordSection.classList.add('hidden');

        // Show the requested section
        if (sectionId === 'personal-info') {
            personalInfoSection.classList.remove('hidden');
            // loadPersonalInfo(); // Chức năng này sẽ bị loại bỏ
        } else if (sectionId === 'change-password') {
            changePasswordSection.classList.remove('hidden');
        }
    };


    // Initial load: show personal info section
    showSection('personal-info');

    // Add event listeners for forms (these forms will now be static)
    document.getElementById('personalInfoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thông tin cá nhân đã được lưu (chức năng này hiện đang là tĩnh).');
    });
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Mật khẩu đã được thay đổi (chức năng này hiện đang là tĩnh).');
    });

    // Handle sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            const section = e.target.dataset.section;
            showSection(section);
        });
    });
}); 