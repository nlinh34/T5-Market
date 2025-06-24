export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error("Format currency error:", error);
    return `${amount.toLocaleString("vi-VN")}đ`; // Fallback format
  }
};

export const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (error) {
    return dateString;
  }
};
