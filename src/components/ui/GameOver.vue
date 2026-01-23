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
/* 🎮 비시바시 스타일 게임 오버 */
.game-over {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  justify-content: center;
  overflow: hidden;
}

.game-over-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.game-over-title {
  font-size: 2.8rem;
  margin: 0;
  color: var(--accent);
  font-weight: bold;
  text-shadow:
    3px 3px 0 var(--error),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000,
    5px 5px 10px rgba(0,0,0,0.4);
  letter-spacing: 0.1em;
  animation: shake 0.5s ease-out;
}

.result-card {
  animation: slideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  overflow: hidden;
}

.grade-display {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 4px solid var(--border);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(255,45,85,0.05) 0%, rgba(255,217,61,0.1) 100%);
  margin: -1rem -1rem 1rem -1rem;
  padding: 1.5rem 1rem;
}

.grade-letter {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  animation: popIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  text-shadow:
    4px 4px 0 rgba(0,0,0,0.3),
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    2px 2px 0 #000;
  filter: drop-shadow(0 5px 15px currentColor);
}

.grade-label {
  font-size: 1rem;
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.result-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%);
  border-left: 4px solid var(--secondary);
}

.stat-row:nth-child(odd) {
  border-left-color: var(--primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-value.primary {
  font-size: 1.6rem;
  color: var(--primary);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
}

.bonus-section {
  background: linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 149, 0, 0.1) 100%);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 3px solid var(--accent);
  box-shadow: inset 0 2px 10px rgba(255, 217, 61, 0.2);
}

.bonus-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bonus-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.bonus-row span:last-child {
  font-weight: bold;
  color: var(--warning);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: slideUp 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  flex-shrink: 0;
}

.secondary-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .game-over {
    padding: 1rem 0.75rem;
    gap: 1rem;
  }

  .game-over-title {
    font-size: 2.2rem;
  }

  .grade-letter {
    font-size: 4rem;
  }

  .stat-value.primary {
    font-size: 1.4rem;
  }
}

@media (max-height: 700px) {
  .game-over {
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .grade-display {
    padding: 1rem;
  }

  .grade-letter {
    font-size: 3.5rem;
  }

  .result-stats {
    gap: 0.35rem;
  }

  .stat-row {
    padding: 0.35rem 0.5rem;
  }

  .bonus-section {
    padding: 0.5rem;
  }
}
</style>
