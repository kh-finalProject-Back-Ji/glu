import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "https://api.goodsugar.store",
  withCredentials: true,
});

// 네 프로젝트가 accessToken을 localStorage에 저장한다면 그대로 사용 가능
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
