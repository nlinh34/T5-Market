const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User")
const bcrypt = require("bcryptjs");
const { httpStatusCodes } = require("../utils/constants");
const mongoose = require("mongoose")

const { Role } = require("../constants/roleEnum");

const approveShop = async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) {
      return res.status(403).json({
        error: "Chỉ quản trị viên mới có quyền duyệt cửa hàng.",
      });
    }

    const { id } = req.params; // id của 
    const shop = await Shop.findById(id).populate("owner");

    if (!shop || shop.status !== "pending") {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Shop không tồn tại hoặc không cần duyệt",
      });
    }

    // Cập nhật shop và role người dùng
    shop.status = "approved";
    shop.approvedBy = req.user.userId;
    await shop.save();

    const user = await User.findById(shop.owner._id);
    user.role = Role.SELLER;
    user.status = "approved";
    user.approvedBy = req.user.userId;
    await user.save();

    return res.status(httpStatusCodes.OK).json({ message: "Đã duyệt cửa hàng và nâng cấp user thành seller" });
  } catch (error) {
    console.error("❌ Error in approveShop:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Lỗi khi duyệt shop",
    });
  }
};

const rejectShop = async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) {
      return res.status(403).json({
        error: "Chỉ quản trị viên mới có quyền duyệt cửa hàng.",
      });
    }

    const { id } = req.params;
    const { reason } = req.body; // 👈 Nhận lý do từ client

    const shop = await Shop.findById(id).populate("owner");
    if (!shop || shop.status !== "pending") {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Shop không tồn tại hoặc đã được xử lý.",
      });
    }

    shop.status = "rejected";
    shop.rejectionReason = reason || "Không rõ lý do";
    shop.rejectedBy = req.user.userId;
    await shop.save();

    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "❌ Đã từ chối yêu cầu mở cửa hàng.",
      rejectionReason: shop.rejectionReason,
    });
  } catch (error) {
    console.error("❌ Error in rejectShop:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Lỗi hệ thống khi từ chối cửa hàng.",
    });
  }
};


const requestUpgradeToSeller = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (req.user.role !== Role.CUSTOMER) {
      return res.status(403).json({
        error: "Chỉ tài khoản khách hàng mới được yêu cầu mở cửa hàng.",
      });
    }

    // Lấy thông tin người dùng từ DB để kiểm tra status
    const dbUser = await User.findById(userId);
    if (!dbUser || dbUser.status !== "approved") {
      return res.status(403).json({
        error: "Tài khoản chưa được duyệt để mở cửa hàng.",
      });
    }

    const { name, address, phone, description, logoUrl, policies } = req.body;

    // Kiểm tra đã có shop chưa
    const existingShop = await Shop.findOne({ owner: userId });
    if (existingShop) {
      return res.status(400).json({ error: "Bạn đã gửi yêu cầu hoặc đã có shop." });
    }

    // Tạo shop mới
    const newShop = new Shop({
      owner: userId,
      name,
      address,
      phone,
      description,
      logoUrl,
      policies,
      status: "pending",
    });

    await newShop.save();

    res.status(200).json({ success: true, message: "Yêu cầu mở shop đã được gửi, vui lòng chờ admin duyệt." });
  } catch (error) {
    console.error("Error in requestUpgradeToSeller:", error);
    res.status(500).json({ error: "Lỗi khi gửi yêu cầu nâng cấp seller" });
  }
};


const getPendingShops = async (req, res) => {
  try {
    const shops = await Shop.find({ status: "pending" }).populate("owner", "fullName email");
    res.status(httpStatusCodes.OK).json({ data: shops });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách shop chờ duyệt:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Lỗi khi lấy danh sách shop",
    });
  }
};

const getApprovedShops = async (req, res) => {
  try {
    const approvedShops = await Shop.find({ status: "approved" })
      .populate("owner", "fullName email")
      .populate("approvedBy", "fullName email")
      .lean();

    res.status(200).json({
      success: true,
      data: approvedShops,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách shop đã duyệt:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy danh sách shop đã được duyệt",
    });
  }
};



