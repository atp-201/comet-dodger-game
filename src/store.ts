import { useState, useEffect } from 'react';
import type { GameState, Quest, ScreenType, Upgrades } from './types';

const INITIAL_QUESTS: Quest[] = [
  { id: 'q1', descriptionVi: 'Chơi 3 ván', descriptionEn: 'Play 3 games', target: 3, current: 0, reward: 100, completed: false, type: 'games' },
  { id: 'q2', descriptionVi: 'Đạt 500 điểm trong một ván', descriptionEn: 'Score 500 in one game', target: 500, current: 0, reward: 200, completed: false, type: 'score' },
  { id: 'q3', descriptionVi: 'Thu thập 50 vàng', descriptionEn: 'Collect 50 coins', target: 50, current: 0, reward: 150, completed: false, type: 'coins' },
];

const INITIAL_STATE: Omit<GameState, 'screen' | 'currentScore' | 'currentCoins'> = {
  stats: {
    highScore: 0,
    totalCoins: 0,
    gamesPlayed: 0,
    playTimeSeconds: 0,
  },
  upgrades: {
    speedLevel: 1,
    shieldLevel: 1,
    coinMultiplier: 1,
  },
  equippedOutfit: 'default',
  unlockedOutfits: ['default'],
  quests: INITIAL_QUESTS,
  lastLoginDate: new Date().toISOString().split('T')[0],
  language: 'vi',
  darkMode: true,
  soundEnabled: true,
};

const STORAGE_KEY = 'comet_dodger_save_v1';

export function useGameStore() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check for daily quest reset
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastLoginDate !== today) {
          parsed.quests = [...INITIAL_QUESTS];
          parsed.lastLoginDate = today;
        }
        return {
          ...parsed,
          screen: 'menu',
          currentScore: 0,
          currentCoins: 0,
        };
      }
    } catch (e) {
      console.error('Failed to load save', e);
    }
    return {
      ...INITIAL_STATE,
      screen: 'menu',
      currentScore: 0,
      currentCoins: 0,
    };
  });

  // Save to local storage on change
  useEffect(() => {
    // Only save persistent state
    const { screen, currentScore, currentCoins, ...persistentState } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
  }, [state]);

  const setScreen = (screen: ScreenType) => setState((s) => ({ ...s, screen }));

  const startGame = () => setState((s) => ({ ...s, screen: 'playing', currentScore: 0, currentCoins: 0 }));

  const updateGameStats = (score: number, coins: number) => {
    setState((s) => {
      // Update Quests
      const newQuests = s.quests.map((q) => {
        if (q.completed) return q;
        let newCurrent = q.current;
        if (q.type === 'games') newCurrent += 1;
        if (q.type === 'score' && score > newCurrent) newCurrent = score;
        if (q.type === 'coins') newCurrent += coins;

        return {
          ...q,
          current: Math.min(newCurrent, q.target),
          completed: newCurrent >= q.target,
        };
      });

      return {
        ...s,
        currentScore: score,
        currentCoins: coins,
        stats: {
          ...s.stats,
          highScore: Math.max(s.stats.highScore, score),
          totalCoins: s.stats.totalCoins + coins,
          gamesPlayed: s.stats.gamesPlayed + 1,
        },
        quests: newQuests,
      };
    });
  };

  const buyUpgrade = (upgradeType: keyof Upgrades, cost: number) => {
    setState((s) => {
      if (s.stats.totalCoins >= cost) {
        return {
          ...s,
          stats: { ...s.stats, totalCoins: s.stats.totalCoins - cost },
          upgrades: { ...s.upgrades, [upgradeType]: s.upgrades[upgradeType] + 1 },
        };
      }
      return s;
    });
  };

  const buyOutfit = (outfitId: string, cost: number) => {
    setState((s) => {
      if (s.stats.totalCoins >= cost && !s.unlockedOutfits.includes(outfitId)) {
        return {
          ...s,
          stats: { ...s.stats, totalCoins: s.stats.totalCoins - cost },
          unlockedOutfits: [...s.unlockedOutfits, outfitId],
        };
      }
      return s;
    });
  };

  const equipOutfit = (outfitId: string) => {
    setState((s) => {
      if (s.unlockedOutfits.includes(outfitId)) {
        return { ...s, equippedOutfit: outfitId };
      }
      return s;
    });
  };

  const claimQuestReward = (questId: string) => {
    setState((s) => {
      const quest = s.quests.find((q) => q.id === questId);
      // We need a flag to track if claimed, let's just use 'completed' -> true, but maybe add claimed flag
      // To keep it simple, if completed, reward is given and we just remove or mark it.
      // Let's assume if current >= target, it can be claimed. Once claimed, we multiply target by 10 or something?
      // Actually, let's just give reward and maybe increase target for next level:
      if (quest && quest.current >= quest.target) {
        const newQuests = s.quests.map((q) => 
          q.id === questId ? { ...q, current: 0, target: q.target * 2, completed: false, reward: q.reward * 2 } : q
        );
        return {
          ...s,
          stats: { ...s.stats, totalCoins: s.stats.totalCoins + quest.reward },
          quests: newQuests,
        };
      }
      return s;
    });
  };

  const toggleDarkMode = () => setState(s => ({ ...s, darkMode: !s.darkMode }));
  const toggleLanguage = () => setState(s => ({ ...s, language: s.language === 'vi' ? 'en' : 'vi' }));
  const toggleSound = () => setState(s => ({ ...s, soundEnabled: !s.soundEnabled }));

  return {
    state,
    setScreen,
    startGame,
    updateGameStats,
    buyUpgrade,
    buyOutfit,
    equipOutfit,
    claimQuestReward,
    toggleDarkMode,
    toggleLanguage,
    toggleSound,
  };
}
