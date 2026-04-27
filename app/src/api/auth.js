import axios from "./axiosInstance";

const registerUser = (data) => {
  return axios.post("/auth/register", data);
};

const loginUser = (data) => {
  return axios.post("/auth/login", data);
};

const logoutUser = async () => {
  const response = await axios.post("/auth/logout", {});

  return response.data;
};

const forgotPassword = (email) => {
  return axios.post("/auth/forgot-password", { email });
};

const resetPassword = (data) => {
  return axios.post("/auth/reset-password", data);
};

export { 
    registerUser, 
    loginUser, 
    logoutUser,
    forgotPassword,
    resetPassword
};
