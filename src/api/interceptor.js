import api from "./api";
import { jwtDecode } from "jwt-decode";

const AUTH_EXCLUDED_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];

let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");
console.log("Initial Access Token:", accessToken);
console.log("Initial Refresh Token:", refreshToken);


let accessTokenExpiry = null;
let isRefreshing = false;
let refreshPromise = null;

if (accessToken) {
  const { exp } = jwtDecode(accessToken);
  accessTokenExpiry = exp * 1000;
}

function isTokenAboutToExpire() {
  return !accessTokenExpiry || Date.now() > accessTokenExpiry - 60_000;
}

api.interceptors.request.use(async (config) => {
  if (AUTH_EXCLUDED_ROUTES.some((route) => config.url?.includes(route))) {
    return config;
  }

  if (!accessToken || isTokenAboutToExpire()) {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = api
        .post("/auth/refresh", { refreshToken })
        .then((res) => {
          accessToken = res.data.accessToken;

          if (res.data.refreshToken) {
            refreshToken = res.data.refreshToken;
            localStorage.setItem("refreshToken", refreshToken);
          }

          const { exp } = jwtDecode(accessToken);
          accessTokenExpiry = exp * 1000;

          localStorage.setItem("accessToken", accessToken);
        })
        .catch(() => {
          accessToken = null;
          refreshToken = null;
          accessTokenExpiry = null;

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // window.location.href = "/login";
          throw new Error("Session expired");
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    await refreshPromise;
  }

  console.log("Using Access Token:", accessToken);
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
