const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User")
const Order = require("../models/Order");
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

    const { id } = req.params; 
    const shop = await Shop.findById(id).populate("owner");

    if (!shop || shop.status !== "pending") {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        error: "Shop không tồn tại hoặc không cần duyệt",
      });
    }
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
    const { reason } = req.body; 

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

    const dbUser = await User.findById(userId);
    if (!dbUser || dbUser.status !== "approved") {
      return res.status(403).json({
        error: "Tài khoản chưa được duyệt để mở cửa hàng.",
      });
    }

    const { name, address, phone, description, logoUrl, policies } = req.body;

    const existingShop = await Shop.findOne({ owner: userId });
    if (existingShop) {
      if (existingShop.status === "rejected") {
        existingShop.name = name;
        existingShop.address = address;
        existingShop.phone = phone;
        existingShop.description = description;
        existingShop.logoUrl = logoUrl;
        existingShop.policies = policies;
        existingShop.status = "pending"; 
        existingShop.rejectionReason = null;
        existingShop.rejectedBy = null;
        await existingShop.save();
        return res.status(200).json({ success: true, message: "Yêu cầu mở shop đã được gửi lại, vui lòng chờ admin duyệt.", data: existingShop });
      } else if (existingShop.status === "approved" || existingShop.status === "pending") {
        return res.status(400).json({ error: "Bạn đã gửi yêu cầu hoặc đã có shop." });
      }
    }

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

    res.status(200).json({ success: true, message: "Yêu cầu mở shop đã được gửi, vui lòng chờ admin duyệt.", data: newShop });
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
    const shop = await Shop.findById(shopId)
      .populate("owner", "fullName email")
      .populate("approvedBy", "fullName")
      .lean();

    if (!shop) {
      return res.status(404).json({ success: false, message: "Không tìm thấy shop" });
    }
    const products = await Product.find({ shop: shopId, status: "approved" })
      .populate("category", "name")
      .populate("seller", "fullName")
      .lean();
    const soldCount = products.reduce((acc, product) => acc + (product.sold_count || 0), 0);

    const productIds = products.map(p => p._id);
    
    let averageRating = 0;
    let totalReviews = 0;

    if (productIds.length > 0) {
      const reviews = await Review.find({ product: { $in: productIds } });
      totalReviews = reviews.length;
      const sumRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = totalReviews > 0 ? sumRating / totalReviews : 0;
    }

    const shopWithStats = {
      ...shop,
      product_count: products.length,
      sold_count: soldCount,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: totalReviews,
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
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ error: "shopId không hợp lệ" });
    }

    const productIds = await Product.find({ shop: shopId }, "_id").then(
      (products) => products.map((p) => p._id)
    );

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
          reviewCriteria: {},
        },
      });
    }

    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("user", "fullName email avatarUrl")
      .populate("product", "name images price")
      .sort({ createdAt: -1 })
      .lean();

    let totalRating = 0;
    const reviewCriteria = {};
    reviews.forEach((review) => {
      totalRating += review.rating;
      if (review.criteria) {
        review.criteria.forEach((crit) => {
          if (!reviewCriteria[crit]) {
            reviewCriteria[crit] = 0;
          }
          reviewCriteria[crit]++;
        });
      }
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    res.status(200).json({
      success: true,
      data: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        reviews,
        reviewCriteria,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy đánh giá shop:", error);
    res.status(500).json({ error: "Không thể lấy đánh giá của shop" });
  }
};


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
            permissions: [] 
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

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin: họ tên, email và mật khẩu." });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng chọn một email khác." });
        }

        const shop = await Shop.findOne({ owner: ownerId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Không tìm thấy cửa hàng của bạn." });
        }

        const newStaffUser = new User({
            fullName,
            username: email,
            email,
            password: password,
            role: Role.STAFF, 
            status: 'pending', 
        });

        const savedUser = await newStaffUser.save();

        shop.staff.push({
            user: savedUser._id,
            permissions: [] 
        });
        
        await shop.save();

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

const getShopAnalytics = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { shopId } = req.params;
        const { period, startDate, endDate } = req.query; 

        const shop = await Shop.findOne({
            _id: shopId,
            $or: [
                { owner: userId },
                { "staff.user": userId }
            ]
        }).lean();

        if (!shop) {
            return res.status(403).json({ success: false, error: 'Bạn không có quyền xem báo cáo cho shop này' });
        }

        let start = new Date();
        let end = new Date();
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23,59,59,999);
        } else if (period) {
            const p = String(period);
            if (p === '7' || p === 'week') start.setDate(start.getDate() - 6);
            else if (p === '30' || p === 'month') start.setDate(start.getDate() - 29);
            else start.setDate(start.getDate() - 29);
        } else {
            start.setDate(start.getDate() - 29);
        }

        const orders = await Order.find({ shop: shopId, createdAt: { $gte: start, $lte: end }, status: { $in: ['confirmed','shipped','delivered'] } }).lean();

        const daily = {};
        const dayCount = Math.ceil((end - start) / (1000*60*60*24)) + 1;
        for (let i = 0; i < dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0,10);
            daily[key] = { revenue: 0, orders: 0 };
        }

        const productSales = {};

        orders.forEach(o => {
            const key = new Date(o.createdAt).toISOString().slice(0,10);
            if (!daily[key]) daily[key] = { revenue: 0, orders: 0 };
            daily[key].orders += 1;
            daily[key].revenue += o.totalAmount || 0;

            if (Array.isArray(o.products)) {
                o.products.forEach(p => {
                    const pid = p.productId ? p.productId.toString() : 'unknown';
                    productSales[pid] = productSales[pid] || { name: p.name, qty: 0, revenue: 0 };
                    productSales[pid].qty += p.quantity || 0;
                    productSales[pid].revenue += (p.price || 0) * (p.quantity || 0);
                });
            }
        });

        const dates = Object.keys(daily).sort();
        const dailyData = dates.map(d => ({ date: d, orders: daily[d].orders, revenue: daily[d].revenue }));

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        const topProducts = Object.entries(productSales)
            .map(([id, v]) => ({ productId: id, name: v.name, qty: v.qty, revenue: v.revenue }))
            .sort((a,b) => b.qty - a.qty);

        const revenueByProduct = topProducts.map(p => ({
            ...p,
            percentContribution: totalRevenue > 0 ? +( (p.revenue / totalRevenue) * 100 ).toFixed(2) : 0
        }));

        const top10 = revenueByProduct.slice(0, 10);

        return res.json({ success: true, data: { daily: dailyData, topProducts: top10, revenueByProduct, totalOrders, totalRevenue, period: { start: start.toISOString(), end: end.toISOString() } } });
    } catch (error) {
        console.error('Error in getShopAnalytics:', error);
        return res.status(500).json({ success: false, error: 'Lỗi khi lấy báo cáo shop' });
    }
};

const getFeaturedShops = async (req, res) => {
  try {
    const featuredShops = await Shop.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "shop",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "products._id",
          foreignField: "product",
          as: "all_reviews",
        },
      },
      {
        $project: {
          name: 1,
          logoUrl: 1,
          status: 1,
          totalReviews: { $size: "$all_reviews" },
          avgRating: { $avg: "$all_reviews.rating" },
        },
      },
      {
        $sort: { totalReviews: -1, avgRating: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.status(httpStatusCodes.OK).json({
      success: true,
      data: featuredShops,
    });
  } catch (error) {
    console.error("❌ Error in getFeaturedShops:", error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "Lỗi khi lấy danh sách cửa hàng nổi bật",
    });
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
    createStaffAccount,
    getShopRating,
    getShopAnalytics,
    getFeaturedShops
}
