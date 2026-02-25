import { useMemo, useState } from "react";

function isAnonymousName(name) {
  return typeof name === "string" && name.startsWith("익명");
}

/**
 * 요구사항:
 * - 닉네임 hover 시 "쪽지 보내기" 버튼 노출
 * - 익명일 때: 기본프로필 + 버튼 비활성
 */
export default function UserChip({ name, profileImg, memberId }) {
  const [open, setOpen] = useState(false);
  const anonymous = useMemo(() => isAnonymousName(name), [name]);

  return (
    <span
      className="gs-userchip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <img className="gs-avatar" src={profileImg} alt="" />
      <span className="gs-user-name">{name}</span>

      {open && (
        <span className="gs-hovercard" onClick={(e) => e.stopPropagation()}>
          <div className="gs-hovercard-row">
            <img className="gs-avatar lg" src={profileImg} alt="" />
            <div style={{ minWidth: 0 }}>
              <div className="gs-user-name">{name}</div>
              <div className="gs-muted" style={{ fontSize: 12 }}>
                {anonymous ? "익명 사용자" : `memberId: ${memberId ?? "-"}`}
              </div>
            </div>
          </div>

          <button
            className="gs-btn gs-btn-outline"
            disabled={anonymous}
            title={anonymous ? "익명에게는 쪽지를 보낼 수 없어요" : "쪽지 기능은 백엔드 API가 필요해요"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("쪽지 기능은 백엔드 메시지 API가 필요해요. (UI만 준비됨)");
            }}
          >
            쪽지 보내기
          </button>
        </span>
      )}
    </span>
  );
}
