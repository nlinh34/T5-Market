const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsByProduct,
  getReviewedProductsByOrder
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createReview);
router.get("/:orderId/reviewed",protect, getReviewedProductsByOrder);
router.get("/:productId", protect, getReviewsByProduct);

module.exports = router;
