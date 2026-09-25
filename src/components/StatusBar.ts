import './StatusBar.css';

export interface StatusBarProps {
  handDetected: boolean;
  fps: number;
  lowPowerMode: boolean;
  onToggleLowPower: () => void;
}

export interface StatusBar {
  el: HTMLElement;
  update: (props: StatusBarProps) => void;
  destroy: () => void;
}

export function createStatusBar(props: StatusBarProps): StatusBar {
  const el = document.createElement('div');
  el.className = 'status-bar';

  const left = document.createElement('div');
  left.className = 'status-bar__left';

  const handIndicator = document.createElement('div');
  handIndicator.className = 'status-bar__indicator';
  const handDot = document.createElement('div');
  handDot.className = 'status-bar__dot';
  const handText = document.createElement('span');
  handText.textContent = 'Hand';
  handIndicator.appendChild(handDot);
  handIndicator.appendChild(handText);

  const fpsDisplay = document.createElement('div');
  fpsDisplay.textContent = `${props.fps} FPS`;

  left.appendChild(handIndicator);
  left.appendChild(fpsDisplay);

  const toggle = document.createElement('button');
  toggle.className = 'status-bar__toggle';
  toggle.textContent = 'Low Power';
  
  const handleToggle = () => props.onToggleLowPower();
  toggle.addEventListener('click', handleToggle);

  el.appendChild(left);
  el.appendChild(toggle);

  function updateDisplay(p: StatusBarProps): void {
    if (p.handDetected) {
      handDot.classList.remove('status-bar__dot--inactive');
    } else {
      handDot.classList.add('status-bar__dot--inactive');
    }

    fpsDisplay.textContent = `${p.fps} FPS`;

    if (p.lowPowerMode) {
      toggle.classList.add('status-bar__toggle--active');
    } else {
      toggle.classList.remove('status-bar__toggle--active');
    }
  }

  updateDisplay(props);

  return {
    el,
    update(nextProps: StatusBarProps) {
      updateDisplay(nextProps);
      props = nextProps;
    },
    destroy() {
      toggle.removeEventListener('click', handleToggle);
    },
  };
}
