import axios, { InternalAxiosRequestConfig } from "axios";
import { showLoading, updateToast } from "@/lib/toast";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  showToast?: boolean;
  successMessage?: string;
  toastId?: string | number;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// REQUEST
api.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.showToast && config.method !== "get") {
    const toastId = showLoading("Please wait...");
    config.toastId = toastId;
  }

  return config;
});

// RESPONSE
api.interceptors.response.use(
  (response) => {
    const config = response.config as CustomAxiosRequestConfig;

    if (config.toastId) {
      updateToast(
        config.toastId,
        "success",
        config.successMessage || "Success ✅"
      );
    }

    return response;
  },
  (error) => {
    const config = error?.config as CustomAxiosRequestConfig;

    if (config?.toastId) {
      updateToast(
        config.toastId,
        "error",
        error.response?.data?.message || "Something went wrong ❌"
      );
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;