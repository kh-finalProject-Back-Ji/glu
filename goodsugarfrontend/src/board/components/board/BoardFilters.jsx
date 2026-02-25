import { EAT_STATUS, SORTS } from "../../constants";

export default function BoardFilters({ type, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch, page: 1 });

  return (
    <div className="gs-filters">
      <input
        className="gs-input"
        value={value.q}
        placeholder="검색어 (제목/내용)"
        onChange={(e) => set({ q: e.target.value })}
      />

      {type === "SNACK" && (
        <select
          className="gs-select"
          value={value.status}
          onChange={(e) => set({ status: e.target.value })}
        >
          {EAT_STATUS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      <select
        className="gs-select"
        value={value.sort}
        onChange={(e) => set({ sort: e.target.value })}
      >
        {SORTS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="gs-select"
        value={value.size}
        onChange={(e) => set({ size: Number(e.target.value) })}
      >
        <option value={12}>12개</option>
        <option value={24}>24개</option>
        <option value={40}>40개</option>
        <option value={80}>80개</option>
      </select>
    </div>
  );
}
