import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // withCredentials: true,    // Use this if your backend uses cookies/sessions
});

export default API;
