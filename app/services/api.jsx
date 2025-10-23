import axios from "axios";


const API_BASE_URL = "https://veebuilds.com/mobile_org/";
// const API_BASE_URL = "https://veebuilds.com/mobile/";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  retry: 3,
  retryDelay: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;