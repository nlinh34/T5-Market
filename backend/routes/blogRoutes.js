// backend/routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes - ai cũng có thể xem
router.get("/get-all-blogs", getAllBlogs);
router.get("/get-blog/:id", getBlog);

// Protected routes - chỉ admin mới có thể thêm/sửa/xóa
router.use(protect);
router.use(authorize("admin"));

router.post("/create", createBlog);
router.put("/update/:id", updateBlog);
router.delete("/delete/:id", deleteBlog);

module.exports = router;
