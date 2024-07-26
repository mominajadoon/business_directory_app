const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: Number },
    isVerified: { type: Boolean, default: false },
    role: { type: String, default: "user" },
    favoriteBusinesses: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    favoriteEvents: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    block: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
