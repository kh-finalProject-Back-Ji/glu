import { Link } from "react-router-dom";
import EatBadge from "./EatBadge";
import { formatDate } from "../../utils/date";

export default function PostCard({ type, item }) {
  // item.eatStatus: "먹음" | "먹고싶다" | null
  const dotCls =
    item.eatStatus === "먹음"
      ? "gs-dot yes"
      : item.eatStatus
      ? "gs-dot no"
      : "gs-dot neutral";

  return (
    <Link to={`/boards/${type}/${item.boardId}`} className="gs-postcard">
      <div className={dotCls} />
      <div className="gs-post-main">
        <div className="gs-post-top">
          {item.eatStatus ? <EatBadge eatStatus={item.eatStatus} /> : null}
          <div className="gs-post-title">{item.title}</div>
        </div>

        <div className="gs-post-preview">{item.preview}</div>

        <div className="gs-post-meta">
          <span className="gs-meta-strong">❤ {item.likeCount ?? 0}</span>
          <span className="gs-meta-strong">💬 {item.commentCount ?? 0}</span>
          <span className="gs-meta-light">{formatDate(item.createdAt)}</span>
          <span className="gs-meta-light">·</span>
          <span className="gs-meta-light">{item.writerName}</span>
        </div>
      </div>
    </Link>
  );
}
