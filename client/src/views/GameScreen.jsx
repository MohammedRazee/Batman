import { useCallback, useEffect, useState } from 'react';
import HUD from '../components/HUD.jsx';
import Narration from '../components/Narration.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import SidePanel from '../components/SidePanel.jsx';

export default function GameScreen({ game }) {
  const { view, busy, error, notice, choose, toggleDetective, useItem, quit, start } = game;
  const [typed, setTyped] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fade, setFade] = useState(true);

  const onDone = useCallback(() => setTyped(true), []);

  // New scene: reset typewriter + quick fade-in. Same scene (e.g. toggling detective) keeps text.
  useEffect(() => {
    setTyped(false);
    setFade(true);
    const t = setTimeout(() => setFade(false), 450);
    return () => clearTimeout(t);
  }, [view.scene.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === 'd' && !view.ending) toggleDetective();
      if (k === 'i') setPanelOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleDetective, view.ending]);

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
        <div className="scene-card">
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
              disabled={busy}
              onChoose={choose}
              detectiveHint={view.detectiveHint}
            />
          )}

          {typed && ending && (
            <div className={`ending ${ending.died ? 'died' : ''}`}>
              <h3>{ending.title}</h3>
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

      <SidePanel hud={view.hud} onUse={useItem} busy={busy} open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
