import './LoadingIndicator.css';

export interface LoadingIndicatorProps {
  message?: string;
  progress?: number; // 0-100
}

export interface LoadingIndicator {
  el: HTMLElement;
  update: (props: LoadingIndicatorProps) => void;
  destroy: () => void;
}

export function createLoadingIndicator(props: LoadingIndicatorProps): LoadingIndicator {
  const el = document.createElement('div');
  el.className = 'loading-indicator';

  const content = document.createElement('div');
  content.className = 'loading-indicator__content';

  const message = document.createElement('div');
  message.className = 'loading-indicator__message';
  message.textContent = props.message || 'INITIALIZING SYSTEMS';

  const barContainer = document.createElement('div');
  barContainer.className = 'loading-indicator__bar-container';

  const bar = document.createElement('div');
  bar.className = 'loading-indicator__bar';

  const progress = document.createElement('div');
  progress.className = 'loading-indicator__progress';
  progress.style.width = `${props.progress || 0}%`;

  bar.appendChild(progress);
  barContainer.appendChild(bar);
  content.appendChild(message);
  content.appendChild(barContainer);
  el.appendChild(content);

  return {
    el,
    update(nextProps: LoadingIndicatorProps) {
      if (nextProps.message && nextProps.message !== props.message) {
        message.textContent = nextProps.message;
      }
      if (nextProps.progress !== undefined && nextProps.progress !== props.progress) {
        progress.style.width = `${nextProps.progress}%`;
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}
