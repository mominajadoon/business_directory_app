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

router.post("/add", addEvent);
router.put("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);
router.put("/approve/:id", approveEvent);
router.put("/like/:id", likeEvent);
router.post("/comment/:id", commentEvent);
//export
module.exports = router;
