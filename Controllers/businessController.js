const Business = require("../Models/Business");
const User = require("../Models/User");
const multer = require("multer");
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const Review = require("../Models/Reviews");

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

exports.searchBusinesses = async (req, res) => {
  const { name, category, keywords, lng, lat, radius = 5000 } = req.query;

  try {
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    }
    if (category) {
      query.category = { $regex: category, $options: "i" }; // Case-insensitive search
    }
    if (keywords) {
      query.description = { $regex: keywords, $options: "i" }; // Case-insensitive search
    }
    if (lng && lat) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / 6378.1], // radius in km
        },
      };
    }

    const businesses = await Business.find(query);
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).send("Server Error");
  }
};

exports.getGeolocation = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ msg: "Address is required" });
  }

  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return res.json({ location });
    } else {
      return res.status(404).json({ msg: "Location not found" });
    }
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return res.status(500).json({ msg: "Server Error" });
  }
};

// Function to add a review to a business
exports.addReview = async (req, res) => {
  const { businessId } = req.params;
  const { text, rating, images } = req.body;
  const userId = req.user.id; // Assuming req.user is populated by isAuthenticated middleware

  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    const newReview = new Review({
      user: userId,
      business: businessId,
      text,
      rating,
      images,
    });

    await newReview.save();

    // Add the review to the business's reviews array
    business.reviews.push(newReview);
    await business.save();

    res.json({ msg: "Review added successfully", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to add a comment to a review
exports.addComment = async (req, res) => {
  const { reviewId } = req.params;
  const { text } = req.body;
  const userId = req.user.id; // Assuming req.user is populated by isAuthenticated middleware

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    const newComment = {
      user: userId,
      text,
    };

    review.comments.push(newComment);
    await review.save();

    res.json({ msg: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to fetch all reviews for a business
exports.getReviewsByBusiness = async (req, res) => {
  const { businessId } = req.params;

  try {
    const reviews = await Review.find({ business: businessId }).populate(
      "user",
      "username"
    ); // Populate user details in the review

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
