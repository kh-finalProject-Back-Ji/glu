export default function Pagination({ page, totalPages, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  const current = page;
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="gs-pagination">
      <button className="gs-btn gs-btn-outline" disabled={current <= 1} onClick={() => onPage(current - 1)}>
        이전
      </button>

      {start > 1 && (
        <>
          <button className="gs-page" onClick={() => onPage(1)}>1</button>
          <span className="gs-muted">…</span>
        </>
      )}

      {pages.map((p) => (
        <button key={p} className={`gs-page ${p === current ? "active" : ""}`} onClick={() => onPage(p)}>
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          <span className="gs-muted">…</span>
          <button className="gs-page" onClick={() => onPage(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className="gs-btn gs-btn-outline" disabled={current >= totalPages} onClick={() => onPage(current + 1)}>
        다음
      </button>
    </div>
  );
}
