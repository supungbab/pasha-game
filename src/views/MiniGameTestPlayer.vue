<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getMiniGameById } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { DIFFICULTY_MULTIPLIERS, type DifficultyLevel } from '@/types/game';
import { Button } from '@/components/base';
import type { MiniGameResult } from '@/types/minigame';

// Debug logging
const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) console.log('[TestPlayer]', ...args);
}

const router = useRouter();
const route = useRoute();

// Test settings
const testDifficulty = ref(1);
const testHardMode = ref(false);

// Game state
const gameState = ref<'setup' | 'playing' | 'result'>('setup');
const lastResult = ref<MiniGameResult | null>(null);
const gameKey = ref(0); // Key for forcing component re-mount

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

// Difficulty options
const difficulties = [
  { level: 1, label: 'Lv.1 (판 1-5)', emoji: '⭐' },
  { level: 2, label: 'Lv.2 (판 6-10)', emoji: '⭐⭐' },
  { level: 3, label: 'Lv.3 (판 11-15)', emoji: '⭐⭐⭐' },
  { level: 4, label: 'Lv.4 (판 16-20)', emoji: '⭐⭐⭐⭐' },
  { level: 5, label: 'Lv.5 (판 21-25)', emoji: '⭐⭐⭐⭐⭐' },
  { level: 6, label: 'Lv.6 (판 26-30)', emoji: '🔥' },
];

function startGame() {
  log('startGame called');
  log('gameData:', gameData.value);
  log('gameData.component:', gameData.value?.component);
  gameKey.value++; // Force component re-mount
  gameState.value = 'playing';
  lastResult.value = null;
  log('gameState changed to:', gameState.value);
}

function handleGameComplete(result: MiniGameResult) {
  log('handleGameComplete called with:', result);
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
  log('onMounted - gameId:', gameId.value);
  log('onMounted - gameData:', gameData.value);
  log('onMounted - isImplemented:', isImplemented.value);
  if (!gameData.value || !isImplemented.value) {
    log('Redirecting to test list - game not found or not implemented');
    router.push({ name: 'minigame-test-list' });
  }
});
</script>

