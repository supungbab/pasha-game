<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { MainMenu, GameView, GameOver, Ranking, Settings } from '@/components/ui';
import type { GameResult } from '@/types/game';

type AppState = 'menu' | 'playing' | 'gameover' | 'ranking' | 'settings';

const route = useRoute();
const appState = ref<AppState>('menu');
const gameResult = ref<GameResult | null>(null);

// Check if current route is a test route
const isTestRoute = computed(() => route.path.startsWith('/test'));

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
  <div id="app" :class="{ 'test-mode': isTestRoute }">
    <!-- RouterView for test routes -->
    <RouterView v-if="isTestRoute" />

    <!-- Main App Content (hidden when on test routes) -->
    <template v-else>
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
        <GameView
          v-if="showPlaying"
          @gameover="handleGameOver"
          @complete="handleGameOver"
        />
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
    </template>
  </div>
</template>

<style>
/* Global styles are imported in main.ts */

#app {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Hide overflow when not in test mode (game play requires fixed viewport) */
#app:not(.test-mode) {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

/* Allow scrolling in test mode */
#app.test-mode {
  height: auto;
  overflow: visible;
}

/* Placeholder for game container */
.game-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.placeholder-game {
  text-align: center;
  padding: 2rem;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.placeholder-game h1 {
  color: var(--accent);
  margin-bottom: 1rem;
  font-size: 2.5rem;
  text-shadow:
    3px 3px 0 var(--primary),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000;
}

.placeholder-game p {
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 1.2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.placeholder-game button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(180deg, #FF6B8A 0%, var(--primary) 50%, #D91A40 100%);
  color: white;
  border: 4px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.2);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.placeholder-game button:hover {
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 12px 30px rgba(255, 45, 85, 0.5);
}

.placeholder-game button:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2);
}

/* Transitions - 더 팝한 트랜지션 */
.fade-enter-active {
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fade-leave-active {
  animation: fadeOut 0.2s ease-out;
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Ensure no scroll when in game */
body.game-active {
  overflow: hidden;
}
</style>
