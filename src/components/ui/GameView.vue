<template>
  <div class="game-view">
    <!-- Game HUD - CLAUDE.md 형식: ☰ ❤️❤️❤️ | #5 | ⭐60 | 🔥 -->
    <header class="game-hud">
      <button class="menu-btn" @touchstart.prevent="togglePause">☰</button>
      <div class="hud-item lives">
        <span v-for="i in 3" :key="i">{{ i <= gameState.state.value.lives ? '❤️' : '🖤' }}</span>
      </div>
      <div class="hud-item stage">#{{ gameState.state.value.currentStage }}</div>
      <div class="hud-item score">⭐{{ gameState.state.value.score }}</div>
      <div v-if="gameState.state.value.isHardMode" class="hud-item hard">🔥</div>
    </header>

    <!-- Instruction Phase -->
    <div v-if="gameState.state.value.phase === 'instruction'" class="instruction-screen">
      <div class="instruction-content">
        <div class="instruction-emoji">{{ currentGameData?.instructionEmoji }}</div>
        <h2 class="instruction-title">{{ currentGameData?.name }}</h2>
        <p class="instruction-text">{{ currentGameData?.instruction }}</p>
        <div class="countdown">{{ instructionCountdown }}</div>
      </div>
    </div>

    <!-- Playing Phase -->
    <main v-else-if="gameState.state.value.phase === 'playing'" class="game-area">
      <div class="game-box">
        <!-- 미니게임 콘텐츠 영역 -->
        <div class="game-content">
          <component
            v-if="currentGameData"
            :is="currentGameData.component"
            :difficulty="gameState.state.value.currentDifficulty"
            :time-limit="adjustedTimeLimit"
            :target-score="adjustedTargetScore"
            :is-hard-mode="gameState.state.value.isHardMode"
            @complete="handleGameComplete"
          />
        </div>
        <!-- 하단 고정 버튼 영역 (미니게임이 inject로 제어) -->
        <div
          class="game-btn-area"
          v-show="gameButtons.some(b => b.visible)"
        >
          <button
            v-for="(btn, i) in gameButtons"
            :key="i"
            v-show="btn.visible"
            :disabled="btn.disabled"
            class="game-btn"
            :style="btn.bg ? { background: btn.bg, borderColor: btn.border || 'transparent' } : {}"
            @touchstart.prevent="btn.onPress()"
            @touchend.prevent="btn.onRelease && btn.onRelease()"
          >{{ btn.label }}</button>
        </div>
      </div>
    </main>

    <!-- Result Phase -->
    <div v-else-if="gameState.state.value.phase === 'result'" class="result-screen">
      <div class="result-content" :class="lastResult?.success ? 'juicy-success-pop' : 'juicy-fail-pop'">
        <div class="result-icon" :class="{ success: lastResult?.success }">
          {{ lastResult?.success ? '✅' : '❌' }}
        </div>
        <h2 class="result-title" :class="{ success: lastResult?.success, fail: !lastResult?.success }">
          {{ lastResult?.success ? '성공!' : '실패!' }}
        </h2>
        <div class="result-stats">
          <p class="result-score juicy-bounce">+{{ lastResult?.score }} 점</p>
          <p v-if="lastResult?.accuracy !== undefined" class="result-accuracy">정확도: {{ lastResult?.accuracy }}%</p>
        </div>
      </div>
    </div>

    <!-- Pause Menu -->
    <PauseMenu
      v-if="isPaused"
      :subtitle="`STAGE ${gameState.state.value.currentStage} / ${currentGameData?.name}`"
      @resume="togglePause"
      @exit="handleExit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameState, useCleanupTimers, provideGameButtons } from '@/composables';
import { MINI_GAMES } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { GAME_CONSTANTS, DIFFICULTY_MULTIPLIERS } from '@/types/game';
import { PauseMenu } from '@/components/common';
import type { MiniGameResult } from '@/types/minigame';
import type { GameResult, DifficultyLevel } from '@/types/game';

// Emits
const emit = defineEmits<{
  gameover: [result: GameResult];
  complete: [result: GameResult];
  exit: [];
}>();

