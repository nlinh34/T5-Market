// const Cart = require("../models/Cart");
// const CartItem = require("../models/CartItem");
// const Product = require("../models/Product");
// const Voucher = require("../models/Voucher");
// const Combo = require("../models/Combo");
// const ComboProduct = require("../models/ComboProduct");
// const { httpStatusCodes } = require("../utils/constants");

// // Hàm tính tổng tiền giỏ hàng và áp dụng voucher
// const updateCartTotals = async (cartId, voucherId = null) => {
//   try {
//     // Lấy tất cả items trong giỏ hàng
//     const cartItems = await CartItem.find({ cart_id: cartId });

//     // Tính tổng tiền của sản phẩm đơn lẻ và combo riêng
//     let productSubtotal = 0;
//     let comboSubtotal = 0;

//     cartItems.forEach((item) => {
//       if (item.item_type === "product") {
//         productSubtotal += item.total_price;
//       } else if (item.item_type === "combo") {
//         comboSubtotal += item.total_price;
//       }
//     });

//     // Tổng tiền trước khi giảm giá
//     const subtotal = productSubtotal + comboSubtotal;

//     let discountAmount = 0;
//     if (voucherId) {
//       // Lấy thông tin voucher
//       const voucher = await Voucher.findById(voucherId);
//       if (voucher) {
//         // Chỉ áp dụng giảm giá cho sản phẩm đơn lẻ
//         if (voucher.discountType === "percent") {
//           discountAmount = Math.round(
//             (productSubtotal * voucher.discountValue) / 100
//           );
//         } else if (voucher.discountType === "fixed") {
//           discountAmount = Math.min(voucher.discountValue, productSubtotal);
//         }

//         // Giới hạn số tiền giảm giá tối đa nếu có
//         if (voucher.maxDiscount) {
//           discountAmount = Math.min(discountAmount, voucher.maxDiscount);
//         }
//       }
//     }

//     // Cập nhật giỏ hàng
//     const cart = await Cart.findByIdAndUpdate(
//       cartId,
//       {
//         subtotal: subtotal,
//         discount_amount: discountAmount,
//         total_amount: subtotal + 15000 - discountAmount, // subtotal + shipping_fee - discount
//         voucher_id: voucherId,
//       },
//       { new: true }
//     );

//     return cart;
//   } catch (error) {
//     console.error("Update cart totals error:", error);
//     throw error;
//   }
// };

// // GET /cart - Lấy thông tin giỏ hàng
// const getCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     let cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       cart = await Cart.create({
//         user_id: userId,
//         shipping_fee: 15000, // Phí ship mặc định
//       });
//     }

//     const cartItems = await CartItem.find({ cart_id: cart._id });

//     // Cập nhật tổng tiền
//     cart = await updateCartTotals(cart._id);

//     res.status(httpStatusCodes.OK).json({
//       cart: {
//         ...cart.toObject(),
//         items: cartItems,
//       },
//     });
//   } catch (error) {
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi lấy thông tin giỏ hàng",
//       details: error.message,
//     });
//   }
// };

// // POST /cart/add - Thêm sản phẩm vào giỏ hàng
// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { product_id, quantity = 1 } = req.body;

//     // Kiểm tra sản phẩm
//     const product = await Product.findById(product_id);
//     if (!product) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy sản phẩm",
//       });
//     }

//     // Tìm hoặc tạo giỏ hàng
//     let cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       cart = await Cart.create({
//         user_id: userId,
//         shipping_fee: 15000,
//       });
//     }

//     // Kiểm tra sản phẩm đã có trong giỏ hàng
//     let cartItem = await CartItem.findOne({
//       cart_id: cart._id,
//       product_id: product_id,
//       item_type: "product", // Thêm điều kiện item_type
//     });

//     if (cartItem) {
//       // Cập nhật số lượng và tổng giá
//       cartItem.quantity += quantity;
//       cartItem.total_price = cartItem.unit_price * cartItem.quantity;
//       cartItem = await cartItem.save();
//     } else {
//       // Tạo item mới
//       const cartItemData = {
//         cart_id: cart._id,
//         product_id: product_id,
//         item_type: "product",
//         product_name: product.name,
//         product_description: product.description,
//         product_image: product.image_url || "",
//         quantity: quantity,
//         unit_price: product.price,
//         total_price: product.price * quantity,
//       };

//       cartItem = await CartItem.create(cartItemData);
//     }

//     // Cập nhật tổng tiền giỏ hàng
//     cart = await updateCartTotals(cart._id);

