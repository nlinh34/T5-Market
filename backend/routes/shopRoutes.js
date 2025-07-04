const express = require("express");
const router = express.Router();
const {
    requestUpgradeToSeller,
    approveShop,
    getPendingShops,
    getShopWithProducts
} = require("../controllers/shopController");

router.get("/get-pending-shops", protect, getPendingShops);
router.get("/:shopId/details-with-products", getShopWithProducts);

router.post("/request-upgrade-seller", protect, requestUpgradeToSeller);
router.put("/approve-shop/:id", protect, isAdmin, approveShop);


