const Notification = require("../Models/Notifications");

// Function to create a notification
const createNotification = async (recipient, sender, type, entityId) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      entityId,
    });
    await notification.save();
    console.log("Notification created:", notification); // Add debug logging
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};
// Function to fetch notifications for a user
// Function to fetch notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is in req.user
    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "username")
      .populate("review", "text") // Populate additional fields as needed
      .populate("event", "name"); // Populate additional fields as needed

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Server Error");
  }
};

// Function to mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
};
