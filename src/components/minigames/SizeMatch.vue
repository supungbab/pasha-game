<template>
  <div class="size-match">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @touchstart.prevent="handleStop"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        성공: {{ successCount }}
        <span class="separator">|</span>
        점수: {{ score }}
      </div>
      <div v-if="feedback" class="feedback" :class="feedback.type">
        {{ feedback.text }}
      </div>
    </div>

    <div class="instruction">
      원이 목표 크기에 가까울 때 탭하세요!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

const canvasRef = ref<HTMLCanvasElement>();
const canvasWidth = 800;
const canvasHeight = 600;

// 게임 상태
const score = ref(0);
const successCount = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

let ctx: CanvasRenderingContext2D;
let animationId: number;
let gameCompleted = false;
let startTime = 0;

// 원 상태
let currentRadius = 50;
let targetRadius = 150;
let minRadius = 50;
let maxRadius = 250;
let isGrowing = true;
let isStopped = false;

// 난이도별 속도
const growSpeed = 2 + props.difficulty * 0.5;

// Perfect/Good 판정 범위
const perfectThreshold = Math.max(20 - props.difficulty * 2, 10);
const goodThreshold = Math.max(40 - props.difficulty * 3, 20);

// 정지 핸들러
function handleStop() {
  if (gameCompleted || isStopped) return;

  isStopped = true;

  // 차이 계산
  const diff = Math.abs(currentRadius - targetRadius);

  let points = 0;
  let feedbackText = '';
  let feedbackType: 'perfect' | 'good' | 'miss' = 'miss';

  if (diff <= perfectThreshold) {
    // Perfect!
    points = 20;
    feedbackText = 'PERFECT! 🔥';
    feedbackType = 'perfect';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  } else if (diff <= goodThreshold) {
    // Good
    points = 10;
    feedbackText = 'Good! 👍';
    feedbackType = 'good';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // Miss
    points = 0;
    feedbackText = 'Miss! 😢';
    feedbackType = 'miss';

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  if (points > 0) {
    successCount.value++;
  }

  score.value += points;
  showFeedback(feedbackText, feedbackType);

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    setTimeout(() => {
      completeGame();
    }, 1000);
    return;
  }

  // 다음 라운드
  setTimeout(() => {
    resetRound();
  }, 1200);
}

// 피드백 표시
function showFeedback(text: string, type: 'perfect' | 'good' | 'miss') {
  feedback.value = { text, type };
  setTimeout(() => {
    feedback.value = null;
  }, 1000);
}

// 라운드 리셋
function resetRound() {
  currentRadius = minRadius;
  isGrowing = true;
  isStopped = false;

  // 새로운 목표 크기 (랜덤)
  targetRadius = minRadius + 50 + Math.random() * (maxRadius - minRadius - 100);
}

// 업데이트
function update() {
  if (isStopped) return;

  if (isGrowing) {
    currentRadius += growSpeed;
    if (currentRadius >= maxRadius) {
      currentRadius = maxRadius;
      isGrowing = false;
    }
  } else {
    currentRadius -= growSpeed;
    if (currentRadius <= minRadius) {
      currentRadius = minRadius;
      isGrowing = true;
    }
  }
}

// 렌더링
function render() {
  if (!ctx) return;

  // 배경
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // 목표 원 (외곽선)
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Perfect 구역
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.6)';
  ctx.lineWidth = perfectThreshold * 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Good 구역
  ctx.strokeStyle = 'rgba(255, 193, 7, 0.3)';
  ctx.lineWidth = goodThreshold * 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 현재 원
  let circleColor = '#f44336';
  const diff = Math.abs(currentRadius - targetRadius);
  if (diff <= perfectThreshold) {
    circleColor = '#4CAF50';
  } else if (diff <= goodThreshold) {
    circleColor = '#FFC107';
  }

  if (isStopped) {
    // 정지 상태에서는 테두리만
    ctx.strokeStyle = circleColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // 이동 중에는 채움
    ctx.fillStyle = circleColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 테두리
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 목표 크기 텍스트
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`목표: ${Math.round(targetRadius)}`, centerX, 50);

  // 현재 크기 텍스트
  ctx.fillText(`현재: ${Math.round(currentRadius)}`, centerX, centerY);

  // 차이 표시
  if (isStopped) {
    const diff = Math.abs(currentRadius - targetRadius);
    ctx.fillText(`차이: ${Math.round(diff)}`, centerX, centerY + 40);
  }
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

  animationId = requestAnimationFrame(gameLoop);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining,
    count: successCount.value
  };

  setTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d')!;
  startTime = Date.now();

  gameLoop();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.size-match {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  pointer-events: none;
}

.score-display {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.separator {
  margin: 0 10px;
  opacity: 0.5;
}

.feedback {
  font-size: 36px;
  font-weight: 800;
  padding: 15px 30px;
  border-radius: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: feedbackPop 0.8s ease-out;
}

.feedback.perfect {
  color: white;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: 3px solid #2e7d32;
}

.feedback.good {
  color: white;
  background: linear-gradient(135deg, #FFC107, #FFB300);
  border: 3px solid #F9A825;
}

.feedback.miss {
  color: white;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: 3px solid #c62828;
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

.instruction {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 24px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
}
</style>
