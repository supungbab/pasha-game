<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { MainMenu, GameView, GameOver, Ranking, Settings } from '@/components/ui';
import type { GameResult } from '@/types/game';

type AppState = 'menu' | 'playing' | 'gameover' | 'ranking' | 'settings';

const route = useRoute();
const appState = ref<AppState>('menu');
const gameResult = ref<GameResult | null>(null);

// Check if current route is a test route
const isTestRoute = computed(() => route.path.startsWith('/test'));

// ===== 웹뷰 기본 동작 비활성화 =====

// 뒤로 가기 제스처/버튼 비활성화
const handlePopState = () => {
  history.pushState(null, '', location.href);
};

// 컨텍스트 메뉴 (길게 누르기) 비활성화
const handleContextMenu = (e: Event) => {
  e.preventDefault();
};

// 더블 탭 줌 비활성화
let lastTouchEnd = 0;
const handleTouchEnd = (e: TouchEvent) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
};

// 핀치 줌 비활성화
const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
};

// 키보드 뒤로 가기 (Android) 비활성화
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' || e.key === 'GoBack') {
    e.preventDefault();
  }
};

// 화면 가장자리 스와이프 백 제스처 차단 (iOS/Android 웹뷰)
const EDGE_THRESHOLD = 30; // 가장자리 감지 영역 (px)
let edgeTouchStartX = 0;

const handleEdgeTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  edgeTouchStartX = touch.clientX;

  // 화면 왼쪽 가장자리에서 시작하는 터치 차단
  if (touch.clientX < EDGE_THRESHOLD) {
    e.preventDefault();
  }
  // 화면 오른쪽 가장자리에서 시작하는 터치도 차단 (앞으로 가기)
  if (touch.clientX > window.innerWidth - EDGE_THRESHOLD) {
    e.preventDefault();
  }
};

const handleEdgeTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;

  // 가장자리에서 시작한 수평 스와이프 차단
  if (edgeTouchStartX < EDGE_THRESHOLD || edgeTouchStartX > window.innerWidth - EDGE_THRESHOLD) {
    const deltaX = Math.abs(touch.clientX - edgeTouchStartX);
    const deltaY = Math.abs(touch.clientY - (e.touches[0]?.clientY || 0));

    // 수평 이동이 수직 이동보다 크면 차단
    if (deltaX > deltaY) {
      e.preventDefault();
    }
  }
};

onMounted(() => {
  // 뒤로 가기 방지를 위한 히스토리 상태 추가
  history.pushState(null, '', location.href);

  // 이벤트 리스너 등록
  window.addEventListener('popstate', handlePopState);
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('keydown', handleKeyDown);

  // 가장자리 스와이프 백 제스처 차단
  document.addEventListener('touchstart', handleEdgeTouchStart, { passive: false });
  document.addEventListener('touchmove', handleEdgeTouchMove, { passive: false });
});

onUnmounted(() => {
  // 이벤트 리스너 해제
  window.removeEventListener('popstate', handlePopState);
  document.removeEventListener('contextmenu', handleContextMenu);
  document.removeEventListener('touchend', handleTouchEnd);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('touchstart', handleEdgeTouchStart);
  document.removeEventListener('touchmove', handleEdgeTouchMove);
});

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
    <div v-else class="app-content">
      <!-- Main Menu -->
      <Transition name="page" mode="out-in">
        <MainMenu
          v-if="showMenu"
          key="menu"
          @start-game="startGame"
          @show-ranking="showRanking"
          @show-settings="showSettings"
        />
        <!-- Game Play -->
        <GameView
          v-else-if="showPlaying"
          key="playing"
          @gameover="handleGameOver"
          @complete="handleGameOver"
          @exit="returnToMenu"
        />
        <!-- Game Over -->
        <GameOver
          v-else-if="showGameOver && gameResult"
          key="gameover"
          :result="gameResult"
          @restart="restartGame"
          @main-menu="returnToMenu"
          @show-ranking="showRanking"
        />
        <!-- Ranking -->
        <Ranking
          v-else-if="showRankingScreen"
          key="ranking"
          @close="returnToMenu"
        />
        <!-- Settings -->
        <Settings
          v-else-if="showSettingsScreen"
          key="settings"
          @close="returnToMenu"
        />
      </Transition>
    </div>
  </div>
</template>

<style>
/* Global styles are imported in main.ts */

#app {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

/* Allow scrolling in test mode */
#app.test-mode {
  height: auto;
  overflow: visible;
}

/* App content wrapper - contains transitions */
.app-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* Page Transitions - 단일 Transition으로 mode="out-in" 사용 */
.page-enter-active {
  animation: pageEnter 0.3s ease-out;
}

.page-leave-active {
  animation: pageLeave 0.2s ease-in;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pageLeave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

/* Ensure no scroll when in game */
body.game-active {
  overflow: hidden;
}
</style>
