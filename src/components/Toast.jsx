import React from 'react';

export default function Toast({ toast, onUndo }) {
  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span id="toastText">{toast.message}</span>
      <button type="button" className="toast-undo" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}