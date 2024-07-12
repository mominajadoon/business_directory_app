const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: Number },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
