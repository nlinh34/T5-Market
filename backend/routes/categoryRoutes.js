// backend/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes
router.get("/get-all", getAllCategories);
router.get("/get/:id", getCategoryById);

// Admin only routes
router.use(protect);
router.use(authorize("admin"));

router.post("/create", createCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
