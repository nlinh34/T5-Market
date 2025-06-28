const express = require("express");
const router = express.Router();
const {
    createProduct,
    getPendingProducts,
    getApprovedProducts,
    getFeaturedProducts,
    getUserProducts,
    updateProduct,
    deleteProduct,
    updateStatus, //  Thêm controller mới
    updateFeaturedStatus,
} = require("../controllers/productController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// Người bán đăng sản phẩm
router.post("/", protect, authorize("user", "admin"), createProduct);

// Người bán cập nhật sản phẩm chưa được duyệt
router.put("/:id", protect, authorize("user"), updateProduct);

// Người bán xoá sản phẩm chưa được duyệt hoặc bị từ chối
router.delete("/:id", protect, authorize("user"), deleteProduct);

// User: lấy danh sách sản phẩm của mình
router.get("/my-products", protect, authorize("user"), getUserProducts);

// Admin: xem danh sách sản phẩm chờ duyệt
router.get("/pending", protect, authorize("admin"), getPendingProducts);

// Admin: cập nhật trạng thái duyệt sản phẩm (✔️ dùng cho approve hoặc từ chối)
router.patch("/:id/status", protect, authorize("admin"), updateStatus);

// Admin: cập nhật trạng thái nổi bật sản phẩm
router.patch("/:id/featured", protect, authorize("admin"), updateFeaturedStatus);

// Hiển thị sản phẩm đã được duyệt
router.get("/approved", getApprovedProducts);

// Hiển thị sản phẩm nổi bật
router.get("/featured", getFeaturedProducts);

module.exports = router;