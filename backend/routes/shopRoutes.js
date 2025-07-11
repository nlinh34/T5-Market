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
    getShopRating
} = require("../controllers/shopController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { Role } = require("../constants/roleEnum");

router.get("/my-shop", protect, getMyShop);
router.put("/profile", protect, updateShopProfile);
router.put("/policies", protect, updateShopPolicies);
router.get("/get-pending-shops", protect, getPendingShops);
router.get("/get-approved-shops", protect, getApprovedShops);
router.post("/", protect, authorize(Role.CUSTOMER), requestUpgradeToSeller);

router.get("/:shopId/details-with-products", getShopWithProducts);
router.get("/:shopId/reviews", protect, getShopRating);
router.put("/approve-shop/:id", protect, authorize(Role.ADMIN), approveShop);
router.put("/reject-shop/:id", protect, authorize(Role.ADMIN), rejectShop);
module.exports = router;