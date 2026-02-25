export default function EatBadge({ eatStatus }) {
  const isYes = eatStatus === "먹음";
  const label = eatStatus === "먹고싶다" ? "안먹음" : (eatStatus || "");
  return (
    <span className={`gs-badge ${isYes ? "gs-badge-yes" : "gs-badge-no"}`}>
      {label}
    </span>
  );
}
