const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const jobRoutes = require("./routes/jobRoutes");

console.log("jobRoutes loaded:", typeof jobRoutes);

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("TEST SERVER 12345");
});

// Job routes
app.use("/api/jobs", jobRoutes);

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });