<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMiniGameById } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { DIFFICULTY_MULTIPLIERS, type DifficultyLevel } from '@/types/game';
import { Button, Card } from '@/components/base';
import { PauseMenu } from '@/components/common';
import { provideGameButtons } from '@/composables';
import type { MiniGameResult } from '@/types/minigame';

// Pause state
const isPaused = ref(false);

// 3-버튼 시스템 provide (useGameButtons 쓰는 미니게임 지원)
const { buttons: gameButtons } = provideGameButtons();

const router = useRouter();
const route = useRoute();

// Test settings
const testDifficulty = ref(1);
const testHardMode = ref(false);

// Game state
const gameState = ref<'setup' | 'playing' | 'result'>('setup');
const lastResult = ref<MiniGameResult | null>(null);
const gameKey = ref(0);

// Get game data
const gameId = computed(() => parseInt(route.params.id as string));
const gameData = computed(() => getMiniGameById(gameId.value));
const isImplemented = computed(() => IMPLEMENTED_MINIGAME_IDS.includes(gameId.value));

// Adjusted values based on difficulty
const adjustedTimeLimit = computed(() => {
  if (!gameData.value) return 10;
  const baseTime = gameData.value.baseTimeLimit;
  const diffLevel = testDifficulty.value as DifficultyLevel;
  const multiplier = DIFFICULTY_MULTIPLIERS[diffLevel]?.timeLimit ?? 1;
  return Math.max(5, Math.round(baseTime * multiplier));
});

const adjustedTargetScore = computed(() => {
  if (!gameData.value) return 100;
  const baseScore = gameData.value.baseTargetScore;
  const diffLevel = testDifficulty.value as DifficultyLevel;
  const multiplier = DIFFICULTY_MULTIPLIERS[diffLevel]?.targetScore ?? 1;
  return Math.round(baseScore * multiplier);
});

function startGame() {
  gameKey.value++;
  gameState.value = 'playing';
  lastResult.value = null;
  isPaused.value = false;
}

function togglePause() {
  isPaused.value = !isPaused.value;
}

function handleExit() {
  isPaused.value = false;
  gameState.value = 'setup';
}

function handleGameComplete(result: MiniGameResult) {
  lastResult.value = result;
  gameState.value = 'result';
}

function restartGame() {
  gameState.value = 'setup';
}

function goBack() {
  router.push({ name: 'minigame-test-list' });
}

function nextGame() {
  const nextId = gameId.value + 1;
  if (nextId <= 30) {
    router.push({ name: 'minigame-test-player', params: { id: nextId } });
  }
}

function prevGame() {
  const prevId = gameId.value - 1;
  if (prevId >= 1) {
    router.push({ name: 'minigame-test-player', params: { id: prevId } });
  }
}

// Reset state when game changes
watch(gameId, () => {
  gameState.value = 'setup';
  lastResult.value = null;
});

onMounted(() => {
  if (!gameData.value || !isImplemented.value) {
    router.push({ name: 'minigame-test-list' });
  }
});

</script>

<template>
  <div v-if="gameData && isImplemented" class="test-player">
    <!-- Setup Screen -->
    <div v-if="gameState === 'setup'" class="setup-screen">
      <!-- Header -->
      <header class="setup-header">
        <Button variant="secondary" size="small" @click="goBack">← 목록</Button>
        <span class="game-num">#{{ gameData.id }}/30</span>
      </header>

      <!-- Game Title Card -->
      <Card class="title-card">
        <div class="title-content">
          <span class="game-emoji">{{ gameData.instructionEmoji }}</span>
          <h1 class="game-title">{{ gameData.name }}</h1>
          <p class="instruction">{{ gameData.instruction }}</p>
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{{ adjustedTimeLimit }}초</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🎯</span>
            <span class="stat-value">{{ adjustedTargetScore }}점</span>
          </div>
        </div>
      </Card>

      <!-- Difficulty Selection -->
      <Card class="difficulty-card">
        <label class="section-label">난이도 선택</label>
        <div class="difficulty-row">
          <Button
            v-for="level in 6"
            :key="level"
            :variant="testDifficulty === level ? 'primary' : 'secondary'"
            size="small"
            @click="testDifficulty = level"
          >
            {{ level }}
          </Button>
        </div>
      </Card>

      <!-- Hard Mode Toggle -->
      <label class="hard-mode-toggle">
        <input type="checkbox" v-model="testHardMode" />
        <span class="toggle-text">🔥 하드 모드</span>
      </label>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <Button variant="primary" size="large" full-width @click="startGame">
          🎮 게임 시작
        </Button>

        <div class="nav-buttons">
          <Button variant="secondary" size="small" :disabled="gameId === 1" @click="prevGame">
            ← 이전
          </Button>
          <Button variant="secondary" size="small" :disabled="gameId === 30" @click="nextGame">
            다음 →
          </Button>
        </div>
      </div>
    </div>

    <!-- Playing Screen -->
    <div v-else-if="gameState === 'playing'" class="playing-screen">
      <!-- Game HUD - GameView와 동일한 스타일 -->
      <header class="game-hud">
        <button class="menu-btn" @touchstart.prevent="togglePause">☰</button>
        <div class="hud-item">Lv.{{ testDifficulty }}</div>
        <div class="hud-item">🎯{{ adjustedTargetScore }}</div>
        <div v-if="testHardMode" class="hud-item hard">🔥</div>
      </header>

      <main class="game-container">
        <div class="game-box">
          <div class="game-content">
            <component
              v-if="gameData?.component"
              :is="gameData.component"
              :key="`game-${gameId}-${gameKey}`"
              :difficulty="testDifficulty"
              :time-limit="adjustedTimeLimit"
              :target-score="adjustedTargetScore"
              :is-hard-mode="testHardMode"
              @complete="handleGameComplete"
            />
          </div>
          <!-- 하단 3-버튼 영역 (useGameButtons 쓰는 미니게임용) -->
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

      <!-- Pause Menu -->
      <PauseMenu
        v-if="isPaused"
        :subtitle="`#${gameData?.id} ${gameData?.name}`"
        @resume="togglePause"
        @exit="handleExit"
      />
    </div>

    <!-- Result Screen -->
    <div v-else-if="gameState === 'result' && lastResult" class="result-screen">
      <Card class="result-card">
        <div class="result-icon">{{ lastResult.success ? '🎉' : '😢' }}</div>
        <h2 class="result-title" :class="{ success: lastResult.success }">
          {{ lastResult.success ? '성공!' : '실패' }}
        </h2>

        <div class="result-stats">
          <div class="result-stat">
            <span class="stat-num" :class="{ success: lastResult.success }">{{ lastResult.score }}</span>
            <span class="stat-label">점수</span>
          </div>
          <div class="result-stat">
            <span class="stat-num">{{ adjustedTargetScore }}</span>
            <span class="stat-label">목표</span>
          </div>
          <div v-if="lastResult.accuracy !== undefined" class="result-stat">
            <span class="stat-num">{{ lastResult.accuracy }}%</span>
            <span class="stat-label">정확도</span>
          </div>
        </div>

        <div class="result-actions">
          <Button variant="primary" size="large" full-width @click="restartGame">
            🔄 다시하기
          </Button>
          <div class="result-nav">
            <Button variant="secondary" size="small" @click="goBack">← 목록</Button>
            <Button variant="secondary" size="small" :disabled="gameId === 30" @click="nextGame">
              다음 →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.test-player {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  overflow: hidden;
}

