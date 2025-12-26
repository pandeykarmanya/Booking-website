import axios from "./axiosInstance";

// Check venue availability
export const checkAvailability = async (date, startTime, endTime) => {
    return axios.get("/booking/check-availability", {
        params: { date, startTime, endTime } // Send as query params
    });
};

// Create booking
export const createBooking = async (data) => {
    return axios.post("/booking/create", data);
};

// Get my bookings
export const getMyBookings = async () => {
    return axios.get("/booking/my-bookings");
};

// Cancel booking
export const cancelBooking = async (id) => {
    return axios.put(`/booking/cancel/${id}`);
};

// Admin — Get all bookings
export const getAllBookings = async () => {
    return axios.get("/booking/all");
};