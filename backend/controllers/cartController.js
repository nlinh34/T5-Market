const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose")

// Thêm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập hoặc ID không hợp lệ" });
    }

    const { product, quantity = 1 } = req.body;

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
      item.product?.toString() === product.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();

    // ❗Lấy lại giỏ hàng sau khi cập nhật
    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    res.status(200).json({ success: true, message: "Đã thêm vào giỏ hàng", data: updatedCart });
  } catch (error) {
    console.error("❌ Lỗi thêm giỏ hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};


exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Chưa đăng nhập hoặc ID không hợp lệ" });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images shop",
      populate: {
        path: "shop",
        select: "name"
      }
    });

    if (!cart || !Array.isArray(cart.items)) {
      return res.json({ success: true, cart: { items: [], total: 0 } });
    }

    const cleanedItems = cart.items
      .filter(item => item.product && typeof item.product.price === "number")
      .map(item => {
        const product = item.product;

        return {
          product: {
            _id: product._id || "",
            name: product.name || "Không có tên",
            price: product.price || 0,
            images: Array.isArray(product.images) ? product.images : [],
            shop: product.shop?.name
              ? { name: product.shop.name }
              : { name: "Không xác định" }
          },
          quantity: item.quantity,
          subtotal: product.price * item.quantity
        };
      });

    const total = cleanedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return res.json({
      success: true,
      cart: {
        items: cleanedItems,
        total
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng", error: error.message });
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
