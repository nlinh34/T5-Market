const express = require("express");
const router = express.Router();
const {
  handleSignIn,
  handleSignUp,
  getAllUsers,
  deleteUserById,
  updateUserStatus,
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


module.exports = router;
