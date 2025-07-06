const express = require("express");
const router = express.Router();
const {
  handleSignIn,
  handleSignUp,
  getAllUsers,
  deleteUserById,
  updateUserStatus,
  updateUserProfile,
  changeUserPassword,
  getCurrentUser,
} = require("../controllers/userController");
const {
  handleGoogleSignIn,
  updatePhone,
} = require("../controllers/googleAuthController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/sign-in", handleSignIn);
router.post("/sign-up", handleSignUp);
router.get("/all-users", protect, getAllUsers);
router.post("/google", handleGoogleSignIn);
router.post("/update-phone", updatePhone);
router.delete("/user/:id", protect, deleteUserById)
router.patch("/user/:id/status", protect, updateUserStatus);
router.put("/profile", protect, updateUserProfile);
router.patch("/change-password", protect, changeUserPassword);
router.get("/current-user", protect, getCurrentUser);


module.exports = router;
