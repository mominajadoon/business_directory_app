const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes.js");
const businessRoutes = require("./Routes/businessRoutes.js");
const eventRoutes = require("./Routes/eventRoutes.js");
const adminRoutes = require("./Routes/adminRoutes.js");

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/admin", adminRoutes); // Use admin routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
