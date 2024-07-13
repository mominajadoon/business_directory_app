const jwt = require("jsonwebtoken");
const User = require("../Models/User");

exports.isAuthenticated = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(401)
        .json({ msg: "User not found, authorization denied" });
    }

    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin resource, access denied" });
  }
  next();
};
