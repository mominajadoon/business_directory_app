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
const { isAuthenticated } = require("../middleware/authmiddleware");

router.post("/add", isAuthenticated, addEvent);
router.put("/update/:id", isAuthenticated, updateEvent);
router.delete("/delete/:id", isAuthenticated, deleteEvent);
// router.put("/approve/:id", approveEvent);
router.put("/like/:id", likeEvent);
router.post("/comment/:id", commentEvent);
//export
module.exports = router;
