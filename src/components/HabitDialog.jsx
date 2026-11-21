import React, { useEffect, useRef, useState } from 'react';
import { LIMITS, goalLabel, normGoal } from '../constants/config';

export default function HabitDialog({ mode, isOpen, habits, onClose, onSaveEdit, onConfirmDelete }) {
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  const [pick, setPick] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(7);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (isOpen && !el.open) {
      setPick(0);
      if (habits[0]) {
        setName(habits[0].name);
        setGoal(habits[0].goal);
      }
      el.showModal();
      if (mode === 'rename' && habits.length > 0) {
        requestAnimationFrame(() => {
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        });
      }
    } else if (!isOpen && el.open) {
      el.close();
    }
  }, [isOpen, mode, habits]);

  const handleSelectHabit = (index) => {
    setPick(index);
    const chosen = habits[index];
    if (chosen) {
      setName(chosen.name);
      setGoal(chosen.goal);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const habit = habits[pick];
    if (!habit) {
      onClose();
      return;
    }

    if (mode === 'rename') {
      const cleaned = name.trim().slice(0, LIMITS.NAME_MAX).trim();
      if (!cleaned) {
        nameInputRef.current?.focus();
        return;
      }
      onSaveEdit(pick, cleaned, normGoal(Number(goal)));
      onClose();
      return;
    }

    onConfirmDelete(pick);
    onClose();
  };

  const isRename = mode === 'rename';
  const isEmpty = habits.length === 0;

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="dialogTitle"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <form className="dialog-box" onSubmit={handleSubmit}>
        <h2 id="dialogTitle">{isRename ? 'Edit a habit' : 'Delete a habit'}</h2>

        {isEmpty ? (
          <p className="dialog-empty">No habits to {isRename ? 'edit' : 'delete'}.</p>
        ) : (
          <>
            <fieldset
              className="dialog-list"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            >
              <legend className="sr-only">Choose a habit</legend>
              {habits.map((h, i) => (
                <label key={h.id} className="dialog-row">
                  <input
                    type="radio"
                    name="dialogHabit"
                    value={i}
                    checked={i === pick}
                    onChange={() => handleSelectHabit(i)}
                  />
                  <span className="dialog-swatch" style={{ '--c': h.color }} />
                  <span className="dialog-habit">{h.name}</span>
                </label>
              ))}
            </fieldset>

            {isRename && (
              <>
                <label className="dialog-name" htmlFor="dialogName">
                  Name (max {LIMITS.NAME_MAX} characters)
                  <input
                    ref={nameInputRef}
                    id="dialogName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={LIMITS.NAME_MAX}
                    autoComplete="off"
                    required
                  />
                </label>

                <label className="dialog-name" htmlFor="dialogGoal">
                  How often
                  <select
                    id="dialogGoal"
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                      <option key={g} value={g}>
                        {goalLabel(g)}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </>
        )}

        <div className="dialog-actions">
          <button type="button" className="rename-btn" onClick={onClose}>
            Cancel
          </button>
          {!isEmpty && (
            <button type="submit" className={`add${isRename ? '' : ' danger'}`}>
              {isRename ? 'Save' : 'Delete'}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}