/* Setup Screen */
.setup-screen {
  height: 100%;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.game-num {
  font-size: 0.9rem;
  font-weight: 700;
  color: #757575;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  padding: 6px 12px;
  border-radius: 10px;
}

/* Title Card */
.title-card {
  flex-shrink: 0;
  border: 2px solid #FFD700 !important;
}

.title-content {
  text-align: center;
  margin-bottom: 16px;
}

.game-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
}

.game-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 1px 1px 0 #F9A825;
  margin: 0 0 8px 0;
}

.instruction {
  font-size: 1rem;
  color: #424242;
  margin: 0;
  font-weight: 500;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 2px solid #FFF8DC;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #424242;
}

/* Difficulty Card */
.difficulty-card {
  flex-shrink: 0;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #757575;
  margin-bottom: 12px;
  text-align: center;
}

.difficulty-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Hard Mode Toggle */
.hard-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: #FFFFFF;
  border: 2px solid #FFCDD2;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.hard-mode-toggle:has(input:checked) {
  background: #FFF0F0;
  border-color: #FF6B6B;
}

.hard-mode-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #FF6B6B;
}

.toggle-text {
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  flex-shrink: 0;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.nav-buttons > * {
  flex: 1;
}

/* Playing Screen */
.playing-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #FFF8DC;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

/* Game HUD - GameView와 동일한 스타일 */
.game-hud {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-bottom: 2px solid #FFD700;
  z-index: 100;
  flex-shrink: 0;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, #F5F5F5 0%, #E0E0E0 100%);
  color: #424242;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 0 #BDBDBD;
  transition: all 0.1s;
}

.menu-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 #BDBDBD;
}

.hud-item {
  padding: 0.3rem 0.6rem;
  background: linear-gradient(180deg, #FFF8DC 0%, #FFFAEB 100%);
  border: 2px solid #FFD700;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: #424242;
}

.hud-item.hard {
  background: linear-gradient(180deg, #FFEBEE 0%, #FFCDD2 100%);
  border-color: #FF6B6B;
}

.game-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-box {
  width: 100%;
  max-width: 400px;
  height: 100%;
  max-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFF8E1;
  display: flex;
  flex-direction: column;
}

.game-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.game-btn-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 5vw, 24px);
  padding: 14px 16px 20px;
  flex-shrink: 0;
  background: #FFF8E1;
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
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
}

.result-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
  animation: popIn 0.3s ease;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 8px;
}

.result-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #FF6B6B;
}

.result-title.success {
  color: #4CAF50;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.result-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: linear-gradient(180deg, #FFF8DC 0%, #FFFAEB 100%);
  border: 2px solid #FFD700;
  border-radius: 12px;
  min-width: 70px;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
}

.stat-num.success {
  color: #4CAF50;
}

.stat-label {
  font-size: 0.8rem;
  color: #757575;
  font-weight: 600;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-nav {
  display: flex;
  gap: 12px;
}

.result-nav > * {
  flex: 1;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile */
@media (max-width: 400px) {
  .setup-screen {
    padding: 16px 12px;
    gap: 12px;
  }

  .game-emoji {
    font-size: 2.5rem;
  }

  .game-title {
    font-size: 1.3rem;
  }

  .result-icon {
    font-size: 3.5rem;
  }

  .result-title {
    font-size: 1.5rem;
  }
}

/* Short screens */
@media (max-height: 700px) {
  .setup-screen {
    padding: 12px;
    gap: 10px;
  }

  .game-emoji {
    font-size: 2rem;
  }

  .game-title {
    font-size: 1.2rem;
    margin-bottom: 4px;
  }

  .instruction {
    font-size: 0.9rem;
  }

  .stats-row {
    padding-top: 8px;
    gap: 16px;
  }

  .hard-mode-toggle {
    padding: 10px;
  }
}
</style>
