const express = require("express");
const router = express.Router();
const {
  addEvent,
  updateEvent,
  deleteEvent,
  likeEvent,
  commentEvent,
} = require("../Controllers/eventController");
const { isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, addEvent);
router.put("/update/:id", isAuthenticated, updateEvent);
router.delete("/delete/:id", isAuthenticated, deleteEvent);
// POST - Like an event
router.post("/:id/like", isAuthenticated, likeEvent);

// POST - Comment on an event
router.post("/:id/comment", isAuthenticated, commentEvent);
//export
module.exports = router;
