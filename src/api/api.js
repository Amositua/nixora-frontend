import axios from "axios";
// const BASE_URL = 'https://nixora-image-latest.onrender.com/api';


const api = axios.create({
  baseURL: "https://nixora-image-latest.onrender.com/api",
  headers: { 'Content-Type': 'application/json'},
  withCredentials: true, // important for httpOnly cookies
});

export default api;

// export default axios.create({
//   baseURL: BASE_URL
// });

// export const axiosPrivate = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json'},
//   withCredentials: true, 
// })