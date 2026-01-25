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
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
}

.menu-header {
  text-align: center;
}

.game-title {
  font-size: 56px;
  margin: 0 0 8px 0;
  color: #FFD700;
  font-weight: 700;
  text-shadow: 2px 2px 0 #F9A825;
  letter-spacing: 0.05em;
}

.title-emoji {
  display: inline-block;
}

.game-subtitle {
  font-size: 20px;
  color: #424242;
  margin: 0;
  font-weight: 600;
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
  background: #FFF8DC;
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.stat-label {
  font-size: 12px;
  color: #757575;
  font-weight: 600;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #FFD700;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.start-button {
  font-size: 24px !important;
}

.secondary-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.menu-footer {
  text-align: center;
  color: #757575;
  font-size: 14px;
  flex-shrink: 0;
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
