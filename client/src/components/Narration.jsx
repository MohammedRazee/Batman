import { useEffect, useRef, useState } from 'react';

const SPEED_MS = 12;

// Types the text out. Click or press Space/Enter to reveal everything.
// Remount with a key={sceneId} to restart the typing for a new scene.
export default function Narration({ text, onDone }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  const total = text.length;

  useEffect(() => {
    if (shown >= total) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return undefined;
    }
    const id = setTimeout(() => setShown((n) => Math.min(total, n + 2)), SPEED_MS);
    return () => clearTimeout(id);
  }, [shown, total, onDone]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && shown < total) {
        e.preventDefault();
        setShown(total);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, total]);

  const visible = text.slice(0, shown);
  const typing = shown < total;

  return (
    <div className="narration" onClick={() => setShown(total)} aria-live="polite">
      {visible.split('\n\n').map((para, i) => (
        <p key={i}>
          {para}
          {typing && i === visible.split('\n\n').length - 1 && <span className="cursor">▌</span>}
        </p>
      ))}
      {typing && <span className="skip-hint">[click or space to skip]</span>}
    </div>
  );
}
