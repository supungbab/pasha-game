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
  min-height: 100dvh;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #424242;
}

.game-header {
  padding: 1.25rem 1rem 0.75rem;
  text-align: center;
  color: #212121;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.4rem;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.game-selector h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
  font-weight: 600;
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
  border-radius: 16px;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.game-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.game-emoji {
  font-size: 2.1rem;
  margin-bottom: 0.25rem;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
}

.game-name {
  font-size: 0.9rem;
  color: #212121;
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
  background: #FFFFFF;
  border-radius: 20px;
  margin-bottom: 0.75rem;
  border: 2px solid #FFF8DC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.info-item .label {
  font-size: 0.75rem;
  color: #424242;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 400;
}

.info-item .value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #212121;
}

.back-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 16px;
  border: none;
  background: linear-gradient(180deg, #FF9800 0%, #F9A825 100%);
  color: #FFFFFF;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-modal {
  background: #FFFFFF;
  padding: 1.75rem 2.25rem;
  border-radius: 24px;
  text-align: center;
  min-width: 280px;
  max-width: 360px;
  border: 2px solid #FFF8DC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  color: #FFD700;
  opacity: 0.2;
}

.result-modal::after {
  content: '★';
  position: absolute;
  bottom: -24px;
  right: 8%;
  font-size: 3rem;
  color: #FFC107;
  opacity: 0.2;
}

.result-modal h2 {
  margin: 0 0 0.75rem;
  font-size: 2.2rem;
  font-weight: 700;
}

.result-modal h2.success {
  color: #FFD700;
}

.result-modal h2.fail {
  color: #FF9800;
}

.result-stats {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #424242;
}

.result-stats p {
  margin: 0.15rem 0;
  font-size: 1.05rem;
  font-weight: 400;
}

.result-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.result-buttons button {
  padding: 0.7rem 1.4rem;
  border-radius: 16px;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.result-buttons button:first-child {
  background: linear-gradient(180deg, #00BCD4 0%, #0097A7 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

.result-buttons button:last-child {
  background: linear-gradient(180deg, #F5F5F5 0%, #E0E0E0 100%);
  color: #424242;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-buttons button:hover {
  transform: translateY(-2px);
}

.result-buttons button:first-child:hover {
  box-shadow: 0 6px 16px rgba(0, 188, 212, 0.4);
}

.result-buttons button:last-child:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.result-buttons button:active {
  transform: translateY(0);
}

.game-footer {
  padding: 0.8rem 1rem 1.1rem;
  background: #F5F5F5;
  border-top: 2px solid #E0E0E0;
}

.difficulty-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #424242;
  font-size: 0.9rem;
}

.difficulty-control select {
  padding: 0.45rem 0.9rem;
  border-radius: 12px;
  border: 2px solid #E0E0E0;
  font-size: 0.9rem;
  outline: none;
  background: #FFFFFF;
  color: #424242;
}

.difficulty-control select:focus {
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.hard-mode {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  background: #FFFFFF;
  border: 2px solid #E0E0E0;
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
