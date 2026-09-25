import './App.css';
import { subscribe, dispatch, getState } from '../services/gameStore';
import { createMenuScreen } from './MenuScreen';
import { createPlayScreen } from './PlayScreen';
import { createGameOverScreen } from './GameOverScreen';
import { createRankingsScreen } from './RankingsScreen';
import { createNameInputScreen } from './NameInputScreen';
import { loadGameHistory } from '../services/storage';
import type { MenuScreen } from './MenuScreen';
import type { PlayScreen } from './PlayScreen';
import type { GameOverScreen } from './GameOverScreen';
import type { RankingsScreen } from './RankingsScreen';
import type { NameInputScreen } from './NameInputScreen';

type Screen = MenuScreen | PlayScreen | GameOverScreen | RankingsScreen | NameInputScreen;

export interface App {
  el: HTMLElement;
}

export function createApp(): App {
  const el = document.createElement('div');
  el.className = 'app';

  let currentScreen: Screen | null = null;
  let currentScreenType: 'menu' | 'play' | 'gameOver' | 'rankings' | 'nameInput' | null = null;

  function showRankings(): void {
    currentScreenType = 'rankings';
    if (currentScreen) {
      currentScreen.destroy();
      el.removeChild(currentScreen.el);
    }
    const history = loadGameHistory();
    console.log('App: Showing rankings with history:', history);
    currentScreen = createRankingsScreen({
      gameHistory: history,
      onBack: () => {
        currentScreenType = null;
        renderScreen();
      },
    });
    el.appendChild(currentScreen.el);
  }

  function exitApp(): void {
    window.close();
    // If window.close() doesn't work (some browsers block it), reload to homepage
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  }

  function renderScreen(): void {
    const state = getState();
    
    // Determine which screen type we need
    let neededScreenType: 'menu' | 'play' | 'gameOver' | 'rankings' | 'nameInput';
    
    // Don't auto-switch away from rankings
    if (currentScreenType === 'rankings') {
      return;
    }
    
    if (state.gameState === 'menu') {
      neededScreenType = 'menu';
    } else if (state.gameState === 'playing' || state.gameState === 'countdown' || state.gameState === 'roundResult') {
      neededScreenType = 'play';
    } else if (state.gameState === 'nameInput') {
      neededScreenType = 'nameInput';
    } else {
      neededScreenType = 'gameOver';
    }

    // Only recreate screen if the type changed
    if (currentScreenType === neededScreenType && currentScreen) {
      // Just update the existing screen
      if (neededScreenType === 'menu' && currentScreen) {
        (currentScreen as MenuScreen).update({
          highScore: state.highScore,
          onStart: () => dispatch({ type: 'START' }),
          onShowRankings: showRankings,
          onExit: exitApp,
        });
      } else if (neededScreenType === 'gameOver' && currentScreen) {
        (currentScreen as GameOverScreen).update({
          score: state.score,
          highScore: state.highScore,
          onRestart: () => dispatch({ type: 'RESTART' }),
          onMenu: () => dispatch({ type: 'TO_MENU' }),
        });
      }
      return;
    }

    // Clean up previous screen
    if (currentScreen) {
      currentScreen.destroy();
      el.removeChild(currentScreen.el);
      currentScreen = null;
    }

    // Create new screen
    currentScreenType = neededScreenType;
    
    if (neededScreenType === 'menu') {
      currentScreen = createMenuScreen({
        highScore: state.highScore,
        onStart: () => dispatch({ type: 'START' }),
        onShowRankings: showRankings,
        onExit: exitApp,
      });
      el.appendChild(currentScreen.el);
    } else if (neededScreenType === 'play') {
      currentScreen = createPlayScreen({
        onQuit: () => dispatch({ type: 'TO_MENU' }),
      });
      el.appendChild(currentScreen.el);
    } else if (neededScreenType === 'nameInput') {
      currentScreen = createNameInputScreen({
        score: state.pendingScore || state.score,
        streak: state.pendingStreak || state.streak,
        onSaveName: (name: string) => dispatch({ type: 'SAVE_NAME', name }),
      });
      el.appendChild(currentScreen.el);
    } else {
      currentScreen = createGameOverScreen({
        score: state.score,
        highScore: state.highScore,
        onRestart: () => dispatch({ type: 'RESTART' }),
        onMenu: () => dispatch({ type: 'TO_MENU' }),
      });
      el.appendChild(currentScreen.el);
    }
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent): void {
    const state = getState();
    if (e.key === ' ') {
      e.preventDefault();
      if (state.gameState === 'menu') {
        dispatch({ type: 'START' });
      } else if (state.gameState === 'gameOver') {
        dispatch({ type: 'RESTART' });
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      dispatch({ type: 'TO_MENU' });
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  // Subscribe to store changes
  subscribe(renderScreen);

  // Initial render
  renderScreen();

  return { el };
}
