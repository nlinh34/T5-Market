const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    product_id: {
      // Sử dụng product_id cho cả sản phẩm và combo
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "item_type", // Tham chiếu động dựa vào item_type
    },
    item_type: {
      type: String,
      enum: ["product", "combo"],
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    product_description: String,
    product_image: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    combo_items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

// Index cho product_id và item_type
CartItemSchema.index(
  {
    cart_id: 1,
    product_id: 1,
    item_type: 1,
  },
  { unique: true }
);

module.exports = mongoose.model("CartItem", CartItemSchema);
