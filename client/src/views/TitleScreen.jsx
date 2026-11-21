import { useState } from 'react';

export default function TitleScreen({ game }) {
  const { saved, start, resume, forget, busy, error } = game;
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) start(name.trim());
  };

  return (
    <main className="title-screen">
      <p className="eyebrow">Gotham City Department of Corrections // Restricted</p>
      <h1 className="logo" data-text="ARKHAM">ARKHAM</h1>
      <p className="tagline">Lockdown. One night. No way off the island.</p>

      <form className="panel name-form" onSubmit={submit}>
        <label htmlFor="name">OPEN A NEW CASE FILE</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={24}
          autoComplete="off"
          autoFocus
        />
        <button type="submit" className="btn primary" disabled={busy || !name.trim()}>
          BEGIN
        </button>
      </form>

      {saved && (
        <div className="panel resume">
          <p>
            Open file found: <strong>{saved.name}</strong>
          </p>
          <div className="row">
            <button className="btn" onClick={resume} disabled={busy}>RESUME CASE FILE</button>
            <button className="btn ghost" onClick={forget} disabled={busy}>BURN IT</button>
          </div>
        </div>
      )}

      {error && <p className="error" role="alert">{error}</p>}
      <p className="footnote">Your name is logged for the case record. Nothing else is.</p>
    </main>
  );
}
