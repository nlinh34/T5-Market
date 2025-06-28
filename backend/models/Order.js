const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, unique: true, required: true },
  shippingInfo: {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    fullAddress: { type: String, required: true },
    note: { type: String },
  },
  order: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subTotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },
  deliveryTime: { type: String, enum: ["now", "later"], required: true },
  deliveryDate: { type: Date },
  deliveryHour: { type: String },
  paymentMethod: {
    type: String,
    enum: ["COD", "momo", "bank", "credit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivering", "completed", "cancelled"],
    default: "pending",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  cancelReason: { type: String },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("Order", orderSchema);
