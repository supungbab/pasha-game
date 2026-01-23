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
.ranking {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ranking-title {
  font-size: 2rem;
  margin: 0;
  color: var(--primary);
}

.ranking-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
}

.ranking-toggle span {
  font-weight: 600;
  color: var(--text-secondary);
  transition: color var(--transition-normal);
}

.ranking-toggle span.active {
  color: var(--primary);
}

.coming-soon,
.no-data {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.coming-soon p,
.no-data p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all var(--transition-normal);
  cursor: default;
}

.ranking-item.top-three {
  border: 2px solid var(--accent);
  background: linear-gradient(135deg, rgba(255, 230, 109, 0.1), transparent);
}

.rank-number {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.rank-emoji {
  font-size: 2rem;
}

.rank-text {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.player-stats {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.score-info {
  text-align: right;
  flex-shrink: 0;
}

.score {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.ranking-footer {
  margin-top: auto;
}
</style>
