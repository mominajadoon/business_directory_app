const express = require("express");
const router = express.Router();
const {
  addEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  likeEvent,
  commentEvent,
} = require("../Controllers/eventController");
const { isAdmin, isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, addEvent);
router.put("/update/:id", isAuthenticated, updateEvent);
router.delete("/delete/:id", isAuthenticated, deleteEvent);
router.put("/approve/:id", isAdmin, approveEvent);
router.put("/like/:id", isAuthenticated, likeEvent);
router.post("/comment/:id", isAuthenticated, commentEvent);

module.exports = router;
