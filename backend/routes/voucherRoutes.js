// backend/routes/voucherRoutes.js
const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getAllVouchers,
  getVoucher,
  updateVoucher,
  deleteVoucher,
} = require("../controllers/voucherController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes - ai cũng có thể xem
router.get("/get-all-vouchers", getAllVouchers);
router.get("/get-voucher/:id", getVoucher);

// Protected routes - chỉ admin mới có thể thêm/sửa/xóa
router.use(protect);
router.use(authorize("admin"));

router.post("/create", createVoucher);
router.put("/update/:id", updateVoucher);
router.delete("/delete/:id", deleteVoucher);

module.exports = router;
