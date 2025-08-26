const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getProductPurchaseStats,
  getDeliveredOrderCountByShop,
  getOrdersByShop
} = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createOrder);
router.get("/get-order", protect, getUserOrders);
router.get("/shop/:shopId", protect, getOrdersByShop);
router.put("/cancel-order/:id", protect, cancelOrder);
router.get("/get-all-orders", protect, getAllOrders);
router.get("/purchase", getProductPurchaseStats);
router.put("/update-order-status/:orderId", protect, updateOrderStatus);
router.get("/shops/:shopId/delivered-orders", protect, getDeliveredOrderCountByShop);

module.exports = router;
