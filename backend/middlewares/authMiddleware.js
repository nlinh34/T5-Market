const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { httpStatusCodes } = require("../utils/constants");

// Middleware kiểm tra đăng nhập
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ error: "Vui lòng đăng nhập để tiếp tục" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ error: "Người dùng không tồn tại" });
    }

    req.user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: decoded.role, // ✅ Gán role từ token
    };

    next();
  } catch (error) {
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Lỗi server" });
  }
};


const authenticateUser = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json({
        error: "Không tìm thấy token xác thực",
      });
    }

    // Lấy token và verify
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Gán thông tin user vào request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json({
      error: "Token không hợp lệ hoặc đã hết hạn",
      details: error.message,
    });
  }
};

// Middleware kiểm tra quyền
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        error: "Bạn không có quyền thực hiện hành động này",
      });
    }
    next();
  };
};

module.exports = { protect, authorize, authenticateUser };
