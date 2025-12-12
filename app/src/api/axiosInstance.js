// src/api/axiosInstance.js

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5001/api/v1",  // your backend base URL

  withCredentials: true, // important for JWT cookie
});

export default instance;