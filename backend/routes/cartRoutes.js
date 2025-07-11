const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateQuantity, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.patch("/update", protect, updateQuantity);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;
