const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose")

// Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin sản phẩm hoặc số lượng" });
    }

    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });
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
    res.status(500).json({ success: false, message: "Lỗi server" });
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
