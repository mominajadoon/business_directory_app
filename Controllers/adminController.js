const bcrypt = require("bcryptjs");
const Admin = require("../Models/Admin");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Business = require("../Models/Business");
const Event = require("../Models/Events");
const AdminLoginRequest = require("../Models/AdminLoginRequest");

// register
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

    // Check if admin is blocked
    if (admin.block) {
      return res.status(403).json({ msg: "Admin is blocked" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Direct login for superAdmin
    if (admin.role === "superAdmin") {
      const payload = {
        user: {
          id: admin.id,
          role: admin.role,
        },
      };

      jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
        if (err) throw err;
        return res.status(200).json({ token, user: payload.user });
      });
    } else {
      // For other roles, proceed with authStatus logic
      if (admin.authStatus === "loggedOut") {
        // Create a new login request
        const loginRequest = new AdminLoginRequest({
          adminId: admin._id,
          phone: admin.phone,
        });

        await loginRequest.save();

        // Change authStatus to Pending
        await Admin.findOneAndUpdate({ phone }, { authStatus: "pending" });

        return res
          .status(200)
          .json({ msg: "Login request submitted and pending approval" });
      }

      // Check if admin's status is pending
      if (admin.authStatus === "pending") {
        return res
          .status(403)
          .json({ msg: "Login request is pending approval" });
      }

      // Generate JWT with role if status is approved
      if (admin.authStatus === "approved") {
        const payload = {
          user: {
            id: admin.id,
            role: admin.role,
          },
        };

        jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, user: payload.user });
        });
      } else {
        // This else clause handles any other status that is not 'pending' or 'approved'
        return res.status(400).json({ msg: "Admin status is not approved" });
      }
    }
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
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete associated events and businesses
    await Event.deleteMany({ userId: user._id });
    await Business.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ msg: "User and associated records deleted successfully" });
  } catch (error) {
    console.error("Error deleting user and associated records:", error);
    res.status(500).send("Server Error");
  }
};

// // Function for admin to edit a business
// exports.adminEditBusiness = async (req, res) => {
//   const { id } = req.params;

//   const updates = req.body;

//   console.log("Request Body:", req.body);

//   try {
//     // Find the business
//     const business = await Business.findById(id);

//     // Log before saving
//     console.log("Before Save:", business);

//     if (!business) {
//       return res.status(404).json({ msg: "Business not found" });
//     }

//     // Apply updates
//     Object.keys(updates).forEach((key) => {
//       if (updates[key] !== undefined) {
//         business[key] = updates[key];
//       }
//     });

//     const updatedBuiness = await Business.findByIdAndUpdate({
//       //
//     });

//     // Save the business
//     await updatedBuiness.save();

//     // Log after saving
//     console.log("After Save:", business);

//     // Respond with the updated business
//     res.json({ msg: "Business updated successfully", business });
//   } catch (error) {
//     console.error("Error updating business:", error);
//     res.status(500).send("Server Error");
//   }
// };

// for superAdmin  to get all admins

