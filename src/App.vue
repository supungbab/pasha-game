<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView } from 'vue-router';
import { MainMenu, GameOver, Ranking, Settings } from '@/components/ui';
import type { GameResult } from '@/types/game';

type AppState = 'menu' | 'playing' | 'gameover' | 'ranking' | 'settings';

const appState = ref<AppState>('menu');
const gameResult = ref<GameResult | null>(null);

// Navigation handlers
const startGame = () => {
  appState.value = 'playing';
  // TODO: Initialize game
};

const showRanking = () => {
  appState.value = 'ranking';
};

const showSettings = () => {
  appState.value = 'settings';
};

const returnToMenu = () => {
  appState.value = 'menu';
  gameResult.value = null;
};

const handleGameOver = (result: GameResult) => {
  gameResult.value = result;
  appState.value = 'gameover';
};

const restartGame = () => {
  startGame();
};

// Computed
const showMenu = computed(() => appState.value === 'menu');
const showPlaying = computed(() => appState.value === 'playing');
const showGameOver = computed(() => appState.value === 'gameover');
const showRankingScreen = computed(() => appState.value === 'ranking');
const showSettingsScreen = computed(() => appState.value === 'settings');
</script>

<template>
  <div id="app">
    <!-- Hidden RouterView for compatibility -->
    <RouterView v-show="false" />

    <!-- Main Menu -->
    <Transition name="fade">
      <MainMenu
        v-if="showMenu"
        @start-game="startGame"
        @show-ranking="showRanking"
        @show-settings="showSettings"
      />
    </Transition>

    <!-- Game Play -->
    <Transition name="fade">
      <div v-if="showPlaying" class="game-container">
        <div class="placeholder-game">
          <h1>🎮 게임 플레이 화면</h1>
          <p>미니게임 컴포넌트가 여기에 표시됩니다</p>
          <button @click="handleGameOver({
            finalScore: 1250,
            clearedStages: 15,
            maxDifficulty: 3,
            hardModeCount: 2,
            playTime: 180,
            continueUsed: false,
            history: [],
            bonusScore: { difficulty: 1500, hardMode: 400 }
          })">
            테스트: 게임 오버
          </button>
        </div>
      </div>
    </Transition>

    <!-- Game Over -->
    <Transition name="fade">
      <GameOver
        v-if="showGameOver && gameResult"
        :result="gameResult"
        @restart="restartGame"
        @main-menu="returnToMenu"
        @show-ranking="showRanking"
      />
    </Transition>

    <!-- Ranking -->
    <Transition name="fade">
      <Ranking
        v-if="showRankingScreen"
        @close="returnToMenu"
      />
    </Transition>

    <!-- Settings -->
    <Transition name="fade">
      <Settings
        v-if="showSettingsScreen"
        @close="returnToMenu"
      />
    </Transition>
  </div>
</template>

<style>
/* Global styles are imported in main.ts */

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Placeholder for game container */
.game-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
}

.placeholder-game {
  text-align: center;
  padding: 2rem;
}

.placeholder-game h1 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.placeholder-game p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.placeholder-game button {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.placeholder-game button:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure no scroll when in game */
body.game-active {
  overflow: hidden;
}
</style>