const getShopWithProducts = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Lấy thông tin shop
    const shop = await Shop.findById(shopId)
      .populate("owner", "fullName email")
      .populate("approvedBy", "fullName")
      .lean();

    if (!shop) {
      return res.status(404).json({ success: false, message: "Không tìm thấy shop" });
    }

    // Lấy sản phẩm của shop (chỉ lấy sản phẩm đã duyệt)
    const products = await Product.find({ shop: shopId, status: "approved" })
      .populate("category", "name")
      .populate("seller", "fullName")
      .lean();

    // Tính toán các chỉ số
    const soldCount = products.reduce((acc, product) => acc + (product.sold_count || 0), 0);
    
    const shopWithStats = {
      ...shop,
      product_count: products.length,
      sold_count: soldCount,
    };

    res.status(200).json({
      success: true,
      data: {
        shop: shopWithStats,
        products,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyShop = async (req, res) => {
  try {
    const userId = req.user.userId;
    const shop = await Shop.findOne({
      $or: [
        { owner: userId },
        { "staff.user": userId }
      ]
    }).lean();

    if (!shop) {
      return res.status(httpStatusCodes.NOT_FOUND).json({ success: false, message: "Không tìm thấy shop cho người dùng này." });
    }

    res.status(httpStatusCodes.OK).json({ success: true, data: shop });
  } catch (error) {
    console.error("Error in getMyShop:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Lỗi khi lấy thông tin shop." });
  }
};

const updateShopProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, address, phone, description, logoUrl } = req.body;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(httpStatusCodes.NOT_FOUND).json({ success: false, message: "Shop không tìm thấy." });
    }

    if (name) shop.name = name;
    if (address) shop.address = address;
    if (phone) shop.phone = phone;
    if (description) shop.description = description;
    if (logoUrl) shop.logoUrl = logoUrl;

    await shop.save();

    res.status(httpStatusCodes.OK).json({ success: true, message: "Cập nhật thông tin shop thành công.", data: shop });
  } catch (error) {
    console.error("Error in updateShopProfile:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Lỗi khi cập nhật thông tin shop." });
  }
};

const updateShopPolicies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { policies } = req.body;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(httpStatusCodes.NOT_FOUND).json({ success: false, message: "Shop không tìm thấy." });
    }

    // Validate policies structure if necessary (e.g., each policy has type and value)
    if (!Array.isArray(policies)) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({ success: false, message: "Chính sách phải là một mảng." });
    }

    shop.policies = policies;
    await shop.save();

    res.status(httpStatusCodes.OK).json({ success: true, message: "Cập nhật chính sách shop thành công.", data: shop });
  } catch (error) {
    console.error("Error in updateShopPolicies:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Lỗi khi cập nhật chính sách shop." });
  }
};

const getShopRating = async (req, res) => {
  try {
    const { shopId } = req.params;
    console.log("shopId received:", shopId);
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ error: "shopId không hợp lệ" });
    }
// ================= STAFF MANAGEMENT =================

// [GET] /api/shops/my-shop/staff
const getShopStaff = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const shop = await Shop.findOne({ owner: ownerId }).populate('staff.user', 'fullName email avatar');

    if (!shop) {
      return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng." });
    }

    res.status(200).json({
      success: true,
      data: shop.staff,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên:", error);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
};

// [POST] /api/shops/my-shop/staff
const addStaff = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { emailOrUsername } = req.body;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng của bạn." });
        }

        const userToAdd = await User.findOne({ 
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }] 
        });

        if (!userToAdd) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng với email/username này." });
        }

        if (userToAdd._id.equals(ownerId)) {
            return res.status(400).json({ success: false, message: "Bạn không thể tự thêm mình làm nhân viên." });
        }
        
        const isAlreadyStaff = shop.staff.some(staffMember => staffMember.user.equals(userToAdd._id));
        if (isAlreadyStaff) {
            return res.status(400).json({ success: false, message: "Người dùng này đã là nhân viên." });
        }

        shop.staff.push({
            user: userToAdd._id,
            permissions: [] // Mặc định không có quyền
        });
        
        await shop.save();

        const newStaffMember = shop.staff[shop.staff.length - 1];
        await shop.populate('staff.user', 'fullName email avatar');
        
        res.status(201).json({
            success: true,
            message: "Thêm nhân viên thành công.",
            data: shop.staff.find(s => s._id.equals(newStaffMember._id)),
        });
    } catch (error) {
        console.error("Lỗi thêm nhân viên:", error);
        res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
};

