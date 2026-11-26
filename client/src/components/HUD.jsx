import { useEffect, useState } from 'react';

const FEAR_FADE_MS = 600;

// Keeps the last fear value mounted briefly after leaving a fear section so it can fade out.
function useFearSlot(fear) {
  const [slot, setSlot] = useState(fear ? { ...fear, leaving: false } : null);
  useEffect(() => {
    if (fear) {
      setSlot({ ...fear, leaving: false });
      return undefined;
    }
    setSlot((s) => (s ? { ...s, leaving: true } : null));
    const id = setTimeout(() => setSlot(null), FEAR_FADE_MS);
    return () => clearTimeout(id);
  }, [fear?.value, fear?.tier, !!fear]); // eslint-disable-line react-hooks/exhaustive-deps
  return slot;
}

function Meter({ label, value, kind, note, className = '' }) {
  return (
    <div className={`meter ${kind} ${className}`}>
      <div className="meter-head">
        <span>{label}{note && <em className="meter-note"> {note}</em>}</span>
        <span>{value}</span>
      </div>
      <div className="meter-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function HUD({ view, onToggleDetective, onTogglePanel, panelOpen, onQuit, busy, locked, urgent }) {
  const { hud, scene, name } = view;
  const fear = useFearSlot(view.fear);
  return (
    <header className={`hud ${urgent ? 'hud--urgent' : ''} ${fear ? 'hud--fear' : ''}`}>
      <div className="hud-loc">
        <span className="loc-area">{scene.area}</span>
        <span className="loc-sub">OPERATIVE: {name}</span>
      </div>
      <Meter label="HEALTH" value={hud.health} kind="health" />
      <Meter label="ALERT" value={hud.alert} kind="alert" />
      {fear && (
        <Meter
          label="FEAR"
          value={fear.value}
          kind={`fear fear-${fear.tier}`}
          note={fear.tier.toUpperCase()}
          className={fear.leaving ? 'meter--leaving' : ''}
        />
      )}
      <div className="hud-buttons">
        {hud.detectiveMode && (
          <span className="trophy-count" title="Riddler trophies claimed">◆ {view.trophyProgress.claimed}/{view.trophyProgress.total}</span>
        )}
        <button
          className={`btn toggle ${hud.detectiveMode ? 'on' : ''}`}
          onClick={onToggleDetective}
          disabled={busy || locked || !!view.ending}
          aria-pressed={hud.detectiveMode}
          title="Toggle Detective Mode (D)"
        >
          DETECTIVE <kbd>D</kbd>
        </button>
        <button className={`btn toggle ${panelOpen ? 'on' : ''}`} disabled={locked} onClick={onTogglePanel} aria-pressed={panelOpen} title="Gear and Case Journal (I)">
          FILE <kbd>I</kbd>
        </button>
        <button className="btn ghost" onClick={onQuit} title="Leave the case. You can resume later.">
          EXIT
        </button>
      </div>
    </header>
  );
}
