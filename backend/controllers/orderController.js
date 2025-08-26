// backend/controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Shop = require("../models/Shop")

const { Role } = require("../constants/roleEnum")

async function generateUniqueOrderCode() {
  let code;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 5) {
    code = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const existingOrder = await Order.findOne({ orderCode: code });
    exists = !!existingOrder;
    attempts++;
  }

  if (exists) {
    throw new Error("Không thể tạo mã đơn hàng duy nhất sau nhiều lần thử.");
  }

  return code;
}

//Tạo đơn hàng
// backend/controllers/orderController.js

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Lấy shop mà user này sở hữu (nếu có)
    const ownShop = await Shop.findOne({ owner: userId }).select("_id");

    const { products, shippingInfo, paymentMethod } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: "Danh sách sản phẩm không hợp lệ." });
    }

    if (!shippingInfo?.fullName || !shippingInfo?.address || !shippingInfo?.phone) {
      return res.status(400).json({ success: false, error: "Thông tin giao hàng không đầy đủ." });
    }

    const productIds = products.map(p => p.productId);
    const productDocs = await Product.find({ _id: { $in: productIds } })
      .select("_id name price images shop");

    const ordersByShop = {};

    for (const item of products) {
      const prod = productDocs.find(p => p._id.equals(item.productId));
      if (!prod) throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
      if (!prod.shop) throw new Error(`Sản phẩm ${prod._id} không có thông tin shop.`);

      // 🚫 Chặn mua sản phẩm từ shop của chính mình
      if (ownShop && prod.shop.equals(ownShop._id)) {
        return res.status(400).json({
          success: false,
          error: `Bạn không thể mua sản phẩm từ shop của chính mình (${prod.name}).`
        });
      }

      const shopId = prod.shop.toString();
      if (!ordersByShop[shopId]) ordersByShop[shopId] = [];

      ordersByShop[shopId].push({
        productId: prod._id,
        name: prod.name,
        quantity: item.quantity,
        price: prod.price,
        image: prod.images?.[0] || ""
      });
    }

    const createdOrders = [];

    for (const [shopId, shopProducts] of Object.entries(ordersByShop)) {
      const totalAmount = shopProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderCode = await generateUniqueOrderCode();

      const newOrder = await Order.create({
        user: userId,
        shop: shopId,
        products: shopProducts,
        shippingInfo,
        paymentMethod: paymentMethod || "cod",
        totalAmount,
        orderCode
      });

      createdOrders.push(newOrder);
    }

    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: { $in: productIds } } } }
    );

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: createdOrders
    });

  } catch (error) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Có lỗi xảy ra khi tạo đơn hàng"
    });
  }
};

//Lấy danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const filterStatus = req.query.status;
    const filterOptions = { user: userId };
    if (filterStatus) {
      filterOptions.status = filterStatus;
    }

    const orders = await Order.find(filterOptions)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi lấy danh sách đơn hàng của bạn" });
  }
};

//Khách hàng hủy đơn
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;
    const { cancelReason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, error: "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn" });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, error: "Không thể hủy đơn hàng ở trạng thái hiện tại" });
    }

    order.status = "cancelled";
    if (cancelReason) order.cancelReason = cancelReason;
    order.updatedAt = new Date();

    const updatedOrder = await order.save();

    res.status(200).json({ success: true, message: "Hủy đơn hàng thành công", data: updatedOrder });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi hủy đơn hàng" });
  }
};

//Lấy danh sách tất cả đơn
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
    }

    const filterStatus = req.query.status;
    const filterOptions = filterStatus ? { status: filterStatus } : {};

    const orders = await Order.find(filterOptions)
      .sort({ createdAt: -1 })
      .populate("user", "fullName email")
      .lean();

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi lấy danh sách đơn hàng" });
  }
};

//Đếm số lượt bán của từng sản phẩm
exports.updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Trạng thái không hợp lệ." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: "Không tìm thấy đơn hàng" });
    }

    // Prevent changing already finished orders
    if (["completed", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, error: "Không thể thay đổi trạng thái đơn hàng đã hoàn thành hoặc đã bị hủy" });
    }

    // Only allow seller (shop owner) or staff with proper permission
    if (![Role.SELLER, Role.STAFF].includes(userRole)) {
      return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
    }

    // Fetch shop to verify ownership / staff membership and permissions
    const shop = await Shop.findById(order.shop);
    if (!shop) {
      return res.status(404).json({ success: false, error: "Không tìm thấy shop liên quan đến đơn hàng" });
    }

    // If user is seller, ensure they're the shop owner
    if (userRole === Role.SELLER) {
      if (!shop.owner || shop.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
      }
    }

    // If user is staff, ensure membership and 'manage_orders' permission
    if (userRole === Role.STAFF) {
      // shop.staff is an array of objects { user: ObjectId, permissions: [] }
      const staffMember = shop.staff ? shop.staff.find(s => s.user && s.user.toString() === userId.toString()) : null;
      if (!staffMember) {
        return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
      }

      const hasPerm = Array.isArray(staffMember.permissions) && staffMember.permissions.includes('manage_orders');
      if (!hasPerm) {
        return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
      }
    }

    // All checks passed -> update status
    order.status = status;
    order.updatedAt = new Date();

    await order.save();

    res.status(200).json({ success: true, message: `Cập nhật trạng thái đơn hàng thành công thành ${status}`, data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng" });
  }
};

//Cập nhật trạng thái đơn hàng
exports.getProductPurchaseStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          purchaseCount: { $sum: "$products.quantity" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          productName: "$product.name",
          purchaseCount: 1
        }
      },
      { $sort: { purchaseCount: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error getting product purchase stats:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi thống kê lượt mua sản phẩm" });
  }
};

//Đếm số lượt bán của shop dựa theo các đơn hàng ở trạng thái đã giao (delivered)
exports.getDeliveredOrderCountByShop = async (req, res) => {
  try {
    const shopId = req.params.shopId;

    const count = await Order.countDocuments({
      shop: shopId,
      status: "delivered"
    });

    res.status(200).json({ success: true, shopId, deliveredOrders: count });
  } catch (error) {
    console.error("Delivered order count error:", error);
    res.status(500).json({ success: false, error: "Lỗi khi thống kê đơn hàng đã giao" });
  }
};

// Lấy danh sách đơn theo shopId (dành cho seller hoặc nhân viên shop)
exports.getOrdersByShop = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    // Lấy shopId từ params
    const { shopId } = req.params;

    // Chỉ seller hoặc staff mới được truy cập
    if (![Role.SELLER, Role.STAFF].includes(userRole)) {
      return res.status(403).json({ success: false, error: "Bạn không có quyền truy cập." });
    }

    // Kiểm tra xem user có thuộc shop này không (chủ shop hoặc nhân viên)
    const shop = await Shop.findOne({
      _id: shopId,
      $or: [
        { owner: userId },
        { "staff.user": userId }
      ]
    });

    if (!shop) {
      return res.status(403).json({ success: false, error: "Bạn không có quyền truy cập đơn hàng của shop này." });
    }

    // Áp dụng lọc theo trạng thái nếu có query param
    const filterStatus = req.query.status;
    const filter = { shop: shopId };
    if (filterStatus) {
      filter.status = filterStatus;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "fullName email") // thông tin người mua
      .lean();

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng theo shop:", error);
    res.status(500).json({ success: false, error: "Lỗi server khi lấy đơn hàng của shop." });
  }
};
