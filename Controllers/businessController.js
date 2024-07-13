const Business = require("../Models/Business");
const User = require("../Models/User");

exports.addBusiness = async (req, res) => {
  const {
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
    location,
  } = req.body;

  const ownerId = req.user.id; // Assuming req.user is populated by authentication middleware

  try {
    if (!location || !location.coordinates) {
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
        coordinates: location.coordinates
          .split(",")
          .map((coord) => parseFloat(coord.trim())),
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
    location,
  } = req.body;

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const profilePicture = req.files["profilePicture"]
      ? req.files["profilePicture"][0].path
      : business.profilePicture;
    const coverPicture = req.files["coverPicture"]
      ? req.files["coverPicture"][0].path
      : business.coverPicture;
    const gallery = req.files["gallery"]
      ? req.files["gallery"].map((file) => file.path)
      : business.gallery;

    business.pendingModifications = {
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
      location,
    };

    await business.save();
    res.json({ msg: "Business update requested, waiting for admin approval." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.approveBusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    if (business.pendingModifications) {
      business.set(business.pendingModifications);
      business.pendingModifications = {};
    }

    business.isApproved = true;
    await business.save();

    res.json({ msg: "Business approved." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.verifyBusiness = async (req, res) => {
  const { id } = req.params;

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    business.isVerified = true;
    await business.save();

    res.json({ msg: "Business verified." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.claimBusiness = async (req, res) => {
  const { id } = req.params;
  const newOwnerId = req.user.id;

  try {
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ msg: "Business not found" });
    }

    business.owner = newOwnerId;
    await business.save();

    res.json({ msg: "Business ownership transferred." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
