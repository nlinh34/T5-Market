const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.createReview = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Bạn chưa đăng nhập" });
    }
    const userId = req.user.userId;
    const { productId, orderId, rating, comment } = req.body;
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ error: "Thiếu thông tin đánh giá." });
    }
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      status: "delivered",
      "products.productId": productId,
    });

    if (!order) {
      return res.status(403).json({ error: "Bạn không có quyền đánh giá sản phẩm này." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Số sao không hợp lệ (1-5)" });
    }

    const existing = await Review.findOne({ user: userId, product: productId, order: orderId });
    if (existing) {
      return res.status(409).json({ error: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    const review = new Review({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      comment: comment?.trim() || "",
    });

    await review.save();
    await updateProductRating(productId);

    res.status(201).json({ success: true, message: "Đánh giá thành công", data: review });
  } catch (error) {
    console.error("Create Review Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Trùng review (duplicate key)", detail: error.keyValue });
    }
    res.status(500).json({ error: "Lỗi server khi tạo đánh giá", detail: error.message });
  }
};


exports.getReviewedProductsByOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const reviews = await Review.find({ user: userId, order: orderId })
      .select("product rating comment");

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get reviewed products error:", error);
    res.status(500).json({ error: "Lỗi server khi lấy trạng thái đánh giá" });
  }
};


exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ error: "Thiếu productId" });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "fullName avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Lỗi server khi lấy đánh giá" });
  }
};

async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
}


