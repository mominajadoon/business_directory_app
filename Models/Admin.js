const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: Number },
  role: { type: String, default: "admin" },
});

module.exports = mongoose.model("Admin", AdminSchema);
