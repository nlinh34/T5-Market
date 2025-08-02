const Product = require("../models/Product");
const Shop = require("../models/Shop");
const { httpStatusCodes } = require("../utils/constants");
const { Role } = require("../constants/roleEnum");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, price, description, images, category, isAvailable } = req.body;

        if (!req.body.images || req.body.images.length === 0) {
            return res.status(400).json({ success: false, error: "Cần ít nhất 1 ảnh." });
        }
        if (req.body.images.length > 5) {
            return res.status(400).json({ success: false, error: "Chỉ được phép tải lên tối đa 5 ảnh." });
        }

        //Tìm shop mà user là chủ hoặc nhân viên (đã được duyệt)
        const shop = await Shop.findOne({
            status: "approved",
            $or: [
                { owner: userId },
                { staffs: userId },
            ],
        }).populate("owner");

        if (!shop) {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                error: "Bạn không có quyền đăng sản phẩm. Chỉ chủ shop hoặc nhân viên được phép.",
            });
        }

        // Xác định seller chính là chủ shop
        const product = new Product({
            name,
            price,
            description,
            images,
            category,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            shop: shop._id,
            seller: shop.owner._id,
            createdBy: userId,
            status: "pending",
        });


        await product.save();

        return res.status(httpStatusCodes.CREATED).json({
            success: true, // Thêm thuộc tính success: true
            message: "Sản phẩm đã được tạo, đang chờ duyệt",
            data: product,
        });
    } catch (error) {
        console.error("❌ Lỗi khi tạo sản phẩm:", error);
        return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Lỗi khi tạo sản phẩm",
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId.toString();

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }
        if (req.body.images && req.body.images.length > 5) {
            return res.status(400).json({ success: false, error: "Chỉ được phép lưu tối đa 5 ảnh." });
        }

        // Kiểm tra quyền: chỉ seller (chủ shop) hoặc người tạo mới được sửa
        if (
            product.seller._id.toString() !== userId &&
            product.createdBy._id.toString() !== userId
        ) {
            return res.status(403).json({ error: "Bạn không có quyền sửa sản phẩm này" });
        }

        const allowedFields = [
            "name",
            "price",
            "description",
            "images",
            "category",
            "isAvailable"
        ];

        for (let field of allowedFields) {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        }

        product.updatedAt = new Date();

        // Nếu sửa => trạng thái trở lại pending để duyệt lại
        product.status = "pending";
        await product.save();

        res.status(200).json({
            message: "Cập nhật sản phẩm thành công. Đang chờ duyệt lại.",
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi cập nhật sản phẩm" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId.toString();
        const userRole = req.user.role;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }

        // Check role
        const isSeller =
            (product.seller && product.seller.toString() === userId) ||
            (product.createdBy && product.createdBy.toString() === userId);

        const isAdmin = userRole === Role.ADMIN;

        if (!isAdmin && !isSeller) {
            return res.status(403).json({ error: "Bạn không có quyền xóa sản phẩm này" });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công.",
        });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ error: "Lỗi hệ thống khi xóa sản phẩm" });
    }
};

const approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (![Role.ADMIN, Role.MOD, Role.MANAGER].includes(userRole)) {
            return res.status(403).json({ error: "Không có quyền duyệt sản phẩm" });
        }

        const product = await Product.findById(id);
        if (!product || product.status !== "pending") {
            return res.status(400).json({ error: "Sản phẩm không tồn tại hoặc đã xử lý" });
        }

        product.status = "approved";
        product.approvedBy = req.user.userId;
        product.approvedAt = new Date();

        await product.save();
        res.json({ message: "✅ Đã duyệt sản phẩm" });
    } catch (err) {
        console.error("❌ Lỗi khi duyệt sản phẩm:", err);
        res.status(500).json({ error: "Lỗi duyệt sản phẩm" });
    }
};


const rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (![Role.ADMIN, Role.MOD, Role.MANAGER].includes(req.user.role)) {
            return res.status(403).json({ error: "Không có quyền từ chối sản phẩm" });
        }

        const product = await Product.findById(id);
        if (!product || product.status !== "pending") {
            return res.status(400).json({ error: "Sản phẩm không tồn tại hoặc đã xử lý" });
        }

        product.status = "rejected";
        product.rejectedBy = req.user.userId;
        product.rejectedAt = new Date();
        product.rejectionReason = reason || "Không rõ lý do";

        await product.save();
        res.json({ message: "❌ Đã từ chối sản phẩm" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi từ chối sản phẩm" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .limit(12)
            .populate("shop", "name logoUrl address status owner shopStatus createdAt")
            .populate("category", "name")
            .populate("createdBy", "name");

        if (products.length === 0) {
            return res.status(200).json({
                message: "Không có sản phẩm nào.",
                data: [],
            });
        }
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách tất cả sản phẩm thành công.",
            data: products,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy tất cả sản phẩm:", error);
        return res.status(500).json({ error: "Lỗi hệ thống." });
    }
};

