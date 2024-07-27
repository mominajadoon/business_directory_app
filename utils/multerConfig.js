const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3 = require("../utils/awsConfig");

// Define storage for each field if necessary
const storage = multerS3({
  s3,
  acl: "public-read",
  bucket: process.env.S3_BUCKET_NAME,
  key: function (req, file, cb) {
    const fileName = `${Date.now()}_${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  // No limits property here means no file size limit
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
  { name: "image", maxCount: 1 },
]);

module.exports = upload;
