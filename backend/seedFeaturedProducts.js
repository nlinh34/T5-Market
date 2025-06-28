const mongoose = require("mongoose");
const Product = require("./models/Product");
const Categories = require("./models/Categories");
const User = require("./models/User");
require("dotenv").config();

const connectDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const seedFeaturedProducts = async() => {
    try {
        // Tạo danh mục mẫu nếu chưa có
        let category = await Categories.findOne({ name: "Điện tử" });
        if (!category) {
            category = await Categories.create({
                name: "Điện tử",
                imageURL: "https://via.placeholder.com/300x300/2e8b57/ffffff?text=Điện+tử"
            });
            console.log("Created category:", category.name);
        }

        // Tạo user admin mẫu nếu chưa có
        let adminUser = await User.findOne({ email: "admin@t5market.com" });
        if (!adminUser) {
            adminUser = await User.create({
                fullName: "Admin T5Market",
                email: "admin@t5market.com",
                phone: "0123456789",
                password: "admin123",
                role: "admin"
            });
            console.log("Created admin user:", adminUser.fullName);
        }

        // Dữ liệu sản phẩm nổi bật mẫu
        const featuredProducts = [{
                name: "iPhone 15 Pro Max",
                price: 29990000,
                description: "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình 6.7 inch Super Retina XDR OLED",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=iPhone+15+Pro+Max",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            },
            {
                name: "MacBook Pro M3",
                price: 45990000,
                description: "MacBook Pro với chip M3 mới nhất, hiệu suất vượt trội, màn hình Liquid Retina XDR 14 inch",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=MacBook+Pro+M3",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                price: 27990000,
                description: "Galaxy S24 Ultra với camera 200MP, S Pen tích hợp, màn hình 6.8 inch Dynamic AMOLED 2X",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=Galaxy+S24+Ultra",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            },
            {
                name: "iPad Pro 12.9 inch",
                price: 32990000,
                description: "iPad Pro với chip M2, màn hình Liquid Retina XDR 12.9 inch, hỗ trợ Apple Pencil thế hệ 2",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=iPad+Pro+12.9",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            },
            {
                name: "Sony WH-1000XM5",
                price: 8990000,
                description: "Tai nghe chống ồn Sony WH-1000XM5 với công nghệ chống ồn hàng đầu, âm thanh chất lượng cao",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=Sony+WH-1000XM5",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            },
            {
                name: "DJI Mini 3 Pro",
                price: 15990000,
                description: "Drone DJI Mini 3 Pro với camera 4K, trọng lượng dưới 250g, thời gian bay lên đến 34 phút",
                image_url: "https://via.placeholder.com/400x400/2e8b57/ffffff?text=DJI+Mini+3+Pro",
                category: category._id,
                seller: adminUser._id,
                isApproved: true,
                isFeatured: true,
                approvedAt: new Date()
            }
        ];

        // Kiểm tra và tạo sản phẩm nổi bật
        for (const productData of featuredProducts) {
            const existingProduct = await Product.findOne({ name: productData.name });
            if (!existingProduct) {
                const product = await Product.create(productData);
                console.log("Created featured product:", product.name);
            } else {
                // Cập nhật trạng thái nổi bật nếu sản phẩm đã tồn tại
                await Product.findByIdAndUpdate(existingProduct._id, { isFeatured: true });
                console.log("Updated featured status for:", existingProduct.name);
            }
        }

        console.log("✅ Featured products seeding completed successfully!");

        // Hiển thị số lượng sản phẩm nổi bật
        const featuredCount = await Product.countDocuments({ isFeatured: true });
        console.log(`📊 Total featured products: ${featuredCount}`);

    } catch (error) {
        console.error("❌ Error seeding featured products:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed");
    }
};

// Chạy script
connectDatabase().then(() => {
    seedFeaturedProducts();
});