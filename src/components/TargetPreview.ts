import './TargetPreview.css';
import type { Shape } from '../services/constants';

export interface TargetPreviewProps {
  shape: Shape;
}

export interface TargetPreview {
  el: HTMLElement;
  update: (props: TargetPreviewProps) => void;
  destroy: () => void;
}

export function createTargetPreview(props: TargetPreviewProps): TargetPreview {
  const el = document.createElement('div');
  el.className = 'target-preview';

  const canvas = document.createElement('canvas');
  canvas.className = 'target-preview__canvas';
  canvas.width = 100;
  canvas.height = 100;

  const name = document.createElement('div');
  name.className = 'target-preview__name';
  
  const gestureNames: Record<Shape, string> = {
    'thumbs-up': 'Thumbs Up',
    'peace': 'Peace Sign',
    'open-hand': 'Open Hand',
    'ok-sign': 'OK Sign',
    'rock': 'Rock On',
    'pointer': 'Pointer',
    'call-me': 'Call Me',
  };
  
  name.textContent = gestureNames[props.shape];

  el.appendChild(canvas);
  el.appendChild(name);

  function drawShape(shape: Shape): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 100, 100);
    ctx.fillStyle = '#4a90e2';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw emoji representation of gesture
    const emojis: Record<Shape, string> = {
      'thumbs-up': '👍',
      'peace': '✌️',
      'open-hand': '✋',
      'ok-sign': '👌',
      'rock': '🤘',
      'pointer': '☝️',
      'call-me': '🤙',
    };

    ctx.fillText(emojis[shape], 50, 50);
  }

  drawShape(props.shape);

  return {
    el,
    update(nextProps: TargetPreviewProps) {
      if (nextProps.shape !== props.shape) {
        const gestureNames: Record<Shape, string> = {
          'thumbs-up': 'Thumbs Up',
          'peace': 'Peace Sign',
          'open-hand': 'Open Hand',
          'ok-sign': 'OK Sign',
          'rock': 'Rock On',
          'pointer': 'Pointer',
          'call-me': 'Call Me',
        };
        name.textContent = gestureNames[nextProps.shape];
        drawShape(nextProps.shape);
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
