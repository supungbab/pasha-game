<template>
  <div class="game-view">
    <header class="game-header">
      <h1>빠샤! 미니게임</h1>
      <div v-if="!currentGame" class="game-selector">
        <h2>미니게임 선택</h2>
        <div class="game-grid">
          <button
            v-for="game in availableGames"
            :key="game.id"
            class="game-button"
            @click="selectGame(game.id)"
          >
            <span class="game-emoji">{{ game.instructionEmoji }}</span>
            <span class="game-name">{{ game.name }}</span>
          </button>
        </div>
      </div>
    </header>

    <main v-if="currentGame" class="game-area">
      <div class="game-info">
        <div class="info-item">
          <span class="label">점수</span>
          <span class="value">{{ currentScore }}</span>
        </div>
        <div class="info-item">
          <span class="label">목표</span>
          <span class="value">{{ targetScore }}</span>
        </div>
        <div class="info-item">
          <span class="label">시간</span>
          <span class="value">{{ timeRemaining.toFixed(1) }}s</span>
        </div>
        <button class="back-btn" @click="exitGame">나가기</button>
      </div>

      <component
        :is="currentGame.component"
        :difficulty="difficulty"
        :time-limit="currentGame.baseTimeLimit"
        :target-score="targetScore"
        :is-hard-mode="isHardMode"
        @complete="handleGameComplete"
      />
    </main>

    <div v-if="showResult" class="result-overlay">
      <div class="result-modal">
        <h2 :class="{ success: gameResult?.success, fail: !gameResult?.success }">
          {{ gameResult?.success ? '성공!' : '실패!' }}
        </h2>
        <div class="result-stats">
          <p>점수: {{ gameResult?.score }}</p>
          <p v-if="gameResult?.accuracy !== undefined">정확도: {{ gameResult?.accuracy }}%</p>
          <p v-if="gameResult?.count !== undefined">수집: {{ gameResult?.count }}개</p>
        </div>
        <div class="result-buttons">
          <button @click="retryGame">다시 하기</button>
          <button @click="exitGame">메뉴로</button>
        </div>
      </div>
    </div>

    <footer class="game-footer">
      <div class="difficulty-control">
        <label>난이도: </label>
        <select v-model="difficulty">
          <option :value="1">Lv.1 (쉬움)</option>
          <option :value="2">Lv.2</option>
          <option :value="3">Lv.3</option>
          <option :value="4">Lv.4</option>
          <option :value="5">Lv.5</option>
          <option :value="6">Lv.6 (어려움)</option>
        </select>
        <label class="hard-mode">
          <input type="checkbox" v-model="isHardMode" />
          하드모드
        </label>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MINI_GAMES } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import type { MiniGame, MiniGameResult } from '@/types/minigame';

// Game state
const currentGame = ref<MiniGame | null>(null);
const difficulty = ref(1);
const isHardMode = ref(false);
const showResult = ref(false);
const gameResult = ref<MiniGameResult | null>(null);
const currentScore = ref(0);
const timeRemaining = ref(10);

// Available games (only implemented ones)
const availableGames = computed(() =>
  MINI_GAMES.filter(game => IMPLEMENTED_MINIGAME_IDS.includes(game.id))
);

// Target score based on difficulty
const targetScore = computed(() => {
  if (!currentGame.value) return 0;
  const baseScore = currentGame.value.baseTargetScore;
  return Math.round(baseScore * (1 + (difficulty.value - 1) * 0.15));
});

// Select a game
function selectGame(gameId: number) {
  const game = MINI_GAMES.find(g => g.id === gameId);
  if (game) {
    currentGame.value = game;
    currentScore.value = 0;
    timeRemaining.value = game.baseTimeLimit;
    showResult.value = false;
    gameResult.value = null;
  }
}

// Handle game completion
function handleGameComplete(result: MiniGameResult) {
  gameResult.value = result;
  currentScore.value = result.score;
  timeRemaining.value = result.timeRemaining;
  showResult.value = true;
}

// Retry the same game
function retryGame() {
  if (currentGame.value) {
    const gameId = currentGame.value.id;
    currentGame.value = null;
    setTimeout(() => selectGame(gameId), 100);
  }
}

// Exit to menu
function exitGame() {
  currentGame.value = null;
  showResult.value = false;
  gameResult.value = null;
}
</script>

<style scoped>
/* 🎮 비시바시 스타일 게임 화면 */
.game-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-main);
  display: flex;
  flex-direction: column;
  font-family: 'Jua', 'Black Han Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-light);
}

