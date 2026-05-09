import { Shirt } from "lucide-react";

export function DataSaveScreen({ onSave, onDelete }: { onSave: () => void; onDelete: () => void }) {
  return (
    <div className="k-overlay">
      <div className="k-modal k-save-modal k-scaleIn">
        <div className="k-save-icon k-popIn">
          <Shirt size={26} strokeWidth={2} />
        </div>
        <h3 className="k-save-title">Save your looks?</h3>
        <p className="k-save-sub">Save your look. Access anytime from your phone.</p>
        <button onClick={onSave} className="k-save-btn k-save-btn-primary k-press">
          Save
        </button>
        <button onClick={onDelete} className="k-save-btn k-save-btn-outline k-press">
          Delete
        </button>
      </div>
    </div>
  );
}
