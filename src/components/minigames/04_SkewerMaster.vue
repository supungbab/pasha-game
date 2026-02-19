<template>
  <div class="skewer-game">
    <canvas
      ref="canvasRef"
      @touchstart.prevent
    ></canvas>

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
import { ref, onMounted, computed, watch } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useGameButtons } from '@/composables';

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

// 3-버튼 시스템
const { setButton } = useGameButtons();

function setupButtons() {
  setButton(0, { visible: true, label: '↖️', onPress: () => handleSkewer('left') });
  setButton(1, { visible: true, label: '⬆️', onPress: () => handleSkewer('center') });
  setButton(2, { visible: true, label: '↗️', onPress: () => handleSkewer('right') });
}

// 게임 상태
const score = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);
const canFinish = ref(false);

let animationId = 0;
let gameCompleted = false;
let startTime = 0;

// 재료 타입
type IngredientType = 'meat' | 'vegetable' | 'onion';
type VerticalPosition = 'top' | 'middle' | 'bottom';

interface Ingredient {
  type: IngredientType;
  emoji: string;
  x: number;
  y: number;
  verticalPos: VerticalPosition;
  speed: number;
  direction: 'left-to-right' | 'right-to-left';
  skewered: boolean;
}

interface Wave {
  ingredients: Ingredient[];
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
  ingredients: Ingredient[];
}

const skewerAnimation = ref<SkewerAnimation>({
  active: false,
  direction: 'center',
  progress: 0,
  ingredients: []
});

// 난이도별 속도
const baseSpeed = computed(() => 2.0 + props.difficulty * 0.5);

// 겹침 판정 범위 (픽셀)
const OVERLAP_THRESHOLD = 40;

// 재료 Y 위치 (상/중/하)
const Y_POSITIONS = {
  top: height * 0.25,
  middle: height * 0.4,
  bottom: height * 0.55
};

// 꼬치 시작점 (가운데 아래)
const SKEWER_START_X = width / 2;
const SKEWER_START_Y = height * 0.8;

// 꼬치 방향별 목표 X (겹침 판정 위치)
const SKEWER_TARGET_X = {
  left: width * 0.25,
  center: width * 0.5,
  right: width * 0.75
};

// 이모지 정보
const INGREDIENTS: { type: IngredientType; emoji: string }[] = [
  { type: 'meat', emoji: '🥩' },
  { type: 'vegetable', emoji: '🥬' },
  { type: 'onion', emoji: '🧅' }
];

// 배열 셔플 유틸리티
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j]!;
    result[j] = temp!;
  }
  return result;
}

// 웨이브 생성
function createWave(): Wave {
  const speed = baseSpeed.value;

  // 재료 순서 셔플
  const shuffledIngredients = shuffle([...INGREDIENTS]);

  // Y 위치 배열
  const positions: VerticalPosition[] = ['top', 'middle', 'bottom'];

  const ingredients: Ingredient[] = shuffledIngredients.map((ing, index) => {
    // 이동 방향 랜덤
    const direction: 'left-to-right' | 'right-to-left' = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
    const startX = direction === 'left-to-right' ? -30 : width + 30;
    const verticalPos = positions[index] as VerticalPosition;

    return {
      type: ing.type,
      emoji: ing.emoji,
      x: startX,
      y: Y_POSITIONS[verticalPos],
      verticalPos,
      speed,
      direction,
      skewered: false
    };
  });

  return {
    ingredients,
    completed: false,
    skeweredCount: 0
  };
}

// 특정 X 위치에 재료들이 있는지 확인
function checkIngredientsAtPosition(targetX: number): Ingredient[] {
  if (!currentWave.value) return [];

  return currentWave.value.ingredients.filter(ing => {
    if (ing.skewered) return false;
    return Math.abs(ing.x - targetX) <= OVERLAP_THRESHOLD;
  });
}

