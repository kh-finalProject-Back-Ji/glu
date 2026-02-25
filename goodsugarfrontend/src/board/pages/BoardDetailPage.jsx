import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Container from "../components/common/Container";
import Loading from "../components/common/Loading";
import ErrorBox from "../components/common/ErrorBox";
import UserChip from "../components/board/UserChip";
import EatBadge from "../components/board/EatBadge";
import CommentThread from "../components/comment/CommentThread";
import { formatDate } from "../utils/date";
import { BOARD_TYPES } from "../constants";
import { deleteBoard, getBoardDetail, toggleLike } from "../api/boardApi";
import { addComment, deleteComment, getComments, updateComment } from "../api/commentApi";

export default function BoardDetailPage() {
  const { type, boardId } = useParams();
  const safeType = BOARD_TYPES[type] ? type : "SNACK";

  const nav = useNavigate();
  const qc = useQueryClient();

  const qDetail = useQuery({
    queryKey: ["boardDetail", boardId],
    queryFn: () => getBoardDetail(boardId),
  });

  const qComments = useQuery({
    queryKey: ["boardComments", boardId],
    queryFn: () => getComments(boardId),
  });

  const detail = qDetail.data;
  const comments = qComments.data || [];

  const likeMut = useMutation({
    mutationFn: () => toggleLike(boardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boardDetail", boardId] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const delMut = useMutation({
    mutationFn: () => deleteBoard(boardId),
    onSuccess: () => nav(`/boards/${safeType}`),
  });

  const addMut = useMutation({
    mutationFn: (payload) => addComment(boardId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boardComments", boardId] }),
  });

  const replyMut = useMutation({
    mutationFn: ({ parentCommentId, payload }) => addComment(boardId, { ...payload, parentCommentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boardComments", boardId] }),
  });

  const editMut = useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boardComments", boardId] }),
  });

  const deleteCommentMut = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boardComments", boardId] }),
  });

  if (qDetail.isLoading) return <Container><Loading /></Container>;
  if (qDetail.isError) return <Container><ErrorBox message={String(qDetail.error)} /></Container>;

  const snack = detail?.snack;
  const recommend = detail?.recommend;
  const eatStatus = snack?.eatStatus;

  return (
    <Container>
      <div className="gs-breadcrumb">
        <Link className="gs-link" to={`/boards/${safeType}`}>← 목록</Link>
      </div>

      <div className="gs-card">
        <div className="gs-card-body">
          <div className="gs-detail-head">
            <div className="gs-detail-title">
              {eatStatus ? <EatBadge eatStatus={eatStatus} /> : null}
              <span>{detail.title}</span>
            </div>

            <div className="gs-detail-actions" title="수정/삭제는 작성자만 가능(서버에서 체크)">
              <button className="gs-btn gs-btn-outline" onClick={() => alert("수정은 Write 페이지 edit 모드로 확장하세요.")}>
                수정
              </button>
              <button className="gs-btn gs-btn-outline danger" onClick={() => window.confirm("삭제할까요?") && delMut.mutate()}>
                삭제
              </button>
            </div>
          </div>

          <div className="gs-detail-meta">
            <UserChip name={detail.writerName} profileImg={detail.writerProfileImg} memberId={detail.writerMemberId} />
            <span className="gs-muted">{formatDate(detail.createdAt)}</span>
            <span className="gs-muted">· 조회 {detail.viewCount ?? 0}</span>
          </div>

          <div className="gs-detail-content">{detail.content}</div>

          {snack && (
            <div className="gs-subcard">
              <div className="gs-title">간식 상세</div>
              <div className="gs-kv">
                <div><span className="k">상태</span><span className="v">{snack.eatStatus === "먹고싶다" ? "안먹음" : snack.eatStatus}</span></div>
                <div><span className="k">종류</span><span className="v">{snack.snackType || "-"}</span></div>
                <div><span className="k">약 복용</span><span className="v">{snack.useMedicationYn || "-"}</span></div>
                <div><span className="k">주사</span><span className="v">{snack.useInjectionYn || "-"}</span></div>
                <div><span className="k">혈당</span><span className="v">{snack.glucoseType ? `${snack.glucoseType} ${snack.glucoseValue ?? ""}` : "-"}</span></div>
                <div><span className="k">측정</span><span className="v">{snack.measureType || "-"} {snack.measureTime ? formatDate(snack.measureTime) : ""}</span></div>
                <div><span className="k">맛점수</span><span className="v">{snack.tasteScore ?? "-"}</span></div>
                <div><span className="k">건강점수</span><span className="v">{snack.healthScore ?? "-"}</span></div>
              </div>
            </div>
          )}

          {recommend && (
            <div className="gs-subcard">
              <div className="gs-title">추천 상세</div>
              <div className="gs-kv">
                <div><span className="k">가게</span><span className="v">{recommend.placeName || "-"}</span></div>
                <div><span className="k">주소</span><span className="v">{recommend.address || "-"}</span></div>
                <div><span className="k">음식</span><span className="v">{recommend.foodName || "-"}</span></div>
                <div><span className="k">추천 이유</span><span className="v">{recommend.diabeticReason || "-"}</span></div>
                <div><span className="k">좌표</span><span className="v">{recommend.latitude && recommend.longitude ? `${recommend.latitude}, ${recommend.longitude}` : "-"}</span></div>
                <div><span className="k">링크</span><span className="v">{recommend.placeUrl ? <a className="gs-link" href={recommend.placeUrl} target="_blank" rel="noreferrer">카카오 장소</a> : "-"}</span></div>
              </div>
            </div>
          )}

          <div className="gs-detail-bottom">
            <button className={`gs-btn ${detail.likedByMe ? "liked" : ""}`} onClick={() => likeMut.mutate()}>
              ❤ 좋아요 {detail.likeCount ?? 0}
            </button>
            <div className="gs-muted">댓글 {detail.commentCount ?? 0}</div>
          </div>
        </div>
      </div>

      {qComments.isLoading && <Loading text="댓글 불러오는 중..." />}
      {qComments.isError && <ErrorBox message={String(qComments.error)} />}

      {!qComments.isLoading && !qComments.isError && (
        <div style={{ marginTop: 16 }}>
          <CommentThread
            comments={comments}
            onAddRoot={(payload) => addMut.mutate({ ...payload, parentCommentId: null })}
            onReply={(parentCommentId, payload) => replyMut.mutate({ parentCommentId, payload })}
            onEdit={(commentId, content) => editMut.mutate({ commentId, content })}
            onDelete={(commentId) => deleteCommentMut.mutate(commentId)}
          />
        </div>
      )}
    </Container>
  );
}
