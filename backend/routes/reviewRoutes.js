const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsByProduct,
  getReviewedProductsByOrder
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createReview);
router.get("/:productId", getReviewsByProduct);
router.get("/:orderId/reviewed", getReviewedProductsByOrder);


module.exports = router;
