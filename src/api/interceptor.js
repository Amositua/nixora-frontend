import api from "./api";
import { jwtDecode } from "jwt-decode";

const AUTH_EXCLUDED_ROUTES = [
  "/auth/login",
  "/auth/register",
  // "/auth/refresh",
];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function isTokenAboutToExpire(token) {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() > exp * 1000 - 60_000;
  } catch {
    return true;
  }
}

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await api.post("/v1/auth/refresh", { refreshToken });
  const newAccessToken = res.data.accessToken;
  
  localStorage.setItem("accessToken", newAccessToken);
  if (res.data.refreshToken) {
    localStorage.setItem("refreshToken", res.data.refreshToken);
  }
  
  return newAccessToken;
};

// REQUEST INTERCEPTOR - proactive refresh
api.interceptors.request.use(async (config) => {
  if (AUTH_EXCLUDED_ROUTES.some(route => config.url?.includes(route))) {
    return config;
  }

  let accessToken = localStorage.getItem("accessToken");

  // Proactive refresh if token is about to expire
  if (accessToken && isTokenAboutToExpire(accessToken)) {
    if (isRefreshing) {
      // Wait for ongoing refresh
      accessToken = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    } else {
      isRefreshing = true;
      try {
        accessToken = await refreshAccessToken();
        processQueue(null, accessToken);
      } catch (error) {
        processQueue(error, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/signin";
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR - handle 401 errors
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if it's an auth route or already retried
    if (
      AUTH_EXCLUDED_ROUTES.some(route => originalRequest.url?.includes(route)) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
























// save for refrence

// import api from "./api";
// import { jwtDecode } from "jwt-decode";

// const AUTH_EXCLUDED_ROUTES = [
//   "/auth/login",
// "/auth/register",
//  ////////// "/auth/refresh",
// ];

// let accessToken = localStorage.getItem("accessToken");
// let refreshToken = localStorage.getItem("refreshToken");
// console.log("Initial Access Token:", accessToken);
// console.log("Initial Refresh Token:", refreshToken);


// let accessTokenExpiry = null;
// let isRefreshing = false;
// let refreshPromise = null;

// if (accessToken) {
//   const { exp } = jwtDecode(accessToken);
//   accessTokenExpiry = exp * 1000;
// }

// function isTokenAboutToExpire() {
//   return !accessTokenExpiry || Date.now() > accessTokenExpiry - 60_000;
// }

// api.interceptors.request.use(async (config) => {
//   if (AUTH_EXCLUDED_ROUTES.some((route) => config.url?.includes(route))) {
//     return config;
//   }

//   if (!accessToken || isTokenAboutToExpire()) {
//     if (!refreshToken) {
//       throw new Error("No refresh token");
//     }

//     if (!isRefreshing) {
//       isRefreshing = true;

//       refreshPromise = api
//         .post("/v1/auth/refresh", { refreshToken })
//         .then((res) => {
//           accessToken = res.data.accessToken;

//           if (res.data.refreshToken) {
//             refreshToken = res.data.refreshToken;
//             localStorage.setItem("refreshToken", refreshToken);
//           }

//           const { exp } = jwtDecode(accessToken);
//           accessTokenExpiry = exp * 1000;

//           localStorage.setItem("accessToken", accessToken);
//         })
//         .catch(() => {
//           accessToken = null;
//           refreshToken = null;
//           accessTokenExpiry = null;

//           localStorage.removeItem("accessToken");
//           localStorage.removeItem("refreshToken");
//           // window.location.href = "/login";
//           throw new Error("Session expired");
//         })
//         .finally(() => {
//           isRefreshing = false;
//         });
//     }

//     await refreshPromise;
//   }

//   console.log("Using Access Token:", accessToken);
//   config.headers.Authorization = `Bearer ${accessToken}`;
//   return config;
// });

// i see Initial Access Token:, null and 
// Initial Refresh Token:", null 

// in my console, and i am callinig it on my main.jsx 

// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App.jsx";
// import "./index.css";
// import "./api/interceptor.js";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </StrictMode>
// );

// OR



// import api from "./api";
// import { jwtDecode } from "jwt-decode";

// const AUTH_EXCLUDED_ROUTES = [
//   "/auth/login",
//   "/auth/register",
//  //////////// "/auth/refresh",
// ];

// let isRefreshing = false;
// let refreshPromise = null;

// function isTokenAboutToExpire(token) {
//   try {
//     const { exp } = jwtDecode(token);
//     return Date.now() > exp * 1000 - 60_000;
//   } catch {
//     return true;
//   }
// }

// api.interceptors.request.use(async (config) => {
//   if (AUTH_EXCLUDED_ROUTES.some(route => config.url?.includes(route))) {
//     return config;
//   }

//   let accessToken = localStorage.getItem("accessToken");
//   let refreshToken = localStorage.getItem("refreshToken");

//   if (!accessToken || isTokenAboutToExpire(accessToken)) {
//     if (!refreshToken) {
//       throw new Error("No refresh token");
//     }

//     if (!isRefreshing) {
//       isRefreshing = true;

//       refreshPromise = api
//         .post("/v1/auth/refresh", { refreshToken })
//         .then((res) => {
//           const newAccessToken = res.data.accessToken;
//           localStorage.setItem("accessToken", newAccessToken);

//           if (res.data.refreshToken) {
//             localStorage.setItem("refreshToken", res.data.refreshToken);
//           }
//         })
//         .catch(() => {
//           localStorage.removeItem("accessToken");
//           localStorage.removeItem("refreshToken");
//           // window.location.href = "/login";
//           throw new Error("Session expired");
//         })
//         .finally(() => {
//           isRefreshing = false;
//         });
//     }

//     await refreshPromise;
//     accessToken = localStorage.getItem("accessToken");
//   }

//   config.headers.Authorization = `Bearer ${accessToken}`;
//   return config;
// });
