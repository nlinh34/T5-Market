// const express = require("express");
// const router = express.Router();
// const {
//   getCart,
//   addToCart,
//   addComboToCart,
//   updateCartItem,
//   removeFromCart,
//   addVoucherToCart,
//   clearCart,
// } = require("../controllers/cartController");
// const { authenticateUser } = require("../middlewares/authMiddleware");

// // Tất cả routes đều yêu cầu authentication
// router.use(authenticateUser);

// router.get("/", getCart);
// router.post("/add-product", addToCart);
// router.post("/add-combo", addComboToCart);
// router.put("/update-product-quantity", updateCartItem);
// router.delete("/remove-product/:id", removeFromCart);
// router.post("/add-voucher", addVoucherToCart);
// router.delete("/clear", clearCart);

// module.exports = router;


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