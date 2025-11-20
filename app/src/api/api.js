import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api/v1",
  withCredentials: true,
});

/* ------------------------------
   AUTH FUNCTIONS
--------------------------------*/
function loginUser(data) {
  return api.post("/auth/login", data);
}

function registerUser(data) {
  return api.post("/auth/register", data);
}

function logoutUser() {
  return api.post("/auth/logout");
}

/* ------------------------------
   USER FUNCTIONS
--------------------------------*/
function updateName(data) {
  return api.put("/user/update-name", data);
}

function getProfile() {
  return api.get("/user/me");
}

/* ------------------------------
   AUDITORIUM FUNCTIONS
--------------------------------*/
function getAllAuditoriums() {
  return api.get("/auditorium/all");
}

function createAuditorium(data) {
  return api.post("/auditorium/create", data);
}

/* ------------------------------
   BOOKING FUNCTIONS
--------------------------------*/
function getAvailableAuditoriums(date, startTime, endTime) {
  return api.get("/booking/available", {
    params: { date, startTime, endTime },
  });
}

function createBooking(data) {
  return api.post("/booking/create", data);
}

function getUserBookings() {
  return api.get("/booking/user");
}

function getAllBookings() {
  return api.get("/booking/all");
}

/* ------------------------------
   ADMIN FUNCTIONS
--------------------------------*/
function adminLogin(data) {
  return api.post("/auth/admin-login", data);
}

function adminStats() {
  return api.get("/admin/stats");
}

/* ------------------------------
   EXPORT ALL FUNCTIONS AT END
--------------------------------*/
export {
  api,
  loginUser,
  registerUser,
  logoutUser,
  updateName,
  getProfile,
  getAllAuditoriums,
  createAuditorium,
  getAvailableAuditoriums,
  createBooking,
  getUserBookings,
  getAllBookings,
  adminLogin,
  adminStats,
};