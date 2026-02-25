import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:12345";

// ✅ 일반 API용 인스턴스
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // refresh cookie용
});

// ✅ refresh 전용(인터셉터 안 타게 분리)
const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

// ✅ 요청 인터셉터: access 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let queue = []; // { resolve, reject }

function resolveQueue(token) {
  queue.forEach((p) => p.resolve(token));
  queue = [];
}

function rejectQueue(err) {
  queue.forEach((p) => p.reject(err));
  queue = [];
}

// ✅ 응답 인터셉터: 401이면 refresh → 재시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err?.config;
    if (!original) return Promise.reject(err);

    const url = original.url || "";

    // ✅ refresh endpoint 자체면 무한루프 방지
    const isRefreshCall = url.includes("/api/auth/refresh");

    // ✅ 로그인/회원가입/이메일인증은 401이어도 refresh 하지 말기 (중요)
    const isPublicAuth =
      url.includes("/api/member/login") ||
      url.includes("/api/member/signup") ||
      url.includes("/api/member/email/") ||
      url.includes("/api/member/nickname/") ||
      url.includes("/api/member/email");

    if (status === 401 && !original._retry && !isRefreshCall && !isPublicAuth) {
      original._retry = true;

      // 이미 refresh 중이면 대기열
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        // ✅ refresh 토큰으로 access 재발급
        const r = await refreshApi.post("/api/auth/refresh");
        const newAccess = r?.data?.access;
        if (!newAccess) throw new Error("NO_ACCESS_FROM_REFRESH");

        setAccessToken(newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

        resolveQueue(newAccess);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        setAccessToken(null);
        rejectQueue(e);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
