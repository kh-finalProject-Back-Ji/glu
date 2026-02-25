import api from "./axios";

export async function getComments(boardId) {
  const { data } = await api.get(`/api/boards/${boardId}/comments`);
  return data;
}

export async function addComment(boardId, payload) {
  const { data } = await api.post(`/api/boards/${boardId}/comments`, payload);
  return data;
}

export async function updateComment(commentId, content) {
  const { data } = await api.put(`/api/comments/${commentId}`, { content });
  return data;
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/api/comments/${commentId}`);
  return data;
}
