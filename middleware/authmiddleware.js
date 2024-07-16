// authmiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Admin = require("../Models/Admin");

exports.isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    let user = await User.findById(decoded.user.id);
    if (!user) {
      user = await Admin.findById(decoded.user.id);
    }

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;
    console.log("Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};
