import api from "./axios";

// 목록
export async function getBoardList(params) {
  const { data } = await api.get("/api/boards", { params });
  return data;
}

// 상세
export async function getBoardDetail(boardId) {
  const { data } = await api.get(`/api/boards/${boardId}`);
  return data;
}

// 작성
export async function createBoard(payload) {
  const { data } = await api.post("/api/boards", payload);
  return data;
}

// 수정
export async function updateBoard(boardId, payload) {
  const { data } = await api.put(`/api/boards/${boardId}`, payload);
  return data;
}

// 삭제
export async function deleteBoard(boardId) {
  const { data } = await api.delete(`/api/boards/${boardId}`);
  return data;
}

// 좋아요 토글
export async function toggleLike(boardId) {
  const { data } = await api.post(`/api/boards/${boardId}/likes`);
  return data;
}
