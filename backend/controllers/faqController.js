// backend/controllers/faqController.js
const FAQ = require("../models/FAQ");
const { httpStatusCodes } = require("../utils/constants");

// Tạo FAQ mới
exports.createFAQ = async (req, res) => {
  try {
    // Thêm user ID của admin vào FAQ
    req.body.created_by = req.user._id;

    const faq = await FAQ.create(req.body);

    res.status(httpStatusCodes.CREATED).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy tất cả FAQ
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .populate("created_by", "fullName email")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    res.status(httpStatusCodes.OK).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết một FAQ
exports.getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id).populate(
      "created_by",
      "fullName email"
    );

    if (!faq) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy câu hỏi",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("created_by", "fullName email");

    if (!faq) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy câu hỏi",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy câu hỏi",
      });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Câu hỏi đã được xóa",
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
