import './HpDisplay.css';
import { STARTING_HP } from '../services/constants';

export interface HpDisplayProps {
  hp: number;
}

export interface HpDisplay {
  el: HTMLElement;
  update: (props: HpDisplayProps) => void;
  destroy: () => void;
}

export function createHpDisplay(props: HpDisplayProps): HpDisplay {
  const el = document.createElement('div');
  el.className = 'hp-display';

  const label = document.createElement('span');
  label.className = 'hp-display__label';
  label.textContent = 'HP';

  const value = document.createElement('span');
  value.className = 'hp-display__value';
  value.textContent = props.hp.toString();

  const bar = document.createElement('div');
  bar.className = 'hp-display__bar';

  const fill = document.createElement('div');
  fill.className = 'hp-display__fill';
  fill.style.width = `${(props.hp / STARTING_HP) * 100}%`;

  // Color based on HP level
  if (props.hp > 60) {
    fill.classList.add('hp-display__fill--high');
  } else if (props.hp > 30) {
    fill.classList.add('hp-display__fill--medium');
  } else {
    fill.classList.add('hp-display__fill--low');
  }

  bar.appendChild(fill);
  el.appendChild(label);
  el.appendChild(value);
  el.appendChild(bar);

  return {
    el,
    update(nextProps: HpDisplayProps) {
      if (nextProps.hp !== props.hp) {
        value.textContent = Math.max(0, nextProps.hp).toString();
        fill.style.width = `${(nextProps.hp / STARTING_HP) * 100}%`;

        // Update color based on HP level
        fill.classList.remove('hp-display__fill--high', 'hp-display__fill--medium', 'hp-display__fill--low');
        if (nextProps.hp > 60) {
          fill.classList.add('hp-display__fill--high');
        } else if (nextProps.hp > 30) {
          fill.classList.add('hp-display__fill--medium');
        } else {
          fill.classList.add('hp-display__fill--low');
        }
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
