<template>
  <div class="hidden-object">
    <div class="target-display">
      <div class="target-label">찾기:</div>
      <div class="target-emoji">{{ targetEmoji }}</div>
      <div class="count">{{ foundCount }} / {{ totalTargets }}</div>
    </div>

    <div class="game-grid" ref="gridRef">
      <div
        v-for="(emoji, index) in emojis"
        :key="index"
        class="emoji-item"
        :class="{ found: foundIndices.includes(index) }"
        @touchstart.prevent="handleClick(index, emoji)"
      >
        {{ emoji }}
      </div>
    </div>

    <div class="ui-overlay">
      <div class="score-display">
        점수: {{ score }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCleanupTimers } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Timer utilities
const { safeSetTimeout } = useCleanupTimers();

// 게임 상태
const emojis = ref<string[]>([]);
const targetEmoji = ref('');
const foundIndices = ref<number[]>([]);
const score = ref(0);
const gridRef = ref<HTMLElement>();

let gameCompleted = false;
let startTime = 0;

// 난이도별 그리드 크기와 목표 개수
const gridSize = computed(() => {
  const base = 8 + props.difficulty * 2;
  return Math.min(base, 16);
});

const totalTargets = computed(() => {
  return 3 + Math.floor(props.difficulty / 2);
});

const foundCount = computed(() => foundIndices.value.length);

// 이모지 세트
const emojiPool = [
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🥭', '🍍', '🥥', '🥑', '🍆', '🥕', '🌽', '🌶️', '🥒', '🥬',
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥓', '🥚', '🍳', '🥞',
  '🏀', '⚽', '🎾', '🏐', '🏈', '⚾', '🥎', '🎱', '🏓', '🏸',
  '⭐', '✨', '💫', '🌟', '🔥', '💧', '❄️', '⚡', '🌈', '☀️'
];

// 이모지 그리드 생성
function generateGrid() {
  const totalCells = gridSize.value * gridSize.value;

  // 타겟 이모지 선택
  const selectedTarget = emojiPool[Math.floor(Math.random() * emojiPool.length)];
  if (!selectedTarget) return;
  targetEmoji.value = selectedTarget;

  // 나머지 이모지 (타겟 제외)
  const otherEmojis = emojiPool.filter(e => e !== targetEmoji.value);

  // 그리드 생성
  const grid: string[] = [];

  // 타겟 이모지 배치
  for (let i = 0; i < totalTargets.value; i++) {
    grid.push(targetEmoji.value);
  }

  // 나머지 칸 채우기
  while (grid.length < totalCells) {
    const randomEmoji = otherEmojis[Math.floor(Math.random() * otherEmojis.length)];
    if (randomEmoji) {
      grid.push(randomEmoji);
    }
  }

  // 셔플
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = grid[i];
    const swapTemp = grid[j];
    if (temp !== undefined && swapTemp !== undefined) {
      grid[i] = swapTemp;
      grid[j] = temp;
    }
  }

  emojis.value = grid;
}

// 클릭 핸들러
function handleClick(index: number, emoji: string) {
  if (gameCompleted || foundIndices.value.includes(index)) return;

  if (emoji === targetEmoji.value) {
    // 정답!
    foundIndices.value.push(index);
    score.value += 20;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // 모두 찾았는지 확인
    if (foundCount.value === totalTargets.value) {
      safeSetTimeout(() => {
        completeGame();
      }, 500);
    }
  } else {
    // 오답
    score.value = Math.max(0, score.value - 5);

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // 틀린 이모지 흔들기 효과
    const element = gridRef.value?.children[index] as HTMLElement;
    if (element) {
      element.classList.add('wrong');
      safeSetTimeout(() => {
        element.classList.remove('wrong');
      }, 500);
    }
  }
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  // 시간 보너스
  const timeBonus = Math.floor(timeRemaining * 5);
  const totalScore = score.value + timeBonus;

  const result: MiniGameResult = {
    success: totalScore >= props.targetScore,
    score: totalScore,
    timeRemaining,
    count: foundCount.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  generateGrid();
  startTime = Date.now();

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
.hidden-object {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-game);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.target-display {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

.target-label {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.target-emoji {
  font-size: 64px;
  animation: targetBounce 1s ease-in-out infinite;
}

@keyframes targetBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.count {
  font-size: 32px;
  font-weight: 800;
  color: #F9A825;
  margin-left: 10px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;
}

.emoji-item {
  aspect-ratio: 1;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  user-select: none;
}

.emoji-item:hover:not(.found) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.emoji-item:active:not(.found) {
  transform: scale(0.95);
}

.emoji-item.found {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  animation: foundPulse 0.5s ease-out;
  cursor: default;
  opacity: 0.5;
}

@keyframes foundPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.emoji-item.wrong {
  animation: wrongShake 0.5s ease-out;
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

@keyframes wrongShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.ui-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  pointer-events: none;
}

.score-display {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 스크롤바 스타일링 */
.game-grid::-webkit-scrollbar {
  width: 8px;
}

.game-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.game-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.game-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
