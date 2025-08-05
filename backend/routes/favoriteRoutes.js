// routes/favoriteRoutes.js
const express = require("express");
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require("../controllers/favoriteController");
const { protect } = require("../middlewares/authMiddleware");

// Toggle yêu thích
router.post("/add/:productId", protect, addToFavorites);
router.delete("/remove/:productId", protect, removeFromFavorites);

// Lấy danh sách yêu thích
router.get("/", protect, getFavorites);

module.exports = router;
