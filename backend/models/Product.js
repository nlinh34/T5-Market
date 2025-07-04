const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên sản phẩm không được để trống"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Giá sản phẩm không được để trống"],
        min: [0, "Giá sản phẩm không được âm"],
    },
    description: {
        type: String,
        required: [true, "Mô tả sản phẩm không được để trống"],
    },
    image_url: {
        type: String,
        required: [true, "URL hình ảnh không được để trống"],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    approvedAt: {
        type: Date,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);