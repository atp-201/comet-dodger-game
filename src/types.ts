export type ScreenType = 'menu' | 'playing' | 'gameover' | 'shop' | 'quests' | 'leaderboard' | 'tutorial';

export interface Upgrades {
  speedLevel: number;
  shieldLevel: number;
  coinMultiplier: number;
}

export interface PlayerStats {
  highScore: number;
  totalCoins: number;
  gamesPlayed: number;
  playTimeSeconds: number;
}

export interface Quest {
  id: string;
  descriptionVi: string;
  descriptionEn: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  type: 'score' | 'coins' | 'games';
}

export interface GameState {
  screen: ScreenType;
  stats: PlayerStats;
  upgrades: Upgrades;
  currentScore: number;
  currentCoins: number;
  equippedOutfit: string;
  unlockedOutfits: string[];
  quests: Quest[];
  lastLoginDate: string | null;
  language: 'vi' | 'en';
  darkMode: boolean;
  soundEnabled: boolean;
}
