<template>
  <div class="skewer-game">
    <canvas
      ref="canvasRef"
      @touchstart.prevent
    ></canvas>

    <!-- 피니시 버튼 (상단) -->
    <button
      class="finish-btn"
      :class="{ active: canFinish, disabled: !canFinish }"
      :disabled="!canFinish"
      @touchstart.prevent="handleFinish"
    >
      🏁
    </button>

    <!-- 꼬치 버튼 3개 (하단) -->
    <div class="controls">
      <button
        class="skewer-btn"
        @touchstart.prevent="handleSkewer('left')"
      >
        ↙️
      </button>
      <button
        class="skewer-btn center"
        @touchstart.prevent="handleSkewer('center')"
      >
        ⬇️
      </button>
      <button
        class="skewer-btn"
        @touchstart.prevent="handleSkewer('right')"
      >
        ↘️
      </button>
    </div>

    <!-- UI 오버레이 -->
    <div class="ui-overlay">
      <div class="score-display">
        점수: {{ score }}
        <span class="target">/ {{ props.targetScore }}</span>
      </div>
      <div v-if="feedback" class="feedback" :class="feedback.type">
        {{ feedback.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, width, height, clear } = useCanvas(canvasRef, {
  width: 400,
  height: 500,
  backgroundColor: '#FFF8E7'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame, cancelAnimationFrame } = useCleanupTimers();

// 게임 상태
const score = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);
const canFinish = ref(false);

let animationId = 0;
let gameCompleted = false;
let startTime = 0;

// 재료 타입
type IngredientType = 'meat' | 'vegetable' | 'onion';

interface Ingredient {
  type: IngredientType;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  direction: 'left-to-right' | 'right-to-left';
  skewered: boolean;
  baseY: number;
}

interface Wave {
  ingredients: Ingredient[];
  crossingX: number;
  completed: boolean;
  skeweredCount: number;
}

// 현재 웨이브
const currentWave = ref<Wave | null>(null);
const waveCount = ref(0);
const skeweredInCurrentWave = ref(0);

// 꼬치 애니메이션
interface SkewerAnimation {
  active: boolean;
  direction: 'left' | 'center' | 'right';
  progress: number;
  startY: number;
  ingredients: Ingredient[];
}

const skewerAnimation = ref<SkewerAnimation>({
  active: false,
  direction: 'center',
  progress: 0,
  startY: 0,
  ingredients: []
});

// 난이도별 속도
const baseSpeed = computed(() => 2.0 + props.difficulty * 0.5);

// 겹침 판정 범위 (픽셀)
const OVERLAP_THRESHOLD = 40;
const CROSSING_X = width / 2;
const CROSSING_Y = height / 2 - 30;

// 이모지 정보
const INGREDIENTS: { type: IngredientType; emoji: string }[] = [
  { type: 'meat', emoji: '🥩' },
  { type: 'vegetable', emoji: '🥬' },
  { type: 'onion', emoji: '🧅' }
];

// 웨이브 생성
function createWave(): Wave {
  const crossingX = CROSSING_X;
  const ingredients: Ingredient[] = [];

  // 3개 재료 생성 - 각각 다른 방향에서 시작하여 동시에 겹침 지점 도달
  const speed = baseSpeed.value;

  INGREDIENTS.forEach((ing, index) => {
    // 방향 결정 (교대로)
    const direction: 'left-to-right' | 'right-to-left' = index % 2 === 0 ? 'left-to-right' : 'right-to-left';

    // 시작 위치 계산 (동시에 겹침 지점 도달하도록)
    const startX = direction === 'left-to-right' ? -30 : width + 30;
    const distanceToCenter = Math.abs(startX - crossingX);

    // Y 위치 (겹침 지점 주변에 약간 분산)
    const yOffset = (index - 1) * 25; // -25, 0, 25
    const baseY = CROSSING_Y + yOffset;

    ingredients.push({
      type: ing.type,
      emoji: ing.emoji,
      x: startX,
      y: baseY,
      baseY: baseY,
      speed: speed,
      direction,
      skewered: false
    });
  });

  return {
    ingredients,
    crossingX,
    completed: false,
    skeweredCount: 0
  };
}

// 재료들이 겹침 지점에 있는지 확인
function checkIngredientsAtCrossing(): Ingredient[] {
  if (!currentWave.value) return [];

  const ingredientsAtCrossing: Ingredient[] = [];

  for (const ing of currentWave.value.ingredients) {
    if (ing.skewered) continue;

    const distanceFromCenter = Math.abs(ing.x - CROSSING_X);
    if (distanceFromCenter <= OVERLAP_THRESHOLD) {
      ingredientsAtCrossing.push(ing);
    }
  }

  return ingredientsAtCrossing;
}

// 꼬치 버튼 핸들러
function handleSkewer(direction: 'left' | 'center' | 'right') {
  if (gameCompleted || !currentWave.value || skewerAnimation.value.active) return;

  const ingredientsAtCrossing = checkIngredientsAtCrossing();

  if (ingredientsAtCrossing.length === 0) {
    // Miss - 겹침 지점에 재료 없음
    showFeedback('Miss! 😢', 'miss');
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  // 꼬치 성공!
  const skeweredCount = ingredientsAtCrossing.length;
  ingredientsAtCrossing.forEach(ing => {
    ing.skewered = true;
  });

  skeweredInCurrentWave.value += skeweredCount;
  currentWave.value.skeweredCount += skeweredCount;

  // 점수 계산
  let points = 0;
  let feedbackText = '';
  let feedbackType: 'perfect' | 'good' | 'miss' = 'good';

  if (skeweredCount === 3) {
    points = 50;
    feedbackText = 'PERFECT! 🍢 +50';
    feedbackType = 'perfect';
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  } else if (skeweredCount === 2) {
    points = 25;
    feedbackText = 'Good! 🍢 +25';
    feedbackType = 'good';
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  } else {
    points = 10;
    feedbackText = '꼬치! +10';
    feedbackType = 'good';
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }

  score.value += points;
  showFeedback(feedbackText, feedbackType);

  // 꼬치 애니메이션 시작
  skewerAnimation.value = {
    active: true,
    direction,
    progress: 0,
    startY: 0,
    ingredients: [...ingredientsAtCrossing]
  };

  // 피니시 가능 상태로 변경
  canFinish.value = true;

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    safeSetTimeout(() => {
      completeGame();
    }, 500);
  }
}

// 피니시 버튼 핸들러
function handleFinish() {
  if (gameCompleted || !canFinish.value) return;

  // 피니시 보너스
  score.value += 20;
  showFeedback('피니시! 🏁 +20', 'perfect');

  if (navigator.vibrate) {
    navigator.vibrate([30, 30, 30, 30]);
  }

  canFinish.value = false;

  // 다음 웨이브 시작
  waveCount.value++;
  skeweredInCurrentWave.value = 0;

  safeSetTimeout(() => {
    if (!gameCompleted) {
      currentWave.value = createWave();
    }
  }, 300);

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    safeSetTimeout(() => {
      completeGame();
    }, 500);
  }
}

