import axios from "axios";
import { API_BASE_URL } from "../config";

const instance = axios.create({
  baseURL: `${import.meta.env.API_BASE_URL_URL}/api/v1`,
  withCredentials: true,
});

export default instance;
