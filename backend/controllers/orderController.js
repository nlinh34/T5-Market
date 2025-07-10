// backend/controllers/orderController.js
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { Role } = require("../constants/roleEnum")
const mongoose = require("mongoose");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products, shippingInfo, paymentMethod } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: "Danh sách sản phẩm không hợp lệ." });
    }

    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.address || !shippingInfo.phone) {
      return res.status(400).json({ success: false, error: "Thông tin giao hàng không đầy đủ." });
    }

    const detailedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
        }
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          image: product.image_url || ""
        };
      })
    );

    const totalAmount = detailedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      products: detailedProducts,
      shippingInfo,
      paymentMethod: paymentMethod || "cod",
      totalAmount
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: newOrder
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Có lỗi xảy ra khi tạo đơn hàng"
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

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

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
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

exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== Role.SELLER) {
      console.log("Current user role:", req.user.role, "| Expected:", Role.SELLER);

      console.log("req.user = ", req.user);

      return res.status(403).json({ success: false, error: "Bạn không có quyền thực hiện hành động này" });
    }

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

    if (["completed", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, error: "Không thể thay đổi trạng thái đơn hàng đã hoàn thành hoặc đã bị hủy" });
    }

    order.status = status;
    order.updatedAt = new Date();

    await order.save();

    res.status(200).json({ success: true, message: `Cập nhật trạng thái đơn hàng thành công thành ${status}`, data: order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, error: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng" });
  }
};

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
