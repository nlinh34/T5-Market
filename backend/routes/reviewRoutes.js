const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsByProduct
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");
const { canEditReview } = require("../middlewares/reviewAuth.js");

router.post("/", protect, createReview);
router.get("/:productId", getReviewsByProduct);


module.exports = router;
