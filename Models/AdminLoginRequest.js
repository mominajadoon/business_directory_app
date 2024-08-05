const mongoose = require("mongoose");

const AdminLoginRequestSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  phone: { type: String, required: true },
});

module.exports = mongoose.model("AdminLoginRequest", AdminLoginRequestSchema);
