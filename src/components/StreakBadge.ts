import './StreakBadge.css';

export interface StreakBadgeProps {
  streak: number;
}

export interface StreakBadge {
  el: HTMLElement;
  update: (props: StreakBadgeProps) => void;
  destroy: () => void;
}

export function createStreakBadge(props: StreakBadgeProps): StreakBadge {
  const el = document.createElement('div');
  el.className = 'streak-badge';
  updateStreakDisplay(el, props.streak);

  return {
    el,
    update(nextProps: StreakBadgeProps) {
      if (nextProps.streak !== props.streak) {
        updateStreakDisplay(el, nextProps.streak);
      }
      props = nextProps;
    },
    destroy() {
      // No cleanup needed
    },
  };
}

function updateStreakDisplay(el: HTMLElement, streak: number): void {
  el.textContent = streak > 0 ? `${streak}X` : '0X';
  
  // Remove all tier classes
  el.classList.remove(
    'streak-badge--tier1',
    'streak-badge--tier2',
    'streak-badge--tier3',
    'streak-badge--tier4',
    'streak-badge--tier5',
    'streak-badge--tier6',
    'streak-badge--tier7',
    'streak-badge--tier8',
    'streak-badge--tier9',
    'streak-badge--tier10'
  );
  
  // Add appropriate tier class
  if (streak >= 100) {
    el.classList.add('streak-badge--tier10');
  } else if (streak >= 90) {
    el.classList.add('streak-badge--tier9');
  } else if (streak >= 80) {
    el.classList.add('streak-badge--tier8');
  } else if (streak >= 70) {
    el.classList.add('streak-badge--tier7');
  } else if (streak >= 60) {
    el.classList.add('streak-badge--tier6');
  } else if (streak >= 50) {
    el.classList.add('streak-badge--tier5');
  } else if (streak >= 40) {
    el.classList.add('streak-badge--tier4');
  } else if (streak >= 30) {
    el.classList.add('streak-badge--tier3');
  } else if (streak >= 20) {
    el.classList.add('streak-badge--tier2');
  } else if (streak >= 10) {
    el.classList.add('streak-badge--tier1');
  }
}
