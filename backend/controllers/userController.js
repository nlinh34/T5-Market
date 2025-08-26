require("dotenv").config();
const { httpStatusCodes } = require("../utils/constants");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const handleSignIn = async(req, res) => {
    try {
        const { email, phone, password, rememberMe } = req.body;

        if (!email && !phone) {
            return res
                .status(httpStatusCodes.BAD_REQUEST)
                .json({ error: "Email hoặc số điện thoại là bắt buộc" });
        }

        const query = email ? { email } : { phone };
        const user = await User.findOne(query);

        if (!user) {
            return res
                .status(httpStatusCodes.UNAUTHORIZED)
                .json({ error: "Thông tin đăng nhập không hợp lệ" });
        }

        const isPasswordCorrect = await user.matchPassword(password);
        if (!isPasswordCorrect) {
            return res
                .status(httpStatusCodes.UNAUTHORIZED)
                .json({ error: "Thông tin đăng nhập không hợp lệ" });
        }


        const tokenOptions = rememberMe ? { expiresIn: "7d" } : { expiresIn: "1h" };
        const userToken = jwt.sign({
                userId: user._id,
                role: Number(user.role), 
            },
            process.env.SECRET_KEY,
            tokenOptions
        );

        res.status(httpStatusCodes.OK).json({
            token: userToken,
            user: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: Number(user.role),
                avatarUrl: user.avatarUrl, 
            },
            message: "Đăng nhập thành công",
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng nhập:", error);
        res
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Lỗi server" });
    }
};

const handleSignUp = async(req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        if (!fullName || !email || !phone || !password) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                error: "Họ tên, email, số điện thoại và mật khẩu là bắt buộc",
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res
                .status(httpStatusCodes.CONFLICT)
                .json({ error: "Email đã tồn tại" });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res
                .status(httpStatusCodes.CONFLICT)
                .json({ error: "Số điện thoại đã tồn tại" });
        }

        const newUser = new User({
            fullName,
            email,
            phone,
            password, 
        });

        await newUser.save();

        const userToken = jwt.sign({
                userId: newUser._id,
                role: newUser.role, 
            },
            process.env.SECRET_KEY, { expiresIn: "24h" }
        );

        res.status(httpStatusCodes.CREATED).json({
            token: userToken,
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl, 
            },
            message: "Đăng ký thành công",
        });
    } catch (error) {
        console.error("Lỗi trong quá trình đăng ký:", error.message, error.stack);
        res.status(500).json({ error: error.message });

    }
};

const getAllUsers = async(req, res) => {
    try {
        const { Role } = require("../constants/roleEnum");
        if (req.user.role !== Role.ADMIN) {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                success: false,
                error: "Không có quyền truy cập",
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();

        const users = await User.find()
            .select("fullName email phone role status accountStatus createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(httpStatusCodes.OK).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit), 
            totalUsers,
            data: users,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi server khi lấy danh sách user",
        });
    }
};


const getCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        res.status(httpStatusCodes.OK).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi khi lấy thông tin người dùng",
        });
    }
};

const deleteUserById = async(req, res) => {
    try {
        const userId = req.params.id;

        const { Role } = require("../constants/roleEnum");
        if (req.user.role !== Role.ADMIN) {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                success: false,
                error: "Không có quyền xóa người dùng",
            });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                error: "Không tìm thấy người dùng để xóa",
            });
        }

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: "Xóa người dùng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi server khi xóa người dùng",
        });
    }
};

const updateUserStatus = async(req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body; 

        const { Role } = require("../constants/roleEnum");
        if (req.user.role !== Role.ADMIN) {
            return res.status(httpStatusCodes.FORBIDDEN).json({
                success: false,
                error: "Không có quyền cập nhật trạng thái người dùng",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                error: "Không tìm thấy người dùng",
            });
        }

        let newStatus;
        if (status === "approve") {
            newStatus = "approved";
        } else if (status === "reject") {
            newStatus = "rejected";
        } else {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Hành động không hợp lệ. Chỉ chấp nhận 'approve' hoặc 'reject'.",
            });
        }

        user.status = newStatus;
        user.approvedBy = req.user.userId;
        await user.save();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: `Người dùng đã được ${newStatus === "approved" ? "duyệt" : "từ chối"}`,
            data: {
                userId: user._id,
                status: user.status,
                approvedBy: user.approvedBy,
            },
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi server khi cập nhật trạng thái người dùng",
        });
    }
};

const updateUserProfile = async(req, res) => {
    try {
        const userId = req.user.userId;
        const {
            fullName,
            email,
            phone,
            gender,
            dateofbirth,
            address,
            avatarUrl
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                error: "Người dùng không tìm thấy"
            });
        }

        if (fullName) user.fullName = fullName;
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(httpStatusCodes.CONFLICT).json({
                    success: false,
                    error: "Email đã được sử dụng"
                });
            }
            user.email = email;
        }
        if (phone) {
            const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
            if (existingPhone) {
                return res.status(httpStatusCodes.CONFLICT).json({
                    success: false,
                    error: "Số điện thoại đã được sử dụng"
                });
            }
            user.phone = phone;
        }
        if (gender) user.gender = gender;
        if (dateofbirth) user.dateofbirth = dateofbirth;
        if (address) user.address = address;
        if (avatarUrl) user.avatarUrl = avatarUrl; 

        await user.save();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: "Cập nhật thông tin thành công",
            data: user.toObject(), 
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật profile người dùng:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi server khi cập nhật profile người dùng",
        });
    }
};

const changeUserPassword = async(req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Mật khẩu mới và xác nhận mật khẩu mới không khớp",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(httpStatusCodes.NOT_FOUND).json({
                success: false,
                error: "Người dùng không tìm thấy"
            });
        }

        const isPasswordCorrect = await user.matchPassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(httpStatusCodes.UNAUTHORIZED).json({
                success: false,
                error: "Mật khẩu hiện tại không chính xác"
            });
        }

        user.password = newPassword; 
        await user.save();

        res.status(httpStatusCodes.OK).json({
            success: true,
            message: "Đổi mật khẩu thành công",
        });
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu người dùng:", error);
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: "Lỗi server khi đổi mật khẩu người dùng",
        });
    }
};

module.exports = {
    handleSignIn,
    handleSignUp,
    getCurrentUser,
    getAllUsers,
    deleteUserById,
    updateUserStatus,
    updateUserProfile,
    changeUserPassword,
};