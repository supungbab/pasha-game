<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MINI_GAMES } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { Button, Card } from '@/components/base';

const router = useRouter();

// Filter games
const filterCategory = ref<string>('all');
const filterImplemented = ref<boolean>(false);

const categories = [
  { value: 'all', label: '전체' },
  { value: 'action', label: '액션' },
  { value: 'timing', label: '타이밍' },
  { value: 'puzzle', label: '퍼즐' },
  { value: 'memory', label: '기억력' },
  { value: 'collection', label: '수집' },
  { value: 'precision', label: '정밀' },
];

const filteredGames = computed(() => {
  let games = [...MINI_GAMES];

  // Filter by category
  if (filterCategory.value !== 'all') {
    games = games.filter(g => g.category === filterCategory.value);
  }

  // Filter by implemented
  if (filterImplemented.value) {
    games = games.filter(g => IMPLEMENTED_MINIGAME_IDS.includes(g.id));
  }

  return games;
});

const implementedCount = computed(() =>
  MINI_GAMES.filter(g => IMPLEMENTED_MINIGAME_IDS.includes(g.id)).length
);

function isImplemented(gameId: number): boolean {
  return IMPLEMENTED_MINIGAME_IDS.includes(gameId);
}

function playGame(gameId: number) {
  router.push({ name: 'minigame-test-player', params: { id: gameId } });
}

function goBack() {
  router.push('/');
}

function getDifficultyStars(difficulty: number): string {
  return '⭐'.repeat(difficulty);
}
</script>

<template>
  <div class="test-list">
    <header class="test-header">
      <Button variant="secondary" @click="goBack">
        ← 돌아가기
      </Button>
      <h1 class="test-title">🎮 미니게임 테스트</h1>
      <div class="test-stats">
        <span class="stat-badge">{{ implementedCount }}/{{ MINI_GAMES.length }} 구현됨</span>
      </div>
    </header>

    <div class="test-filters">
      <div class="filter-group">
        <label class="filter-label">카테고리:</label>
        <div class="filter-buttons">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="filter-button"
            :class="{ active: filterCategory === cat.value }"
            @click="filterCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-checkbox">
          <input type="checkbox" v-model="filterImplemented" />
          <span>구현된 게임만 보기</span>
        </label>
      </div>
    </div>

    <div class="games-grid">
      <Card
        v-for="game in filteredGames"
        :key="game.id"
        class="game-card"
        :class="{ implemented: isImplemented(game.id), placeholder: !isImplemented(game.id) }"
        @click="isImplemented(game.id) ? playGame(game.id) : null"
      >
        <div class="game-header">
          <span class="game-emoji">{{ game.instructionEmoji }}</span>
          <div class="game-badges">
            <span class="game-id">#{game.id}</span>
            <span v-if="!isImplemented(game.id)" class="placeholder-badge">📋 TODO</span>
            <span v-else class="implemented-badge">✅</span>
          </div>
        </div>

        <h3 class="game-name">{{ game.name }}</h3>
        <p class="game-name-en">{{ game.nameEn }}</p>

        <div class="game-info">
          <span class="game-category">{{ game.category }}</span>
          <span class="game-difficulty">{{ getDifficultyStars(game.difficulty) }}</span>
        </div>

        <p class="game-instruction">{{ game.instruction }}</p>

        <div class="game-stats">
          <div class="stat">
            <span class="stat-icon">⏱️</span>
            <span class="stat-text">{{ game.baseTimeLimit }}초</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🎯</span>
            <span class="stat-text">{{ game.baseTargetScore }}점</span>
          </div>
          <div class="stat">
            <span class="stat-icon">📊</span>
            <span class="stat-text">{{ game.scoreType }}</span>
          </div>
        </div>

        <Button
          v-if="isImplemented(game.id)"
          variant="primary"
          size="small"
          full-width
          class="play-button"
          @click.stop="playGame(game.id)"
        >
          플레이 ▶️
        </Button>
        <div v-else class="placeholder-text">
          구현 예정
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.test-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  padding: 1rem;
}

.test-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.test-title {
  font-size: 2rem;
  font-weight: 700;
  color: #212121;
  margin: 0;
  flex: 1;
  text-align: center;
}

.test-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #212121;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

.test-filters {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #424242;
  min-width: 80px;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.5rem 1rem;
  background: #FFFFFF;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-button:hover {
  border-color: #FFD700;
  color: #212121;
}

.filter-button.active {
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border-color: #F9A825;
  color: #212121;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #424242;
  cursor: pointer;
  user-select: none;
}

.filter-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.games-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.game-card {
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.game-card.implemented:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
}

.game-card.placeholder {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-card.placeholder:hover {
  transform: none;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.game-emoji {
  font-size: 3rem;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
}

.game-badges {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.game-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: #757575;
  background: #F5F5F5;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.placeholder-badge {
  font-size: 0.75rem;
  font-weight: 700;
  background: #E0E0E0;
  color: #757575;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.implemented-badge {
  font-size: 1rem;
}

.game-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #212121;
  margin: 0 0 0.25rem 0;
}

.game-name-en {
  font-size: 0.9rem;
  color: #757575;
  margin: 0 0 1rem 0;
  font-style: italic;
}

.game-info {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.game-category {
  padding: 0.25rem 0.75rem;
  background: #FFF8DC;
  border: 2px solid #FFD700;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #424242;
}

.game-difficulty {
  padding: 0.25rem 0.5rem;
  background: #F5F5F5;
  border-radius: 8px;
  font-size: 0.8rem;
}

.game-instruction {
  font-size: 1rem;
  color: #424242;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.game-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #FFF8DC;
  border-radius: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.stat-icon {
  font-size: 1rem;
}

.stat-text {
  font-weight: 600;
  color: #424242;
}

.play-button {
  margin-top: auto;
}

.placeholder-text {
  text-align: center;
  padding: 0.75rem;
  background: #E0E0E0;
  border-radius: 12px;
  color: #757575;
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .test-header {
    flex-direction: column;
    text-align: center;
  }

  .test-title {
    font-size: 1.5rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-label {
    min-width: auto;
  }
}
</style>
