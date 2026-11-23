import { useEffect, useRef, useState } from 'react';

const SPEED_MS = 25;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function RiddleModal({ riddleId, getRiddle, answerRiddle, onClose }) {
  const [data, setData] = useState(null);
  const [shown, setShown] = useState(0);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState(null); // null | 'rejected' | 'accepted'
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const box = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    getRiddle(riddleId)
      .then((d) => { setData(d); setShown(reduced() ? d.text.length : 0); })
      .catch((e) => setError(e.message));
  }, [riddleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = data ? data.text.length : 0;
  useEffect(() => {
    if (!data || shown >= total) return undefined;
    const t = setTimeout(() => setShown((n) => Math.min(total, n + 1)), SPEED_MS);
    return () => clearTimeout(t);
  }, [data, shown, total]);

  useEffect(() => { input.current?.focus(); }, [data]);

  // Esc closes; Tab cycles inside the dialog.
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...box.current.querySelectorAll('button, input')].filter((el) => !el.disabled);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending || !answer.trim() || status === 'accepted') return;
    setSending(true);
    setError(null);
    try {
      const res = await answerRiddle(riddleId, answer);
      if (res.correct) {
        setStatus('accepted');
        setTimeout(onClose, 1200);
      } else {
        setStatus('rejected');
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setData((d) => ({ ...d, tries: res.tries, hint: res.hint }));
        setAnswer('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="riddle-overlay" onKeyDown={onKeyDown}>
      <div
        ref={box}
        className={`riddle-modal ${shake ? 'shake' : ''} ${status === 'accepted' ? 'accepted' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Intercepted transmission"
      >
        <p className="riddle-tag">▒ INTERCEPTED TRANSMISSION</p>
        {error && <p className="error" role="alert">{error}</p>}
        {data && (
          <>
            <p className="riddle-text" aria-live="polite">{data.text.slice(0, shown)}</p>
            {data.claimed ? (
              <>
                <p className="riddle-status ok">SOLVED: {data.answer}</p>
                <div className="row"><button className="btn primary" onClick={onClose} autoFocus>CLOSE</button></div>
              </>
            ) : (
              <form onSubmit={submit}>
                <input
                  ref={input}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer"
                  maxLength={100}
                  autoComplete="off"
                  aria-label="Answer"
                />
                <div className="riddle-status" role="status">
                  {status === 'rejected' && <span className="bad">SIGNAL REJECTED</span>}
                  {status === 'accepted' && <span className="ok">SIGNAL ACCEPTED</span>}
                  {data.tries > 0 && <span> ATTEMPTS: {data.tries}</span>}
                </div>
                {data.hint && <p className="riddle-hint">HINT: {data.hint}</p>}
                <div className="row">
                  <button type="submit" className="btn primary" disabled={sending || !answer.trim()}>TRANSMIT</button>
                  <button type="button" className="btn ghost" onClick={onClose}>ABORT</button>
                </div>
              </form>
            )}
          </>
        )}
        {!data && !error && <p className="riddle-text">Locking signal…</p>}
        {error && !data && <div className="row"><button className="btn ghost" onClick={onClose}>ABORT</button></div>}
      </div>
    </div>
  );
}
