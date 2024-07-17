const express = require("express");
const router = express.Router();
const {
  register,
  verifyOtp,
  forgotPassword,
  resendOtp,
  newPassword,
  login,
  getAllUsers,
} = require("../Controllers/authController");

router.post("/register", register);
// signin
router.get("/all", getAllUsers);

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/new-password", newPassword);

module.exports = router;
