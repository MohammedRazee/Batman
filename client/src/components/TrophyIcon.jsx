// Original inline-SVG emblem: an angular question mark in a faceted frame.
export default function TrophyIcon({ claimed }) {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" className="trophy-svg">
      <polygon points="24,2 44,14 44,34 24,46 4,34 4,14" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {claimed ? (
        <polyline points="14,25 21,32 34,16" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      ) : (
        <>
          <polyline points="16,18 16,13 32,13 32,23 24,28 24,32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" />
          <rect x="22" y="36" width="4" height="4" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
