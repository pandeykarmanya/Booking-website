import axios from "axios";

export const loginUser = (data) => {
  return axios.post(
    "http://localhost:5001/api/v1/auth/login",
    data,
    {
      withCredentials: true, 
    }
  );
};

export const logoutUser = () => {
  return axios.post("http://localhost:5001/api/v1/auth/logout", {}, {
    withCredentials: true
  });
};