const express = require("express");
const router = express.Router();
const {
    requestUpgradeToSeller,
    approveShop,
    getPendingShops,
    getShopWithProducts,
    getApprovedShops,
    getMyShop,
    updateShopProfile,
    updateShopPolicies,
    rejectShop,
    getShopRating,
    getShopStaff,
    addStaff,
    removeStaff,
    updateStaffPermissions,
    createStaffAccount,
    getShopAnalytics
} = require("../controllers/shopController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { Role } = require("../constants/roleEnum");

router.get("/my-shop", protect, getMyShop);
router.post("/", protect, authorize(Role.CUSTOMER), requestUpgradeToSeller);
router.put("/profile", protect, updateShopProfile);
router.put("/policies", protect, updateShopPolicies);
router.get("/get-pending-shops", protect, getPendingShops);
router.get("/get-approved-shops", protect, getApprovedShops);
router.put("/approve-shop/:id", protect, authorize(Role.ADMIN), approveShop);
router.put("/reject-shop/:id", protect, authorize(Role.ADMIN), rejectShop);
router.get("/:shopId/details-with-products", getShopWithProducts);
router.get("/:shopId/reviews", getShopRating);
router.get('/my-shop/:shopId/analytics', protect, getShopAnalytics);

// Staff management routes
router.route("/my-shop/staff")
  .get(protect, getShopStaff)
  .post(protect, addStaff);

router.route("/my-shop/staff/:staffId")
  .delete(protect, removeStaff);

router.route("/my-shop/staff/:staffId/permissions")
  .put(protect, updateStaffPermissions);

router.post('/my-shop/staff/create', protect, createStaffAccount);

module.exports = router;