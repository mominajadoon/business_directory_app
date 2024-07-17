const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    description: { type: String, required: true },
    eventName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
