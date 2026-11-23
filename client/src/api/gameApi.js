const BASE = '/api/game';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('SIGNAL LOST. Cannot reach the island. Is the server running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'SIGNAL LOST.');
    err.status = res.status;
    throw err;
  }
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body || {}) });

export const gameApi = {
  newGame: (name) => post('/new', { name }),
  resume: (id) => request(`/${id}`),
  choose: (id, choiceId, timedOut) => post(`/${id}/choose`, { choiceId, timedOut }),
  setDetective: (id, on) => post(`/${id}/detective`, { on }),
  getRiddle: (id, riddleId) => request(`/${id}/riddle/${riddleId}`),
  answerRiddle: (id, riddleId, answer) => post(`/${id}/riddle/${riddleId}`, { answer }),
  useItem: (id, itemId) => post(`/${id}/use`, { itemId }),
};
