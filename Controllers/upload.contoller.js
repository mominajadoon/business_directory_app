const upload = require("../utils/multerConfig");
const util = require("util");

exports.uploadSingle = (req, res) => {
  res.json(req.file);
};

exports.uploadMultiple = (req, res) => {
  res.json(req.files);
};

exports.uploadSingleV2 = async (req, res) => {
  const uploadFile = util.promisify(upload.single("file"));
  try {
    await uploadFile(req, res);
    res.json(req.file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