// [DELETE] /api/shops/my-shop/staff/:staffId
const removeStaff = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { staffId } = req.params;

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng." });
        }

        const staffIndex = shop.staff.findIndex(staffMember => staffMember._id.toString() === staffId);

        if (staffIndex === -1) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên trong cửa hàng." });
        }

        shop.staff.splice(staffIndex, 1);
        await shop.save();
        
        res.status(200).json({
            success: true,
            message: "Xóa nhân viên thành công.",
        });
    } catch (error) {
        console.error("Lỗi xóa nhân viên:", error);
        res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
};

// [PUT] /api/shops/my-shop/staff/:staffId/permissions
const updateStaffPermissions = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { staffId } = req.params;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ success: false, message: "Permissions phải là một mảng." });
        }

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng." });
        }
        
        const staffMember = shop.staff.id(staffId);
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên." });
        }

        staffMember.permissions = permissions;
        await shop.save();
        
        res.status(200).json({
            success: true,
            message: "Cập nhật quyền cho nhân viên thành công.",
            data: staffMember,
        });
    } catch (error) {
        console.error("Lỗi cập nhật quyền:", error);
        res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
};

const createStaffAccount = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const { fullName, email, password } = req.body;

        // Basic validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin: họ tên, email và mật khẩu." });
        }
        
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng chọn một email khác." });
        }

        // Find the owner's shop
        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng của bạn." });
        }

        // Create new user for staff - The pre-save hook in User.js will hash the password
        const newStaffUser = new User({
            fullName,
            username: email, // Use email as username for consistency
            email,
            password: password, // Pass the plain password
            role: Role.STAFF, // Staff should have the STAFF role, not CUSTOMER
            status: 'pending', // Staff account must be approved by admin
        });

        const savedUser = await newStaffUser.save();

        // Add new user to the shop's staff list
        shop.staff.push({
            user: savedUser._id,
            permissions: [] // Default with no permissions
        });
        
        await shop.save();

        // Populate user details for the response
        await shop.populate('staff.user', 'fullName email avatar');
        const newStaffMember = shop.staff.find(s => s.user._id.equals(savedUser._id));
        
        res.status(201).json({
            success: true,
            message: "Tạo và thêm tài khoản nhân viên thành công.",
            data: newStaffMember,
        });
    } catch (error) {
        console.error("Lỗi tạo tài khoản nhân viên:", error);
        res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
};

module.exports = {
    approveShop,
    requestUpgradeToSeller,
    getPendingShops,
    getShopWithProducts,
    rejectShop,
    getApprovedShops,
    getMyShop,
    updateShopProfile,
    updateShopPolicies,
    getShopStaff,
    addStaff,
    removeStaff,
    updateStaffPermissions,
    createStaffAccount
}

    const productIds = await Product.find({ shop: shopId }, "_id").then(products =>
      products.map(p => p._id)
    );

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
        },
      });
    }

    const stats = await Review.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("user", "fullName email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    const result = stats[0] || { averageRating: 0, totalReviews: 0 };

    res.status(200).json({
      success: true,
      data: {
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        reviews,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy đánh giá shop:", error);
    res.status(500).json({ error: "Không thể lấy đánh giá của shop" });
  }
};

module.exports = {


  approveShop,
  requestUpgradeToSeller,
  getPendingShops,
  getShopWithProducts,
  rejectShop,
  getApprovedShops,
  getMyShop,
  updateShopProfile,
  updateShopPolicies,
  getShopRating
}