const express = require("express");
const router = express.Router();
const {
    requestUpgradeToSeller,
    approveShop,
    getPendingShops,
    getShopWithProducts
} = require("../controllers/shopController");
const { protect, authorize } = require("../middlewares/authMiddleware");

router.get("/get-pending-shops", protect, getPendingShops);
router.get("/:shopId/details-with-products", getShopWithProducts);

router.post("/", protect, requestUpgradeToSeller);
router.put("/approve-shop/:id", protect, approveShop);


module.exports = router;
