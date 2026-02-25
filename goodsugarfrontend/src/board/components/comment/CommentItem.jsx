import { useState } from "react";
import { formatDate } from "../../utils/date";
import UserChip from "../board/UserChip";
import CommentForm from "./CommentForm";

export default function CommentItem({ node, depth = 0, onReply, onEdit, onDelete }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const deleted = node.deleteFl === "Y";

  return (
    <div className={`gs-comment ${depth > 0 ? "child" : ""}`}>
      <div className="gs-comment-head">
        <UserChip name={node.writerName} profileImg={node.writerProfileImg} memberId={node.writerMemberId} />
        <span className="gs-muted" style={{ fontSize: 12 }}>
          {formatDate(node.createdAt)}
        </span>
      </div>

      <div className={`gs-comment-body ${deleted ? "deleted" : ""}`}>{node.content}</div>

      {!deleted && (
        <div className="gs-comment-actions">
          <button className="gs-link" onClick={() => setReplyOpen((v) => !v)}>
            답글
          </button>
          <button className="gs-link" onClick={() => setEditOpen((v) => !v)}>
            수정
          </button>
          <button className="gs-link danger" onClick={() => window.confirm("삭제할까요?") && onDelete(node.commentId)}>
            삭제
          </button>
        </div>
      )}

      {replyOpen && (
        <CommentForm
          submitLabel="대댓글 등록"
          onCancel={() => setReplyOpen(false)}
          onSubmit={(payload) => {
            onReply(node.commentId, payload);
            setReplyOpen(false);
          }}
        />
      )}

      {editOpen && (
        <CommentForm
          initial={node.content}
          submitLabel="수정 저장"
          onCancel={() => setEditOpen(false)}
          onSubmit={(payload) => {
            onEdit(node.commentId, payload.content);
            setEditOpen(false);
          }}
        />
      )}

      {(node.children || []).map((ch) => (
        <CommentItem
          key={ch.commentId}
          node={ch}
          depth={depth + 1}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
