import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
      toast.error("Session expired. Please login again.");
    } else if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.response?.status === 404) {
      toast.error("Resource not found.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
