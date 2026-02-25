export const BOARD_TYPES = {
  SNACK: { id: 1, label: "간식 게시판" },
  FREE: { id: 2, label: "자유 게시판" },
  RECOMMEND: { id: 3, label: "당뇨식 추천 게시판" },
};

export const EAT_STATUS = [
  { value: "전체", label: "전체" },
  { value: "먹음", label: "먹음" },
  { value: "먹고싶다", label: "안먹음" }, // UI 표시용
];

export const SORTS = [
  { value: "latest", label: "최신순" },
  { value: "likes", label: "좋아요순" },
  { value: "comments", label: "댓글순" },
];
