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
  getMyBusinesses,
  getMyEvents,
} = require("../Controllers/authController");
const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");

router.post("/register", register);
// signin
router.get("/all", getAllUsers);

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/new-password", newPassword);
// Route to fetch user's own businesses
router.get("/my-businesses", isAuthenticated, getMyBusinesses);

// Route to fetch user's own events
router.get("/my-events", isAuthenticated, getMyEvents);
module.exports = router;
