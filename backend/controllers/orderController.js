// backend/controllers/orderController.js
const Order = require("../models/Order");
const User = require("../models/User");
const { validateOrder } = require("../utils/validationOrder");

const generateOrderCode = async (userId) => {
  try {
    // Lấy thông tin user
    const user = await User.findById(userId);
    // Tạo phần tiền tố từ tên người dùng (2 ký tự đầu của họ và tên)
    let prefix = "";
    if (user && user.fullName) {
      // Tách họ tên và lấy ký tự đầu của mỗi từ
      const nameParts = user.fullName.split(" ");
      if (nameParts.length >= 2) {
        // Lấy chữ cái đầu của họ và tên
        prefix = (
          nameParts[0][0] + nameParts[nameParts.length - 1][0]
        ).toUpperCase();
      } else {
        // Nếu chỉ có một từ, lấy 2 chữ cái đầu
        prefix = user.fullName.substring(0, 2).toUpperCase();
      }
    } else {
      // Nếu không có tên, dùng 'FG' (FoodGreen)
      prefix = "FG";
    }
    // Tạo phần số từ ngày giờ hiện tại
    const datePart = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .substring(0, 12);
    // Tạo phần ngẫu nhiên (4 ký tự)
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    // Kết hợp các phần và phần userId (lấy 4 ký tự cuối)
    const userSuffix = userId.toString().slice(-4);
    // Tạo mã đơn hàng theo định dạng: PREFIX-DATECODE-RANDOM-USERID
    const orderCode = `${prefix}${datePart}${randomPart}${userSuffix}`;
    return orderCode;
  } catch (error) {
    console.error("Error generating order code:", error);
    // Trả về mã đơn hàng mặc định nếu có lỗi
    return `FG${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

// USER
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const userId = req.user._id; // Lấy từ middleware auth

    // Validate dữ liệu đầu vào
    const { error } = validateOrder(orderData);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Kiểm tra deliveryTime và các trường liên quan
    if (orderData.deliveryTime === "later") {
      if (!orderData.deliveryDate || !orderData.deliveryHour) {
        return res.status(400).json({
          success: false,
          error: "Vui lòng chọn ngày và giờ giao hàng",
        });
      }
    }

    // Tạo đơn hàng mới
    const order = new Order({
      ...orderData,
      orderCode: await generateOrderCode(userId),
      userId,
      status: "pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi tạo đơn hàng",
    });
  }
};

// Lấy đơn hàng theo ID của user - dành cho user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm kiếm theo trạng thái (nếu có)
    const filterStatus = req.query.status;
    const filterOptions = { userId };
    if (filterStatus) {
      filterOptions.status = filterStatus;
    }

    // Lấy danh sách đơn hàng của user, sắp xếp theo thời gian mới nhất
    const orders = await Order.find(filterOptions)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi lấy danh sách đơn hàng của bạn",
    });
  }
};

// Hủy đơn hàng - dành cho user
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    const { cancelReason } = req.body;

    // Tìm đơn hàng theo ID và userId
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn",
      });
    }

    // Kiểm tra trạng thái
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Không thể hủy đơn hàng ở trạng thái hiện tại",
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";

    // Thêm lý do hủy nếu có
    if (cancelReason) {
      order.cancelReason = cancelReason;
    }

    // Thêm thời gian cập nhật
    order.updatedAt = new Date();

    // Lưu thay đổi và trả về bản cập nhật mới nhất
    const updatedOrder = await order.save();

    // Đảm bảo lấy đơn hàng mới nhất để kiểm tra
    const finalOrder = await Order.findById(orderId);

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: finalOrder,
      cancelReason: finalOrder.cancelReason, // Thêm phần này để kiểm tra
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi hủy đơn hàng",
    });
  }
};

// ADMIN
// Lấy tất cả đơn hàng - dành cho admin
exports.getAllOrders = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền thực hiện hành động này",
      });
    }

    // Tìm kiếm theo trạng thái (nếu có)
    const filterStatus = req.query.status;
    const filterOptions = filterStatus ? { status: filterStatus } : {};

    // Lấy danh sách đơn hàng, mặc định sắp xếp theo thời gian tạo mới nhất
    const orders = await Order.find(filterOptions)
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email") // Populate thông tin người dùng
      .lean(); // Sử dụng lean() để tối ưu hiệu suất

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi lấy danh sách đơn hàng",
    });
  }
};

// Cập nhật trạng thái đơn hàng - dành cho admin
exports.updateOrderStatus = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền thực hiện hành động này",
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    // Kiểm tra status có hợp lệ không
    const validStatuses = ["pending", "confirmed", "delivering", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error:
          "Trạng thái không hợp lệ. Trạng thái phải là một trong các giá trị: pending, confirmed, delivering, completed",
      });
    }

    // Tìm đơn hàng theo ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đơn hàng",
      });
    }

    // Các kiểm tra logic nghiệp vụ
    // Ví dụ: Nếu đơn hàng đã hoàn thành thì không thể thay đổi trạng thái
    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "Không thể thay đổi trạng thái của đơn hàng đã hoàn thành",
      });
    }

    // Nếu đơn hàng đã bị hủy thì không thể thay đổi trạng thái
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Không thể thay đổi trạng thái của đơn hàng đã bị hủy",
      });
    }

    // Cập nhật trạng thái
    order.status = status;

    // Thêm ngày cập nhật
    order.updatedAt = new Date();

    // Lưu vào database
    await order.save();

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành công thành ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
    });
  }
};
