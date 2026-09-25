import './Countdown.css';

export interface CountdownProps {
  value: number; // 3, 2, 1, or 0 for "GO!"
}

export interface Countdown {
  el: HTMLElement;
  update: (props: CountdownProps) => void;
  destroy: () => void;
}

export function createCountdown(props: CountdownProps): Countdown {
  const el = document.createElement('div');
  el.className = 'countdown';

  const display = document.createElement('div');
  
  function updateDisplay(value: number): void {
    if (value > 0) {
      display.className = 'countdown__number';
      display.textContent = value.toString();
    } else {
      display.className = 'countdown__text';
      display.textContent = 'GO!';
    }
  }

  updateDisplay(props.value);
  el.appendChild(display);

  return {
    el,
    update(nextProps: CountdownProps) {
      if (nextProps.value !== props.value) {
        updateDisplay(nextProps.value);
        // Restart animation
        display.style.animation = 'none';
        setTimeout(() => {
          display.style.animation = '';
        }, 10);
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
