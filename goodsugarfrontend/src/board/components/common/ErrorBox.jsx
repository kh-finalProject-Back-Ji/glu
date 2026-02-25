export default function ErrorBox({ title = "오류", message }) {
  return (
    <div className="gs-card" style={{ border: "1px solid rgba(0,0,0,.08)" }}>
      <div className="gs-card-body">
        <div className="gs-title">{title}</div>
        <div className="gs-muted" style={{ marginTop: 8 }}>
          {message || "요청 처리 중 문제가 발생했어요."}
        </div>
      </div>
    </div>
  );
}
