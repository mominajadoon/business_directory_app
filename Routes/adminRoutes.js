const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  deleteUser,
  adminEditBusiness,
  getAllAdmins,
  deleteAdmin,
  blockAdmin,
  blockUser,
} = require("../Controllers/adminController");
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
  isAdminOrSuperAdmin,
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

// Delete user
router.delete("/delete-user", isAuthenticated, isAdmin, deleteUser);
// Route to edit a business by admin
router.put("/edit-business/:id", isAuthenticated, isAdmin, adminEditBusiness);
router.get("/all-admins", isAuthenticated, isSuperAdmin, getAllAdmins);
router.delete("/delete-admin", isAuthenticated, isSuperAdmin, deleteAdmin);
router.put("/block-admin", isAuthenticated, isSuperAdmin, blockAdmin);
router.put("/block-user", isAuthenticated, isAdminOrSuperAdmin, blockUser);
module.exports = router;