// Game state management
const gameState = useGameState();

// 3-버튼 시스템 - 미니게임들이 inject로 제어
const { buttons: gameButtons } = provideGameButtons();

// Timer utilities (auto-cleanup on unmount)
const { safeSetInterval, safeSetTimeout, clearInterval } = useCleanupTimers();

// Instruction countdown
const instructionCountdown = ref(3);
let instructionTimerId: number | null = null;

// Last result
const lastResult = ref<MiniGameResult | null>(null);

// Pause state
const isPaused = ref(false);

// Get implemented games
const implementedGames = computed(() =>
  MINI_GAMES.filter(game => IMPLEMENTED_MINIGAME_IDS.includes(game.id))
);

// Current game data
const currentGameData = computed(() => gameState.queue.value.current);

// Adjusted time limit based on difficulty
const adjustedTimeLimit = computed(() => {
  if (!currentGameData.value) return 10;
  const baseTime = currentGameData.value.baseTimeLimit;
  const multiplier = DIFFICULTY_MULTIPLIERS[gameState.state.value.currentDifficulty].timeLimit;
  return Math.max(5, Math.round(baseTime * multiplier));
});

// Adjusted target score based on difficulty
const adjustedTargetScore = computed(() => {
  if (!currentGameData.value) return 100;
  const baseScore = currentGameData.value.baseTargetScore;
  const multiplier = DIFFICULTY_MULTIPLIERS[gameState.state.value.currentDifficulty].targetScore;
  return Math.round(baseScore * multiplier);
});

// Initialize game on mount
onMounted(() => {
  gameState.initGame(implementedGames.value);
  gameState.startGame();
});

// Watch for phase changes
watch(() => gameState.state.value.phase, (newPhase) => {
  if (newPhase === 'instruction') {
    startInstructionCountdown();
  } else if (newPhase === 'result') {
    startResultTimer();
  } else if (newPhase === 'gameover') {
    // Emit game over event to parent
    const result: GameResult = {
      finalScore: gameState.state.value.score,
      clearedStages: gameState.state.value.currentStage - 1,
      maxDifficulty: gameState.state.value.maxDifficultyReached as DifficultyLevel,
      hardModeCount: gameState.state.value.hardModeCleared,
      playTime: gameState.state.value.playTime,
      continueUsed: gameState.state.value.continueUsed,
      history: [...gameState.history.value],
      bonusScore: {
        difficulty: gameState.state.value.maxDifficultyReached * GAME_CONSTANTS.DIFFICULTY_BONUS_PER_LEVEL,
        hardMode: gameState.state.value.hardModeCleared * GAME_CONSTANTS.HARD_MODE_BONUS
      }
    };
    emit('gameover', result);
  } else if (newPhase === 'complete') {
    // Emit complete event to parent
    const result: GameResult = {
      finalScore: gameState.state.value.score,
      clearedStages: GAME_CONSTANTS.TOTAL_STAGES,
      maxDifficulty: gameState.state.value.maxDifficultyReached as DifficultyLevel,
      hardModeCount: gameState.state.value.hardModeCleared,
      playTime: gameState.state.value.playTime,
      continueUsed: gameState.state.value.continueUsed,
      history: [...gameState.history.value],
      bonusScore: {
        difficulty: gameState.state.value.maxDifficultyReached * GAME_CONSTANTS.DIFFICULTY_BONUS_PER_LEVEL,
        hardMode: gameState.state.value.hardModeCleared * GAME_CONSTANTS.HARD_MODE_BONUS
      }
    };
    emit('complete', result);
  }
});

// Start instruction countdown
function startInstructionCountdown() {
  instructionCountdown.value = 3;

  if (instructionTimerId) clearInterval(instructionTimerId);

  instructionTimerId = safeSetInterval(() => {
    instructionCountdown.value--;

    if (instructionCountdown.value <= 0) {
      if (instructionTimerId) clearInterval(instructionTimerId);
      gameState.startMiniGame();
    }
  }, 1000);
}

// Start result auto-proceed timer
function startResultTimer() {
  safeSetTimeout(() => {
    gameState.proceedToNext();
  }, GAME_CONSTANTS.RESULT_DISPLAY_DURATION * 1000);
}