// 피드백 표시
function showFeedback(text: string, type: 'perfect' | 'good' | 'miss') {
  feedback.value = { text, type };
  safeSetTimeout(() => {
    feedback.value = null;
  }, 800);
}

// 업데이트
function update() {
  if (!currentWave.value) return;

  // 재료 이동
  for (const ing of currentWave.value.ingredients) {
    if (ing.skewered) continue;

    if (ing.direction === 'left-to-right') {
      ing.x += ing.speed;
    } else {
      ing.x -= ing.speed;
    }

    // 약간의 흔들림 (위아래)
    ing.y = ing.baseY + Math.sin(Date.now() / 200 + ing.type.charCodeAt(0)) * 3;
  }

  // 웨이브 완료 체크 (모든 재료가 화면 밖으로 나감)
  const allOutOfScreen = currentWave.value.ingredients.every(ing => {
    if (ing.skewered) return true;
    return ing.x < -50 || ing.x > width + 50;
  });

  if (allOutOfScreen && !currentWave.value.completed) {
    currentWave.value.completed = true;
    canFinish.value = false;

    // 다음 웨이브 시작
    safeSetTimeout(() => {
      if (!gameCompleted) {
        waveCount.value++;
        skeweredInCurrentWave.value = 0;
        currentWave.value = createWave();
      }
    }, 500);
  }

  // 꼬치 애니메이션 업데이트
  if (skewerAnimation.value.active) {
    skewerAnimation.value.progress += 0.15;
    if (skewerAnimation.value.progress >= 1) {
      skewerAnimation.value.active = false;
    }
  }
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경 클리어
  clear();

  // 배경 그라데이션
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#FFF8E7');
  gradient.addColorStop(1, '#FFE4B5');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 겹침 지점 표시 (타겟 영역)
  c.fillStyle = 'rgba(255, 152, 0, 0.2)';
  c.beginPath();
  c.arc(CROSSING_X, CROSSING_Y, OVERLAP_THRESHOLD + 10, 0, Math.PI * 2);
  c.fill();

  c.strokeStyle = '#FF9800';
  c.lineWidth = 3;
  c.setLineDash([5, 5]);
  c.beginPath();
  c.arc(CROSSING_X, CROSSING_Y, OVERLAP_THRESHOLD + 10, 0, Math.PI * 2);
  c.stroke();
  c.setLineDash([]);

  // 중심점 표시
  c.fillStyle = '#FF9800';
  c.beginPath();
  c.arc(CROSSING_X, CROSSING_Y, 8, 0, Math.PI * 2);
  c.fill();

  // 가이드라인 (재료 이동 경로)
  c.strokeStyle = 'rgba(139, 69, 19, 0.2)';
  c.lineWidth = 2;

  // 좌→우 라인
  c.beginPath();
  c.moveTo(0, CROSSING_Y - 25);
  c.lineTo(width, CROSSING_Y - 25);
  c.stroke();

  c.beginPath();
  c.moveTo(0, CROSSING_Y + 25);
  c.lineTo(width, CROSSING_Y + 25);
  c.stroke();

  // 우→좌 라인
  c.beginPath();
  c.moveTo(0, CROSSING_Y);
  c.lineTo(width, CROSSING_Y);
  c.stroke();

  // 재료 렌더링
  if (currentWave.value) {
    for (const ing of currentWave.value.ingredients) {
      if (ing.skewered) continue;

      c.font = '40px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(ing.emoji, ing.x, ing.y);

      // 방향 화살표 표시
      c.font = '16px Arial';
      c.fillStyle = 'rgba(0, 0, 0, 0.3)';
      if (ing.direction === 'left-to-right') {
        c.fillText('→', ing.x, ing.y + 30);
      } else {
        c.fillText('←', ing.x, ing.y + 30);
      }
    }
  }

  // 꼬치 애니메이션 렌더링
  if (skewerAnimation.value.active) {
    const anim = skewerAnimation.value;
    const progress = anim.progress;

    // 꼬치 막대 그리기
    c.strokeStyle = '#8B4513';
    c.lineWidth = 6;
    c.lineCap = 'round';

    const startY = CROSSING_Y - 100;
    const endY = CROSSING_Y + 50;
    const currentY = startY + (endY - startY) * Math.min(progress * 2, 1);

    let offsetX = 0;
    if (anim.direction === 'left') offsetX = -30;
    if (anim.direction === 'right') offsetX = 30;

    c.beginPath();
    c.moveTo(CROSSING_X + offsetX, startY);
    c.lineTo(CROSSING_X + offsetX, currentY);
    c.stroke();

    // 꼬치 끝 (뾰족한 부분)
    c.fillStyle = '#8B4513';
    c.beginPath();
    c.moveTo(CROSSING_X + offsetX - 8, currentY);
    c.lineTo(CROSSING_X + offsetX + 8, currentY);
    c.lineTo(CROSSING_X + offsetX, currentY + 15);
    c.closePath();
    c.fill();

    // 꽂힌 재료들
    if (progress > 0.5) {
      const ingredientY = CROSSING_Y - 20;
      anim.ingredients.forEach((ing, i) => {
        c.font = '36px Arial';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(ing.emoji, CROSSING_X + offsetX, ingredientY + i * 25);
      });
    }
  }

  // 웨이브 번호 표시
  c.font = 'bold 16px Arial';
  c.fillStyle = 'rgba(0, 0, 0, 0.5)';
  c.textAlign = 'left';
  c.fillText(`Wave ${waveCount.value + 1}`, 15, 30);
}

