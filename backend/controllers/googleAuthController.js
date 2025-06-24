const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { httpStatusCodes } = require("../utils/constants");
const crypto = require("crypto");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Credential is required",
      });
    }

    // Xác thực token từ Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Invalid Google token",
      });
    }

    // Kiểm tra xem user đã tồn tại chưa
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Tạo một random password cho Google users
      const randomPassword = crypto.randomBytes(16).toString("hex");

      // Tạo user mới nếu chưa tồn tại
      user = new User({
        fullName: payload.name,
        email: payload.email,
        password: randomPassword, // Sử dụng random password thay vì null
        isGoogleUser: true, // Thêm flag để đánh dấu đây là tài khoản Google
      });

      try {
        await user.save();
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
          error: "Error creating new user",
          details: saveError.message,
        });
      }
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.status(httpStatusCodes.OK).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
      },
      message: "Google sign-in successful",
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

const updatePhone = async (req, res) => {
  try {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "User ID và số điện thoại là bắt buộc",
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Số điện thoại đã được sử dụng",
      });
    }

    // Cập nhật số điện thoại cho user
    const user = await User.findByIdAndUpdate(userId, { phone }, { new: true });

    if (!user) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        error: "Không tìm thấy người dùng",
      });
    }

    // Tạo token mới
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(httpStatusCodes.OK).json({
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      message: "Cập nhật số điện thoại thành công",
    });
  } catch (error) {
    console.error("Update phone error:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { handleGoogleSignIn, updatePhone };