// Handle game completion
function handleGameComplete(result: MiniGameResult) {
  lastResult.value = result;
  gameState.completeMiniGame(result);
}

// Pause functions
function togglePause() {
  // Only allow pause during playing phase
  if (gameState.state.value.phase !== 'playing') return;
  isPaused.value = !isPaused.value;
}

function handleExit() {
  isPaused.value = false;
  emit('exit');
}
</script>

<style scoped>
.game-view {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  font-family: inherit;
  overflow: hidden;
}

/* Game HUD - 한 줄 레이아웃 */
.game-hud {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 3px solid var(--primary-yellow);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-header);
}

.menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.menu-btn:active {
  transform: scale(0.92);
  background: var(--gray-200);
}

.hud-item {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
  white-space: nowrap;
}

.hud-item.lives {
  display: flex;
  gap: 2px;
  font-size: 1.2rem;
}

.hud-item.stage {
  color: var(--accent-purple);
  font-size: 1.2rem;
}

.hud-item.score {
  color: var(--primary-yellow);
  font-size: 1.2rem;
  margin-left: auto;
}

.hud-item.hard {
  font-size: 1.3rem;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Instruction Screen */
.instruction-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.instruction-content {
  text-align: center;
  padding: 2rem;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.instruction-emoji {
  font-size: 6rem;
  margin-bottom: 1rem;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.1));
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.instruction-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 1rem 0;
  letter-spacing: 0.05em;
}

.instruction-text {
  font-size: 1.3rem;
  color: var(--text-medium);
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

.countdown {
  font-size: 4rem;
  font-weight: 700;
  color: var(--primary-yellow);
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Game Area */
.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 12px;
}

/* Game Box - contains the minigame with timer border */
.game-box {
  width: 100%;
  max-width: 400px;
  height: 100%;
  max-height: 600px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--white);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

/* 미니게임 콘텐츠 영역 */
.game-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* 하단 3-버튼 고정 영역 */
.game-btn-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 5vw, 24px);
  padding: 14px 16px 20px;
  flex-shrink: 0;
  background: var(--bg-game, #FFF8E1);
}

.game-btn {
  width: clamp(72px, 22vw, 96px);
  height: clamp(72px, 22vw, 96px);
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border: 4px solid #F9A825;
  font-size: clamp(28px, 8vw, 40px);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-btn:active {
  transform: scale(0.92);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.game-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

/* Result Screen */
.result-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.result-content {
  text-align: center;
  padding: 2rem;
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.result-icon {
  font-size: 6rem;
  margin-bottom: 1rem;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.1));
}

.result-icon.success {
  animation: successPop 0.5s ease, juicyCelebrate 2s ease-in-out infinite 0.5s;
}

@keyframes juicyCelebrate {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}

@keyframes successPop {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

.result-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  letter-spacing: 0.05em;
}

.result-title.success {
  color: var(--success);
  text-shadow: 3px 3px 0 rgba(76, 175, 80, 0.2);
}

.result-title.fail {
  color: var(--error);
  text-shadow: 3px 3px 0 rgba(244, 67, 54, 0.2);
}

.result-stats {
  margin-bottom: 1rem;
}

.result-score {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-yellow);
  margin: 0.5rem 0;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.result-accuracy {
  font-size: 1.2rem;
  color: var(--text-medium);
  margin: 0.3rem 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile responsive */
@media (max-width: 600px) {
  .game-hud {
    padding: 0.4rem 0.6rem;
    gap: 0.4rem;
  }

  .menu-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .hud-item {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }

  .instruction-emoji {
    font-size: 4rem;
  }

  .instruction-title {
    font-size: 2rem;
  }

  .instruction-text {
    font-size: 1.1rem;
  }

  .countdown {
    font-size: 3rem;
  }

  .result-icon {
    font-size: 4rem;
  }

  .result-title {
    font-size: 2.2rem;
  }

  .result-score {
    font-size: 1.6rem;
  }

  .game-area {
    padding: 8px;
  }

  .game-box {
    border-radius: var(--radius-md);
  }
}
</style>
