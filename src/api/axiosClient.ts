import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Log mọi request liên quan đến branches/users/customers/tier-configs để dễ debug
axiosClient.interceptors.request.use((config) => {
  const url = config.url || "";
  if (
    url.includes("/api/branches") ||
    url.includes("/api/users") ||
    url.includes("/api/customers") ||
    url.includes("/api/tier-configs") ||
    url.includes("/api/dashboard") ||
    url.includes("/api/dashboard")
  ) {
    console.log("[axios] →", config.method?.toUpperCase(), url, {
      data: config.data,
      params: config.params,
    });
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    if (
      url.includes("/api/branches") ||
      url.includes("/api/users") ||
      url.includes("/api/customers") ||
      url.includes("/api/tier-configs")
    ) {
      console.log("[axios] ←", response.status, url, {
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    const url = error?.config?.url || "";
    if (
      url.includes("/api/branches") ||
      url.includes("/api/users") ||
      url.includes("/api/customers") ||
      url.includes("/api/tier-configs")
    ) {
      console.log(
        "[axios] ✕",
        error.response?.status,
        url,
        error.response?.data
      );
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const e = error as Record<string, unknown>;
    const data = (e.response as Record<string, unknown> | undefined)?.data;
    if (typeof data === "string" && data.trim()) return data;

    const payload =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : undefined;

    if (payload?.message) return String(payload.message);
    if (payload?.error) return String(payload.error);
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      const first = payload.errors[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first !== null && "message" in first) {
        return String((first as Record<string, unknown>).message);
      }
    }
    if (typeof e.message === "string") return e.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Đã xảy ra lỗi không xác định";
}

export default axiosClient;