import './FeedbackFlash.css';

export interface FeedbackFlashProps {
  visible: boolean;
  success: boolean;
  accuracy: number;
}

export interface FeedbackFlash {
  el: HTMLElement;
  update: (props: FeedbackFlashProps) => void;
  destroy: () => void;
}

export function createFeedbackFlash(props: FeedbackFlashProps): FeedbackFlash {
  const el = document.createElement('div');
  el.className = 'feedback-flash';

  const message = document.createElement('div');
  const accuracy = document.createElement('div');
  accuracy.className = 'feedback-flash__accuracy';

  el.appendChild(message);
  el.appendChild(accuracy);

  function updateDisplay(p: FeedbackFlashProps): void {
    if (p.visible) {
      el.classList.add('feedback-flash--visible');
      if (p.success) {
        el.classList.add('feedback-flash--success');
        el.classList.remove('feedback-flash--fail');
        message.textContent = '✓ Match!';
      } else {
        el.classList.add('feedback-flash--fail');
        el.classList.remove('feedback-flash--success');
        message.textContent = '✗ Try Again';
      }
      accuracy.textContent = `${Math.round(p.accuracy)}%`;
    } else {
      el.classList.remove('feedback-flash--visible');
    }
  }

  updateDisplay(props);

  return {
    el,
    update(nextProps: FeedbackFlashProps) {
      updateDisplay(nextProps);
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
