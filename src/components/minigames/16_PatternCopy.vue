<template>
  <div class="pattern-copy">
    <div class="game-header">
      <div class="round-info">{{ currentRound }}/{{ totalRounds }}</div>
    </div>

    <div class="game-area">
      <!-- 패턴 표시 영역 -->
      <div v-if="gamePhase === 'showing'" class="pattern-display">
        <div class="title">패턴을 기억하세요!</div>
        <div class="pattern-grid">
          <div
            v-for="(tile, index) in pattern"
            :key="index"
            class="pattern-tile"
            :class="{
              active: tile.isActive,
              highlight: highlightIndex === index
            }"
            :style="{ backgroundColor: tile.color }"
          >
            {{ tile.emoji }}
          </div>
        </div>
      </div>

      <!-- 입력 영역 -->
      <div v-else-if="gamePhase === 'input'" class="input-area">
        <div class="title">패턴을 재현하세요!</div>
        <div class="pattern-grid">
          <div
            v-for="(tile, index) in pattern"
            :key="index"
            class="pattern-tile clickable"
            :class="{
              selected: userPattern[index],
              correct: userPattern[index] && tile.isActive,
              wrong: userPattern[index] && !tile.isActive
            }"
            :style="{ backgroundColor: tile.color }"
            @touchstart.prevent="handleTileClick(index)"
          >
            {{ userPattern[index] ? tile.emoji : '' }}
          </div>
        </div>
        <Button variant="primary" size="medium" :disabled="!canSubmit" @click="submitPattern">
          확인
        </Button>
      </div>

      <!-- 결과 표시 -->
      <div v-else-if="gamePhase === 'result'" class="result-display">
        <div class="result-emoji">{{ isCorrect ? '✅' : '❌' }}</div>
        <div class="result-text">{{ isCorrect ? '정답!' : '틀렸습니다!' }}</div>
      </div>
    </div>

    <div class="score-display">
      점수: {{ score }} / {{ props.targetScore }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCleanupTimers } from '@/composables';
import Button from '@/components/base/Button.vue';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// 타이머 유틸리티
const { safeSetTimeout, safeSetInterval, clearInterval: safeClearInterval } = useCleanupTimers();

// 게임 상태
const gamePhase = ref<'showing' | 'input' | 'result'>('showing');
const currentRound = ref(0);
const score = ref(0);
const pattern = ref<Array<{ color: string; emoji: string; isActive: boolean }>>([]);
const userPattern = ref<boolean[]>([]);
const highlightIndex = ref(-1);
const isCorrect = ref(false);

let startTime = 0;
let gameCompleted = false;

// 색상 및 이모지 풀
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
const emojis = ['⬜', '🟦', '🟧', '🟩', '🟪', '🟨', '🟥', '⬛'];

// 난이도별 설정
const gridSize = computed(() => {
  return Math.min(3 + Math.floor((props.difficulty - 1) / 2), 4); // 3x3 ~ 4x4
});

const totalRounds = computed(() => {
  return Math.min(3 + props.difficulty, 7); // 4~7 라운드
});

const patternLength = computed(() => {
  return Math.min(3 + props.difficulty, 8); // 4~8개 활성화
});

const canSubmit = computed(() => {
  return userPattern.value.filter(Boolean).length > 0;
});

// 패턴 생성
function generatePattern() {
  const size = gridSize.value * gridSize.value;
  pattern.value = [];

  for (let i = 0; i < size; i++) {
    pattern.value.push({
      color: colors[i % colors.length] ?? colors[0]!,
      emoji: emojis[i % emojis.length] ?? emojis[0]!,
      isActive: false
    });
  }

  // 랜덤하게 타일 활성화
  const activeCount = patternLength.value;
  const activeIndices = new Set<number>();

  while (activeIndices.size < activeCount) {
    const randomIndex = Math.floor(Math.random() * size);
    activeIndices.add(randomIndex);
  }

  activeIndices.forEach(index => {
    const tile = pattern.value[index];
    if (tile) tile.isActive = true;
  });
}

