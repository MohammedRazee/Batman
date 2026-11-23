import { useCallback, useEffect, useRef, useState } from 'react';
import { gameApi } from '../api/gameApi.js';

const KEY = 'arkham.playerId';
const NAME_KEY = 'arkham.playerName';

export function useGame() {
  const [view, setView] = useState(null);
  const [saved, setSaved] = useState(() => {
    const id = localStorage.getItem(KEY);
    return id ? { id, name: localStorage.getItem(NAME_KEY) || 'Unknown' } : null;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const busyRef = useRef(false);

  const run = useCallback(async (fn) => {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e.message);
      return { failed: e };
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  const remember = (v) => {
    localStorage.setItem(KEY, v.playerId);
    localStorage.setItem(NAME_KEY, v.name);
    setSaved({ id: v.playerId, name: v.name });
  };

  const forget = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(NAME_KEY);
    setSaved(null);
  };

  const start = (name) =>
    run(async () => {
      const v = await gameApi.newGame(name);
      remember(v);
      setNotice(null);
      setView(v);
    });

  const resume = () =>
    run(async () => {
      try {
        const v = await gameApi.resume(saved.id);
        setNotice(null);
        setView(v);
      } catch (e) {
        if (e.status === 404) forget();
        throw e;
      }
    });

  // defer: return the new view instead of showing it, so a timed scene can finish its hold first.
  const choose = (choiceId, { timedOut = false, defer = false } = {}) =>
    run(async () => {
      setNotice(null);
      const v = await gameApi.choose(view.playerId, choiceId, timedOut);
      if (!defer) setView(v);
      return v;
    });

  const toggleDetective = () =>
    run(async () => {
      setView(await gameApi.setDetective(view.playerId, !view.hud.detectiveMode));
    });

  const useItem = (itemId) =>
    run(async () => {
      const v = await gameApi.useItem(view.playerId, itemId);
      setNotice(v.message || null);
      setView(v);
    });

  // Not wrapped in run(): the modal manages its own loading and errors.
  const getRiddle = (riddleId) => gameApi.getRiddle(view.playerId, riddleId);
  const answerRiddle = async (riddleId, answer) => {
    const res = await gameApi.answerRiddle(view.playerId, riddleId, answer);
    if (res.correct) setView(await gameApi.resume(view.playerId));
    return res;
  };

  const quit = () => {
    setView(null);
    setError(null);
    setNotice(null);
  };

  // Drop the notice after a few seconds.
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  return { view, saved, busy, error, notice, start, resume, choose, toggleDetective, useItem, getRiddle, answerRiddle, quit, showView: setView, forget };
}
