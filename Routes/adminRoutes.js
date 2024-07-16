const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../Controllers/adminController");
const {
  approveBusiness,
  verifyBusiness,
  transferOwnership,
} = require("../Controllers/businessController");

const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");

router.post("/register-admin", registerAdmin);
router.post("/login", loginAdmin);

// Approve business modifications
router.put("/approve-business", isAuthenticated, isAdmin, approveBusiness);

// Verify business
router.put("/verify-business", isAuthenticated, isAdmin, verifyBusiness);

// Transfer business ownership
router.put("/transfer-ownership", isAuthenticated, isAdmin, transferOwnership);

module.exports = router;
