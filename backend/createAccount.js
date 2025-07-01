const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const { Role } = require("./constants/roleEnum"); // ✅ Import role dạng số

dotenv.config();

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công.");
    createDefaultUsers();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });

// Danh sách user mặc định
const defaultUsers = [
  {
    fullName: "Quản Trị Viên",
    email: "admin1@t5market.com",
    password: "admin123",
    phone: "0582110949",
    role: Role.ADMIN,
  },
  {
    fullName: "Quản Lý Hệ Thống",
    email: "manager@t5market.com",
    password: "manager123",
    phone: "0582110949",
    role: Role.MANAGER,
  },
  {
    fullName: "MOD Kiểm Duyệt",
    email: "mod@t5market.com",
    password: "mod123",
    phone: "0582110949",
    role: Role.MOD,
  },
  {
    fullName: "Cửa Hàng",
    email: "seller@t5market.com",
    password: "seller123",
    phone: "0582110949",
    role: Role.SELLER,
  },
  {
    fullName: "Nhân Viên Cửa Hàng",
    email: "staff@t5market.com",
    password: "staff123",
    phone: "0582110949",
    role: Role.STAFF,
  },
  {
    fullName: "Khách Hàng 1",
    email: "customer@t5market.com",
    password: "customer123",
    phone: "0582110949",
    role: Role.CUSTOMER,
  },
];

async function createDefaultUsers() {
  try {
    for (const userData of defaultUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`⚠️ User đã tồn tại: ${userData.email}`);
        continue;
      }

      const newUser = new User({
        phone: "0123456789",
        status: "pending",
        accountStatus: "green",
        isGoogleUser: false,
        ...userData,
      });

      await newUser.save();
      console.log(`✅ Tạo user thành công: ${userData.email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo user:", error);
    process.exit(1);
  }
}
