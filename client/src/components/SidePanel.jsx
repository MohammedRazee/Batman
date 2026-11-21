import { useState } from 'react';

export default function SidePanel({ hud, onUse, busy, open, onClose }) {
  const [tab, setTab] = useState('gear');
  return (
    <aside className={`side-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="tabs">
        <button className={tab === 'gear' ? 'active' : ''} onClick={() => setTab('gear')}>
          GEAR ({hud.inventory.length})
        </button>
        <button className={tab === 'journal' ? 'active' : ''} onClick={() => setTab('journal')}>
          JOURNAL ({hud.journal.length})
        </button>
        <button className="close" onClick={onClose} aria-label="Close panel">×</button>
      </div>

      {tab === 'gear' && (
        <ul className="list">
          {hud.inventory.length === 0 && <li className="empty">Your hands are empty.</li>}
          {hud.inventory.map((item) => (
            <li key={item.id} className="item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.desc}</p>
              </div>
              {item.usable && (
                <button className="btn small" onClick={() => onUse(item.id)} disabled={busy}>
                  USE
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === 'journal' && (
        <ul className="list">
          {hud.journal.length === 0 && <li className="empty">Nothing recorded yet. Pay attention.</li>}
          {[...hud.journal].reverse().map((j) => (
            <li key={j.id} className="entry">
              <strong>{j.title}</strong>
              <p>{j.text}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