//     res.status(httpStatusCodes.OK).json({
//       message: "Thêm sản phẩm vào giỏ hàng thành công",
//       cart,
//       cartItem,
//     });
//   } catch (error) {
//     console.error("Add to cart error:", error);
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi thêm sản phẩm vào giỏ hàng",
//       details: error.message,
//     });
//   }
// };

// // POST /cart/add-combo - Thêm combo vào giỏ hàng
// const addComboToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { combo_id, quantity = 1 } = req.body;

//     // Kiểm tra combo và populate products
//     const combo = await Combo.findById(combo_id).populate({
//       path: "products",
//       populate: {
//         path: "product_id",
//         model: "Product",
//         select: "name", // Chỉ lấy tên sản phẩm
//       },
//     });

//     if (!combo) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy combo",
//       });
//     }

//     // Tạo mô tả combo từ danh sách sản phẩm
//     const comboDescription = combo.products
//       .map((item) => `${item.quantity} ${item.product_id.name}`)
//       .join("\n");

//     // Tìm hoặc tạo giỏ hàng
//     let cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       cart = await Cart.create({
//         user_id: userId,
//         shipping_fee: 15000,
//       });
//     }

//     // Kiểm tra combo đã có trong giỏ hàng
//     let cartItem = await CartItem.findOne({
//       cart_id: cart._id,
//       product_id: combo_id,
//       item_type: "combo",
//     });

//     if (cartItem) {
//       // Cập nhật số lượng và tổng giá
//       cartItem.quantity += quantity;
//       cartItem.total_price = cartItem.unit_price * cartItem.quantity;
//       await cartItem.save();
//     } else {
//       // Tạo item mới cho combo
//       cartItem = await CartItem.create({
//         cart_id: cart._id,
//         product_id: combo_id,
//         item_type: "combo",
//         product_name: combo.name,
//         product_description: comboDescription, // Sử dụng mô tả mới
//         product_image: combo.imageURL,
//         quantity: quantity,
//         unit_price: combo.discountPrice || combo.originalPrice,
//         total_price: (combo.discountPrice || combo.originalPrice) * quantity,
//         combo_items: combo.products.map((item) => ({
//           product_id: item.product_id._id,
//           quantity: item.quantity,
//         })),
//       });
//     }

//     // Cập nhật tổng tiền giỏ hàng
//     cart = await updateCartTotals(cart._id);

//     res.status(httpStatusCodes.OK).json({
//       message: "Thêm combo vào giỏ hàng thành công",
//       cart,
//       cartItem,
//     });
//   } catch (error) {
//     console.error("Add combo error:", error);
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi thêm combo vào giỏ hàng",
//       details: error.message,
//     });
//   }
// };

// // PUT /cart/update - Cập nhật số lượng sản phẩm
// // backend/controllers/cartController.js
// const updateCartItem = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { cart_item_id, quantity } = req.body;

//     if (!quantity || quantity < 1) {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error: "Số lượng phải lớn hơn 0",
//       });
//     }
//     // Tìm cart của user
//     const cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy giỏ hàng",
//       });
//     }
//     // Tìm và cập nhật cart item theo _id
//     const cartItem = await CartItem.findOne({
//       _id: cart_item_id,
//       cart_id: cart._id,
//     });
//     if (!cartItem) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy sản phẩm trong giỏ hàng",
//       });
//     }
//     // Cập nhật số lượng và tổng giá
//     cartItem.quantity = quantity;
//     cartItem.total_price = cartItem.unit_price * quantity;
//     await cartItem.save();
//     // Cập nhật tổng tiền giỏ hàng
//     const updatedCart = await updateCartTotals(cart._id);
//     res.status(httpStatusCodes.OK).json({
//       message: "Cập nhật số lượng thành công",
//       cart: updatedCart,
//       cartItem,
//     });
//   } catch (error) {
//     console.error("Update cart item error:", error);
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi cập nhật số lượng",
//       details: error.message,
//     });
//   }
// };

// // DELETE /cart/remove/:product_id - Xóa sản phẩm khỏi giỏ hàng
// const removeFromCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const cartItemId = req.params.id;
//     const cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy giỏ hàng",
//       });
//     }
//     // Tìm và xóa cart item theo _id
//     const deletedItem = await CartItem.findOneAndDelete({
//       _id: cartItemId,
//       cart_id: cart._id,
//     });
//     if (!deletedItem) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy sản phẩm trong giỏ hàng",
//       });
//     }
//     // Cập nhật tổng tiền giỏ hàng
//     const updatedCart = await updateCartTotals(cart._id);
//     res.status(httpStatusCodes.OK).json({
//       message: "Xóa sản phẩm khỏi giỏ hàng thành công",
//       cart: updatedCart,
//     });
//   } catch (error) {
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
//       details: error.message,
//     });
//   }
// };