// for all login requests
exports.getAllAdminLoginRequests = async (req, res) => {
  try {
    const pendingLogins = await Admin.find({ authStatus: "pending" });
    res.status(200).json(pendingLogins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.approveAdminLoginRequest = async (req, res) => {
  const { adminId } = req.body;

  try {
    const admin = await Admin.findOneAndUpdate(
      { _id: adminId },
      { authStatus: "approved" },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ msg: "Admin Not Found!" });
    }

    res.status(200).json({ msg: "Login Request approved" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.rejectAdminLoginRequest = async (req, res) => {
  const { adminId } = req.body;

  try {
    const admin = await Admin.findOneAndUpdate(
      { _id: adminId },
      { authStatus: "loggedOut" },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ msg: "Admin Not Found!" });
    }

    res.status(200).json({ msg: "Request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// delete admin by super admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.body; // Get ID from request body

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    await Admin.findByIdAndDelete(id);
    res.json({ msg: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Block or unblock admins by super admin
exports.blockAdmin = async (req, res) => {
  const { id } = req.body;

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Toggle the block field
    admin.block = !admin.block;
    await admin.save();

    res.json({
      msg: `Admin block status set to ${admin.block ? "blocked" : "unblocked"}`,
      admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.blockUser = async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Toggle the block field
    user.block = !user.block;
    await user.save();

    res.json({
      msg: `User block status set to ${user.block ? "blocked" : "unblocked"}`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.EditBusiness = async (req, res) => {
  const { id: businessId } = req.body;

  const {
    name,
    category,
    description,
    phone,
    email,
    website,
    socialMedia,
    location,
  } = req.body;

  try {
    // Prepare the update data
    const updateData = {};

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (website) updateData.website = website;
    if (socialMedia) updateData.socialMedia = socialMedia;

    // Process file uploads if provided
    if (req.files) {
      if (req.files["profilePicture"]) {
        updateData.profilePicture = req.files["profilePicture"][0].location;
      }
      if (req.files["coverPicture"]) {
        updateData.coverPicture = req.files["coverPicture"][0].location;
      }
      if (req.files["gallery"]) {
        updateData.gallery = req.files["gallery"].map((file) => file.location);
      }
    }

    // Update location if provided
    if (
      location &&
      location.type === "Point" &&
      location.coordinates &&
      location.coordinates.length === 2
    ) {
      updateData.location = {
        type: "Point",
        coordinates: [
          parseFloat(location.coordinates[0]),
          parseFloat(location.coordinates[1]),
        ],
      };
    }

    // Set isApproved to false after update
    updateData.isApproved = true;

    // Find and update the business
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ msg: "Business not found" });
    }

    res.json({
      msg: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// exports.EditBusiness = async (req, res) => {
//   const { id: businessId } = req.body;

//   const {
//     name,
//     category,
//     description,
//     phone,
//     email,
//     website,
//     socialMedia,
//     location,
//   } = req.body;

//   try {
//     // Find the existing business
//     const business = await Business.findById(businessId);

//     if (!business) {
//       return res.status(404).json({ msg: "Business not found" });
//     }

//     // Update business details
//     if (name) business.name = name;
//     if (category) business.category = category;
//     if (description) business.description = description;
//     if (phone) business.phone = phone;
//     if (email) business.email = email;
//     if (website) business.website = website;
//     if (socialMedia) business.socialMedia = socialMedia;

//     // Process file uploads if provided
//     if (req.files) {
//       if (req.files["profilePicture"]) {
//         business.profilePicture = req.files["profilePicture"][0].location;
//       }
//       if (req.files["coverPicture"]) {
//         business.coverPicture = req.files["coverPicture"][0].location;
//       }
//       if (req.files["gallery"]) {
//         business.gallery = req.files["gallery"].map((file) => file.location);
//       }
//     }

//     // Update location if provided
//     if (
//       location &&
//       location.type === "Point" &&
//       location.coordinates &&
//       location.coordinates.length === 2
//     ) {
//       business.location = {
//         type: "Point",
//         coordinates: [
//           parseFloat(location.coordinates[0]),
//           parseFloat(location.coordinates[1]),
//         ],
//       };
//     }

//     // Set isApproved to false after update
//     business.isApproved = true;

//     // Save the updated business
//     await business.save();
//     res.json({ msg: "Business updated successfully", business });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// };

exports.deleteBusiness = async (req, res) => {
  const { id: businessId } = req.body;

  try {
    // Find the business by ID
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Delete the business
    await Business.deleteOne({ _id: businessId });
    res.json({ msg: "Business deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.deleteEvent = async (req, res) => {
  const { id: eventId } = req.body; // Get event ID from the request body

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Delete the event
    await Event.deleteOne({ _id: eventId });
    res.json({ msg: "Event deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.verifyEvent = async (req, res) => {
  const { id: eventId } = req.body;

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Verify the event
    event.isVerified = true;

    // Save the updated event
    await event.save();
    res.json({ msg: "Event verified successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.editEvent = async (req, res) => {
  const { id, image, description, name, date, time, location } = req.body;

  try {
    // Find the event by id
    let event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Update the event fields
    event.image = image || event.image;
    event.description = description || event.description;
    event.name = name || event.name;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;

    await event.save();

    res.json({ msg: "Event updated successfully", event });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
