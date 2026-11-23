import { useCallback, useEffect, useState } from 'react';
import HUD from '../components/HUD.jsx';
import Narration from '../components/Narration.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import SidePanel from '../components/SidePanel.jsx';
import TrophyIcon from '../components/TrophyIcon.jsx';
import RiddleModal from '../components/RiddleModal.jsx';

export default function GameScreen({ game }) {
  const { view, busy, error, notice, choose, toggleDetective, useItem, quit, start, getRiddle, answerRiddle } = game;
  const [typed, setTyped] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fade, setFade] = useState(true);
  const [riddleOpen, setRiddleOpen] = useState(false);
  const trophy = view.scene.trophy;

  const onDone = useCallback(() => setTyped(true), []);

  // New scene: reset typewriter + quick fade-in. Same scene (e.g. toggling detective) keeps text.
  useEffect(() => {
    setTyped(false);
    setFade(true);
    const t = setTimeout(() => setFade(false), 450);
    return () => clearTimeout(t);
  }, [view.scene.id]);

  useEffect(() => setRiddleOpen(false), [view.scene.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (riddleOpen || e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === 'd' && !view.ending) toggleDetective();
      if (k === 'i') setPanelOpen((o) => !o);
      if (k === 't' && trophy && typed) setRiddleOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleDetective, view.ending, riddleOpen, trophy, typed]);

  const ending = view.ending;

  return (
    <div className={`game ${fade ? 'fading' : ''}`}>
      <HUD
        view={view}
        busy={busy}
        onToggleDetective={toggleDetective}
        onTogglePanel={() => setPanelOpen((o) => !o)}
        panelOpen={panelOpen}
        onQuit={quit}
      />

      <main className="stage">
        <div className="scene-card scene-stage">
          {typed && trophy && (
            <button
              className={`trophy ${trophy.claimed ? 'claimed' : ''}`}
              style={{ left: `${trophy.x}%`, top: `${trophy.y}%` }}
              onClick={() => setRiddleOpen(true)}
              title={trophy.claimed ? 'Solved' : 'Inspect'}
              aria-label={trophy.claimed ? 'Solved riddle trophy' : 'Inspect riddle trophy'}
            >
              <TrophyIcon claimed={trophy.claimed} />
            </button>
          )}
          <p className="scene-area">{view.scene.area}</p>
          <h2 className="scene-title">{view.scene.title}</h2>

          <Narration key={view.scene.id} text={view.scene.text} onDone={onDone} />

          {typed && view.scene.detectiveText && (
            <div className="detective-note">
              <span className="tag">DETECTIVE</span>
              <p>{view.scene.detectiveText}</p>
            </div>
          )}

          {notice && <p className="notice" role="status">{notice}</p>}
          {error && <p className="error" role="alert">{error}</p>}

          {typed && !ending && (
            <ChoiceList
              choices={view.choices}
              disabled={busy || riddleOpen}
              onChoose={choose}
              detectiveHint={view.detectiveHint}
            />
          )}

          {typed && ending && (
            <div className={`ending ${ending.died ? 'died' : ''}`}>
              <h3>{ending.title}</h3>
              {ending.epilogue && <p className="epilogue">{ending.epilogue}</p>}
              <div className="row">
                <button className="btn primary" onClick={() => start(view.name)} disabled={busy}>
                  OPEN A NEW CASE
                </button>
                <button className="btn ghost" onClick={quit}>
                  TITLE
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {riddleOpen && trophy && (
        <RiddleModal riddleId={trophy.riddleId} getRiddle={getRiddle} answerRiddle={answerRiddle} onClose={() => setRiddleOpen(false)} />
      )}
      <SidePanel hud={view.hud} onUse={useItem} busy={busy} open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
