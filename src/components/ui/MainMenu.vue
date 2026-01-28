<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Card } from '@/components/base';
import { getHighScore, getGameStats } from '@/utils/storage';

const emit = defineEmits<{
  startGame: [];
  showRanking: [];
  showSettings: [];
}>();

const router = useRouter();

const highScore = ref(0);
const stats = ref({
  totalPlays: 0,
  bestStage: 0
});

// Check if in development mode
const isDev = computed(() => import.meta.env.DEV);

function goToTestMode() {
  router.push({ name: 'minigame-test-list' });
}

onMounted(() => {
  highScore.value = getHighScore();
  stats.value = getGameStats();
});
</script>

<template>
  <div class="main-menu">
    <div class="menu-header">
      <h1 class="game-title">
        <span class="title-emoji">🎮</span>
        빠샤!
      </h1>
      <p class="game-subtitle">30개의 미니게임 챌린지</p>
    </div>

    <Card class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">최고 점수</span>
          <span class="stat-value">{{ highScore.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">최고 기록</span>
          <span class="stat-value">{{ stats.bestStage }}/30판</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">총 플레이</span>
          <span class="stat-value">{{ stats.totalPlays }}회</span>
        </div>
      </div>
    </Card>

    <div class="menu-buttons">
      <Button
        variant="primary"
        size="large"
        full-width
        class="start-button"
        @tap="emit('startGame')"
      >
        🎮 게임 시작
      </Button>

      <div class="secondary-buttons">
        <Button
          variant="secondary"
          size="medium"
          full-width
          @tap="emit('showRanking')"
        >
          🏆 랭킹
        </Button>

        <Button
          variant="secondary"
          size="medium"
          full-width
          @tap="emit('showSettings')"
        >
          ⚙️ 설정
        </Button>
      </div>

      <!-- Dev Mode: Test Button -->
      <Button
        v-if="isDev"
        variant="secondary"
        size="medium"
        full-width
        class="dev-test-button"
        @tap="goToTestMode"
      >
        🧪 미니게임 테스트 (DEV)
      </Button>
    </div>

    <div class="menu-footer">
      <p class="version">v1.0.0</p>
      <p class="credit">Made with ❤️ by Claude</p>
    </div>
  </div>
</template>

<style scoped>
/* 캐주얼 미니게임 메인 메뉴 */
.main-menu {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-main);
}

.menu-header {
  text-align: center;
  animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-title {
  font-size: 56px;
  margin: 0 0 8px 0;
  color: var(--primary-yellow);
  font-weight: 700;
  text-shadow: 2px 2px 0 var(--dark-yellow);
  letter-spacing: 0.05em;
}

.title-emoji {
  display: inline-block;
}

.game-subtitle {
  font-size: 20px;
  color: var(--text-medium);
  margin: 0;
  font-weight: 600;
}

.stats-card {
  animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: var(--neutral-cream);
  border-radius: var(--radius-md);
  border: 2px solid var(--primary-yellow);
}

.stat-label {
  font-size: 12px;
  color: var(--text-light);
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-yellow);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.start-button {
  font-size: 24px !important;
}

.secondary-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dev-test-button {
  margin-top: 8px;
  background: linear-gradient(180deg, #5E35B1 0%, #4527A0 100%) !important;
  color: white !important;
  border-color: #311B92 !important;
}

.menu-footer {
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
  flex-shrink: 0;
  animation: slideUp 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.version {
  margin: 0 0 4px 0;
  font-weight: 600;
}

.credit {
  margin: 0;
}

@media (max-width: 480px) {
  .main-menu {
    padding: 16px 12px;
    gap: 20px;
  }

  .game-title {
    font-size: 44px;
  }

  .game-subtitle {
    font-size: 18px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 20px;
  }

  .start-button {
    font-size: 20px !important;
  }
}

@media (max-height: 700px) {
  .main-menu {
    gap: 16px;
    padding: 12px;
  }

  .game-title {
    font-size: 40px;
  }

  .stats-grid {
    gap: 8px;
  }

  .menu-buttons {
    gap: 12px;
  }
}
</style>
