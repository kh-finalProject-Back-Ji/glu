export default function Loading({ text = "로딩중..." }) {
  return (
    <div className="gs-center gs-muted" style={{ padding: 24 }}>
      {text}
    </div>
  );
}
