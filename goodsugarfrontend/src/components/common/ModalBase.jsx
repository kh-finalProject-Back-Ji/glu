import { useEffect } from "react";
import "../../styles/Modal.css";

export default function ModalBase({ open, onClose, children, panelClassName = "" }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    // ✅ 모달 열리면 body 스크롤 잠금
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div
        className={`dm-panel ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dm-close" type="button" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
