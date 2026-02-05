import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:12345",
  withCredentials: true, // refresh cookie용
});

// 요청 인터셉터: access 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

// 응답 인터셉터: 401이면 refresh → 재시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;

      // 이미 refresh 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        // refresh 토큰으로 access 재발급
        const r = await api.post("/api/auth/refresh");
        const newAccess = r.data.access;

        localStorage.setItem("accessToken", newAccess);

        // 대기 중이던 요청들 재개
        queue.forEach((p) => p.resolve(newAccess));
        queue = [];
        isRefreshing = false;

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        // refresh 실패 → 완전 로그아웃 상태
        queue.forEach((p) => p.reject(e));
        queue = [];
        isRefreshing = false;

        localStorage.removeItem("accessToken");
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