// 게임 루프
function gameLoop() {
  if (gameCompleted) return;

  update();
  render();

  // 시간 체크
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  animationId = safeRequestAnimationFrame(gameLoop);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  cancelAnimationFrame(animationId);

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();

  // 첫 웨이브 생성
  safeSetTimeout(() => {
    currentWave.value = createWave();
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.skewer-game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 70%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.finish-btn {
  position: absolute;
  top: clamp(80px, 15vh, 120px);
  left: 50%;
  transform: translateX(-50%);
  width: clamp(70px, 18vw, 90px);
  height: clamp(70px, 18vw, 90px);
  font-size: clamp(28px, 8vw, 40px);
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  border: 4px solid #6A1B9A;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  user-select: none;
  z-index: 10;
  opacity: 0.5;
}

.finish-btn.active {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border-color: #FF9800;
  opacity: 1;
  animation: pulse 0.8s infinite;
}

.finish-btn.disabled {
  cursor: not-allowed;
}

.finish-btn:active:not(.disabled) {
  transform: translateX(-50%) scale(0.95);
}

@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.6);
  }
}

.controls {
  position: absolute;
  bottom: clamp(15px, 4vw, 30px);
  display: flex;
  gap: clamp(15px, 5vw, 25px);
  z-index: 10;
}

.skewer-btn {
  width: clamp(70px, 22vw, 100px);
  height: clamp(70px, 22vw, 100px);
  font-size: clamp(28px, 8vw, 40px);
  background: linear-gradient(135deg, #FF9800, #F57C00);
  border: 4px solid #E65100;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.skewer-btn.center {
  width: clamp(80px, 25vw, 110px);
  height: clamp(80px, 25vw, 110px);
  font-size: clamp(32px, 10vw, 48px);
}

.skewer-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.skewer-btn:active {
  transform: scale(0.95);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-color: #2e7d32;
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.score-display {
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: clamp(8px, 2vw, 12px) clamp(15px, 4vw, 25px);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
}

.target {
  font-size: clamp(16px, 4vw, 20px);
  opacity: 0.8;
}

.feedback {
  font-size: clamp(24px, 6vw, 36px);
  font-weight: 800;
  padding: 15px 30px;
  border-radius: 20px;
  animation: feedbackPop 0.8s ease-out;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.feedback.perfect {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border: 3px solid #FFD700;
}

.feedback.good {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
  border: 3px solid #4CAF50;
}

.feedback.miss {
  color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  border: 3px solid #f44336;
}

@keyframes feedbackPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
