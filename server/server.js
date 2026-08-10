const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const jobRoutes = require("./routes/jobRoutes");
console.log("jobRoutes loaded:", typeof jobRoutes);

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("TEST SERVER 12345");
});

app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("TEST SERVER 12345");
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });