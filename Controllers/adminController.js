const bcrypt = require("bcryptjs");
const Admin = require("../Models/Admin");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Business = require("../Models/Business");

exports.registerAdmin = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // Validate input fields
    if (!name || !phone || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ phone });

    if (admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    // Create new admin instance with null otp field
    admin = new Admin({ name, phone, password, role: "admin" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // Save admin to database
    await admin.save();

    res.json({ msg: "Admin registered." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Login User
exports.loginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Validate input fields
    if (!phone || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user exists
    const admin = await Admin.findOne({ phone });

    if (!admin) {
      return res.status(400).json({ msg: "Admin Not Found!" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT with role
    const payload = {
      user: {
        id: admin.id,
        role: admin.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      // Remove expiresIn to not set expiration time
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: payload.user });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.body;

  try {
    // Check if user exists
    const user = await User.findById({ id });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete associated events and businesses
    await Event.deleteMany({ userId: user._id });

    await Business.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete({ id });

    res.json({ msg: "User and associated records deleted successfully" });
  } catch (error) {
    console.error("Error deleting user and associated records:", error);
    res.status(500).send("Server Error");
  }
};

// Function for admin to edit a business
exports.adminEditBusiness = async (req, res) => {
  const { id } = req.params;

  const updates = req.body;

  console.log("Request Body:", req.body);

  try {
    // Find the business
    const business = await Business.findById(id);

    // Log before saving
    console.log("Before Save:", business);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        business[key] = updates[key];
      }
    });

    const updatedBuiness = await Business.findByIdAndUpdate({
      //
    });

    // Save the business
    await updatedBuiness.save();

    // Log after saving
    console.log("After Save:", business);

    // Respond with the updated business
    res.json({ msg: "Business updated successfully", business });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).send("Server Error");
  }
};

// for superAdmin  to get all admins

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
