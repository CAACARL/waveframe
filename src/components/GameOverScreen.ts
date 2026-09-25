import './GameOverScreen.css';
import { createButton } from './Button';

export interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export interface GameOverScreen {
  el: HTMLElement;
  update: (props: GameOverScreenProps) => void;
  destroy: () => void;
}

export function createGameOverScreen(props: GameOverScreenProps): GameOverScreen {
  const el = document.createElement('div');
  el.className = 'game-over-screen';

  const title = document.createElement('h1');
  title.className = 'game-over-screen__title';
  title.textContent = 'Game Over';

  const scores = document.createElement('div');
  scores.className = 'game-over-screen__scores';

  const finalScore = document.createElement('div');
  finalScore.className = 'game-over-screen__score';
  const scoreLabel = document.createElement('span');
  scoreLabel.className = 'game-over-screen__score-label';
  scoreLabel.textContent = 'Final Score:';
  const scoreValue = document.createElement('span');
  scoreValue.textContent = props.score.toString();
  finalScore.appendChild(scoreLabel);
  finalScore.appendChild(scoreValue);

  const highScore = document.createElement('div');
  highScore.className = 'game-over-screen__high-score';
  highScore.textContent = `High Score: ${props.highScore}`;

  scores.appendChild(finalScore);
  scores.appendChild(highScore);

  const controls = document.createElement('div');
  controls.className = 'game-over-screen__controls';

  const restartButton = createButton({
    text: 'Play Again',
    onClick: props.onRestart,
  });

  const menuButton = createButton({
    text: 'Main Menu',
    onClick: props.onMenu,
  });

  const hint = document.createElement('p');
  hint.className = 'game-over-screen__hint';
  hint.textContent = 'Press Space to play again or Escape for menu';

  controls.appendChild(restartButton.el);
  controls.appendChild(menuButton.el);
  controls.appendChild(hint);

  el.appendChild(title);
  el.appendChild(scores);
  el.appendChild(controls);

  return {
    el,
    update(nextProps: GameOverScreenProps) {
      if (nextProps.score !== props.score) {
        scoreValue.textContent = nextProps.score.toString();
      }
      if (nextProps.highScore !== props.highScore) {
        highScore.textContent = `High Score: ${nextProps.highScore}`;
      }
      props = nextProps;
    },
    destroy() {
      restartButton.destroy();
      menuButton.destroy();
    },
  };
}