// // POST /cart/add-voucher - Thêm voucher vào giỏ hàng
// const addVoucherToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { voucher_id, voucher_code } = req.body;

//     let voucher;

//     // Kiểm tra xem request gửi lên voucher_id hay voucher_code
//     if (voucher_id) {
//       voucher = await Voucher.findById(voucher_id);
//     } else if (voucher_code) {
//       voucher = await Voucher.findOne({ code: voucher_code });
//     } else {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error: "Vui lòng cung cấp voucher_id hoặc voucher_code",
//       });
//     }

//     // Kiểm tra voucher có tồn tại và còn hiệu lực
//     if (!voucher || new Date() > voucher.expirationDate) {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error: "Voucher không hợp lệ hoặc đã hết hạn",
//       });
//     }

//     // Tìm giỏ hàng của user
//     const cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy giỏ hàng",
//       });
//     }

//     // Kiểm tra nếu giỏ hàng trống
//     const cartItems = await CartItem.find({ cart_id: cart._id });
//     if (cartItems.length === 0) {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error: "Giỏ hàng trống, không thể áp dụng voucher",
//       });
//     }

//     // Kiểm tra xem có sản phẩm đơn lẻ nào không
//     const hasProducts = cartItems.some((item) => item.item_type === "product");
//     if (!hasProducts) {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error:
//           "Voucher chỉ áp dụng cho sản phẩm đơn lẻ, không áp dụng cho combo",
//       });
//     }

//     // Tính tổng tiền sản phẩm đơn lẻ
//     const productSubtotal = cartItems
//       .filter((item) => item.item_type === "product")
//       .reduce((sum, item) => sum + item.total_price, 0);

//     // Kiểm tra điều kiện áp dụng voucher (nếu có)
//     if (voucher.minOrderValue && productSubtotal < voucher.minOrderValue) {
//       return res.status(httpStatusCodes.BAD_REQUEST).json({
//         error: `Tổng giá trị sản phẩm phải từ ${voucher.minOrderValue.toLocaleString()}đ để áp dụng voucher này`,
//       });
//     }

//     // Cập nhật giỏ hàng với voucher mới
//     const updatedCart = await updateCartTotals(cart._id, voucher._id);

//     // Tính toán chi tiết giảm giá
//     const discountDetails = {
//       productSubtotal: productSubtotal, // Thêm tổng tiền sản phẩm đơn lẻ
//       comboSubtotal: updatedCart.subtotal - productSubtotal, // Thêm tổng tiền combo
//       discountType: voucher.discountType,
//       discountValue: voucher.discountValue,
//       discountAmount: updatedCart.discount_amount,
//       finalAmount: updatedCart.total_amount,
//       voucherInfo: {
//         code: voucher.code,
//         name: voucher.name,
//         description: voucher.description,
//       },
//     };

//     res.status(httpStatusCodes.OK).json({
//       message: "Áp dụng voucher thành công",
//       cart: updatedCart,
//       discountDetails: discountDetails,
//     });
//   } catch (error) {
//     console.error("Add voucher error:", error);
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi thêm voucher",
//       details: error.message,
//     });
//   }
// };

// // DELETE /cart/clear - Xóa toàn bộ giỏ hàng
// const clearCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // Tìm giỏ hàng của user
//     const cart = await Cart.findOne({ user_id: userId });
//     if (!cart) {
//       return res.status(httpStatusCodes.NOT_FOUND).json({
//         error: "Không tìm thấy giỏ hàng",
//       });
//     }

//     // Xóa tất cả cart items của giỏ hàng này
//     await CartItem.deleteMany({ cart_id: cart._id });

//     // Reset giỏ hàng về trạng thái ban đầu
//     const updatedCart = await Cart.findByIdAndUpdate(
//       cart._id,
//       {
//         subtotal: 0,
//         discount_amount: 0,
//         total_amount: 0,
//         voucher_id: null,
//       },
//       { new: true }
//     );

//     res.status(httpStatusCodes.OK).json({
//       message: "Đã xóa toàn bộ giỏ hàng",
//       cart: updatedCart,
//     });
//   } catch (error) {
//     console.error("Clear cart error:", error);
//     res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
//       error: "Lỗi khi xóa giỏ hàng",
//       details: error.message,
//     });
//   }
// };

// module.exports = {
//   getCart,
//   addToCart,
//   addComboToCart,
//   updateCartItem,
//   removeFromCart,
//   addVoucherToCart,
//   clearCart,
// };



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
