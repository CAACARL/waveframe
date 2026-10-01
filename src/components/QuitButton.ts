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
  const el = document.createElement('button');
  el.className = 'quit-button';
  el.textContent = 'QUIT';

  const handleClick = () => props.onClick();
  el.addEventListener('click', handleClick);

  return {
    el,
    update(nextProps: QuitButtonProps) {
      props = nextProps;
    },
    destroy() {
      el.removeEventListener('click', handleClick);
    },
  };
}
