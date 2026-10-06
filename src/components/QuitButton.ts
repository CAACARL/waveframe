import './QuitButton.css';

export interface QuitButtonProps {
  onClick: () => void;
}

export interface QuitButton {
  el: HTMLElement;
  update: (props: QuitButtonProps) => void;
  destroy: () => void;
}

export function createQuitButton(props: QuitButtonProps): QuitButton {
  const container = document.createElement('div');
  container.className = 'quit-button-container';

  const mount = document.createElement('div');
  mount.className = 'quit-button__mount';

  const arm = document.createElement('div');
  arm.className = 'quit-button__arm';

  const el = document.createElement('button');
  el.className = 'quit-button';
  el.textContent = 'QUIT';

  const handleClick = () => props.onClick();
  el.addEventListener('click', handleClick);

  arm.appendChild(el);
  container.appendChild(mount);
  container.appendChild(arm);

  return {
    el: container,
    update(nextProps: QuitButtonProps) {
      props = nextProps;
    },
    destroy() {
      el.removeEventListener('click', handleClick);
    },
  };
}
