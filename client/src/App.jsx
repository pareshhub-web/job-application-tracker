import { useEffect, useState } from "react";
import API from "./services/api";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState([]);

  // =========================
  // FORM FIELDS
  // =========================

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("Applied");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);

  // =========================
  // MESSAGE
  // =========================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================
  // LOADING
  // =========================

  const [loading, setLoading] = useState(true);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // =========================
  // SEARCH / FILTER / SORT
  // =========================

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  // =========================
  // FETCH JOBS
  // =========================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await API.get("/jobs");

      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);

      showMessage(
        "Failed to load jobs.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STATISTICS
  // =========================

  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(
    (job) => job.status === "Applied"
  ).length;

  const interviewJobs = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const selectedJobs = jobs.filter(
    (job) => job.status === "Selected"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  // =========================
  // ANALYTICS
  // =========================

  const interviewRate =
    totalJobs > 0
      ? ((interviewJobs / totalJobs) * 100).toFixed(1)
      : "0.0";

  const selectionRate =
    totalJobs > 0
      ? ((selectedJobs / totalJobs) * 100).toFixed(1)
      : "0.0";

  const rejectionRate =
    totalJobs > 0
      ? ((rejectedJobs / totalJobs) * 100).toFixed(1)
      : "0.0";

  const progressRate =
    totalJobs > 0
      ? (
          ((interviewJobs + selectedJobs) /
            totalJobs) *
          100
        ).toFixed(1)
      : "0.0";

  // =========================
  // SEARCH + FILTER + SORT
  // =========================

  const filteredJobs = [...jobs]
    .filter((job) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        job.company
          ?.toLowerCase()
          .includes(search) ||
        job.position
          ?.toLowerCase()
          .includes(search) ||
        job.location
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        filterStatus === "All" ||
        job.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(
            b.date || b.createdAt
          ) -
          new Date(
            a.date || a.createdAt
          )
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(
            a.date || a.createdAt
          ) -
          new Date(
            b.date || b.createdAt
          )
        );
      }

      if (sortOrder === "az") {
        return (a.company || "").localeCompare(
          b.company || ""
        );
      }

      if (sortOrder === "za") {
        return (b.company || "").localeCompare(
          a.company || ""
        );
      }

      return 0;
    });

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setCompany("");
    setPosition("");
    setStatus("Applied");
    setLocation("");
    setJobUrl("");
    setNotes("");
    setEditingId(null);
  };

  // =========================
  // ADD JOB
  // =========================

  const addJob = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/jobs", {
        company,
        position,
        status,
        location,
        jobUrl,
        notes,
      });

      setJobs((prevJobs) => [
        response.data,
        ...prevJobs,
      ]);

      resetForm();

      showMessage(
        "Job added successfully!"
      );
    } catch (error) {
      console.error(
        "Error adding job:",
        error
      );

      showMessage(
        "Failed to add job.",
        "error"
      );
    }
  };

  // =========================
  // START EDIT
  // =========================

  const startEdit = (job) => {
    setEditingId(job._id);

    setCompany(job.company || "");
    setPosition(job.position || "");
    setStatus(
      job.status || "Applied"
    );
    setLocation(job.location || "");
    setJobUrl(job.jobUrl || "");
    setNotes(job.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE JOB
  // =========================

  const updateJob = async (e) => {
    e.preventDefault();

    try {
      const response = await API.put(
        `/jobs/${editingId}`,
        {
          company,
          position,
          status,
          location,
          jobUrl,
          notes,
        }
      );

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === editingId
            ? response.data
            : job
        )
      );

      resetForm();

      showMessage(
        "Job updated successfully!"
      );
    } catch (error) {
      console.error(
        "Error updating job:",
        error
      );

      showMessage(
        "Failed to update job.",
        "error"
      );
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this job application?"
      );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/jobs/${id}`
      );

      setJobs((prevJobs) =>
        prevJobs.filter(
          (job) => job._id !== id
        )
      );

      if (editingId === id) {
        resetForm();
      }

      showMessage(
        "Job deleted successfully!"
      );
    } catch (error) {
      console.error(
        "Error deleting job:",
        error
      );

      showMessage(
        "Failed to delete job.",
        "error"
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="app">
      <div className="container">

        {/* =========================
            SUCCESS / ERROR MESSAGE
        ========================= */}

        {message && (
          <div
            className={`message ${messageType}`}
          >
            {message}
          </div>
        )}

        {/* =========================
            HEADER
        ========================= */}

        <header className="header">

          <div>
            <h1>
              Job Application Tracker
            </h1>

            <p>
              Manage and track your job
              applications
            </p>
          </div>

          <div className="total-card">
            <span>
              {totalJobs}
            </span>

            <small>
              Total Jobs
            </small>
          </div>

        </header>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon total-icon">
              📋
            </div>

            <div>
              <span>
                Total Jobs
              </span>

              <strong>
                {totalJobs}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon applied-icon">
              📨
            </div>

            <div>
              <span>
                Applied
              </span>

              <strong>
                {appliedJobs}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon interview-icon">
              🎯
            </div>

            <div>
              <span>
                Interview
              </span>

              <strong>
                {interviewJobs}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon selected-icon">
              ✅
            </div>

            <div>
              <span>
                Selected
              </span>

              <strong>
                {selectedJobs}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected-icon">
              ❌
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {rejectedJobs}
              </strong>
            </div>
          </div>

        </section>

        {/* =========================
            APPLICATION ANALYTICS
        ========================= */}

        <section className="analytics-card">

          <div className="section-title">

            <h2>
              Application Analytics
            </h2>

            <p>
              Track your application
              performance
            </p>

          </div>

          <div className="analytics-grid">

            <div className="analytics-item">
              <div>🎯</div>

              <span>
                Interview Rate
              </span>

              <strong>
                {interviewRate}%
              </strong>
            </div>

            <div className="analytics-item">
              <div>🏆</div>

              <span>
                Selection Rate
              </span>

              <strong>
                {selectionRate}%
              </strong>
            </div>

            <div className="analytics-item">
              <div>❌</div>

              <span>
                Rejection Rate
              </span>

              <strong>
                {rejectionRate}%
              </strong>
            </div>

            <div className="analytics-item">
              <div>📈</div>

              <span>
                Progress Rate
              </span>

              <strong>
                {progressRate}%
              </strong>
            </div>

          </div>

        </section>

        {/* =========================
            ADD / EDIT JOB
        ========================= */}

        <section className="form-card">

          <div className="section-title">

            <h2>
              {editingId
                ? "Edit Job"
                : "Add New Job"}
            </h2>

            <p>
              {editingId
                ? "Update your application details"
                : "Add a new job application to your tracker"}
            </p>

          </div>

          <form
            className="job-form"
            onSubmit={
              editingId
                ? updateJob
                : addJob
            }
          >

            <div className="input-group">
              <label>
                Company
              </label>

              <input
                type="text"
                placeholder="e.g. Google"
                value={company}
                onChange={(e) =>
                  setCompany(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="input-group">
              <label>
                Position
              </label>

              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                value={position}
                onChange={(e) =>
                  setPosition(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="input-group">
              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option value="Applied">
                  Applied
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Selected">
                  Selected
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

            <div className="input-group">
              <label>
                Location
              </label>

              <input
                type="text"
                placeholder="e.g. Mumbai / Remote"
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label>
                Job URL
              </label>

              <input
                type="url"
                placeholder="https://example.com/job"
                value={jobUrl}
                onChange={(e) =>
                  setJobUrl(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group notes-group">
              <label>
                Notes
              </label>

              <textarea
                placeholder="Add notes about this application..."
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-buttons">

              <button
                className="primary-btn"
                type="submit"
              >
                {editingId
                  ? "Update Job"
                  : "Add Job"}
              </button>

              {editingId && (
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =========================
            APPLICATIONS
        ========================= */}

        <section className="applications-section">

          <div className="applications-header">

            <div>
              <h2>
                Your Applications
              </h2>

              <p>
                {filteredJobs.length === 1
                  ? "1 application"
                  : `${filteredJobs.length} applications`}
              </p>
            </div>

            <span>
              {filteredJobs.length} of{" "}
              {totalJobs}
            </span>

          </div>

          {/* =========================
              SEARCH / FILTER / SORT
          ========================= */}

          <div className="filters">

            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search company, position or location"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Applied">
                Applied
              </option>

              <option value="Interview">
                Interview
              </option>

              <option value="Selected">
                Selected
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>

            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value
                )
              }
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="az">
                Company A-Z
              </option>

              <option value="za">
                Company Z-A
              </option>

            </select>

          </div>

          {/* =========================
              JOB LIST
          ========================= */}

          {loading ? (

            <div className="loading-state">

              <div className="loading-spinner"></div>

              <h3>
                Loading applications...
              </h3>

              <p>
                Please wait while we load
                your applications.
              </p>

            </div>

          ) : filteredJobs.length === 0 ? (

            <div className="empty-state">

              <h3>
                {jobs.length === 0
                  ? "No jobs found"
                  : "No matching jobs"}
              </h3>

              <p>
                {jobs.length === 0
                  ? "Add your first job application above."
                  : "Try changing your search or status filter."}
              </p>

            </div>

          ) : (

            <div className="jobs-grid">

              {filteredJobs.map(
                (job) => (

                  <div
                    className="job-card"
                    key={job._id}
                  >

                    {/* CARD TOP */}

                    <div className="job-card-top">

                      <div className="company-icon">

                        {job.company
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>

                      <span
                        className={`status-badge ${job.status?.toLowerCase()}`}
                      >
                        {job.status}
                      </span>

                    </div>

                    {/* JOB INFORMATION */}

                    <div className="job-info">

                      <h3>
                        {job.position}
                      </h3>

                      <p>
                        {job.company}
                      </p>

                      {job.location && (
                        <div className="job-location">
                          📍 {job.location}
                        </div>
                      )}

                      {(job.date ||
                        job.createdAt) && (
                        <small className="job-date">
                          🗓️ Applied on:{" "}
                          {new Date(
                            job.date ||
                              job.createdAt
                          ).toLocaleDateString()}
                        </small>
                      )}

                      {job.notes && (
                        <div className="job-notes">
                          📝 {job.notes}
                        </div>
                      )}

                      {job.jobUrl && (
                        <div className="job-link">

                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🔗 View Job
                          </a>

                        </div>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="job-actions">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          startEdit(job)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteJob(
                            job._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>
    </div>
  );
}

export default App;