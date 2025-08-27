const User = require("../models/User");

exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (user.status === "pending") {
      return res.status(403).json({ message: "Tài khoản chưa được duyệt, không thể thêm sản phẩm vào yêu thích" });
    }
    if (user.favorites.includes(productId)) {
      return res.status(400).json({ message: "Sản phẩm đã nằm trong danh sách yêu thích" });
    }

    user.favorites.push(productId);
    await user.save();

    return res.status(200).json({ message: "Đã thêm vào yêu thích", favorites: user.favorites });
  } catch (err) {
    console.error("Lỗi addToFavorites:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (user.status === "pending") {
      return res.status(403).json({ message: "Tài khoản chưa được duyệt, không thể xoá sản phẩm khỏi yêu thích" });
    }
    const index = user.favorites.indexOf(productId);
    if (index === -1) {
      return res.status(400).json({ message: "Sản phẩm không nằm trong danh sách yêu thích" });
    }

    user.favorites.splice(index, 1);
    await user.save();

    return res.status(200).json({ message: "Đã bỏ khỏi yêu thích", favorites: user.favorites });
  } catch (err) {
    console.error("Lỗi removeFromFavorites:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate({
        path: "favorites",
        populate: {
          path: "shop",
          select: "name",
        },
      });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    return res.status(200).json(user.favorites);
  } catch (err) {
    console.error("Lỗi getFavorites:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
