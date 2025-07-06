const Product = require("../models/Product");
const Shop = require("../models/Shop");
const { httpStatusCodes } = require("../utils/constants");

// Người bán đăng sản phẩm
const createProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, price, description, image_url, category } = req.body;

    // 👉 Tìm shop mà user là chủ hoặc nhân viên
    const shop = await Shop.findOne({
      status: "approved",
      $or: [
        { owner: userId },
        { staffs: userId },
      ],
    });

    if (!shop) {
      return res.status(httpStatusCodes.FORBIDDEN).json({
        error: "Bạn không có quyền đăng sản phẩm. Chỉ chủ shop hoặc nhân viên được phép.",
      });
    }

    // 👉 Tạo sản phẩm
    const product = new Product({
      name,
      price,
      description,
      image_url,
      category,
      shop: shop._id,
      seller: userId, // có thể là seller hoặc staff
      isApproved: false,
    });

    await product.save();

    return res.status(httpStatusCodes.CREATED).json({
      message: "Sản phẩm đã được tạo, chờ admin duyệt",
      data: product,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Lỗi khi tạo sản phẩm",
    });
  }
};


// Admin lấy danh sách sản phẩm chờ duyệt
const getPendingProducts = async(req, res) => {
    try {
        const products = await Product.find({ isApproved: false }).populate("seller", "fullName email");

        res.status(httpStatusCodes.OK).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};

// Lấy danh sách sản phẩm đã được duyệt (hiển thị trên web)
const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true })
      .populate("category", "name")
      .populate("shop", "name") // 
      .populate("seller", "fullName role") 
      .lean();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm" });
  }
};


// Lấy danh sách sản phẩm nổi bật
const getFeaturedProducts = async(req, res) => {
    try {
        const products = await Product.find({
            isApproved: true,
            isFeatured: true
        }).limit(6);

        res.status(httpStatusCodes.OK).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};


// Cập nhật sản phẩm
const updateProduct = async(req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy sản phẩm",
            });
        }

        // Kiểm tra quyền: chỉ người bán chính hoặc admin được sửa
        if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                success: false,
                message: "Bạn không có quyền sửa sản phẩm này",
            });
        }

        // Không cho phép sửa sản phẩm đã được duyệt
        if (product.isApproved) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Không thể sửa sản phẩm đã được duyệt",
            });
        }

        const allowedFields = ["name", "price", "description", "image_url", "category"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            data: product,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};

// Xoá sản phẩm
const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy sản phẩm",
            });
        }

        // Chỉ seller hoặc admin được xoá
        if (product.seller.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                success: false,
                message: "Bạn không có quyền xoá sản phẩm này",
            });
        }

        await product.deleteOne();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: "Xoá sản phẩm thành công",
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};

const updateStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        const product = await Product.findByIdAndUpdate(
            id, { isApproved, approvedAt: isApproved ? new Date() : null }, { new: true }
        );

        if (!product) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy sản phẩm",
            });
        }

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: `Đã ${isApproved ? "duyệt" : "từ chối duyệt"} sản phẩm`,
            data: product,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};

// Cập nhật trạng thái nổi bật
const updateFeaturedStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { isFeatured } = req.body;

        const product = await Product.findByIdAndUpdate(
            id, { isFeatured }, { new: true }
        );

        if (!product) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy sản phẩm",
            });
        }

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: `Đã ${isFeatured ? "đánh dấu" : "bỏ đánh dấu"} sản phẩm nổi bật`,
            data: product,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message,
        });
    }
};

const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const products = await Product.find({ shop: shopId })
      .populate("seller", "fullName email")
      .populate("category", "name");

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};



module.exports = {
    createProduct,
    getPendingProducts,
    getApprovedProducts,
    getFeaturedProducts,
    updateProduct,
    deleteProduct,
    updateStatus,
    updateFeaturedStatus,
    getProductsByShop
};