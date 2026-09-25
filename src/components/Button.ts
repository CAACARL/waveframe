import './Button.css';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface Button {
  el: HTMLButtonElement;
  update: (props: ButtonProps) => void;
  destroy: () => void;
}

export function createButton(props: ButtonProps): Button {
  const el = document.createElement('button');
  el.className = 'button';
  el.textContent = props.text;
  el.disabled = props.disabled || false;

  const handleClick = () => props.onClick();
  el.addEventListener('click', handleClick);

  return {
    el,
    update(nextProps: ButtonProps) {
      if (nextProps.text !== props.text) {
        el.textContent = nextProps.text;
      }
      if (nextProps.disabled !== props.disabled) {
        el.disabled = nextProps.disabled || false;
      }
      props = nextProps;
    },
    destroy() {
      el.removeEventListener('click', handleClick);
    },
  };
}
