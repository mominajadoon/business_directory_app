const express = require("express");
const router = express.Router();
const {
  addBusiness,
  updateBusiness,
  claimOwnership,
  getAllBusinesses,
  searchBusinesses,
  getGeolocation,
  addReview,
  addComment,
  getReviewsByBusiness,
} = require("../Controllers/businessController");
const multipleUpload = require("../middleware/multerConfig");
const { isAdmin, isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, multipleUpload, addBusiness);
router.put("/update/:id", isAuthenticated, multipleUpload, updateBusiness);
// Route to claim ownership of a business
router.post("/claim/:id", isAuthenticated, claimOwnership);
router.get("/all", getAllBusinesses);
router.get("/search", searchBusinesses);
router.get("/geolocation", getGeolocation);
// Review routes
router.post("/:businessId/review", isAuthenticated, addReview);
router.post("/review/:reviewId/comment", isAuthenticated, addComment);
router.get("/:businessId/reviews", getReviewsByBusiness);

module.exports = router;
