const Event = require("../Models/Events");

exports.addEvent = async (req, res) => {
  const { image, description } = req.body;
  const createdBy = req.user.id; // Assuming you have user ID in request after authentication

  try {
    const newEvent = new Event({
      image,
      description,
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
  const { image, description } = req.body;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Only the creator can update the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    event.image = image || event.image;
    event.description = description || event.description;

    await event.save();
    res.json({ msg: "Event updated, waiting for admin approval." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Only the creator can delete the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await event.remove();
    res.json({ msg: "Event removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.approveEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    event.isApproved = true;
    await event.save();

    res.json({ msg: "Event approved." });
  } catch (error) {
    console.error(error);
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
