<script setup lang="ts">
import { computed } from 'vue';
import { Button, Card, Badge } from '@/components/base';
import type { GameResult } from '@/types/game';
import { calculateGrade, getGradeColor } from '@/utils/difficulty';

interface Props {
  result: GameResult;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  restart: [];
  mainMenu: [];
  showRanking: [];
}>();

const grade = computed(() => {
  const avgScore = props.result.finalScore / props.result.clearedStages;
  return calculateGrade(avgScore, 100);
});

const gradeColor = computed(() => getGradeColor(grade.value));

const isNewRecord = computed(() => {
  // TODO: Compare with saved high score
  return false;
});
</script>

<template>
  <div class="game-over">
    <div class="game-over-header">
      <h1 class="game-over-title">
        {{ result.clearedStages === 30 ? '🎉 완료! 🎉' : 'GAME OVER' }}
      </h1>
      <Badge v-if="isNewRecord" variant="warning" size="large">
        🏆 NEW RECORD!
      </Badge>
    </div>

    <Card class="result-card">
      <div class="grade-display" :style="{ color: gradeColor }">
        <div class="grade-letter">{{ grade }}</div>
        <div class="grade-label">종합 등급</div>
      </div>

      <div class="result-stats">
        <div class="stat-row">
          <span class="stat-label">최종 점수</span>
          <span class="stat-value primary">{{ result.finalScore.toLocaleString() }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">클리어 판수</span>
          <span class="stat-value">{{ result.clearedStages }}/30</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">최고 난이도</span>
          <span class="stat-value">Lv.{{ result.maxDifficulty }}</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">하드모드 클리어</span>
          <span class="stat-value">{{ result.hardModeCount }}회</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">플레이 시간</span>
          <span class="stat-value">{{ Math.floor(result.playTime / 60) }}분 {{ result.playTime % 60 }}초</span>
        </div>

        <div class="stat-row">
          <span class="stat-label">컨티뉴 사용</span>
          <span class="stat-value">{{ result.continueUsed ? 'O' : 'X' }}</span>
        </div>
      </div>

      <div class="bonus-section">
        <h3>보너스 점수</h3>
        <div class="bonus-row">
          <span>난이도 보너스</span>
          <span>+{{ result.bonusScore.difficulty }}</span>
        </div>
        <div class="bonus-row">
          <span>하드모드 보너스</span>
          <span>+{{ result.bonusScore.hardMode }}</span>
        </div>
      </div>
    </Card>

    <div class="action-buttons">
      <Button
        variant="primary"
        size="large"
        full-width
        @click="emit('restart')"
      >
        🔄 다시 시작
      </Button>

      <div class="secondary-actions">
        <Button
          variant="secondary"
          size="medium"
          full-width
          @click="emit('showRanking')"
        >
          🏆 랭킹 보기
        </Button>

        <Button
          variant="secondary"
          size="medium"
          full-width
          @click="emit('mainMenu')"
        >
          🏠 메인 메뉴
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  justify-content: center;
}

.game-over-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  animation: slideUp 0.5s ease-out;
}

.game-over-title {
  font-size: 2.5rem;
  margin: 0;
  color: var(--error);
  font-weight: bold;
}

.result-card {
  animation: slideUp 0.6s ease-out;
}

.grade-display {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1.5rem;
}

.grade-letter {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  animation: pulse 1s ease-out;
}

.grade-label {
  font-size: 1rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-value.primary {
  font-size: 1.5rem;
  color: var(--primary);
}

.bonus-section {
  background: rgba(255, 230, 109, 0.1);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 2px dashed var(--accent);
}

.bonus-section h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.bonus-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.bonus-row span:last-child {
  font-weight: bold;
  color: var(--accent);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slideUp 0.7s ease-out;
}

.secondary-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
