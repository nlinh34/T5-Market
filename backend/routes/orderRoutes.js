// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/create", protect, createOrder);
router.get("/get-order", protect, getUserOrders);
router.put("/cancel-order/:id", protect, cancelOrder);
router.get("/get-all-orders", protect, getAllOrders);
router.put("/update-order-status/:orderId", protect, updateOrderStatus);

module.exports = router;
