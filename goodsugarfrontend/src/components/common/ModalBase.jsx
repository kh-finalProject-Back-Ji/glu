// src/components/common/ModalBase.jsx
import "../../styles/Modal.css";

export default function ModalBase({ open, onClose, children, panelClassName = "" }) {
  if (!open) return null;

  return (
    <div className="dm-backdrop" onClick={onClose}>
      <div className={`dm-panel ${panelClassName}`} onClick={(e) => e.stopPropagation()}>
        <button className="dm-close" onClick={onClose} aria-label="close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
