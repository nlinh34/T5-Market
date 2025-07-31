// frontend/utils/notification.js
export function showNotification(message, type = "success") {
    let notificationContainer = document.getElementById("notification-container");

    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Force reflow to ensure transition works
    void notification.offsetWidth;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }, 3000);
}