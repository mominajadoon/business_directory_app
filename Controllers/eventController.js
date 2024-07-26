const Events = require("../Models/Events");
const Event = require("../Models/Events");

const User = require("../Models/User");

exports.addEvent = async (req, res) => {
  const { image, description, name, date, time, location } = req.body;
  const createdBy = req.user.id;

  try {
    const newEvent = new Event({
      image,
      description,
      name,
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
  const { image, description, name, date, time, location } = req.body;

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
    event.name = name || event.name;
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

// Function to like an event
exports.likeEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if the user has already liked the event
    if (event.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: "Event already liked" });
    }

    // Add user's ID to the likes array
    event.likes.push(req.user.id);
    await event.save();

    res.json({ msg: "Event liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to comment on an event
exports.commentEvent = async (req, res) => {
  const eventId = req.params.id; // Assuming the event ID is passed in the URL parameters
  const { text } = req.body; // Assuming the comment text is sent in the request body

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Create a new comment object
    const newComment = {
      user: req.user.id,
      text,
    };

    // Add the new comment to the comments array
    event.comments.push(newComment);
    await event.save();

    res.json({ msg: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Events.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Server Error");
  }
};

// Function to add an event to user's favorites
exports.addEventToFavorites = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id; // Assuming req.user is populated by isAuthenticated middleware

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Check if the user exists and update their favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Add the event to user's favorites if not already added
    if (!user.favoriteEvents.includes(eventId)) {
      user.favoriteEvents.push(eventId);
      await user.save();
    }

    res.json({ msg: "Event added to favorites successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to highlight an event
exports.highlightEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.isHighlighted = true;
    await event.save();

    res.json({ msg: "Event highlighted successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to unhighlight an event
exports.unhighlightEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.isHighlighted = false;
    await event.save();

    res.json({ msg: "Event unhighlighted successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
