<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button, Card, Badge, Toggle } from '@/components/base';
import { getLocalRankings } from '@/utils/storage';
import type { RankingEntry } from '@/types/ranking';

const emit = defineEmits<{
  close: [];
}>();

const rankings = ref<RankingEntry[]>([]);
const showLocal = ref(true);

const displayRankings = computed(() => {
  if (showLocal.value) {
    return rankings.value.slice(0, 10);
  }
  // TODO: Fetch global rankings
  return [];
});

const hasRankings = computed(() => displayRankings.value.length > 0);

onMounted(() => {
  rankings.value = getLocalRankings();
});

const getRankEmoji = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="ranking">
    <div class="ranking-header">
      <h1 class="ranking-title">🏆 랭킹</h1>
      <Button variant="secondary" size="small" @click="emit('close')">
        ✕
      </Button>
    </div>

    <div class="ranking-toggle">
      <span :class="{ active: showLocal }">로컬 랭킹</span>
      <Toggle v-model="showLocal" />
      <span :class="{ active: !showLocal }">글로벌 랭킹</span>
    </div>

    <div v-if="!showLocal" class="coming-soon">
      <p>🌐 글로벌 랭킹은 준비 중입니다!</p>
    </div>

    <div v-else-if="!hasRankings" class="no-data">
      <p>📊 아직 랭킹 데이터가 없습니다.</p>
      <p>게임을 플레이하고 기록을 세워보세요!</p>
    </div>

    <div v-else class="ranking-list">
      <Card
        v-for="entry in displayRankings"
        :key="entry.rank"
        :class="['ranking-item', { 'top-three': entry.rank <= 3 }]"
        padding="small"
      >
        <div class="rank-number">
          <span v-if="entry.rank <= 3" class="rank-emoji">
            {{ getRankEmoji(entry.rank) }}
          </span>
          <span v-else class="rank-text">{{ entry.rank }}</span>
        </div>

        <div class="player-info">
          <div class="player-name">
            {{ entry.playerName }}
            <Badge v-if="entry.isHardModeCleared" variant="error" size="small">
              🔥 {{ entry.hardModeCount }}
            </Badge>
          </div>
          <div class="player-stats">
            {{ entry.clearedStages }}/30판 · Lv.{{ entry.maxDifficulty }}
          </div>
        </div>

        <div class="score-info">
          <div class="score">{{ entry.score.toLocaleString() }}</div>
          <div class="date">{{ formatDate(entry.playDate) }}</div>
        </div>
      </Card>
    </div>

    <div class="ranking-footer">
      <Button variant="primary" full-width @click="emit('close')">
        닫기
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* 🎮 비시바시 스타일 랭킹 */
.ranking {
  width: 100%;
  max-width: 600px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.ranking-title {
  font-size: 2.2rem;
  margin: 0;
  color: var(--accent);
  text-shadow:
    3px 3px 0 var(--primary),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000;
}

.ranking-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 3px solid var(--border);
  box-shadow: 4px 4px 0 rgba(0,0,0,0.3);
  flex-shrink: 0;
  animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.ranking-toggle span {
  font-weight: 700;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.ranking-toggle span.active {
  color: var(--primary);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
}

.coming-soon,
.no-data {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-light);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.coming-soon p,
.no-data p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

/* 🏆 랭킹 리스트 - 스크롤 가능! */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.25rem;
  animation: slideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 스크롤바 스타일 */
.ranking-list::-webkit-scrollbar {
  width: 8px;
}

.ranking-list::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--accent), var(--primary));
  border-radius: 4px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all var(--transition-fast);
  cursor: default;
  animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.ranking-item.top-three {
  border: 3px solid var(--accent) !important;
  background: linear-gradient(135deg, rgba(255, 217, 61, 0.15), rgba(255, 149, 0, 0.1)) !important;
  box-shadow: 0 0 15px rgba(255, 217, 61, 0.3), 4px 4px 0 rgba(0,0,0,0.3) !important;
}

.rank-number {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%);
  border-radius: var(--radius-md);
}

.rank-emoji {
  font-size: 1.8rem;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
}

.rank-text {
  font-size: 1.3rem;
  color: var(--text-secondary);
  font-weight: 700;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.player-stats {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.score-info {
  text-align: right;
  flex-shrink: 0;
}

.score {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.15rem;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
}

.date {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.ranking-footer {
  flex-shrink: 0;
  animation: slideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@media (max-width: 480px) {
  .ranking {
    padding: 1rem 0.75rem;
    gap: 0.75rem;
  }

  .ranking-title {
    font-size: 1.8rem;
  }

  .ranking-toggle {
    padding: 0.6rem 0.75rem;
    gap: 0.75rem;
  }

  .ranking-toggle span {
    font-size: 0.8rem;
  }

  .ranking-item {
    gap: 0.5rem;
  }

  .rank-number {
    width: 2rem;
    height: 2rem;
  }

  .rank-emoji {
    font-size: 1.4rem;
  }

  .player-name {
    font-size: 0.9rem;
  }

  .score {
    font-size: 1rem;
  }
}

@media (max-height: 700px) {
  .ranking {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .ranking-list {
    gap: 0.4rem;
  }
}
</style>
