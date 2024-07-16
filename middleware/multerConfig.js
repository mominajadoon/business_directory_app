const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const multipleUpload = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "coverPicture", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

module.exports = multipleUpload;
