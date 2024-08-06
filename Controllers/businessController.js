const Business = require("../Models/Business");
const User = require("../Models/User");
const multer = require("multer");
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const Review = require("../Models/Reviews");
const Notification = require("../Models/Notifications");
const { createNotification } = require("../Controllers/notificationController");
const upload = require("../utils/multerConfig");

// exports.addBusiness = async (req, res) => {
//   console.log(req.files);

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

//   if (
//     !req.files ||
//     !req.files["profilePicture"] ||
//     !req.files["coverPicture"] ||
//     !req.files["gallery"]
//   ) {
//     return res.status(400).json({ msg: "All required files must be uploaded" });
//   }

//   const profilePicture = req.files["profilePicture"]
//     ? req.files["profilePicture"][0].location
//     : null;
//   const coverPicture = req.files["coverPicture"]
//     ? req.files["coverPicture"][0].location
//     : null;
//   const gallery = req.files["gallery"]
//     ? req.files["gallery"].map((file) => file.location)
//     : [];
//   let locationData = null;
//   if (
//     location &&
//     location.type === "Point" &&
//     location.coordinates &&
//     location.coordinates.length === 2
//   ) {
//     locationData = {
//       type: "Point",
//       coordinates: [
//         parseFloat(location.coordinates[0]),
//         parseFloat(location.coordinates[1]),
//       ],
//     };
//   } else {
//     return res.status(400).json({ msg: "Invalid location data" });
//   }
//   try {
//     const newBusiness = new Business({
//       name,
//       profilePicture,
//       coverPicture,
//       category,
//       description,
//       phone,
//       email,
//       website,
//       socialMedia,
//       gallery,
//       location: locationData,
//       owner: req.user.id,
//       isApproved: false,
//     });

//     await newBusiness.save();
//     res.json({ msg: "Business added, waiting for admin approval." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// };

exports.addBusiness = async (req, res) => {
  console.log(req.files);

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

  if (
    !req.files ||
    !req.files["profilePicture"] ||
    !req.files["coverPicture"] ||
    !req.files["gallery"]
  ) {
    return res.status(400).json({ msg: "All required files must be uploaded" });
  }

  const profilePicture = req.files["profilePicture"]
    ? req.files["profilePicture"][0].location
    : null;
  const coverPicture = req.files["coverPicture"]
    ? req.files["coverPicture"][0].location
    : null;
  const gallery = req.files["gallery"]
    ? req.files["gallery"].map((file) => file.location)
    : [];

  if (!location) {
    return res.status(400).json({ msg: "Location is required." });
  }

  try {
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
      location,
      owner: req.user.id,
      isApproved: false,
    });

    await newBusiness.save();
    res.json({
      msg: "Business added, waiting for admin approval.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateBusiness = async (req, res) => {
  const businessId = req.params.id; // Get business ID from URL parameters

  console.log(req.files); // Debugging

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
    // Find the existing business
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Update business details
    business.name = name || business.name;
    business.category = category || business.category;
    business.description = description || business.description;
    business.phone = phone || business.phone;
    business.email = email || business.email;
    business.website = website || business.website;
    business.socialMedia = socialMedia || business.socialMedia;

    // Process file uploads if provided
    if (req.files) {
      if (req.files["profilePicture"]) {
        business.profilePicture = req.files["profilePicture"][0].location;
      }
      if (req.files["coverPicture"]) {
        business.coverPicture = req.files["coverPicture"][0].location;
      }
      if (req.files["gallery"]) {
        business.gallery = req.files["gallery"].map((file) => file.location);
      }
    }

    // Update location if provided
    if (
      location &&
      location.type === "Point" &&
      location.coordinates &&
      location.coordinates.length === 2
    ) {
      business.location = {
        type: "Point",
        coordinates: [
          parseFloat(location.coordinates[0]),
          parseFloat(location.coordinates[1]),
        ],
      };
    }
    business.isApproved = false;

    // Save the updated business
    await business.save();
    res.json({ msg: "Business updated successfully", business });
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

    business.isApproved = !business.isApproved;
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
exports.getBusinessById = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    res.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
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
    console.log("Review saved:", newReview); // Log after saving review

    // Add the review to the business's reviews array
    business.reviews.push(newReview);
    await business.save();
    console.log("Business updated with review:", business); // Log after updating business

    // Trigger notification to business owner if the review is not by the owner
    if (business.owner.toString() !== userId) {
      await createNotification(business.owner, userId, "review", newReview._id);
      console.log("Notification created for business owner");
    }

    console.log("Review added successfully:", newReview); // Log after successful completion

    res.json({ msg: "Review added successfully", review: newReview });
  } catch (error) {
    console.error("Error adding review:", error);
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

    // Trigger notification to review owner if the comment is not by the review owner
    if (review.user.toString() !== userId) {
      await createNotification(review.user, userId, "comment", review._id);
    }

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

// Function to add a business to user's favorites
exports.addBusinessToFavorites = async (req, res) => {
  const { businessId } = req.params;
  const userId = req.user.id; // Assuming req.user is populated by isAuthenticated middleware

  try {
    // Check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    // Check if the user exists and update their favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Add the business to user's favorites if not already added
    if (!user.favoriteBusinesses.includes(businessId)) {
      user.favoriteBusinesses.push(businessId);
      await user.save();
    }

    res.json({ msg: "Business added to favorites successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to highlight a business
exports.highlightBusiness = async (req, res) => {
  const { businessId } = req.params;

  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    business.isHighlighted = true;
    await business.save();

    res.json({ msg: "Business highlighted successfully", business });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Function to unhighlight a business
exports.unhighlightBusiness = async (req, res) => {
  const { businessId } = req.params;

  try {
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    business.isHighlighted = false;
    await business.save();

    res.json({ msg: "Business unhighlighted successfully", business });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
