const express = require("express");
const router = express.Router();

const Job = require("../models/Job");

// =========================
// GET ALL JOBS
// =========================

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching jobs",
      error: error.message,
    });
  }
});

// =========================
// ADD NEW JOB
// =========================

router.post("/", async (req, res) => {
  try {
    const {
      company,
      position,
      status,
      location,
      jobUrl,
      notes,
    } = req.body;

    const job = await Job.create({
      company,
      position,
      status,
      location,
      jobUrl,
      notes,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({
      message: "Error adding job",
      error: error.message,
    });
  }
});

// =========================
// UPDATE JOB
// =========================

router.put("/:id", async (req, res) => {
  try {
    const {
      company,
      position,
      status,
      location,
      jobUrl,
      notes,
    } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        company,
        position,
        status,
        location,
        jobUrl,
        notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({
      message: "Error updating job",
      error: error.message,
    });
  }
});

// =========================
// DELETE JOB
// =========================

router.delete("/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting job",
      error: error.message,
    });
  }
});

module.exports = router;