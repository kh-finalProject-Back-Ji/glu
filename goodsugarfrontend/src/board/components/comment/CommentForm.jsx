import { useState } from "react";

export default function CommentForm({ initial = "", onSubmit, onCancel, submitLabel = "등록" }) {
  const [content, setContent] = useState(initial);
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div className="gs-commentform">
      <textarea
        className="gs-textarea"
        rows={3}
        placeholder="댓글을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="gs-commentform-row">
        <label className="gs-check">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          익명
        </label>

        <div className="gs-spacer" />

        {onCancel && (
          <button className="gs-btn gs-btn-outline" onClick={onCancel}>
            취소
          </button>
        )}

        <button
          className="gs-btn"
          onClick={() => {
            const v = content.trim();
            if (!v) return alert("내용을 입력하세요.");
            onSubmit({ content: v, isAnonymousYn: anonymous ? "Y" : "N" });
            setContent("");
            setAnonymous(false);
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
