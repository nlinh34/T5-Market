const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  orderCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    }
  ],
  shippingInfo: {
    address: String,
    phone: String,
    fullName: String,
    note: String
  },
  paymentMethod: { type: String, enum: ["cod", "bank"], default: "cod" },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