// 패턴 표시
function showPattern() {
  gamePhase.value = 'showing';
  generatePattern();

  // 활성 타일을 순차적으로 하이라이트
  const activeTiles = pattern.value
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => tile.isActive);

  let currentIndex = 0;
  const highlightInterval = safeSetInterval(() => {
    if (currentIndex < activeTiles.length) {
      highlightIndex.value = activeTiles[currentIndex]?.index ?? -1;
      currentIndex++;
    } else {
      safeClearInterval(highlightInterval);
      highlightIndex.value = -1;

      // 표시 시간 후 입력 단계로
      safeSetTimeout(() => {
        gamePhase.value = 'input';
        userPattern.value = new Array(pattern.value.length).fill(false);
      }, 500);
    }
  }, 600);
}

// 타일 클릭
function handleTileClick(index: number) {
  if (gamePhase.value !== 'input') return;

  userPattern.value[index] = !userPattern.value[index];

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

// 패턴 제출
function submitPattern() {
  if (!canSubmit.value || gamePhase.value !== 'input') return;

  // 정답 확인
  let correct = true;
  for (let i = 0; i < pattern.value.length; i++) {
    const tile = pattern.value[i];
    if (tile && tile.isActive !== userPattern.value[i]) {
      correct = false;
      break;
    }
  }

  isCorrect.value = correct;
  gamePhase.value = 'result';

  // 점수 계산
  if (correct) {
    const roundScore = 100 / totalRounds.value;
    score.value += roundScore;
  }

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(correct ? [50, 50, 50] : [100]);
  }

  // 다음 라운드 또는 게임 종료
  safeSetTimeout(() => {
    if (currentRound.value >= totalRounds.value) {
      completeGame();
    } else {
      currentRound.value++;
      showPattern();
    }
  }, 1000);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const timeElapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - timeElapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: Math.floor(score.value),
    timeRemaining,
    accuracy: score.value / 100
  };

  emit('complete', result);
}

// 게임 초기화
onMounted(() => {
  startTime = Date.now();
  currentRound.value = 1;
  showPattern();

  // 제한시간 타이머
  safeSetTimeout(() => {
    if (!gameCompleted) {
      completeGame();
    }
  }, props.timeLimit * 1000);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.pattern-copy {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-game);
  padding: clamp(10px, 3vw, 20px);
  position: relative;
  overflow: hidden;
}

.game-header {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.round-info {
  background: rgba(255, 255, 255, 0.85);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.title {
  font-size: clamp(18px, 5vw, 24px);
  font-weight: 700;
  color: #333;
  margin-bottom: clamp(12px, 3vw, 20px);
  text-shadow: none;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-size, 3), 1fr);
  gap: clamp(6px, 2vw, 10px);
  padding: clamp(12px, 3vw, 20px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
}

.pattern-tile {
  width: clamp(50px, 18vw, 70px);
  height: clamp(50px, 18vw, 70px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(22px, 7vw, 32px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.pattern-tile.active {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
}

.pattern-tile.highlight {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  animation: highlight-pulse 0.6s ease;
}

@keyframes highlight-pulse {
  0%, 100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.2);
  }
}

.pattern-tile.clickable {
  cursor: pointer;
  user-select: none;
}

.pattern-tile.clickable:hover {
  transform: scale(1.05);
}

.pattern-tile.clickable:active {
  transform: scale(0.95);
}

.pattern-tile.selected {
  border: 3px solid white;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.pattern-tile.correct {
  border-color: #4CAF50;
}

.pattern-tile.wrong {
  border-color: #f44336;
}

.result-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.result-emoji {
  font-size: clamp(60px, 20vw, 100px);
  animation: result-pop 0.5s ease;
}

@keyframes result-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.result-text {
  font-size: clamp(24px, 8vw, 32px);
  font-weight: 700;
  color: #333;
  text-shadow: none;
}

.score-display {
  margin-top: 20px;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  background: rgba(255, 255, 255, 0.85);
  padding: 12px 24px;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
