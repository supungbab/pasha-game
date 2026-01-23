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
.game-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.game-header {
  padding: 20px;
  text-align: center;
  color: white;
}

.game-header h1 {
  margin: 0 0 20px 0;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.game-selector h2 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.game-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.game-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.game-emoji {
  font-size: 2rem;
  margin-bottom: 5px;
}

.game-name {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.game-info {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 30px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item .label {
  font-size: 0.75rem;
  color: #666;
}

.info-item .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.back-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #ff6b6b;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-modal {
  background: white;
  padding: 30px 40px;
  border-radius: 20px;
  text-align: center;
  min-width: 280px;
}

.result-modal h2 {
  margin: 0 0 20px 0;
  font-size: 2rem;
}

.result-modal h2.success {
  color: #2ecc71;
}

.result-modal h2.fail {
  color: #e74c3c;
}

.result-stats {
  margin-bottom: 20px;
}

.result-stats p {
  margin: 5px 0;
  font-size: 1.1rem;
}

.result-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.result-buttons button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.result-buttons button:first-child {
  background: #3498db;
  color: white;
}

.result-buttons button:last-child {
  background: #95a5a6;
  color: white;
}

.result-buttons button:hover {
  transform: scale(1.05);
}

.game-footer {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
}

.difficulty-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
}

.difficulty-control select {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
}

.hard-mode {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 15px;
}

.hard-mode input {
  width: 18px;
  height: 18px;
}
</style>
