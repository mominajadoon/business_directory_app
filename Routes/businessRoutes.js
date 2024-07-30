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
  addBusinessToFavorites,
  getBusinessById,
} = require("../Controllers/businessController");
const { isAdmin, isAuthenticated } = require("../middleware/authmiddleware");
const {
  getNotifications,
  markNotificationAsRead,
} = require("../Controllers/notificationController");

const upload = require("../utils/multerConfig");

router.post("/add", isAuthenticated, upload, addBusiness);
router.put("/update/:id", isAuthenticated, upload, updateBusiness);
// Route to claim ownership of a business
router.post("/claim/:id", isAuthenticated, claimOwnership);
router.get("/all", getAllBusinesses);
router.get("/search", searchBusinesses);
router.get("/geolocation", getGeolocation);
// Review routes
router.post("/:businessId/review", isAuthenticated, upload, addReview);
router.post("/review/:reviewId/comment", isAuthenticated, addComment);
router.get("/:businessId/reviews", getReviewsByBusiness);
// Route to fetch notifications for a user
// Notification routes
router.get("/notifications", isAuthenticated, getNotifications);
router.put(
  "/notifications/:notificationId/read",
  isAuthenticated,
  markNotificationAsRead
);
// Get business by ID from request body
router.get("/:id", getBusinessById);
// Route to add a business to favorites
router.post("/:businessId/favorite", isAuthenticated, addBusinessToFavorites);

module.exports = router;
//update
