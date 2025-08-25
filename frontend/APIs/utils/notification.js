// frontend/utils/notification.js
export function showNotification(message, type = "success", icon = "") {
  const notificationContainer = getOrCreateNotificationContainer();

  const notification = document.createElement("div");
  notification.classList.add("notification", type);

  let iconHtml = "";
  if (icon) {
    iconHtml = `<i class="${icon}"></i>`;
  } else {
    // Default icons based on type
    switch (type) {
      case "success":
        iconHtml = '<i class="fas fa-check-circle"></i>';
        break;
      case "error":
        iconHtml = '<i class="fas fa-times-circle"></i>';
        break;
      case "warning":
        iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      case "info":
        iconHtml = '<i class="fas fa-info-circle"></i>';
        break;
      default:
        iconHtml = '<i class="fas fa-info-circle"></i>';
    }
  }

  notification.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;

  notificationContainer.appendChild(notification);

  // Force reflow to ensure animation plays
  void notification.offsetWidth;

  notification.classList.add("show");

  const closeButton = notification.querySelector(".close-btn");
  closeButton.addEventListener("click", () => {
    hideNotification(notification);
  });

  setTimeout(() => {
    hideNotification(notification);
  }, 5000);
}

function hideNotification(notification) {
  notification.classList.remove("show");
  notification.classList.add("hide");

  notification.addEventListener("transitionend", () => {
    notification.remove();
  }, { once: true });
}

function getOrCreateNotificationContainer() {
  let container = document.getElementById("notification-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
  }
  return container;
}