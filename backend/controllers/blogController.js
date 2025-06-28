// backend/controllers/blogController.js
const Blog = require("../models/Blog");
const { httpStatusCodes } = require("../utils/constants");

// Tạo blog mới
exports.createBlog = async (req, res) => {
  try {
    // Thêm user ID của admin vào blog
    req.body.createdBy = req.user._id;

    const blog = await Blog.create(req.body);

    res.status(httpStatusCodes.CREATED).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy tất cả blog
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    res.status(httpStatusCodes.OK).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết một blog
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "createdBy",
      "fullName email"
    );

    if (!blog) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật blog
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "fullName email");

    if (!blog) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy blog",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Blog đã được xóa",
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
