import './MenuScreen.css';
import { createButton } from './Button';

export interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
  onShowRankings: () => void;
  onExit: () => void;
}

export interface MenuScreen {
  el: HTMLElement;
  update: (props: MenuScreenProps) => void;
  destroy: () => void;
}

export function createMenuScreen(props: MenuScreenProps): MenuScreen {
  const el = document.createElement('div');
  el.className = 'menu-screen';

  const title = document.createElement('h1');
  title.className = 'menu-screen__title';
  title.textContent = 'WAVEFRAME';

  const instructions = document.createElement('p');
  instructions.className = 'menu-screen__instructions';
  instructions.textContent = "Make hand gestures to match the target. Do that with your fingers facing the camera, though, 'cause idk how to make it read backhands XD";

  const controls = document.createElement('div');
  controls.className = 'menu-screen__controls';

  const startButton = createButton({
    text: 'Start Game',
    onClick: props.onStart,
  });

  const hint = document.createElement('p');
  hint.style.color = 'var(--text-secondary)';
  hint.style.fontSize = '14px';
  hint.textContent = 'Press Space to start';

  controls.appendChild(startButton.el);
  controls.appendChild(hint);

  el.appendChild(title);
  el.appendChild(instructions);
  el.appendChild(controls);

  // Make corner badges clickable
  const rankingsBadge = document.createElement('div');
  rankingsBadge.className = 'menu-screen__badge menu-screen__badge--rankings';
  rankingsBadge.textContent = 'RANKINGS';
  rankingsBadge.onclick = props.onShowRankings;

  const exitBadge = document.createElement('div');
  exitBadge.className = 'menu-screen__badge menu-screen__badge--exit';
  exitBadge.textContent = 'EXIT';
  exitBadge.onclick = props.onExit;

  el.appendChild(rankingsBadge);
  el.appendChild(exitBadge);

  return {
    el,
    update(nextProps: MenuScreenProps) {
      props = nextProps;
    },
    destroy() {
      startButton.destroy();
    },
  };
}