.game-header {
  padding: 1.25rem 1rem 0.75rem;
  text-align: center;
  color: var(--text-light);
  text-shadow:
    3px 3px 0 var(--text-stroke),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.4rem;
  letter-spacing: 0.1em;
}

.game-selector h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
  text-shadow: 2px 2px 0 var(--text-stroke);
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  max-width: 680px;
  margin: 0 auto;
}

.game-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.9rem 0.6rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, #ffffff 0%, #ffeef5 50%, #fff9d9 100%);
  border: 3px solid var(--border);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.3), 0 10px 18px rgba(0, 0, 0, 0.2);
}

.game-button:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.35), 0 14px 24px rgba(0, 0, 0, 0.3);
}

.game-button:active {
  transform: translateY(3px) scale(0.98);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.35), 0 4px 10px rgba(0, 0, 0, 0.25);
}

.game-emoji {
  font-size: 2.1rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.4));
  animation: bounce 1.1s ease-in-out infinite;
}

.game-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
}

.game-info {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 228, 181, 0.98) 100%);
  border-radius: 999px;
  margin-bottom: 0.75rem;
  border: 3px solid var(--border);
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.3);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.info-item .label {
  font-size: 0.75rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.info-item .value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #222;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.back-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  border: 3px solid var(--border);
  background: linear-gradient(180deg, #ff6b6b 0%, #ff3b30 100%);
  color: #fff;
  cursor: pointer;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.4);
  transition: all var(--transition-fast);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.4), 0 10px 18px rgba(0, 0, 0, 0.25);
}

.back-btn:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.25);
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-modal {
  background: var(--bg-card);
  padding: 1.75rem 2.25rem;
  border-radius: var(--radius-xl);
  text-align: center;
  min-width: 280px;
  max-width: 360px;
  border: 4px solid var(--border);
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.4), 0 15px 40px rgba(0, 0, 0, 0.35);
  animation: popIn 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  overflow: hidden;
}

.result-modal::before {
  content: '★';
  position: absolute;
  top: -24px;
  left: 10%;
  font-size: 3rem;
  color: #ffed4e;
  opacity: 0.7;
}

.result-modal::after {
  content: '★';
  position: absolute;
  bottom: -24px;
  right: 8%;
  font-size: 3rem;
  color: #ff6b8a;
  opacity: 0.6;
}

.result-modal h2 {
  margin: 0 0 0.75rem;
  font-size: 2.2rem;
  text-shadow:
    3px 3px 0 var(--text-stroke),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000;
}

.result-modal h2.success {
  color: #ffed4e;
  animation: bounce 0.8s ease-in-out infinite;
}

.result-modal h2.fail {
  color: #ff3b30;
  animation: shake 0.45s;
}

.result-stats {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #333;
}

.result-stats p {
  margin: 0.15rem 0;
  font-size: 1.05rem;
}

.result-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.result-buttons button {
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  border: 3px solid var(--border);
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 5px 0 rgba(0, 0, 0, 0.4);
}

.result-buttons button:first-child {
  background: linear-gradient(180deg, #5ac8fa 0%, #007aff 100%);
  color: #fff;
}

.result-buttons button:last-child {
  background: linear-gradient(180deg, #bdc3c7 0%, #7f8c8d 100%);
  color: #fff;
}

.result-buttons button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.4), 0 12px 20px rgba(0, 0, 0, 0.3);
}

.result-buttons button:active {
  transform: translateY(3px) scale(0.97);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.25);
}

.game-footer {
  padding: 0.8rem 1rem 1.1rem;
  background: rgba(0, 0, 0, 0.25);
  border-top: 3px solid rgba(0, 0, 0, 0.4);
}

.difficulty-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.difficulty-control select {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 2px solid var(--border);
  font-size: 0.9rem;
  outline: none;
}

.difficulty-control select:focus {
  box-shadow: 0 0 0 3px rgba(255, 237, 78, 0.7);
}

.hard-mode {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 2px solid rgba(0, 0, 0, 0.6);
}

.hard-mode input {
  width: 18px;
  height: 18px;
}

@media (max-width: 600px) {
  .game-header h1 {
    font-size: 2rem;
  }

  .game-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .game-info {
    gap: 0.75rem;
    padding-inline: 0.8rem;
  }

  .info-item .value {
    font-size: 1.1rem;
  }
}
</style>