<template>
  <div v-if="gameData && isImplemented" class="test-player">
    <!-- Setup Screen -->
    <div v-if="gameState === 'setup'" class="setup-screen">
      <header class="player-header">
        <Button variant="secondary" size="small" @click="goBack">
          ← 목록
        </Button>
        <h1 class="player-title">{{ gameData.instructionEmoji }} {{ gameData.name }}</h1>
        <div class="spacer"></div>
      </header>

      <div class="setup-content">
        <div class="game-info-card">
          <div class="info-row">
            <span class="info-label">게임 번호:</span>
            <span class="info-value">#{{ gameData.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">영어 이름:</span>
            <span class="info-value">{{ gameData.nameEn }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">카테고리:</span>
            <span class="info-value">{{ gameData.category }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">점수 타입:</span>
            <span class="info-value">{{ gameData.scoreType }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">기본 난이도:</span>
            <span class="info-value">{{ '⭐'.repeat(gameData.difficulty) }}</span>
          </div>
        </div>

        <div class="instruction-card">
          <h2 class="instruction-title">게임 설명</h2>
          <p class="instruction-text">{{ gameData.instruction }}</p>
        </div>

        <div class="settings-card">
          <h2 class="settings-title">테스트 설정</h2>

          <div class="setting-group">
            <label class="setting-label">난이도 선택:</label>
            <div class="difficulty-grid">
              <button
                v-for="diff in difficulties"
                :key="diff.level"
                class="difficulty-button"
                :class="{ active: testDifficulty === diff.level }"
                @click="testDifficulty = diff.level"
              >
                <span class="diff-emoji">{{ diff.emoji }}</span>
                <span class="diff-label">{{ diff.label }}</span>
              </button>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-checkbox">
              <input type="checkbox" v-model="testHardMode" />
              <span>🔥 하드 모드 (난이도 +1~2)</span>
            </label>
          </div>

          <div class="adjusted-values">
            <div class="adjusted-item">
              <span class="adjusted-label">⏱️ 제한시간</span>
              <span class="adjusted-value">{{ adjustedTimeLimit }}초</span>
              <span class="adjusted-base">(기본: {{ gameData.baseTimeLimit }}초)</span>
            </div>
            <div class="adjusted-item">
              <span class="adjusted-label">🎯 목표 점수</span>
              <span class="adjusted-value">{{ adjustedTargetScore }}점</span>
              <span class="adjusted-base">(기본: {{ gameData.baseTargetScore }}점)</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <Button
            variant="primary"
            size="large"
            full-width
            class="start-test-button"
            @click="startGame"
          >
            🎮 테스트 시작
          </Button>

          <div class="navigation-buttons">
            <Button
              variant="secondary"
              size="medium"
              :disabled="gameId === 1"
              @click="prevGame"
            >
              ← 이전 게임
            </Button>
            <Button
              variant="secondary"
              size="medium"
              :disabled="gameId === 30"
              @click="nextGame"
            >
              다음 게임 →
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Playing Screen -->
    <div v-else-if="gameState === 'playing'" class="playing-screen">
      <header class="playing-header">
        <div class="playing-info">
          <span class="playing-stage">TEST MODE</span>
          <span class="playing-difficulty">
            {{ difficulties.find(d => d.level === testDifficulty)?.emoji }}
            Lv.{{ testDifficulty }}
          </span>
          <span v-if="testHardMode" class="playing-hard">🔥 HARD</span>
        </div>
        <div class="playing-target">
          <span class="target-label">목표</span>
          <span class="target-value">{{ adjustedTargetScore }}점</span>
        </div>
      </header>

      <main class="game-container">
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
      </main>
    </div>

    <!-- Result Screen -->
    <div v-else-if="gameState === 'result' && lastResult" class="result-screen">
      <div class="result-content">
        <div class="result-icon" :class="{ success: lastResult.success }">
          {{ lastResult.success ? '✅' : '❌' }}
        </div>

        <h2 class="result-title" :class="{ success: lastResult.success }">
          {{ lastResult.success ? '목표 달성!' : '목표 실패' }}
        </h2>

        <div class="result-stats-grid">
          <div class="result-stat">
            <span class="result-stat-label">획득 점수</span>
            <span class="result-stat-value" :class="{ success: lastResult.success }">
              {{ lastResult.score }}점
            </span>
          </div>

          <div class="result-stat">
            <span class="result-stat-label">목표 점수</span>
            <span class="result-stat-value">{{ adjustedTargetScore }}점</span>
          </div>

          <div v-if="lastResult.timeRemaining !== undefined" class="result-stat">
            <span class="result-stat-label">남은 시간</span>
            <span class="result-stat-value">{{ lastResult.timeRemaining.toFixed(1) }}초</span>
          </div>

          <div v-if="lastResult.accuracy !== undefined" class="result-stat">
            <span class="result-stat-label">정확도</span>
            <span class="result-stat-value">{{ lastResult.accuracy }}%</span>
          </div>

          <div v-if="lastResult.count !== undefined" class="result-stat">
            <span class="result-stat-label">성공 횟수</span>
            <span class="result-stat-value">{{ lastResult.count }}회</span>
          </div>
        </div>

        <div class="result-actions">
          <Button variant="primary" size="large" full-width @click="restartGame">
            🔄 다시 테스트
          </Button>

          <div class="result-nav-buttons">
            <Button variant="secondary" size="medium" @click="goBack">
              ← 목록으로
            </Button>
            <Button
              variant="secondary"
              size="medium"
              :disabled="gameId === 30"
              @click="nextGame"
            >
              다음 게임 →
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-player {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  overflow-y: auto;
}

/* Setup Screen */
.setup-screen {
  min-height: 100vh;
  padding: 1rem;
  padding-bottom: 3rem;
}

.player-header {
  max-width: 800px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.player-title {
  font-size: 2rem;
  font-weight: 700;
  color: #212121;
  margin: 0;
  text-align: center;
  flex: 1;
}

.spacer {
  width: 80px;
}

.setup-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-info-card,
.instruction-card,
.settings-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #E0E0E0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #757575;
}

.info-value {
  font-weight: 700;
  color: #212121;
}

.instruction-title,
.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
  margin: 0 0 1rem 0;
}

.instruction-text {
  font-size: 1.1rem;
  color: #424242;
  margin: 0;
  line-height: 1.6;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: #424242;
  margin-bottom: 0.75rem;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.difficulty-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #FFFFFF;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.difficulty-button:hover {
  border-color: #FFD700;
  transform: translateY(-2px);
}

.difficulty-button.active {
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border-color: #F9A825;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.diff-emoji {
  font-size: 1.5rem;
}

.diff-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #424242;
}

.difficulty-button.active .diff-label {
  color: #212121;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #424242;
  cursor: pointer;
  user-select: none;
  padding: 0.75rem;
  background: #FFF8DC;
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.setting-checkbox input[type="checkbox"] {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.adjusted-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #FFF8DC;
  border-radius: 12px;
}

.adjusted-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.adjusted-label {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 600;
}

.adjusted-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
}

.adjusted-base {
  font-size: 0.8rem;
  color: #9E9E9E;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.start-test-button {
  font-size: 1.3rem !important;
}

.navigation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Playing Screen - fixed position to prevent scrolling */
.playing-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  z-index: 100;
}

.playing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid #FFD700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playing-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.playing-stage {
  font-size: 0.9rem;
  font-weight: 700;
  color: #5E35B1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.playing-difficulty {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #212121;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

.playing-hard {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(180deg, #FF6B6B 0%, #EE5A52 100%);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
}

.playing-target {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.target-label {
  font-size: 0.75rem;
  color: #757575;
  font-weight: 600;
  text-transform: uppercase;
}

.target-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #FFD700;
}

.game-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0; /* Important for flex children */
  width: 100%;
}

/* Result Screen */
.result-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-content {
  max-width: 600px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.result-icon {
  font-size: 6rem;
  margin-bottom: 1rem;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.1));
}

.result-icon.success {
  animation: successPop 0.5s ease;
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
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: #FF6B6B;
}

.result-title.success {
  color: #4CAF50;
}

.result-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #FFF8DC;
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.result-stat-label {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 600;
}

.result-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
}

.result-stat-value.success {
  color: #4CAF50;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-nav-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

@media (max-width: 768px) {
  .player-header {
    flex-direction: column;
    text-align: center;
  }

  .player-title {
    font-size: 1.5rem;
  }

  .spacer {
    display: none;
  }

  .difficulty-grid {
    grid-template-columns: 1fr;
  }

  .navigation-buttons,
  .result-nav-buttons {
    grid-template-columns: 1fr;
  }

  .adjusted-values {
    grid-template-columns: 1fr;
  }
}
</style>
