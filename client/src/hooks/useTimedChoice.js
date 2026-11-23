import { useCallback, useEffect, useRef, useState } from 'react';

// phases: idle -> counting -> resolving -> done
// Holds (ms) after a pick: dim 250 + hang 1100, or flash 1200 + 300.
const HOLD = { chosen: 1350, timeout: 1500 };
const SCALE = { normal: 1, '1.5': 1.5, off: 0 };

// timed: view.timed | null. active: choices are on screen. view: changes on every new turn (restarts the timer).
// resolve(choiceId, timedOut) -> Promise (API call); advance(result) shows the next scene once the hold ends too.
export function useTimedChoice({ timed, view, active, scale, resolve, advance }) {
  const [phase, setPhase] = useState('idle');
  const [resolution, setResolution] = useState(null);
  const [left, setLeft] = useState(null);
  const deadline = useRef(0);
  const turn = useRef(0);
  const locked = useRef(false);
  const latest = useRef({});
  latest.current = { timed, resolve, advance };
  const total = timed ? timed.seconds * 1000 * (SCALE[scale] ?? 1) : 0; // 0 = assist "off", never expires

  const startCounting = useCallback(() => {
    locked.current = false;
    deadline.current = Date.now() + total;
    setLeft(total);
    setResolution(null);
    setPhase('counting');
  }, [total]);

  useEffect(() => {
    turn.current += 1;
    if (!timed || !active) {
      setPhase('idle');
      setResolution(null);
      return;
    }
    startCounting();
  }, [view, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = useCallback(async (choiceId, timedOut = false) => {
    if (locked.current) return;
    locked.current = true;
    const mine = turn.current;
    setResolution({ kind: timedOut ? 'timeout' : 'chosen', choiceId });
    setPhase('resolving');
    const hold = new Promise((r) => setTimeout(r, HOLD[timedOut ? 'timeout' : 'chosen']));
    const [result] = await Promise.all([latest.current.resolve(choiceId, timedOut), hold]);
    if (turn.current !== mine) return; // scene changed or left meanwhile
    if (result && result.failed) {
      startCounting(); // error is shown by useGame; give the player another go
      return;
    }
    setPhase('done');
    latest.current.advance(result);
  }, [startCounting]);

  // Deadline timestamp, not a counter, so the bar is right after the tab was hidden.
  useEffect(() => {
    if (phase !== 'counting' || !total) return undefined;
    const tick = () => {
      const ms = deadline.current - Date.now();
      setLeft(Math.max(0, ms));
      if (ms <= 0) pick(latest.current.timed.defaultChoiceId, true);
    };
    const id = setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [phase, total, pick]);

  return {
    timed,
    phase,
    resolution,
    left,
    total,
    urgent: phase === 'counting' && total > 0 && left !== null && left <= 2000,
    busy: !!timed && (phase === 'counting' || phase === 'resolving'),
    pick,
  };
}
