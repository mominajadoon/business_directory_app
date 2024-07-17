const Business = require("../Models/Business");
const User = require("../Models/User");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

exports.addBusiness = async (req, res) => {
  const {
    name,
    category,
    description,
    phone,
    email,
    website,
    socialMedia,
    address,
    location,
  } = req.body;
  console.log("Authenticated User:", req.user);
  const ownerId = req.user.id; // Assuming req.user is populated by isAuthenticated middleware

  // Check if files are uploaded
  if (
    !req.files ||
    !req.files["profilePicture"] ||
    !req.files["coverPicture"] ||
    !req.files["gallery"]
  ) {
    return res.status(400).json({ msg: "All required files must be uploaded" });
  }

  // Retrieve file paths from req.files object provided by multer
  const profilePicture = req.files["profilePicture"][0].path;
  const coverPicture = req.files["coverPicture"][0].path;
  const gallery = req.files["gallery"].map((file) => file.path);

  try {
    if (
      !location ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({ msg: "Location coordinates are required" });
    }

    const newBusiness = new Business({
      name,
      profilePicture,
      coverPicture,
      category,
      description,
      phone,
      email,
      website,
      socialMedia,
      gallery,
      address,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      owner: ownerId,
      isApproved: false,
    });

    await newBusiness.save();
    res.json({ msg: "Business added, waiting for admin approval." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateBusiness = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    phone,
    email,
    website,
    socialMedia,
    address,
  } = req.body;

  let location;

  try {
    // Parse the location JSON string if it exists
    if (req.body.location) {
      location = JSON.parse(req.body.location);
      if (
        !location.type ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        return res.status(400).json({ msg: "Invalid location data" });
      }
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Handle file paths from req.files if present
    const profilePicture =
      req.files && req.files["profilePicture"]
        ? req.files["profilePicture"][0].path
        : business.profilePicture;
    const coverPicture =
      req.files && req.files["coverPicture"]
        ? req.files["coverPicture"][0].path
        : business.coverPicture;
    const gallery =
      req.files && req.files["gallery"]
        ? req.files["gallery"].map((file) => file.path)
        : business.gallery;

    // If files are not being uploaded, use the paths from the request body
    const profilePicturePath =
      profilePicture || req.body.profilePicture || business.profilePicture;
    const coverPicturePath =
      coverPicture || req.body.coverPicture || business.coverPicture;
    const galleryPaths =
      gallery.length > 0 ? gallery : req.body.gallery || business.gallery;

    // Apply the updates directly to the business document
    if (name) business.name = name;
    if (profilePicturePath) business.profilePicture = profilePicturePath;
    if (coverPicturePath) business.coverPicture = coverPicturePath;
    if (category) business.category = category;
    if (description) business.description = description;
    if (phone) business.phone = phone;
    if (email) business.email = email;
    if (website) business.website = website;
    if (socialMedia) business.socialMedia = socialMedia;
    if (galleryPaths) business.gallery = galleryPaths;
    if (address) business.address = address;
    if (location) business.location = location;

    await business.save();
    res.json({ msg: "Business updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Verify Business
exports.approveBusiness = async (req, res) => {
  const businessId = req.body.id;

  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    business.isApproved = true; // Update the field
    await business.save();

    res.json({ msg: "Business approved successfully", business });
  } catch (error) {
    console.error("Error approving business:", error);
    res.status(500).send("Server Error");
  }
};

exports.verifyBusiness = async (req, res) => {
  const businessId = req.body.id;

  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Your verification logic here
    business.isVerified = true;
    await business.save();

    return res
      .status(200)
      .json({ msg: "Business verified successfully", business });
  } catch (error) {
    console.error("Error verifying business:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Function to allow a user to claim ownership of a business
exports.claimOwnership = async (req, res) => {
  const { id } = req.params; // Assuming the business ID is passed in the URL parameters

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Check if the business is already claimed
    if (business.owner) {
      return res.status(400).json({ msg: "Business is already claimed" });
    }

    // Assign current user as the owner of the business
    business.owner = req.user.id;
    await business.save();

    res.json({ msg: "Ownership claimed successfully", business });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
// Transfer Business Ownership
// Function to allow admin to transfer ownership of a business
exports.transferOwnership = async (req, res) => {
  const { id } = req.params; // Assuming the business ID is passed in the URL parameters
  const { newOwnerId } = req.body; // Assuming the new owner's ID is sent in the request body

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Check if the current user is an admin (you should have isAdmin middleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    // Find the new owner by their ID
    const newOwner = await User.findById(id);

    if (!newOwner) {
      return res.status(404).json({ msg: "New owner not found" });
    }

    // Assign the new owner to the business
    business.owner = newOwnerId;
    await business.save();

    res.json({ msg: "Ownership transferred successfully", business });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).send("Server Error");
  }
};
