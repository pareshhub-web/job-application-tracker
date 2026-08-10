import axios from "axios";

const API = axios.create({
  baseURL: "https://job-application-tracker-rsys.onrender.com/api",
});

export default API;