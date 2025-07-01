require("dotenv").config();
const { httpStatusCodes } = require("../utils/constants");
const User = require("../models/User");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const jwt = require("jsonwebtoken");

const handleSignIn = async (req, res) => {
  try {
    const { email, phone, password, rememberMe } = req.body;

    if (!email && !phone) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ error: "Email hoặc số điện thoại là bắt buộc" });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ error: "Thông tin đăng nhập không hợp lệ" });
    }

    // Lấy thông tin giỏ hàng của user
    const cart = await Cart.findOne({ user_id: user._id });
    let cartItemCount = 0;

    if (cart) {
      // Lấy tất cả items trong giỏ hàng
      const cartItems = await CartItem.find({ cart_id: cart._id });
      // Tính tổng số lượng sản phẩm
      cartItemCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    }

    const tokenOptions = rememberMe ? { expiresIn: "7d" } : { expiresIn: "1h" };
    const userToken = jwt.sign(
      {
        userId: user._id,
        role: user.role, // Thêm role vào token
      },
      process.env.SECRET_KEY,
      tokenOptions
    );

    res.status(httpStatusCodes.OK).json({
      token: userToken,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cartCount: cartItemCount,
      },
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Lỗi trong quá trình đăng nhập:", error);
    res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Lỗi server" });
  }
};

const handleSignUp = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Họ tên, email, số điện thoại và mật khẩu là bắt buộc",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(httpStatusCodes.CONFLICT)
        .json({ error: "Email đã tồn tại" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(httpStatusCodes.CONFLICT)
        .json({ error: "Số điện thoại đã tồn tại" });
    }

    const newUser = new User({
      fullName,
      email,
      phone,
      password,
      role: "user", // Mặc định role là user
    });

    await newUser.save();

    const userToken = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role, // Thêm role vào token
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(httpStatusCodes.CREATED).json({
      token: userToken,
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.error("Lỗi trong quá trình đăng ký:", error);
    res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Lỗi server" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 0) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        success: false,
        error: "Không có quyền truy cập",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .select("fullName email phone role status accountStatus createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(httpStatusCodes.OK).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit), // 👈 CÁI NÀY ĐANG BỊ THIẾU
      totalUsers,
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Lỗi server khi lấy danh sách user",
    });
  }
};


// Thêm hàm để lấy thông tin user hiện tại
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.status(httpStatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Lỗi khi lấy thông tin người dùng",
    });
  }
};

module.exports = {
  handleSignIn,
  handleSignUp,
  getCurrentUser,
  getAllUsers,
};