// 꼬치 버튼 핸들러
function handleSkewer(direction: 'left' | 'center' | 'right') {
  if (gameCompleted || !currentWave.value || skewerAnimation.value.active) return;

  const targetX = SKEWER_TARGET_X[direction];
  const ingredientsAtPosition = checkIngredientsAtPosition(targetX);

  if (ingredientsAtPosition.length === 0) {
    // Miss - 해당 위치에 재료 없음
    showFeedback('Miss! 😢', 'miss');
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  // 꼬치 성공!
  const skeweredCount = ingredientsAtPosition.length;
  ingredientsAtPosition.forEach(ing => {
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
    ingredients: [...ingredientsAtPosition]
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

  // 재료 이동 경로 가이드라인 (상/중/하)
  c.strokeStyle = 'rgba(139, 69, 19, 0.15)';
  c.lineWidth = 2;
  c.setLineDash([10, 10]);

  // 상단 라인
  c.beginPath();
  c.moveTo(0, Y_POSITIONS.top);
  c.lineTo(width, Y_POSITIONS.top);
  c.stroke();

  // 중단 라인
  c.beginPath();
  c.moveTo(0, Y_POSITIONS.middle);
  c.lineTo(width, Y_POSITIONS.middle);
  c.stroke();

  // 하단 라인
  c.beginPath();
  c.moveTo(0, Y_POSITIONS.bottom);
  c.lineTo(width, Y_POSITIONS.bottom);
  c.stroke();

  c.setLineDash([]);

  // 재료 렌더링
  if (currentWave.value) {
    for (const ing of currentWave.value.ingredients) {
      if (ing.skewered) continue;

      c.font = '40px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(ing.emoji, ing.x, ing.y);

      // 방향 화살표 표시
      c.font = '14px Arial';
      c.fillStyle = 'rgba(0, 0, 0, 0.25)';
      if (ing.direction === 'left-to-right') {
        c.fillText('→', ing.x, ing.y + 28);
      } else {
        c.fillText('←', ing.x, ing.y + 28);
      }
    }
  }

  // 꼬치 애니메이션 렌더링 (가운데 아래에서 해당 방향으로)
  if (skewerAnimation.value.active) {
    const anim = skewerAnimation.value;
    const progress = anim.progress;
    const animProgress = Math.min(progress * 2, 1);

    // 꼬치 막대 그리기
    c.strokeStyle = '#8B4513';
    c.lineWidth = 6;
    c.lineCap = 'round';

    // 시작점 (가운데 아래)
    const startX = SKEWER_START_X;
    const startY = SKEWER_START_Y;

    // 끝점 (방향에 따라 다름)
    const targetX = SKEWER_TARGET_X[anim.direction];
    const endY = Y_POSITIONS.top - 30;

    // 현재 위치 (대각선 이동)
    const currentX = startX + (targetX - startX) * animProgress;
    const currentY = startY + (endY - startY) * animProgress;

    c.beginPath();
    c.moveTo(startX, startY);
    c.lineTo(currentX, currentY);
    c.stroke();

    // 꼬치 끝 (뾰족한 부분)
    c.fillStyle = '#8B4513';
    c.beginPath();

    // 방향에 따라 삼각형 회전
    const angle = Math.atan2(currentY - startY, currentX - startX);
    c.save();
    c.translate(currentX, currentY);
    c.rotate(angle - Math.PI / 2);
    c.moveTo(-8, 0);
    c.lineTo(8, 0);
    c.lineTo(0, -15);
    c.closePath();
    c.fill();
    c.restore();

    // 꽂힌 재료들 (꼬치 막대 위에)
    if (progress > 0.3) {
      const ingredientProgress = Math.min((progress - 0.3) / 0.7, 1);
      anim.ingredients.forEach((ing, i) => {
        // 꼬치 막대를 따라 재료 배치
        const ingProgress = animProgress * (0.3 + i * 0.2);
        const ingX = startX + (targetX - startX) * ingProgress;
        const ingY = startY + (endY - startY) * ingProgress;

        c.font = '32px Arial';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.globalAlpha = ingredientProgress;
        c.fillText(ing.emoji, ingX, ingY);
        c.globalAlpha = 1;
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

// canFinish 변화에 따라 중앙 버튼 토글: 꼬치↔피니시
watch(canFinish, (val) => {
  if (val) {
    setButton(1, { label: '🏁', onPress: handleFinish, disabled: false });
  } else {
    setButton(1, { label: '⬆️', onPress: () => handleSkewer('center'), disabled: false });
  }
});

onMounted(() => {
  setupButtons();
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
  justify-content: flex-start;
  background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
