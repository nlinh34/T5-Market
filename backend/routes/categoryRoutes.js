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

router.get("/get-all", getAllCategories);
router.get("/get/:id", getCategoryById);

router.use(protect);
router.use(authorize(0));

router.post("/create", createCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
