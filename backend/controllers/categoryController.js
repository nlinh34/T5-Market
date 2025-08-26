const Categories = require("../models/Categories");
const { httpStatusCodes } = require("../utils/constants");

exports.createCategory = async (req, res) => {
  try {
    const { name, imageURL } = req.body;

    const category = await Categories.create({ name, imageURL });

    res.status(httpStatusCodes.CREATED).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.find();

    res.status(httpStatusCodes.OK).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);

    if (!category) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, imageURL } = req.body;

    const category = await Categories.findByIdAndUpdate(
      req.params.id,
      { name, imageURL },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Categories.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(httpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(httpStatusCodes.OK).json({
      success: true,
      message: "Danh mục đã được xóa",
    });
  } catch (error) {
    res.status(httpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
