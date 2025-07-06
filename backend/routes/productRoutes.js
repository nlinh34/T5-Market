const express = require("express");
const router = express.Router();
const {
    createProduct,
    getPendingProducts,
    getApprovedProducts,
    getProductById,
    approveProduct,
    rejectProduct,
    getRejectedProducts,
    getAllProductsByShopId,
    getApprovedProductsByShopId,
    getPendingProductsByShopId,
    getRejectedProductsByShopId,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const { protect, authorize } = require("../middlewares/authMiddleware");
const { Role } = require("../constants/roleEnum")

// Người bán đăng sản phẩm
router.post("/", protect, authorize(Role.SELLER, Role.STAFF), createProduct);

// Lấy sản phẩm theo trạng thái
router.get("/get-all-products", getAllProducts);
router.get("/get-pending-products", getPendingProducts);
router.get("/get-approved-products", getApprovedProducts);
router.get("/get-rejected-products", getRejectedProducts);

// Duyệt hoặc từ chối sản phẩm
router.put("/approve-product/:id", protect, authorize(Role.ADMIN, Role.MOD, Role.MANAGER), approveProduct);
router.put("/reject-product/:id", protect, authorize(Role.ADMIN, Role.MOD, Role.MANAGER), rejectProduct);

// Lấy chi tiết sản phẩm
router.get("/:id", getProductById);
router.patch("/:id", protect, authorize(Role.SELLER, Role.STAFF), updateProduct);
router.delete("/:id", protect, authorize(Role.SELLER, Role.STAFF, Role.ADMIN), deleteProduct);

// Lấy tất cả sản phẩm theo shopId
router.get("/by-shop/:shopId", getAllProductsByShopId);
router.get("/by-shop/:shopId/approved", getApprovedProductsByShopId);
router.get("/by-shop/:shopId/pending", getPendingProductsByShopId);
router.get("/by-shop/:shopId/rejected", getRejectedProductsByShopId);


module.exports = router;