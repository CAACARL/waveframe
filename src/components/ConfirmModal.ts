import './ConfirmModal.css';
import { createButton } from './Button';
import { soundManager } from '../services/sounds';

export interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ConfirmModal {
  el: HTMLElement;
  update: (props: ConfirmModalProps) => void;
  destroy: () => void;
}

export function createConfirmModal(props: ConfirmModalProps): ConfirmModal {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'confirm-modal';

  const header = document.createElement('div');
  header.className = 'confirm-modal__header';

  const title = document.createElement('h2');
  title.className = 'confirm-modal__title';
  title.textContent = props.title;

  header.appendChild(title);

  const content = document.createElement('div');
  content.className = 'confirm-modal__content';
  content.textContent = props.message;

  const actions = document.createElement('div');
  actions.className = 'confirm-modal__actions';

  const cancelButton = createButton({
    text: 'Cancel',
    onClick: props.onCancel,
    variant: 'white',
  });

  const confirmButton = createButton({
    text: 'Quit',
    onClick: () => {
      soundManager.playQuit();
      props.onConfirm();
    },
    variant: 'danger-inverted',
  });

  actions.appendChild(cancelButton.el);
  actions.appendChild(confirmButton.el);

  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(actions);
  overlay.appendChild(modal);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      props.onCancel();
    }
  };

  // Close on ESC key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onCancel();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  return {
    el: overlay,
    update(nextProps: ConfirmModalProps) {
      props = nextProps;
      title.textContent = props.title;
      content.textContent = props.message;
    },
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
      cancelButton.destroy();
      confirmButton.destroy();
    },
  };
}
