const express = require("express");
const router = express.Router();
const {
  addBusiness,
  updateBusiness,
  approveBusiness,
  verifyBusiness,
  claimBusiness,
} = require("../Controllers/businessController");
const { isAdmin, isAuthenticated } = require("../middleware/authmiddleware");
const upload = require("../middleware/multerConfig");

router.post("/add", isAuthenticated, upload, addBusiness);
router.put("/update/:id", isAuthenticated, upload, updateBusiness);
router.put("/approve/:id", isAdmin, approveBusiness);
router.put("/verify/:id", isAdmin, verifyBusiness);
router.put("/claim/:id", isAuthenticated, claimBusiness);

module.exports = router;
