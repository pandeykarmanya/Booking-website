import axios from "axios";

const API = "http://localhost:5001";

const registerUser = (data) => {
  return axios.post(
    `${API}/api/v1/auth/register`,
    data,
    { withCredentials: true }
  );
};

const loginUser = (data) => {
  return axios.post(
    `${API}/api/v1/auth/login`,
    data,
    {
      withCredentials: true, 
    }
  );
};

const logoutUser = async () => {
  const response = await axios.post(
    `${API}/api/v1/auth/logout`,
    {},
    {
      withCredentials: true, 
    }
  );

  return response.data;
};

const forgotPassword = (email) => {
  return axios.post(
    `${API}/api/v1/auth/forgot-password`,
    { email }
  );
};

const resetPassword = (data) => {
  return axios.post(
    `${API}/api/v1/auth/reset-password`,
    data
  );
};

export { 
    registerUser, 
    loginUser, 
    logoutUser,
    forgotPassword,
    resetPassword
};