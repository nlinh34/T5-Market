export const formatCurrency = (amount) => {
  try {
    // Format the number part without currency symbol
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formattedAmount} VND`;
  } catch (error) {
    console.error("Format currency error:", error);
    return `${amount.toLocaleString("vi-VN")} VND`; // Fallback format with VND
  }
};

export const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (error) {
    return dateString;
  }
};

export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + " năm ";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + " tháng ";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + " ngày ";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + " giờ ";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + " phút ";
  }
  return "Vừa xong";
};
