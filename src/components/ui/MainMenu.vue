<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button, Card } from '@/components/base';
import { getHighScore, getGameStats } from '@/utils/storage';

const emit = defineEmits<{
  startGame: [];
  showRanking: [];
  showSettings: [];
}>();

const highScore = ref(0);
const stats = ref({
  totalPlays: 0,
  bestStage: 0
});

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
        빠샤! (PASHA!)
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
        @click="emit('startGame')"
      >
        🎮 게임 시작
      </Button>

      <div class="secondary-buttons">
        <Button
          variant="secondary"
          size="medium"
          full-width
          @click="emit('showRanking')"
        >
          🏆 랭킹
        </Button>

        <Button
          variant="secondary"
          size="medium"
          full-width
          @click="emit('showSettings')"
        >
          ⚙️ 설정
        </Button>
      </div>
    </div>

    <div class="menu-footer">
      <p class="version">v1.0.0</p>
      <p class="credit">Made with ❤️ by Claude</p>
    </div>
  </div>
</template>

<style scoped>
.main-menu {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100vh;
  justify-content: center;
}

.menu-header {
  text-align: center;
  animation: slideUp 0.5s ease-out;
}

.game-title {
  font-size: 3rem;
  margin: 0 0 0.5rem 0;
  color: var(--primary);
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.title-emoji {
  display: inline-block;
  animation: bounce 1s ease-in-out infinite;
}

.game-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin: 0;
}

.stats-card {
  animation: slideUp 0.6s ease-out;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideUp 0.7s ease-out;
}

.start-button {
  animation: pulse 2s ease-in-out infinite;
}

.secondary-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.menu-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: auto;
  animation: fadeIn 1s ease-out;
}

.version {
  margin: 0 0 0.25rem 0;
}

.credit {
  margin: 0;
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
