import { STARTING_HP, BASE_DAMAGE, ROUND_TIME_MS, PASS_SCORE, SHAPES, type Shape } from './constants';
import { saveHighScore, loadHighScore, saveGameRecord } from './storage';

export type GameState = 'menu' | 'countdown' | 'playing' | 'roundResult' | 'nameInput' | 'gameOver';

export interface StoreState {
  gameState: GameState;
  score: number;
  highScore: number;
  hp: number;
  consecutiveFails: number;
  streak: number;
  maxStreak: number;
  currentTarget: Shape;
  roundStartTime: number;
  roundsCompleted: number;
  lastAccuracy: number;
  lastSuccess: boolean;
  countdownValue: number;
  pendingScore: number | null;
  pendingStreak: number | null;
}

export type Action =
  | { type: 'START' }
  | { type: 'TICK'; now: number }
  | { type: 'STROKE_SCORED'; accuracy: number }
  | { type: 'TIMEOUT' }
  | { type: 'RESTART' }
  | { type: 'TO_MENU' }
  | { type: 'SAVE_NAME'; name: string };

type Listener = (state: StoreState) => void;

let state: StoreState = {
  gameState: 'menu',
  score: 0,
  highScore: loadHighScore(),
  hp: STARTING_HP,
  consecutiveFails: 0,
  streak: 0,
  maxStreak: 0,
  currentTarget: getRandomShape(),
  roundStartTime: 0,
  roundsCompleted: 0,
  lastAccuracy: 0,
  lastSuccess: false,
  countdownValue: 3,
  pendingScore: null,
  pendingStreak: null,
};

const listeners: Listener[] = [];

function getRandomShape(): Shape {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function calculatePoints(accuracy: number, timeMs: number, streak: number): number {
  const timeBonus = Math.max(0, Math.floor((ROUND_TIME_MS - timeMs) / 100));
  const basePoints = accuracy + timeBonus;
  // Multiply by streak (5X streak = 5x multiplier)
  const streakMultiplier = Math.max(1, streak);
  return Math.floor(basePoints * streakMultiplier);
}

function notifyListeners(): void {
  listeners.forEach(listener => listener(state));
}

export function getState(): StoreState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

export function dispatch(action: Action): void {
  const prevState = state.gameState;

  switch (action.type) {
    case 'START':
      if (state.gameState === 'menu') {
        state = {
          ...state,
          gameState: 'playing',
          score: 0,
          hp: STARTING_HP,
          consecutiveFails: 0,
          streak: 0,
          maxStreak: 0,
          roundsCompleted: 0,
          currentTarget: getRandomShape(),
          roundStartTime: Date.now(),
        };
      }
      break;

    case 'TICK':
      // Removed - no longer used
      break;

    case 'STROKE_SCORED':
      if (state.gameState === 'playing') {
        const elapsed = Date.now() - state.roundStartTime;
        const success = action.accuracy >= PASS_SCORE;

        if (success) {
          const points = calculatePoints(action.accuracy, elapsed, state.streak);
          const newScore = state.score + points;
          const newStreak = state.streak + 1;
          const newMaxStreak = Math.max(state.maxStreak, newStreak);
          const newRoundsCompleted = state.roundsCompleted + 1;

          state = {
            ...state,
            gameState: 'roundResult',
            score: newScore,
            highScore: Math.max(state.highScore, newScore),
            streak: newStreak,
            maxStreak: newMaxStreak,
            roundsCompleted: newRoundsCompleted,
            lastAccuracy: action.accuracy,
            lastSuccess: true,
            consecutiveFails: 0, // Reset on success
            currentTarget: getRandomShape(),
            roundStartTime: Date.now(),
          };

          saveHighScore(state.highScore);

          // Auto-advance to next round
          setTimeout(() => {
            const currentState = getState();
            if (currentState.gameState === 'roundResult') {
              state = {
                ...currentState,
                gameState: 'playing',
              };
              notifyListeners();
            }
          }, 1500);
        } else {
          state = {
            ...state,
            gameState: 'roundResult',
            lastAccuracy: action.accuracy,
            lastSuccess: false,
          };

          // Return to playing for retry
          setTimeout(() => {
            const currentState = getState();
            if (currentState.gameState === 'roundResult') {
              state = {
                ...currentState,
                gameState: 'playing',
              };
              notifyListeners();
            }
          }, 1000);
        }
      }
      break;

    case 'TIMEOUT':
      if (state.gameState === 'playing') {
        const newConsecutiveFails = state.consecutiveFails + 1;
        const damage = BASE_DAMAGE * newConsecutiveFails; // Escalating damage
        const newHp = Math.max(0, state.hp - damage);
        const newStreak = 0;

        console.log(`TIMEOUT! Damage: ${damage} HP (${newConsecutiveFails}x consecutive fails). HP: ${state.hp} -> ${newHp}`);

        if (newHp <= 0) {
          // Go to name input screen first - use maxStreak instead of current streak
          console.log('Game over - storing pending score:', state.score, 'and max streak:', state.maxStreak);
          state = {
            ...state,
            gameState: 'nameInput',
            hp: 0,
            streak: newStreak,
            consecutiveFails: newConsecutiveFails,
            pendingScore: state.score,
            pendingStreak: state.maxStreak, // Use maxStreak, not current streak
          };
        } else {
          state = {
            ...state,
            hp: newHp,
            streak: newStreak,
            consecutiveFails: newConsecutiveFails,
            currentTarget: getRandomShape(),
            roundStartTime: Date.now(),
          };
        }
      }
      break;

    case 'RESTART':
      if (state.gameState === 'gameOver') {
        state = {
          ...state,
          gameState: 'playing',
          score: 0,
          hp: STARTING_HP,
          consecutiveFails: 0,
          streak: 0,
          maxStreak: 0,
          roundsCompleted: 0,
          currentTarget: getRandomShape(),
          roundStartTime: Date.now(),
        };
      }
      break;

    case 'TO_MENU':
      state = {
        ...state,
        gameState: 'menu',
        score: 0,
        hp: STARTING_HP,
        consecutiveFails: 0,
        streak: 0,
        maxStreak: 0,
        roundsCompleted: 0,
        currentTarget: getRandomShape(),
        pendingScore: null,
        pendingStreak: null,
      };
      break;

    case 'SAVE_NAME':
      if (state.gameState === 'nameInput' && state.pendingScore !== null) {
        console.log('Saving game record:', {
          score: state.pendingScore,
          streak: state.pendingStreak || 0,
          name: action.name
        });
        saveGameRecord(state.pendingScore, state.pendingStreak || 0, action.name);
        state = {
          ...state,
          gameState: 'gameOver',
          pendingScore: null,
          pendingStreak: null,
        };
      }
      break;
  }

  if (state.gameState === 'roundResult' && prevState !== 'roundResult') {
    // Handled in the action case
  }

  notifyListeners();
}

// Console test helpers (can be called from browser console)
(window as any).gameStore = { getState, dispatch, subscribe };
