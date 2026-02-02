import "../../styles/Modal.css";

export default function ModalBase({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

