const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../Controllers/adminController");
const {
  approveBusiness,
  verifyBusiness,
  transferOwnership,
} = require("../Controllers/businessController");
const { approveEvent } = require("../Controllers/eventController");

const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");

router.post("/register-admin", registerAdmin);
router.post("/login", loginAdmin);

// Approve business modifications
router.put("/approve-business", isAuthenticated, isAdmin, approveBusiness);

// Verify business
router.put("/verify-business", isAuthenticated, isAdmin, verifyBusiness);

// Approve event
router.put("/approve-event", isAuthenticated, isAdmin, approveEvent);

// Route to transfer ownership of a business
router.post("/transfer/:id", isAuthenticated, isAdmin, transferOwnership);

module.exports = router;
