const bcrypt = require("bcryptjs");
const Admin = require("../Models/Admin");
const jwt = require("jsonwebtoken");

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
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const payload = {
      user: {
        id: admin.id,
      },
    };
    //line added
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
