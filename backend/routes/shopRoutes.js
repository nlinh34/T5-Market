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
    updateShopPolicies
} = require("../controllers/shopController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { Role } = require("../constants/roleEnum");

router.get("/get-pending-shops", protect, getPendingShops);
router.get("/get-approve-shops", protect, getApprovedShops);

router.get("/:shopId/details-with-products", getShopWithProducts);
router.get("/my-shop", protect, getMyShop);

router.post("/", protect, authorize(Role.CUSTOMER), requestUpgradeToSeller);
router.put("/approve-shop/:id", protect, authorize(Role.ADMIN), approveShop);
router.put("/profile", protect, updateShopProfile);
router.put("/policies", protect, updateShopPolicies);



module.exports = router;
