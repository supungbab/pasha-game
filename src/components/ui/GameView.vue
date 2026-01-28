<template>
  <div class="game-view">
    <!-- Game HUD -->
    <header class="game-hud">
      <div class="hud-left">
        <div class="stage-info">
          <span class="stage-number">STAGE {{ gameState.state.value.currentStage }}</span>
          <span class="difficulty-badge">{{ difficultyEmoji }} Lv.{{ gameState.state.value.currentDifficulty }}</span>
          <span v-if="gameState.state.value.isHardMode" class="hard-mode-badge">🔥 HARD</span>
        </div>
      </div>
      <div class="hud-center">
        <div class="score-display">
          <span class="score-label">SCORE</span>
          <span class="score-value">{{ gameState.state.value.score }}</span>
        </div>
      </div>
      <div class="hud-right">
        <div class="lives-display">
          <span v-for="i in 3" :key="i" class="life-icon" :class="{ active: i <= gameState.state.value.lives }">
            {{ i <= gameState.state.value.lives ? '❤️' : '🖤' }}
          </span>
        </div>
      </div>
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
        <TimerBorder
          :time-limit="adjustedTimeLimit"
          :warning-threshold="3"
          :border-width="6"
          @time-up="handleTimeUp"
          @warning="handleWarning"
        >
          <component
            v-if="currentGameData"
            :is="currentGameData.component"
            :difficulty="gameState.state.value.currentDifficulty"
            :time-limit="adjustedTimeLimit"
            :target-score="adjustedTargetScore"
            :is-hard-mode="gameState.state.value.isHardMode"
            @complete="handleGameComplete"
          />
        </TimerBorder>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameState, useCleanupTimers, useAudio } from '@/composables';
import { MINI_GAMES } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { DIFFICULTY_TIERS, GAME_CONSTANTS, DIFFICULTY_MULTIPLIERS } from '@/types/game';
import { TimerBorder } from '@/components/common';
import type { MiniGameResult } from '@/types/minigame';
import type { GameResult, DifficultyLevel } from '@/types/game';

// Emits
const emit = defineEmits<{
  gameover: [result: GameResult];
  complete: [result: GameResult];
}>();

// Game state management
const gameState = useGameState();

// Timer utilities (auto-cleanup on unmount)
const { safeSetInterval, safeSetTimeout, clearInterval } = useCleanupTimers();

// Instruction countdown
const instructionCountdown = ref(3);
let instructionTimerId: number | null = null;

// Last result
const lastResult = ref<MiniGameResult | null>(null);

// Get implemented games
const implementedGames = computed(() =>
  MINI_GAMES.filter(game => IMPLEMENTED_MINIGAME_IDS.includes(game.id))
);

// Current game data
const currentGameData = computed(() => gameState.queue.value.current);

// Difficulty emoji
const difficultyEmoji = computed(() => {
  const tier = DIFFICULTY_TIERS.find(t => t.level === gameState.state.value.currentDifficulty);
  return tier?.emoji || '⭐';
});

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

// Audio for feedback
const { playSoundEffect, vibrate } = useAudio();

// Handle timer warning
function handleWarning() {
  vibrate(100);
  playSoundEffect('warning');
}

// Handle time up (game failed due to timeout)
function handleTimeUp() {
  vibrate([100, 50, 100]);
  const result: MiniGameResult = {
    success: false,
    score: 0,
    timeRemaining: 0
  };
  lastResult.value = result;
  gameState.completeMiniGame(result);
}

// Handle game completion
function handleGameComplete(result: MiniGameResult) {
  lastResult.value = result;
  gameState.completeMiniGame(result);
}
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
  font-family: inherit;
  overflow: hidden;
}

/* Game HUD */
.game-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid var(--primary-yellow);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-header);
}

.hud-left,
.hud-center,
.hud-right {
  flex: 1;
}

.hud-center {
  display: flex;
  justify-content: center;
}

.hud-right {
  display: flex;
  justify-content: flex-end;
}

.stage-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.stage-number {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.difficulty-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dark);
  box-shadow: var(--shadow-primary);
}

.hard-mode-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: var(--gradient-danger);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--white);
  box-shadow: var(--shadow-danger);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.score-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-yellow);
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.lives-display {
  display: flex;
  gap: 0.3rem;
}

.life-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.life-icon.active {
  filter: drop-shadow(0 2px 4px rgba(255, 0, 0, 0.3));
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
    padding: 0.5rem 0.75rem;
  }

  .stage-number {
    font-size: 0.85rem;
  }

  .difficulty-badge,
  .hard-mode-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .score-value {
    font-size: 1.3rem;
  }

  .life-icon {
    font-size: 1.2rem;
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
