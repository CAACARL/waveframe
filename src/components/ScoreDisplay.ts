import './ScoreDisplay.css';

export interface ScoreDisplayProps {
  score: number;
}

export interface ScoreDisplay {
  el: HTMLElement;
  update: (props: ScoreDisplayProps) => void;
  destroy: () => void;
}

export function createScoreDisplay(props: ScoreDisplayProps): ScoreDisplay {
  const el = document.createElement('div');
  el.className = 'score-display';

  const label = document.createElement('span');
  label.className = 'score-display__label';
  label.textContent = 'Score:';

  const value = document.createElement('span');
  value.textContent = props.score.toString();

  el.appendChild(label);
  el.appendChild(value);

  return {
    el,
    update(nextProps: ScoreDisplayProps) {
      if (nextProps.score !== props.score) {
        value.textContent = nextProps.score.toString();
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
