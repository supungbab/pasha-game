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
/* 🎮 비시바시 스타일 메인 메뉴 */
.main-menu {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
  overflow: hidden;
  --primary: #FFD700;
  --primary-dark: #FFA500;
  --primary-light: #FFED4E;
  --secondary: #FFD93D;
  --secondary-dark: #FFA500;
  --accent: #FFED4E;
}

.menu-header {
  text-align: center;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-title {
  font-size: 3.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--accent);
  font-weight: bold;
  text-shadow:
    4px 4px 0 var(--primary),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    6px 6px 10px rgba(0,0,0,0.3);
  letter-spacing: 0.1em;
}

.title-emoji {
  display: inline-block;
  animation: bounce 0.8s ease-in-out infinite;
  filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5));
}

.game-subtitle {
  font-size: 1.3rem;
  color: var(--text-light);
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.15em;
}

.stats-card {
  animation: slideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(255,45,85,0.1) 0%, rgba(0,212,170,0.1) 100%);
  border-radius: var(--radius-md);
  border: 2px solid rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--primary);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideUp 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.start-button {
  animation: pulse 1.5s ease-in-out infinite;
  font-size: 1.5rem !important;
}

.secondary-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.menu-footer {
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  animation: fadeIn 1s ease-out;
  flex-shrink: 0;
}

.version {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.credit {
  margin: 0;
}

@media (max-width: 480px) {
  .main-menu {
    padding: 1rem 0.75rem;
    gap: 1.25rem;
  }

  .game-title {
    font-size: 2.8rem;
  }

  .game-subtitle {
    font-size: 1.1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.4rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  .start-button {
    font-size: 1.3rem !important;
  }
}

@media (max-height: 700px) {
  .main-menu {
    gap: 1rem;
    padding: 0.75rem;
  }

  .game-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    gap: 0.5rem;
  }

  .menu-buttons {
    gap: 0.75rem;
  }
}
</style>
