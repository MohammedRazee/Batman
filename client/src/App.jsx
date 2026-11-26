import { useGame } from './hooks/useGame.js';
import TitleScreen from './views/TitleScreen.jsx';
import GameScreen from './views/GameScreen.jsx';

export default function App() {
  const game = useGame();
  const detective = game.view?.hud.detectiveMode;
  const lowHealth = game.view && game.view.hud.health <= 30;
  const highAlert = game.view && game.view.hud.alert >= 70;
  const fear = game.view?.fear;

  const classes = [
    'app',
    detective ? 'detective' : '',
    lowHealth ? 'low-health' : '',
    highAlert ? 'high-alert' : '',
    fear ? `fear fear-${fear.tier}` : '',
  ].join(' ');

  return (
    <div className={classes}>
      <div className="fx fx-grain" aria-hidden="true" />
      <div className="fx fx-scanlines" aria-hidden="true" />
      <div className="fx fx-vignette" aria-hidden="true" />
      {detective && <div className="fx fx-sweep" aria-hidden="true" />}
      {game.view ? <GameScreen game={game} /> : <TitleScreen game={game} />}
    </div>
  );
}
