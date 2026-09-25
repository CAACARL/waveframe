import './LivesDisplay.css';
import { STARTING_HP } from '../services/constants';

export interface LivesDisplayProps {
  lives: number;
}

export interface LivesDisplay {
  el: HTMLElement;
  update: (props: LivesDisplayProps) => void;
  destroy: () => void;
}

export function createLivesDisplay(props: LivesDisplayProps): LivesDisplay {
  const el = document.createElement('div');
  el.className = 'lives-display';

  const hearts: HTMLSpanElement[] = [];

  for (let i = 0; i < STARTING_HP; i++) {
    const heart = document.createElement('span');
    heart.className = 'lives-display__heart';
    heart.textContent = '❤️';
    if (i >= props.lives) {
      heart.classList.add('lives-display__heart--lost');
    }
    hearts.push(heart);
    el.appendChild(heart);
  }

  return {
    el,
    update(nextProps: LivesDisplayProps) {
      if (nextProps.lives !== props.lives) {
        hearts.forEach((heart, i) => {
          if (i >= nextProps.lives) {
            heart.classList.add('lives-display__heart--lost');
          } else {
            heart.classList.remove('lives-display__heart--lost');
          }
        });
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
