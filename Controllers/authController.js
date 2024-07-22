const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpToUser, apiClient } = require("../config/nimba");
const Business = require("../Models/Business");
const Event = require("../Models/Events");

// Register User
exports.register = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // Validate input fields
    if (!name || !phone || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user instance with null otp field
    let otp = null;
    user = new User({ name, phone, password, otp });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Send OTP
    await sendOtpToUser(user.phone); // Assuming sendOtpToUser accepts phone number

    res.json({ msg: "User registered. OTP sent for verification." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Login User
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Validate input fields
    if (!phone || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your account" });
    }

    // Generate JWT
    // Generate JWT without expiration
    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: "Login failed!" });
  }
};
// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.otp = null;
    user.isVerified = true;
    await user.save();

    res.json({ msg: "Otp verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Resend Otp
exports.resendOtp = async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await sendOtpToUser(phone);
    await user.save();

    res.json({ msg: "Otp resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate OTP and send it to the user
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();

    await sendOtpToUser(user.phone, `Your verification code is ${otp}`);

    res.json({ msg: "OTP sent to your phone for password reset" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.newPassword = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Validate input fields
    if (!phone || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ msg: "User Doesn't exist" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password field
    await User.findOneAndUpdate(
      { phone },
      { $set: { password: hashedPassword, otp: null } },
      { new: true }
    );

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ msg: "Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
};
// Function to fetch user's own businesses
exports.getMyBusinesses = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is in req.user
    const businesses = await Business.find({ owner: userId });
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    res.status(500).send("Server Error");
  }
};

// Function to fetch user's own events
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is in req.user
    const events = await Event.find({ createdBy: userId });
    res.json(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).send("Server Error");
  }
};
