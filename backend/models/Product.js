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
    isAvailable: {
        type: Boolean,
        default: true, // Còn hàng hoặc hết hàng
    },
    description: {
        type: String,
        required: [true, "Mô tả sản phẩm không được để trống"],
    },
    images: [
        {
            type: String,
            required: [true, "Cần ít nhất một hình ảnh sản phẩm"],
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // người tạo bài đăng: seller hoặc staff
        required: true,
    },
    // Trạng thái duyệt
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Admin hoặc Mod duyệt
    },
    approvedAt: {
        type: Date,
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Admin hoặc Mod từ chối
    },
    rejectedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },

    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },

    // Sản phẩm nổi bật
    isFeatured: {
        type: Boolean,
        default: false,
    },

},
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
