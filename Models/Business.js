const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePicture: { type: String },
    coverPicture: { type: String },
    category: { type: String, required: true },
    description: { type: String },
    phone: { type: String, required: true },
    businessEmail: { type: String },
    website: { type: String },
    socialMedia: { type: String },
    gallery: { type: [String] },
    location: { type: String, required: true },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //   },
    // },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false },
    pendingModifications: [
      {
        details: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    keywords: { type: [String] },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// BusinessSchema.index({ location: "2dsphere" });
BusinessSchema.index({
  name: "text",
  category: "text",
  description: "text",
  keywords: "text",
});

module.exports = mongoose.model("Business", BusinessSchema);
