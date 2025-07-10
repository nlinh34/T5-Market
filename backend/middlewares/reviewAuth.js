const Review = require("../models/Review");

// Middleware: chỉ cho sửa nếu là chủ đánh giá và trong 24h
exports.canEditReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Đánh giá không tồn tại" });
    }

    // Kiểm tra người dùng hiện tại có phải là người tạo đánh giá không
    if (String(review.user) !== String(req.user.userId)) {
      return res.status(403).json({ error: "Bạn không có quyền sửa hoặc xóa đánh giá này" });
    }

    // Kiểm tra thời gian: chỉ được sửa trong 24 giờ
    const timeDiffMs = Date.now() - new Date(review.createdAt).getTime();
    const hoursPassed = timeDiffMs / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      return res.status(403).json({ error: "Chỉ được chỉnh sửa trong vòng 24 giờ kể từ khi đánh giá" });
    }

    req.review = review;
    next();
  } catch (error) {
    console.error("Middleware canEditReview error:", error);
    res.status(500).json({ error: "Có lỗi khi kiểm tra quyền sửa đánh giá" });
  }
};
