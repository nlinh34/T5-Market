// frontend/utils/notification.js
export function showNotification(message, type = "success", icon = "") {
  const notificationContainer = getOrCreateNotificationContainer();

  const notification = document.createElement("div");
  notification.classList.add("notification", `notification-${type}`);

  let iconHtml = "";
  if (icon) {
    iconHtml = `<i class="${icon} notification-icon"></i>`;
  }

  notification.innerHTML = `
    ${iconHtml}
    <span class="notification-message">${message}</span>
    <button class="notification-close">&times;</button>
  `;

  notificationContainer.appendChild(notification);

  // Force reflow to ensure animation plays
  void notification.offsetWidth;

  notification.classList.add("show");

  const closeButton = notification.querySelector(".notification-close");
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