// controllers/cartController.js
const Cart = require("../models/Cart");

// Lấy giỏ hàng của user
exports.getCurrentCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user_id: userId }).populate("items.product_id");

    if (!cart) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({
      success: true,
      data: cart.items,
      summary: {
        subtotal: cart.subtotal,
        shipping_fee: cart.shipping_fee,
        discount_amount: cart.discount_amount,
        total_amount: cart.total_amount
      }
    });
  } catch (error) {
    console.error("Lỗi getCurrentCart:", error);
    res.status(500).json({ success: false, error: "Không thể lấy giỏ hàng" });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { product_id, quantity } = req.body;

    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        items: [{ product_id, quantity }]
      });
    } else {
      const index = cart.items.findIndex(
        item => item.product_id.toString() === product_id
      );

      if (index >= 0) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }
    }

    // Recalculate subtotal
    let subtotal = 0;
    await cart.populate("items.product_id");
    cart.items.forEach(item => {
      subtotal += item.product_id.price * item.quantity;
    });

    cart.subtotal = subtotal;
    cart.total_amount = subtotal + cart.shipping_fee - cart.discount_amount;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng",
      cart
    });
  } catch (error) {
    console.error("Lỗi thêm giỏ hàng:", error);
    res.status(500).json({ success: false, error: "Không thể thêm vào giỏ hàng" });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { product_id, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Số lượng không hợp lệ" });
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });
    }

    const item = cart.items.find(item => item.product_id.toString() === product_id);
    if (!item) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    item.quantity = quantity;

    await cart.populate("items.product_id");
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += item.product_id.price * item.quantity;
    });

    cart.subtotal = subtotal;
    cart.total_amount = subtotal + cart.shipping_fee - cart.discount_amount;

    await cart.save();

    res.status(200).json({ success: true, message: "Đã cập nhật số lượng", cart });
  } catch (error) {
    console.error("Lỗi updateCartItem:", error);
    res.status(500).json({ success: false, error: "Không thể cập nhật giỏ hàng" });
  }
};

// Xoá 1 sản phẩm khỏi giỏ hàng
exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ error: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(item => item.product_id.toString() !== id);

    await cart.populate("items.product_id");
    let subtotal = 0;
    cart.items.forEach(item => {
      subtotal += item.product_id.price * item.quantity;
    });

    cart.subtotal = subtotal;
    cart.total_amount = subtotal + cart.shipping_fee - cart.discount_amount;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Đã xoá sản phẩm khỏi giỏ hàng",
      cart
    });
  } catch (error) {
    console.error("Lỗi deleteCartItem:", error);
    res.status(500).json({ success: false, error: "Không thể xoá sản phẩm" });
  }
};
