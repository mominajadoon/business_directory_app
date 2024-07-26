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

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superAdmin") {
    return res.status(403).json({ msg: "Access denied: Spuer Admin only" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("Checking Admin Role:", req.user); // Added debug log

    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};
exports.isAdminOrSuperAdmin = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superAdmin")
  ) {
    return res
      .status(403)
      .json({ msg: "Access denied: Admins and Super Admins only" });
  }
  next();
};
