function Meter({ label, value, kind }) {
  return (
    <div className={`meter ${kind}`}>
      <div className="meter-head">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="meter-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function HUD({ view, onToggleDetective, onTogglePanel, panelOpen, onQuit, busy }) {
  const { hud, scene, name } = view;
  return (
    <header className="hud">
      <div className="hud-loc">
        <span className="loc-area">{scene.area}</span>
        <span className="loc-sub">OPERATIVE: {name}</span>
      </div>
      <Meter label="HEALTH" value={hud.health} kind="health" />
      <Meter label="ALERT" value={hud.alert} kind="alert" />
      <div className="hud-buttons">
        <button
          className={`btn toggle ${hud.detectiveMode ? 'on' : ''}`}
          onClick={onToggleDetective}
          disabled={busy || !!view.ending}
          aria-pressed={hud.detectiveMode}
          title="Toggle Detective Mode (D)"
        >
          DETECTIVE <kbd>D</kbd>
        </button>
        <button className={`btn toggle ${panelOpen ? 'on' : ''}`} onClick={onTogglePanel} aria-pressed={panelOpen} title="Gear and Case Journal (I)">
          FILE <kbd>I</kbd>
        </button>
        <button className="btn ghost" onClick={onQuit} title="Leave the case. You can resume later.">
          EXIT
        </button>
      </div>
    </header>
  );
}
