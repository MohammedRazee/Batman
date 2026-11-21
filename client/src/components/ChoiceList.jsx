import { useEffect } from 'react';

export default function ChoiceList({ choices, disabled, onChoose, detectiveHint }) {
  useEffect(() => {
    const onKey = (e) => {
      if (disabled || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= choices.length) {
        const c = choices[n - 1];
        if (!c.locked) onChoose(c.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choices, disabled, onChoose]);

  return (
    <div className="choices">
      {choices.map((c, i) => (
        <button
          key={c.id}
          className={`choice ${c.locked ? 'locked' : ''} ${c.detective ? 'detective-choice' : ''}`}
          disabled={disabled || c.locked}
          onClick={() => onChoose(c.id)}
        >
          <span className="num">{i + 1}</span>
          <span className="label">
            {c.label}
            {c.locked && <em className="reason"> // {c.reason}</em>}
          </span>
        </button>
      ))}
      {detectiveHint && (
        <p className="hint">
          ▒▒ Something here is hidden from normal sight. <kbd>D</kbd> Detective Mode.
        </p>
      )}
    </div>
  );
}
