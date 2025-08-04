// backend/controllers/voucherController.js
const Voucher = require("../models/Voucher");
const { httpStatusCodes } = require("../utils/constants");

// Tạo voucher mới
exports.createVoucher = async (req, res) => {
  try {
    req.body.created_by = req.user.userId;

    const voucher = await Voucher.create(req.body);

    res.status(httpStatusCodes.CREATED).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .populate("created_by", "fullName email")
      .sort({ createdAt: -1 });

    res.status(httpStatusCodes.OK).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết một voucher
exports.getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "created_by",
      "fullName email"
    );

    if (!voucher) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("created_by", "fullName email");

    if (!voucher) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    await Voucher.findByIdAndDelete(req.params.id);

    res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Voucher đã được xóa",
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
