const express = require("express");
const router = express.Router();
const {
  addBusiness,
  updateBusiness,
  claimOwnership,
} = require("../Controllers/businessController");
const multipleUpload = require("../middleware/multerConfig");
const { isAdmin, isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, multipleUpload, addBusiness);
router.put("/update/:id", isAuthenticated, multipleUpload, updateBusiness);
// Route to claim ownership of a business
router.post("/claim/:id", isAuthenticated, claimOwnership);

module.exports = router;
