import './TargetDrawer.css';
import { createTargetPreview } from './TargetPreview';
import type { Shape } from '../services/constants';

export interface TargetDrawerProps {
  shape: Shape;
}

export interface TargetDrawer {
  el: HTMLElement;
  update: (props: TargetDrawerProps) => void;
  destroy: () => void;
}

export function createTargetDrawer(props: TargetDrawerProps): TargetDrawer {
  const el = document.createElement('div');
  el.className = 'target-drawer';

  const header = document.createElement('div');
  header.className = 'target-drawer__header';
  header.textContent = 'TARGET';

  const content = document.createElement('div');
  content.className = 'target-drawer__content';

  const targetPreview = createTargetPreview({ shape: props.shape });
  content.appendChild(targetPreview.el);

  el.appendChild(header);
  el.appendChild(content);

  return {
    el,
    update(nextProps: TargetDrawerProps) {
      targetPreview.update({ shape: nextProps.shape });
      props = nextProps;
    },
    destroy() {
      targetPreview.destroy();
    },
  };
}
