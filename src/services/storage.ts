const STORAGE_KEY = 'air-drawing-game';

export interface GameRecord {
  score: number;
  streak: number;
  timestamp: number;
  playerName: string;
}

interface StorageData {
  highScore: number;
  gameHistory: GameRecord[];
}

const memoryFallback: StorageData = {
  highScore: 0,
  gameHistory: [],
};

export function saveGameRecord(score: number, streak: number, playerName: string = 'Anonymous'): void {
  console.log('saveGameRecord called with:', { score, streak, playerName });
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: StorageData = stored ? JSON.parse(stored) : { highScore: 0, gameHistory: [] };
    
    // Ensure gameHistory exists (for backwards compatibility with old data)
    if (!data.gameHistory) {
      console.log('gameHistory field missing, initializing...');
      data.gameHistory = [];
    }
    
    console.log('Current data before save:', data);
    
    // Add new record
    const record: GameRecord = {
      score,
      streak,
      timestamp: Date.now(),
      playerName,
    };
    
    data.gameHistory.push(record);
    
    // Keep only top 10 records
    data.gameHistory.sort((a, b) => b.score - a.score);
    data.gameHistory = data.gameHistory.slice(0, 10);
    
    // Update high score
    data.highScore = Math.max(data.highScore, score);
    
    console.log('Data after processing:', data);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Successfully saved to localStorage');
  } catch (e) {
    console.error('Error saving game record:', e);
    const record: GameRecord = { score, streak, timestamp: Date.now(), playerName };
    memoryFallback.gameHistory.push(record);
    memoryFallback.gameHistory.sort((a, b) => b.score - a.score);
    memoryFallback.gameHistory = memoryFallback.gameHistory.slice(0, 10);
    memoryFallback.highScore = Math.max(memoryFallback.highScore, score);
  }
}

export function loadGameHistory(): GameRecord[] {
  console.log('loadGameHistory called');
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage value:', stored);
    if (stored) {
      const data = JSON.parse(stored) as StorageData;
      console.log('Parsed data:', data);
      console.log('Game history:', data.gameHistory);
      return data.gameHistory || [];
    }
  } catch (e) {
    console.error('Error loading game history:', e);
    // Fall through to memory fallback
  }
  console.log('Returning memory fallback:', memoryFallback.gameHistory);
  return memoryFallback.gameHistory;
}

export function saveHighScore(score: number): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: StorageData = stored ? JSON.parse(stored) : { highScore: 0, gameHistory: [] };
    data.highScore = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    memoryFallback.highScore = score;
  }
}

export function loadHighScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as StorageData;
      return data.highScore || 0;
    }
  } catch (e) {
    // Fall through to memory fallback
  }
  return memoryFallback.highScore;
}
