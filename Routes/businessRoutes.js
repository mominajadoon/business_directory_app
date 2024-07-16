const express = require("express");
const router = express.Router();
const {
  addBusiness,
  updateBusiness,
  approveBusiness,
  verifyBusiness,
  claimBusiness,
} = require("../Controllers/businessController");
const multipleUpload = require("../middleware/multerConfig");
const { isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, multipleUpload, addBusiness);
router.put("/update/:id", isAuthenticated, multipleUpload, updateBusiness);
// router.put("/approve/:id", approveBusiness);
// router.put("/verify/:id", verifyBusiness);
// router.put("/claim/:id", claimBusiness);

module.exports = router;
