// backend/routes/faqRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFAQ,
  getAllFAQs,
  getFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/faqController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Public routes - ai cũng có thể xem
router.get("/get-all-faqs", getAllFAQs);
router.get("/get-faq/:id", getFAQ);

// Protected routes - chỉ admin mới có thể thêm/sửa/xóa
router.use(protect);
router.use(authorize("admin"));

router.post("/create", createFAQ);
router.put("/update/:id", updateFAQ);
router.delete("/delete/:id", deleteFAQ);

module.exports = router;
