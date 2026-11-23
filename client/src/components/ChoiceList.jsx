import { useEffect } from 'react';

export default function ChoiceList({ choices, disabled, onChoose, detectiveHint, timer }) {
  const t = timer && timer.timed ? timer : null;
  const resolving = t && t.phase === 'resolving' ? t.resolution : null;
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

  const stateClass = (c) => {
    if (!resolving) return '';
    if (c.id !== resolving.choiceId) return 'choice--dimmed';
    return resolving.kind === 'timeout' ? 'choice--default-flash' : 'choice--picked';
  };

  return (
    <div className="choices">
      {t && (
        <div className="timer">
          {t.timed.prompt && <p className="timer-prompt">{t.timed.prompt}</p>}
          {t.total > 0 && (
            <div className={`timer-bar ${t.urgent ? 'timer-bar--urgent' : ''}`} role="timer" aria-label="Time left">
              <div className="timer-fill" style={{ width: `${((t.left ?? t.total) / t.total) * 100}%` }} />
              <span className="timer-secs">{Math.ceil((t.left ?? t.total) / 1000)}</span>
            </div>
          )}
        </div>
      )}
      {choices.map((c, i) => (
        <button
          key={c.id}
          className={`choice ${c.locked ? 'locked' : ''} ${c.detective ? 'detective-choice' : ''} ${stateClass(c)}`}
          disabled={disabled || c.locked}
          onClick={() => onChoose(c.id)}
        >
          <span className="num">{i + 1}</span>
          <span className="label">
            {c.label}
            {c.locked && <em className="reason"> // {c.reason}</em>}
          </span>
          {resolving && resolving.kind === 'timeout' && c.id === resolving.choiceId && (
            <span className="choice-tag--no-response">NO RESPONSE: DEFAULT</span>
          )}
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
