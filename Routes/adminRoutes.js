const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../Controllers/adminController");
const {
  approveBusiness,
  verifyBusiness,
  transferOwnership,
  highlightBusiness,
  unhighlightBusiness,
} = require("../Controllers/businessController");
const {
  approveEvent,
  highlightEvent,
  unhighlightEvent,
} = require("../Controllers/eventController");

const {
  isAuthenticated,
  isSuperAdmin,
  isAdmin,
} = require("../middleware/authmiddleware");

router.post("/register-admin", isSuperAdmin, registerAdmin);
router.post("/login", loginAdmin);

// Approve business modifications
router.put("/approve-business", isAuthenticated, isAdmin, approveBusiness);

// Verify business
router.put("/verify-business", isAuthenticated, isAdmin, verifyBusiness);

// Approve event
router.put("/approve-event", isAuthenticated, isAdmin, approveEvent);

// Route to transfer ownership of a business
router.post("/transfer/:id", isAuthenticated, isAdmin, transferOwnership);

router.put(
  "/highlight/:businessId",
  isAuthenticated,
  isAdmin,
  highlightBusiness
);
router.put(
  "/unhighlight/:businessId",
  isAuthenticated,
  isAdmin,
  unhighlightBusiness
);
router.put(
  "/event/highlight/:eventId",
  isAuthenticated,
  isAdmin,
  highlightEvent
);
router.put(
  "/event/unhighlight/:eventId",
  isAuthenticated,
  isAdmin,
  unhighlightEvent
);

module.exports = router;
