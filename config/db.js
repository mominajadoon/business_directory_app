const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      dbName: "businessApp",
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
