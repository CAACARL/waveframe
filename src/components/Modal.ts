import './Modal.css';

export interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

export interface Modal {
  el: HTMLElement;
  update: (props: ModalProps) => void;
  destroy: () => void;
}

export function createModal(props: ModalProps): Modal {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal__header';

  const title = document.createElement('h2');
  title.className = 'modal__title';
  title.textContent = props.title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal__close';
  closeBtn.textContent = '×';
  closeBtn.onclick = props.onClose;

  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'modal__content';
  content.innerHTML = props.content;

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      props.onClose();
    }
  };

  // Close on ESC key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  return {
    el: overlay,
    update(nextProps: ModalProps) {
      props = nextProps;
      title.textContent = props.title;
      content.innerHTML = props.content;
    },
    destroy() {
      document.removeEventListener('keydown', handleKeyDown);
    },
  };
}
