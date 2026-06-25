import React from 'react';
import { useGameStore } from '../store';
import { GameCanvas } from './GameCanvas';
import { 
  Play, ShoppingBag, Target, Trophy, Settings, X, 
  Moon, Sun, Languages, Volume2, VolumeX, Shield, Zap, Coins, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function GameUI() {
  const { 
    state, setScreen, startGame, updateGameStats, 
    buyUpgrade, buyOutfit, equipOutfit, claimQuestReward,
    toggleDarkMode, toggleLanguage, toggleSound
  } = useGameStore();

  const handleGameOver = (score: number, coins: number) => {
    updateGameStats(score, coins);
    setScreen('gameover');
  };

  const isVi = state.language === 'vi';
  const t = (vi: string, en: string) => isVi ? vi : en;

  const textPrimary = state.darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = state.darkMode ? 'text-slate-300' : 'text-slate-600';

  const bgClasses = state.darkMode 
    ? `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black ${textPrimary}` 
    : `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white ${textPrimary}`;
  const cardClasses = state.darkMode 
    ? `bg-slate-900/60 border-slate-700/50 backdrop-blur-xl shadow-2xl ${textPrimary}` 
    : `bg-white/60 border-slate-200/50 backdrop-blur-xl shadow-2xl ${textPrimary}`;
  const btnClasses = 'px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2';
  const primaryBtn = `${btnClasses} bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]`;
  const secondaryBtn = `${btnClasses} ${state.darkMode ? 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200' : 'bg-white/80 hover:bg-slate-100/80 border border-slate-200/50 text-slate-700'}`;


  const borderColor = state.darkMode ? 'border-slate-700' : 'border-slate-200';
  const borderLightColor = state.darkMode ? 'border-slate-700/50' : 'border-slate-200/50';
  const disabledBtnColor = state.darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400';
  const itemHoverBgColor = state.darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100';
  const secondaryBtnActionColor = state.darkMode ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900';
  const progressBgColor = state.darkMode ? 'bg-slate-700' : 'bg-slate-200';
  const coinTextColor = state.darkMode ? 'text-yellow-400' : 'text-amber-600';
  const coinIconBgColor = state.darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-amber-100 text-amber-600';

  const textBlue = state.darkMode ? 'text-blue-400' : 'text-blue-600';
  const textEmerald = state.darkMode ? 'text-emerald-400' : 'text-emerald-600';
  const textAmber = state.darkMode ? 'text-amber-400' : 'text-amber-600';
  const textRose = state.darkMode ? 'text-rose-400' : 'text-rose-600';
  
  const bgBlueIcon = state.darkMode ? 'bg-blue-500/20' : 'bg-blue-100';
  const bgEmeraldIcon = state.darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100';

  // Menu Screen
  if (state.screen === 'playing') {
    return (
      <div className={`fixed inset-0 overflow-hidden ${bgClasses}`}>
        <GameCanvas state={state} onGameOver={handleGameOver} />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden flex flex-col items-center justify-center ${bgClasses} p-4 sm:p-8 font-sans transition-colors duration-300`}>
      {/* Decorative Background Elements */}
      {state.screen !== 'playing' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Settings / Top Bar */}
      <div className={`absolute top-4 right-4 flex gap-2 z-50 ${textPrimary}`}>
        <button onClick={toggleLanguage} className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors">
          <Languages size={24} />
        </button>
        <button onClick={toggleSound} className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors">
          {state.soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors">
          {state.darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={state.screen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md flex flex-col gap-6"
        >
          {state.screen === 'menu' && (
            <div className="flex flex-col items-center text-center gap-8">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  COMET DODGER
                </h1>
                <p className={`text-lg tracking-widest uppercase font-bold ${textSecondary}`}>
                  {t('Sống sót giữa vì sao', 'Survive the stars')}
                </p>
              </div>

              <button onClick={startGame} className={`${primaryBtn} w-full text-xl py-4 group`}>
                <Play className="transition-transform group-hover:scale-125" fill="currentColor" /> {t('Chơi ngay', 'Play Now')}
              </button>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={() => setScreen('shop')} className={secondaryBtn}>
                  <ShoppingBag size={20} className={textAmber} /> {t('Cửa hàng', 'Shop')}
                </button>
                <button onClick={() => setScreen('quests')} className={secondaryBtn}>
                  <Target size={20} className={textRose} /> {t('Nhiệm vụ', 'Quests')}
                </button>
                <button onClick={() => setScreen('leaderboard')} className={secondaryBtn}>
                  <Trophy size={20} className={textEmerald} /> {t('Thành tích', 'Stats')}
                </button>
                <button onClick={() => setScreen('tutorial')} className={secondaryBtn}>
                  <HelpCircle size={20} className={textBlue} /> {t('Hướng dẫn', 'How to Play')}
                </button>
              </div>
            </div>
          )}

          {state.screen === 'gameover' && (
            <div className={`flex flex-col items-center text-center gap-6 p-8 rounded-3xl border ${cardClasses}`}>
              <h2 className="text-4xl font-black text-red-500">{t('TRÒ CHƠI KẾT THÚC', 'GAME OVER')}</h2>
              
              <div className={`flex w-full justify-around py-4 border-y ${borderLightColor}`}>
                <div className="flex flex-col">
                  <span className="text-sm opacity-60 uppercase tracking-wider">{t('Điểm', 'Score')}</span>
                  <span className="text-3xl font-mono">{state.currentScore}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm opacity-60 uppercase tracking-wider">{t('Kỷ lục', 'Best')}</span>
                  <span className={`text-3xl font-mono ${textBlue}`}>{state.stats.highScore}</span>
                </div>
              </div>

              <div className={`flex items-center gap-2 font-bold text-xl ${coinTextColor}`}>
                <Coins /> +{state.currentCoins} {t('Vàng', 'Coins')}
              </div>

              <div className="flex gap-4 w-full pt-4">
                <button onClick={() => setScreen('menu')} className={`${secondaryBtn} flex-1`}>
                  {t('Menu', 'Menu')}
                </button>
                <button onClick={startGame} className={`${primaryBtn} flex-1`}>
                  <Play fill="currentColor" /> {t('Chơi Lại', 'Restart')}
                </button>
              </div>
            </div>
          )}

          {state.screen === 'shop' && (
            <div className="flex flex-col gap-6 h-[80vh] overflow-y-auto pr-2 pb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">{t('CỬA HÀNG', 'SHOP')}</h2>
                <div className={`flex items-center gap-2 font-bold text-xl ${coinTextColor}`}>
                  <Coins /> {state.stats.totalCoins}
                </div>
              </div>

              {/* Upgrades */}
              <div className={`p-4 rounded-2xl border ${cardClasses} space-y-4`}>
                <h3 className={`text-xl font-bold border-b ${borderColor} pb-2`}>{t('Nâng cấp Kỹ năng', 'Skill Upgrades')}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgBlueIcon} ${textBlue}`}><Zap size={24} /></div>
                    <div>
                      <div className="font-bold">{t('Tốc độ', 'Speed')} (Lv {state.upgrades.speedLevel})</div>
                      <div className="text-sm opacity-60">Cost: {state.upgrades.speedLevel * 100} <Coins inline size={14}/></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => buyUpgrade('speedLevel', state.upgrades.speedLevel * 100)}
                    disabled={state.stats.totalCoins < state.upgrades.speedLevel * 100}
                    className={`px-4 py-2 text-sm rounded-lg font-bold ${state.stats.totalCoins >= state.upgrades.speedLevel * 100 ? 'bg-blue-600 hover:bg-blue-500 text-white' : disabledBtnColor}`}
                  >
                    {t('Nâng', 'Upgrade')}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgEmeraldIcon} ${textEmerald}`}><Shield size={24} /></div>
                    <div>
                      <div className="font-bold">{t('Thời gian Khiên', 'Shield Time')} (Lv {state.upgrades.shieldLevel})</div>
                      <div className="text-sm opacity-60">Cost: {state.upgrades.shieldLevel * 150} <Coins inline size={14}/></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => buyUpgrade('shieldLevel', state.upgrades.shieldLevel * 150)}
                    disabled={state.stats.totalCoins < state.upgrades.shieldLevel * 150}
                    className={`px-4 py-2 text-sm rounded-lg font-bold ${state.stats.totalCoins >= state.upgrades.shieldLevel * 150 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : disabledBtnColor}`}
                  >
                    {t('Nâng', 'Upgrade')}
                  </button>
                </div>
              </div>

              {/* Outfits */}
              <div className={`p-4 rounded-2xl border ${cardClasses} space-y-4`}>
                <h3 className={`text-xl font-bold border-b ${borderColor} pb-2`}>{t('Trang phục', 'Outfits')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'default', name: 'Original', color: 'bg-blue-600', cost: 0 },
                    { id: 'neon', name: 'Neon', color: 'bg-cyan-400', cost: 500 },
                    { id: 'ninja', name: 'Ninja', color: 'bg-emerald-500', cost: 1000 },
                    { id: 'gold', name: 'Golden', color: 'bg-amber-400', cost: 3000 },
                  ].map(outfit => {
                    const isUnlocked = state.unlockedOutfits.includes(outfit.id);
                    const isEquipped = state.equippedOutfit === outfit.id;
                    return (
                      <div key={outfit.id} className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-colors ${isEquipped ? 'border-blue-500 bg-blue-500/10' : `${borderColor} ${itemHoverBgColor}`}`}>
                        <div className={`w-8 h-8 rounded-full ${outfit.color} mb-2 shadow-lg shadow-current`}></div>
                        <div className="font-bold text-sm">{outfit.name}</div>
                        {isUnlocked ? (
                          <button 
                            onClick={() => equipOutfit(outfit.id)}
                            className={`px-4 py-1 text-xs rounded-full font-bold ${isEquipped ? 'bg-blue-600 text-white' : secondaryBtnActionColor}`}
                          >
                            {isEquipped ? t('Đang dùng', 'Equipped') : t('Chọn', 'Equip')}
                          </button>
                        ) : (
                          <button 
                            onClick={() => buyOutfit(outfit.id, outfit.cost)}
                            disabled={state.stats.totalCoins < outfit.cost}
                            className={`px-4 py-1 text-xs rounded-full font-bold flex items-center justify-center gap-1 ${state.stats.totalCoins >= outfit.cost ? 'bg-amber-600 hover:bg-amber-500 text-white' : disabledBtnColor}`}
                          >
                            {outfit.cost} <Coins size={12}/>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button onClick={() => setScreen('menu')} className={`${secondaryBtn} mt-auto`}>
                <X size={20} /> {t('Đóng', 'Close')}
              </button>
            </div>
          )}

          {state.screen === 'quests' && (
            <div className="flex flex-col gap-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black">{t('NHIỆM VỤ', 'QUESTS')}</h2>
                <div className="text-sm opacity-60">{t('Cập nhật mỗi ngày', 'Daily Refresh')}</div>
              </div>

              <div className="space-y-3">
                {state.quests.map(quest => (
                  <div key={quest.id} className={`p-4 rounded-2xl border ${cardClasses} flex flex-col gap-3 relative overflow-hidden`}>
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <div className="font-bold">{isVi ? quest.descriptionVi : quest.descriptionEn}</div>
                        <div className={`text-sm font-bold flex items-center gap-1 mt-1 ${coinTextColor}`}>
                          <Coins size={14}/> {quest.reward}
                        </div>
                      </div>
                      <div className="font-mono text-sm opacity-70">
                        {quest.current} / {quest.target}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`h-2 w-full rounded-full overflow-hidden z-10 ${progressBgColor}`}>
                      <div 
                        className={`h-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                      ></div>
                    </div>

                    {quest.completed && (
                      <button 
                        onClick={() => claimQuestReward(quest.id)}
                        className="mt-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors z-10"
                      >
                        {t('Nhận thưởng', 'Claim Reward')}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => setScreen('menu')} className={secondaryBtn}>
                <X size={20} /> {t('Quay lại', 'Back')}
              </button>
            </div>
          )}

          {state.screen === 'leaderboard' && (
            <div className="flex flex-col gap-6 w-full max-w-md">
              <h2 className="text-3xl font-black text-center">{t('THỐNG KÊ', 'STATISTICS')}</h2>
              
              <div className={`p-6 rounded-3xl border ${cardClasses} space-y-4`}>
                <div className={`flex justify-between items-center py-2 border-b ${borderLightColor}`}>
                  <span className="opacity-70">{t('Kỷ lục điểm', 'High Score')}</span>
                  <span className={`font-mono text-2xl font-bold ${textBlue}`}>{state.stats.highScore}</span>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${borderLightColor}`}>
                  <span className="opacity-70">{t('Số ván đã chơi', 'Games Played')}</span>
                  <span className="font-mono text-xl">{state.stats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="opacity-70">{t('Tổng vàng kiếm được', 'Total Coins')}</span>
                  <span className={`font-mono text-xl ${coinTextColor}`}>{state.stats.totalCoins}</span>
                </div>
              </div>
              
              <p className="text-center text-sm opacity-50 px-8">
                {t('Bảng xếp hạng toàn cầu đang được bảo trì. Dữ liệu trên là thống kê cá nhân của bạn trên thiết bị này.', 
                  'Global leaderboard is under maintenance. The data above is your local performance.')}
              </p>

              <button onClick={() => setScreen('menu')} className={secondaryBtn}>
                <X size={20} /> {t('Quay lại', 'Back')}
              </button>
            </div>
          )}
          {state.screen === 'tutorial' && (
            <div className="flex flex-col gap-6 w-full max-w-md">
              <h2 className="text-3xl font-black text-center">{t('HƯỚNG DẪN', 'HOW TO PLAY')}</h2>
              
              <div className={`p-6 rounded-3xl border ${cardClasses} space-y-6 text-sm md:text-base`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${bgBlueIcon} ${textBlue}`}><Play size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg">{t('Di chuyển', 'Movement')}</h3>
                    <p className="opacity-70 mt-1">
                      {t('Sử dụng phím WASD hoặc Mũi Tên trên máy tính. Trượt ngón tay trên màn hình nếu chơi trên điện thoại.', 
                         'Use WASD or Arrow keys on PC. Drag your finger on the screen on mobile devices.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/20 text-red-400 rounded-xl shrink-0"><Target size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg">{t('Né Sao Chổi', 'Dodge Comets')}</h3>
                    <p className="opacity-70 mt-1">
                      {t('Tránh va chạm với các sao chổi màu đỏ. Càng sống lâu, sao chổi xuất hiện càng nhiều và di chuyển càng nhanh.', 
                         'Avoid colliding with the red comets. The longer you survive, the more comets will appear and the faster they move.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${coinIconBgColor}`}><Coins size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg">{t('Thu thập Vàng', 'Collect Coins')}</h3>
                    <p className="opacity-70 mt-1">
                      {t('Thu thập các đồng tiền vàng để mua trang phục mới và nâng cấp kỹ năng trong Cửa hàng.', 
                         'Collect gold coins to buy new outfits and upgrade your skills in the Shop.')}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => setScreen('menu')} className={secondaryBtn}>
                <X size={20} /> {t('Đã hiểu', 'Got it')}
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
