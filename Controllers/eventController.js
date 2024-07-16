const Event = require("../Models/Events");

exports.addEvent = async (req, res) => {
  const { image, description, eventName, date, time, location } = req.body;
  const createdBy = req.user.id;

  try {
    const newEvent = new Event({
      image,
      description,
      eventName,
      date,
      time,
      location,
      createdBy,
      isApproved: false,
    });

    await newEvent.save();
    res.json({ msg: "Event added, waiting for admin approval." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { image, description, eventName, date, time, location } = req.body;

  try {
    // Find the event by id
    let event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if the user updating the event is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Update the event fields
    event.image = image || event.image;
    event.description = description || event.description;
    event.eventName = eventName || event.eventName;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;

    await event.save();

    res.json({ msg: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
//delete
// Delete an event
// Function to delete an event
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id; // Assuming the event ID is passed in the URL parameters

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if the user has permission to delete the event (if required)
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized to delete this event" });
    }

    // Delete the event from the database using findByIdAndDelete
    await Event.findByIdAndDelete(eventId);

    res.json({ msg: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
// Approved event
exports.approveEvent = async (req, res) => {
  const eventId = req.body.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Business not found" });
    }

    event.isApproved = true; // Update the field
    await event.save();

    res.json({ msg: "Business approved successfully", event });
  } catch (error) {
    console.error("Error approving business:", error);
    res.status(500).send("Server Error");
  }
};

exports.likeEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if the event is already liked by this user
    if (event.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "Event already liked" });
    }

    event.likes.push(req.user.id);
    await event.save();

    res.json({ msg: "Event liked." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.commentEvent = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    event.comments.push(newComment);
    await event.save();

    res.json({ msg: "Comment added." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
