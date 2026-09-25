import './RankingsScreen.css';
import { createButton } from './Button';
import type { GameRecord } from '../services/storage';

export interface RankingsScreenProps {
  gameHistory: GameRecord[];
  onBack: () => void;
}

export interface RankingsScreen {
  el: HTMLElement;
  update: (props: RankingsScreenProps) => void;
  destroy: () => void;
}

export function createRankingsScreen(props: RankingsScreenProps): RankingsScreen {
  const el = document.createElement('div');
  el.className = 'rankings-screen';

  const title = document.createElement('h1');
  title.className = 'rankings-screen__title';
  title.textContent = 'RANKINGS';

  const subtitle = document.createElement('div');
  subtitle.className = 'rankings-screen__subtitle';
  subtitle.textContent = 'TOP 10 PERFORMANCES';

  // Podium for top 3
  const podiumContainer = document.createElement('div');
  podiumContainer.className = 'rankings-screen__podium-container';

  function renderPodium(history: GameRecord[]): void {
    podiumContainer.innerHTML = '';
    
    if (history.length === 0) return;

    const podium = document.createElement('div');
    podium.className = 'rankings-screen__podium';

    // Create podium positions (2nd, 1st, 3rd visual order)
    const positions = [
      { rank: 2, position: 'left', height: '160px' },
      { rank: 1, position: 'center', height: '160px' },
      { rank: 3, position: 'right', height: '160px' },
    ];

    positions.forEach(({ rank, position, height }) => {
      const record = history[rank - 1];
      if (!record) return;

      const block = document.createElement('div');
      block.className = `rankings-screen__podium-block rankings-screen__podium-block--${position}`;
      block.style.height = height;

      const rankBadge = document.createElement('div');
      rankBadge.className = 'rankings-screen__podium-rank';
      rankBadge.textContent = `#${rank}`;

      const playerName = document.createElement('div');
      playerName.className = 'rankings-screen__podium-name';
      playerName.textContent = record.playerName || 'Anonymous';

      const scoreDisplay = document.createElement('div');
      scoreDisplay.className = 'rankings-screen__podium-score';
      scoreDisplay.textContent = record.score.toLocaleString();

      const streakDisplay = document.createElement('div');
      streakDisplay.className = 'rankings-screen__podium-streak';
      streakDisplay.textContent = `${record.streak}X`;

      block.appendChild(rankBadge);
      block.appendChild(playerName);
      block.appendChild(scoreDisplay);
      block.appendChild(streakDisplay);
      podium.appendChild(block);
    });

    podiumContainer.appendChild(podium);
  }

  renderPodium(props.gameHistory);

  const tableContainer = document.createElement('div');
  tableContainer.className = 'rankings-screen__table-container';

  const table = document.createElement('div');
  table.className = 'rankings-screen__table';

  // Header
  const header = document.createElement('div');
  header.className = 'rankings-screen__row rankings-screen__row--header';
  header.innerHTML = `
    <div class="rankings-screen__cell rankings-screen__cell--rank">RANK</div>
    <div class="rankings-screen__cell rankings-screen__cell--name">NAME</div>
    <div class="rankings-screen__cell rankings-screen__cell--score">SCORE</div>
    <div class="rankings-screen__cell rankings-screen__cell--streak">STREAK</div>
    <div class="rankings-screen__cell rankings-screen__cell--date">DATE</div>
  `;
  table.appendChild(header);

  // Rows
  function renderRows(history: GameRecord[]): void {
    // Remove existing rows (keep header)
    const existingRows = table.querySelectorAll('.rankings-screen__row:not(.rankings-screen__row--header)');
    existingRows.forEach(row => row.remove());

    if (history.length === 0) {
      const emptyRow = document.createElement('div');
      emptyRow.className = 'rankings-screen__empty';
      emptyRow.textContent = 'NO RECORDS YET';
      table.appendChild(emptyRow);
      return;
    }

    history.forEach((record, index) => {
      const row = document.createElement('div');
      row.className = 'rankings-screen__row';
      if (index === 0) row.classList.add('rankings-screen__row--first');
      if (index === 1) row.classList.add('rankings-screen__row--second');
      if (index === 2) row.classList.add('rankings-screen__row--third');

      const date = new Date(record.timestamp);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      row.innerHTML = `
        <div class="rankings-screen__cell rankings-screen__cell--rank">#${index + 1}</div>
        <div class="rankings-screen__cell rankings-screen__cell--name">${record.playerName || 'Anonymous'}</div>
        <div class="rankings-screen__cell rankings-screen__cell--score">${record.score.toLocaleString()}</div>
        <div class="rankings-screen__cell rankings-screen__cell--streak">${record.streak}X</div>
        <div class="rankings-screen__cell rankings-screen__cell--date">${formattedDate}</div>
      `;
      table.appendChild(row);
    });
  }

  renderRows(props.gameHistory);
  tableContainer.appendChild(table);

  const backButton = createButton({
    text: 'Back to Menu',
    onClick: props.onBack,
  });

  el.appendChild(title);
  el.appendChild(subtitle);
  el.appendChild(podiumContainer);
  el.appendChild(tableContainer);
  el.appendChild(backButton.el);

  return {
    el,
    update(nextProps: RankingsScreenProps) {
      if (nextProps.gameHistory !== props.gameHistory) {
        renderPodium(nextProps.gameHistory);
        renderRows(nextProps.gameHistory);
      }
      props = nextProps;
    },
    destroy() {
      backButton.destroy();
    },
  };
}
