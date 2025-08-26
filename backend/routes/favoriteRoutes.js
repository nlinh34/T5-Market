const express = require("express");
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require("../controllers/favoriteController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/add/:productId", protect, addToFavorites);
router.delete("/remove/:productId", protect, removeFromFavorites);

router.get("/", protect, getFavorites);

module.exports = router;
