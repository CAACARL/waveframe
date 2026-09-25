import './NameInputScreen.css';
import { createButton } from './Button';

export interface NameInputScreenProps {
  score: number;
  streak: number;
  onSaveName: (name: string) => void;
}

export interface NameInputScreen {
  el: HTMLElement;
  update: (props: NameInputScreenProps) => void;
  destroy: () => void;
}

export function createNameInputScreen(props: NameInputScreenProps): NameInputScreen {
  const el = document.createElement('div');
  el.className = 'name-input-screen';

  const title = document.createElement('h1');
  title.className = 'name-input-screen__title';
  title.textContent = 'Mission Complete';

  const stats = document.createElement('div');
  stats.className = 'name-input-screen__stats';

  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'name-input-screen__stat';
  scoreDisplay.innerHTML = `
    <span class="name-input-screen__stat-label">Final Score</span>
    <span class="name-input-screen__stat-value">${props.score.toLocaleString()}</span>
  `;

  const streakDisplay = document.createElement('div');
  streakDisplay.className = 'name-input-screen__stat';
  streakDisplay.innerHTML = `
    <span class="name-input-screen__stat-label">Max Streak</span>
    <span class="name-input-screen__stat-value">${props.streak}X</span>
  `;

  stats.appendChild(scoreDisplay);
  stats.appendChild(streakDisplay);

  const nameSection = document.createElement('div');
  nameSection.className = 'name-input-screen__name-section';

  const nameLabel = document.createElement('div');
  nameLabel.className = 'name-input-screen__name-label';
  nameLabel.textContent = 'ENTER YOUR NAME FOR LEADERBOARD';

  const nameInput = document.createElement('input');
  nameInput.className = 'name-input-screen__name-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'Anonymous';
  nameInput.maxLength = 20;
  nameInput.autocomplete = 'off';

  const saveButton = createButton({
    text: 'Save & Continue',
    onClick: () => {
      const name = nameInput.value.trim() || 'Anonymous';
      console.log('NameInputScreen: Save button clicked with name:', name);
      console.log('NameInputScreen: Calling onSaveName with score:', props.score, 'streak:', props.streak);
      props.onSaveName(name);
    },
  });

  nameSection.appendChild(nameLabel);
  nameSection.appendChild(nameInput);
  nameSection.appendChild(saveButton.el);

  // Handle Enter key
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveButton.el.click();
    }
  });

  el.appendChild(title);
  el.appendChild(stats);
  el.appendChild(nameSection);

  // Focus input on mount
  setTimeout(() => nameInput.focus(), 100);

  return {
    el,
    update(nextProps: NameInputScreenProps) {
      if (nextProps.score !== props.score) {
        scoreDisplay.innerHTML = `
          <span class="name-input-screen__stat-label">Final Score</span>
          <span class="name-input-screen__stat-value">${nextProps.score.toLocaleString()}</span>
        `;
      }
      if (nextProps.streak !== props.streak) {
        streakDisplay.innerHTML = `
          <span class="name-input-screen__stat-label">Max Streak</span>
          <span class="name-input-screen__stat-value">${nextProps.streak}X</span>
        `;
      }
      props = nextProps;
    },
    destroy() {
      saveButton.destroy();
    },
  };
}
