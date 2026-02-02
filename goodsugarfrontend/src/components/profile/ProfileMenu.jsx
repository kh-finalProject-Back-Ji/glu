import ModalBase from "../common/ModalBase";
import "../../styles/ProfileMenu.css";

import GlucoseIcon from "../../assets/glucose.png";
import HealthInfoIcon from "../../assets/healthInfo.png";
import PersonalInfoIcon from "../../assets/personalInfo.png";
import LogoutIcon from "../../assets/logout.png";

export default function ProfileMenu({ open, onClose, onGo, onLogout }) {
  if (!open) return null;

  const go = (path) => {
    onClose?.();
    onGo?.(path);
  };

  const logout = () => {
    onClose?.();
    onLogout?.();
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <div className="pm-wrap">
        <div className="pm-title">메뉴</div>

        <button className="pm-item" onClick={() => go("/glucose")}>
          <img className="pm-icon" src={GlucoseIcon} alt="" />
          <span>혈당기록</span>
        </button>

        <button className="pm-item" onClick={() => go("/health")}>
          <img className="pm-icon" src={HealthInfoIcon} alt="" />
          <span>건강정보</span>
        </button>

        <button className="pm-item" onClick={() => go("/personalInfo")}>
          <img className="pm-icon" src={PersonalInfoIcon} alt="" />
          <span>개인정보수정</span>
        </button>

        <div className="pm-divider" />

        <button className="pm-item pm-logout" onClick={logout}>
          <img className="pm-icon" src={LogoutIcon} alt="" />
          <span>로그아웃</span>
        </button>
      </div>
    </ModalBase>
  );
}
