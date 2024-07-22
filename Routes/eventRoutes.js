const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");

const {
  addEvent,
  updateEvent,
  deleteEvent,
  likeEvent,
  commentEvent,
  getAllEvents,
  addEventToFavorites,
} = require("../Controllers/eventController");
const { isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, upload, addEvent);
router.put("/update/:id", isAuthenticated, upload, updateEvent);
router.delete("/delete/:id", isAuthenticated, deleteEvent);
// POST - Like an event
router.post("/:id/like", isAuthenticated, likeEvent);

// POST - Comment on an event
router.post("/:id/comment", isAuthenticated, commentEvent);
router.get("/all", getAllEvents);

// Route to add an event to favorites
router.post("/:eventId/favorite", isAuthenticated, addEventToFavorites);
//export
module.exports = router;
