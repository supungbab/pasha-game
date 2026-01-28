<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MINI_GAMES } from '@/config/miniGames';
import { IMPLEMENTED_MINIGAME_IDS } from '@/components/minigames';
import { Button, Card } from '@/components/base';

const router = useRouter();

const filterImplemented = ref<boolean>(true);

const filteredGames = computed(() => {
  let games = [...MINI_GAMES];
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

// Simple touch handlers for game cards
function handleCardTouchStart(event: TouchEvent, gameId: number) {
  if (!isImplemented(gameId)) return;
  (event.currentTarget as HTMLElement).classList.add('pressed');
}

function handleCardTouchEnd(event: TouchEvent) {
  (event.currentTarget as HTMLElement).classList.remove('pressed');
}
</script>

<template>
  <div class="test-list">
    <!-- Header -->
    <header class="list-header">
      <Button variant="secondary" size="small" @click="goBack">← 메뉴</Button>
      <h1 class="list-title">🧪 미니게임 테스트</h1>
      <div class="stat-badge">
        <span class="stat-num">{{ implementedCount }}</span>
        <span class="stat-total">/{{ MINI_GAMES.length }}</span>
      </div>
    </header>

    <!-- Filter -->
    <Card class="filter-card">
      <label class="filter-toggle">
        <input type="checkbox" v-model="filterImplemented" />
        <span class="toggle-text">구현된 게임만 보기</span>
      </label>
    </Card>

    <!-- Games Grid -->
    <div class="games-scroll">
      <div class="games-grid">
        <div
          v-for="game in filteredGames"
          :key="game.id"
          class="game-card"
          :class="{
            implemented: isImplemented(game.id),
            disabled: !isImplemented(game.id)
          }"
          @click="isImplemented(game.id) && playGame(game.id)"
          @touchstart="handleCardTouchStart($event, game.id)"
          @touchend="handleCardTouchEnd"
          @touchcancel="handleCardTouchEnd"
        >
          <div class="card-header">
            <span class="game-emoji">{{ game.instructionEmoji }}</span>
            <span class="game-badge" :class="{ done: isImplemented(game.id) }">
              {{ isImplemented(game.id) ? '✅' : 'TODO' }}
            </span>
          </div>
          <h3 class="game-name">{{ game.name }}</h3>
          <div class="card-footer">
            <span class="game-info">⏱️ {{ game.baseTimeLimit }}초</span>
            <span class="game-info">🎯 {{ game.baseTargetScore }}점</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-list {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  overflow: hidden;
}

/* Header */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.list-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 1px 1px 0 #F9A825;
  margin: 0;
  flex: 1;
  text-align: center;
}

.stat-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 6px 12px;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

.stat-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: #212121;
}

.stat-total {
  font-size: 0.85rem;
  font-weight: 600;
  color: #424242;
}

/* Filter Card */
.filter-card {
  flex-shrink: 0;
  padding: 12px 16px !important;
}

.filter-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.filter-toggle input[type="checkbox"] {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #FFD700;
}

.toggle-text {
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
}

/* Games Scroll Area */
.games-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 4px;
}

.games-scroll::-webkit-scrollbar {
  width: 6px;
}

.games-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.games-scroll::-webkit-scrollbar-thumb {
  background: #FFD700;
  border-radius: 3px;
}

/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-bottom: 16px;
}

/* Game Card */
.game-card {
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #E0E0E0;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.game-card.implemented {
  border-color: #FFD700;
}

.game-card.implemented:active,
.game-card.implemented.pressed {
  transform: scale(0.97);
  background: #FFF8DC;
}

.game-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.game-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
}

.game-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: #E0E0E0;
  color: #757575;
}

.game-badge.done {
  background: transparent;
  font-size: 1rem;
  padding: 0;
}

.game-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212121;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.card-footer {
  display: flex;
  gap: 12px;
}

.game-info {
  font-size: 0.8rem;
  font-weight: 600;
  color: #757575;
}

/* Mobile */
@media (max-width: 400px) {
  .test-list {
    padding: 16px 12px;
    gap: 12px;
  }

  .list-title {
    font-size: 1.25rem;
  }

  .games-grid {
    gap: 10px;
  }

  .game-card {
    padding: 12px !important;
  }

  .game-emoji {
    font-size: 2rem;
  }

  .game-name {
    font-size: 1rem;
  }
}

/* Short screens */
@media (max-height: 700px) {
  .test-list {
    padding: 12px;
    gap: 12px;
  }

  .filter-card {
    padding: 10px 14px !important;
  }
}
</style>
