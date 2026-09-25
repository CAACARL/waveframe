import './Hud.css';
import { createTimerBar } from './TimerBar';
import { createScoreDisplay } from './ScoreDisplay';
import { createStreakBadge } from './StreakBadge';
import { createHpDisplay } from './HpDisplay';
import type { Shape } from '../services/constants';

export interface HudProps {
  score: number;
  streak: number;
  hp: number;
  timerProgress: number;
  targetShape: Shape;
}

export interface Hud {
  el: HTMLElement;
  update: (props: HudProps) => void;
  destroy: () => void;
}

export function createHud(props: HudProps): Hud {
  const el = document.createElement('div');
  el.className = 'hud';

  const top = document.createElement('div');
  top.className = 'hud__top';

  const stats = document.createElement('div');
  stats.className = 'hud__stats';

  const scoreDisplay = createScoreDisplay({ score: props.score });
  const streakBadge = createStreakBadge({ streak: props.streak });
  const hpDisplay = createHpDisplay({ hp: props.hp });

  stats.appendChild(scoreDisplay.el);
  stats.appendChild(streakBadge.el);
  stats.appendChild(hpDisplay.el);

  top.appendChild(stats);

  const timerBar = createTimerBar({ progress: props.timerProgress });

  el.appendChild(top);
  el.appendChild(timerBar.el);

  return {
    el,
    update(nextProps: HudProps) {
      scoreDisplay.update({ score: nextProps.score });
      streakBadge.update({ streak: nextProps.streak });
      hpDisplay.update({ hp: nextProps.hp });
      timerBar.update({ progress: nextProps.timerProgress });
      props = nextProps;
    },
    destroy() {
      scoreDisplay.destroy();
      streakBadge.destroy();
      hpDisplay.destroy();
      timerBar.destroy();
    },
  };
}