const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: "pending" })
            .populate("createdBy", "fullName")
            .populate("category", "name")
            .populate("shop", "name logoUrl address status shopStatus createdAt");

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm chờ duyệt:", error);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm chờ duyệt" });
    }
};



const getApprovedProducts = async (req, res) => {
  const { cursor, limit = 15 } = req.query;
  const query = { status: "approved" };
  if (cursor) query._id = { $lt: cursor };

  const products = await Product.find(query)
    .select("name price images averageRating shop category")
    .populate("shop", "name logoUrl")
    .populate("category", "name")
    .sort({ _id: -1 })
    .limit(parseInt(limit))
    .lean();

  const total = await Product.estimatedDocumentCount({ status: "approved" }).catch(() => null);

  return res.json({
    success: true,
    data: products,
    pagination: {
      nextCursor: products.length ? products[products.length - 1]._id : null,
      total, limit: parseInt(limit)
    }
  });
};




const getRejectedProducts = async (req, res) => {
    try {
        const rejectedProducts = await Product.find({ status: "rejected" })
            .populate("shop", "name logoUrl address status owner shopStatus createdAt")
            .populate("seller", "name email") // hoặc createdBy nếu bạn muốn hiển thị người tạo bài
            .populate("category", "name");

        res.status(httpStatusCodes.OK).json({
            success: true,
            data: rejectedProducts,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm bị từ chối:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Lỗi khi lấy danh sách sản phẩm bị từ chối",
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔒 Kiểm tra ID có phải ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
        }

        const product = await Product.findById(id)
            .populate("createdBy", "fullName email")
            .populate("shop", "name logoUrl address status owner shopStatus createdAt")
            .populate("category", "name");

        if (!product) {
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
        console.log("DEBUG: Full error in getProductById:", error); // Add this line
        res.status(500).json({ error: `Lỗi server khi lấy chi tiết sản phẩm: ${error.message}` });
    }
};


const getAllProductsByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { keyword, sortBy, status } = req.query; // Thêm keyword và sortBy

        let query = { shop: shopId };
        if (status && status !== 'all') { // Lọc theo trạng thái nếu có
            query.status = status;
        }

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' }; // Tìm kiếm theo tên sản phẩm (không phân biệt chữ hoa, chữ thường)
        }

        let sortOptions = {};
        if (sortBy) {
            const [field, order] = sortBy.split('-');
            sortOptions[field] = order === 'asc' ? 1 : -1;
        } else {
            sortOptions = { createdAt: -1 }; // Mặc định sắp xếp mới nhất
        }

        const products = await Product.find(query)
            .populate("category", "name")
            .populate("createdBy", "name")
            .populate("shop", "name logoUrl address status owner shopStatus createdAt")
            .sort(sortOptions); // Áp dụng sắp xếp

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("❌ Lỗi khi lấy tất cả sản phẩm theo shopId:", error);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};


const getApprovedProductsByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        const products = await Product.find({
            shop: shopId,
            status: "approved",
        })
            .populate("category", "name")
            .populate("createdBy", "name")
            .populate("shop", "name logoUrl address status owner shopStatus createdAt");


        if (products.length === 0) {
            return res.status(200).json({
                message: "Chưa có sản phẩm nào được duyệt.",
                data: [],
            });
        }

        res.status(200).json({ message: "Danh sách sản phẩm đã được duyệt của SHOP:", success: true, data: products });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm đã duyệt:", error);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};


const getPendingProductsByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        const products = await Product.find({
            shop: shopId,
            status: "pending",
        })
            .populate("category", "name")
            .populate("createdBy", "name")
            .populate("shop", "name logoUrl address status owner shopStatus createdAt");

        if (products.length === 0) {
            return res.status(200).json({
                message: "Không có sản phẩm nào đang chờ duyệt.",
                data: [],
            });
        }
        res.status(200).json({ message: "Danh sách các sản phẩm đang chờ duyệt của SHOP:", success: true, data: products });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm chờ duyệt:", error);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};


const getRejectedProductsByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        const products = await Product.find({
            shop: shopId,
            status: "rejected",
        })
            .populate("category", "name")
            .populate("createdBy", "name")
            .populate("shop", "name logoUrl address status owner shopStatus createdAt")

        if (products.length === 0) {
            return res.status(200).json({
                message: "Không có sản phẩm nào bị từ chối.",
                data: [],
            });
        }
        res.status(200).json({ message: "Danh sách sản phẩm bị từ chối của SHOP:", success: true, data: products });
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm bị từ chối:", error);
        res.status(500).json({ error: "Lỗi hệ thống" });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    approveProduct,
    rejectProduct,
    getAllProducts,
    getApprovedProducts,
    getPendingProducts,
    getRejectedProducts,
    getProductById,
    getAllProductsByShopId,
    getApprovedProductsByShopId,
    getRejectedProductsByShopId,
    getPendingProductsByShopId
};