<template>
  <div class="speed-click">
    <div class="game-area">
      <div class="click-target" @touchstart.prevent="handleTouchClick">
        <div class="emoji">👆</div>
        <div class="click-count">{{ clicks }}</div>
      </div>

      <div class="effect-container">
        <div
          v-for="effect in clickEffects"
          :key="effect.id"
          class="click-effect"
          :style="{
            left: effect.x + 'px',
            top: effect.y + 'px'
          }"
        >
          ⚡
        </div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div class="instruction">
      {{ instructionText }}
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
const clicks = ref(0);
const clickEffects = ref<Array<{ id: number; x: number; y: number }>>([]);
let effectIdCounter = 0;
let startTime = 0;
let gameCompleted = false;

// 난이도별 목표 클릭 수
const targetClicks = computed(() => {
  const base = 30;
  const multiplier = 1 + (props.difficulty - 1) * 0.3;
  return Math.floor(base * multiplier);
});

// 진행도 계산
const progressPercent = computed(() => {
  return Math.min((clicks.value / targetClicks.value) * 100, 100);
});

// 지시문
const instructionText = computed(() => {
  if (clicks.value === 0) {
    return '빠르게 탭하세요!';
  }
  return `${targetClicks.value - clicks.value}번 더!`;
});

// 클릭 핸들러
function handleClick(event: MouseEvent) {
  if (gameCompleted) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  processClick(x, y);
}

// 터치 핸들러
function handleTouchClick(event: TouchEvent) {
  if (gameCompleted) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;

  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  processClick(x, y);
}

// 공통 클릭 처리
function processClick(x: number, y: number) {
  clicks.value++;

  // 클릭 이펙트 생성
  const effect = {
    id: effectIdCounter++,
    x,
    y
  };

  clickEffects.value.push(effect);

  // 0.5초 후 이펙트 제거
  safeSetTimeout(() => {
    const index = clickEffects.value.findIndex(e => e.id === effect.id);
    if (index !== -1) {
      clickEffects.value.splice(index, 1);
    }
  }, 500);

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // 목표 달성 확인
  if (clicks.value >= targetClicks.value && !gameCompleted) {
    completeGame();
  }
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const timeElapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - timeElapsed, 0);

  // 점수 계산: 클릭 수 × 2 + 속도 보너스
  const baseScore = clicks.value * 2;
  const speedBonus = Math.floor(timeRemaining * 10);
  const totalScore = baseScore + speedBonus;

  const result: MiniGameResult = {
    success: clicks.value >= targetClicks.value,
    score: totalScore,
    timeRemaining,
    count: clicks.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 300);
}

onMounted(() => {
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
.speed-click {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.game-area {
  position: relative;
  width: 100%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.click-target {
  width: min(280px, 70vw);
  height: min(280px, 70vw);
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.click-target:active {
  transform: scale(0.95);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.emoji {
  font-size: clamp(40px, 15vw, 80px);
  margin-bottom: 10px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.click-count {
  font-size: clamp(36px, 12vw, 64px);
  font-weight: 800;
  color: #667eea;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.effect-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.click-effect {
  position: absolute;
  font-size: 32px;
  animation: spark 0.5s ease-out forwards;
  transform: translate(-50%, -50%);
}

@keyframes spark {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1.5);
  }
}

.progress-bar {
  width: 90%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 30px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFC107);
  border-radius: 10px;
  transition: width 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
}

.instruction {
  margin-top: 20px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
