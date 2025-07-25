const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose")

// Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  console.log("🟢 Controller chạy vào đây rồi");
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập hoặc token không hợp lệ" });
    }

    console.log("🔑 req.user:", req.user);
    console.log("📦 req.body:", req.body);

    let userId = req.user.userId;

    // Nếu userId là chuỗi thì chuyển sang ObjectId
    if (typeof userId === "string") {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "ID user không hợp lệ" });
      }
      userId = new mongoose.Types.ObjectId(userId);
    }

    const { product, quantity = 1 } = req.body;

    if (!product) {
      return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item =>
      item.product && item.product.toString() === product
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();

    res.status(200).json({ success: true, message: "Đã thêm vào giỏ hàng", data: cart });
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};


exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product", "name price images");
    if (!cart) return res.json({ success: true, cart: { items: [], total: 0 } });

    const itemsWithSubtotal = cart.items.map(item => {
      const subtotal = item.product.price * item.quantity;
      return {
        product: item.product,
        quantity: item.quantity,
        subtotal
      };
    });

    const total = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({ success: true, cart: { items: itemsWithSubtotal, total } });
  } catch (err) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", err.message);
    res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng" });
  }
};


// Xoá sản phẩm khỏi giỏ
exports.removeFromCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.json({ success: true, message: "Đã xoá sản phẩm khỏi giỏ" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Cập nhật số lượng
exports.updateQuantity = async (req, res) => {
  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, message: "Đã cập nhật số lượng" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
