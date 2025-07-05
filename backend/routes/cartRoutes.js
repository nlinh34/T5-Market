const express = require("express");
const router = express.Router();
const {
  getCurrentCart,
  addToCart,
  updateCartItem,
  deleteCartItem
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/get-current", protect, getCurrentCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem); 
router.delete("/delete/:id", protect, deleteCartItem);

module.exports = router;