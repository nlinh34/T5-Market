const Shop = require("../models/Shop");
const Product = require("../models/Product");
const User = require("../models/User")
const { httpStatusCodes } = require("../utils/constants");

const approveShop = async (req, res) => {
  try {
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
    user.role = "seller";
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
    const { id } = req.params;

    const shop = await Shop.findById(id).populate("owner");
    if (!shop || shop.status !== "pending") {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Shop không tồn tại hoặc đã được xử lý.",
      });
    }

    shop.status = "rejected";
    shop.rejectedBy = req.user.userId;
    await shop.save();

    const user = await User.findById(shop.owner._id);
    user.status = "rejected"; // Hoặc vẫn để là "pending" tùy bạn
    await user.save();

    return res.status(httpStatusCodes.OK).json({
      success: true,
      message: "❌ Đã từ chối yêu cầu mở cửa hàng.",
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
    console.log("User in req:", req.user);
    const userId = req.user.userId;
    const { name, address, phone, description, logoUrl } = req.body;

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
      status: "pending",
    });

    await newShop.save();

    res.status(200).json({ message: "Yêu cầu mở shop đã được gửi, vui lòng chờ admin duyệt." });
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


const getShopWithProducts = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Lấy thông tin shop
    const shop = await Shop.findById(shopId)
      .populate("owner", "fullName email")
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



module.exports = {
    approveShop,
    requestUpgradeToSeller,
    getPendingShops,
    getShopWithProducts,
    rejectShop
}

