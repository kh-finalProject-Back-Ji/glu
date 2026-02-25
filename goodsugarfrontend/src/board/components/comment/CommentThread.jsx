import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

export default function CommentThread({ comments, onAddRoot, onReply, onEdit, onDelete }) {
  return (
    <div className="gs-card">
      <div className="gs-card-body">
        <div className="gs-title">댓글</div>

        <div style={{ marginTop: 12 }}>
          <CommentForm submitLabel="댓글 등록" onSubmit={onAddRoot} />
        </div>

        <div style={{ marginTop: 16 }}>
          {(!comments || comments.length === 0) && <div className="gs-muted">아직 댓글이 없어요.</div>}
          {(comments || []).map((c) => (
            <CommentItem key={c.commentId} node={c} onReply={onReply} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
