import './TimerBar.css';

export interface TimerBarProps {
  progress: number; // 0 to 1
}

export interface TimerBar {
  el: HTMLElement;
  update: (props: TimerBarProps) => void;
  destroy: () => void;
}

export function createTimerBar(props: TimerBarProps): TimerBar {
  const el = document.createElement('div');
  el.className = 'timer-bar';

  const fill = document.createElement('div');
  fill.className = 'timer-bar__fill';
  fill.style.width = `${props.progress * 100}%`;

  el.appendChild(fill);

  return {
    el,
    update(nextProps: TimerBarProps) {
      if (nextProps.progress !== props.progress) {
        fill.style.width = `${nextProps.progress * 100}%`;
        
        if (nextProps.progress < 0.3) {
          fill.classList.add('timer-bar__fill--warning');
        } else {
          fill.classList.remove('timer-bar__fill--warning');
        }
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
