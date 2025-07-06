const Shop = require("../models/Shop");
const Product = require("../models/Product");
const User = require("../models/User")
const { httpStatusCodes } = require("../utils/constants");

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

    const user = await User.findById(shop.owner._id);
    user.status = "rejected"; // Tuỳ yêu cầu, có thể để là "pending"
    await user.save();

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
    const products = await Product.find({ shop: shopId, isApproved: true })
      .populate("category", "name")
      .populate("seller", "fullName")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        shop,
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
    const shop = await Shop.findOne({ owner: userId }).lean();

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

module.exports = {
    approveShop,
    requestUpgradeToSeller,
    getPendingShops,
    getShopWithProducts,
    rejectShop,
    getApprovedShops,
    getMyShop,
    updateShopProfile,
    updateShopPolicies
}

