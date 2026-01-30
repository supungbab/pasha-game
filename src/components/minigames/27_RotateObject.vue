<template>
  <div class="rotate-object">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
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
      드래그하여 목표 각도로 회전하세요!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, width, height, clear } = useCanvas(canvasRef, {
  width: 800,
  height: 600,
  backgroundColor: '#667eea'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

// 게임 상태
const score = ref(0);
const successCount = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

let gameCompleted = false;
let startTime = 0;

// 회전 상태
let currentAngle = 0;
let targetAngle = 90;
let isDragging = false;
let lastMouseAngle = 0;
let isLocked = false;

// 난이도별 판정 범위
const perfectThreshold = Math.max(5 - props.difficulty * 0.5, 2);
const goodThreshold = Math.max(15 - props.difficulty, 8);

// 마우스 각도 계산
function calculateAngle(x: number, y: number): number {
  const centerX = width / 2;
  const centerY = height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function handleTouchStart(event: TouchEvent) {
  if (gameCompleted || isLocked) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  const touch = event.touches[0];
  if (!touch) return;

  isDragging = true;
  lastMouseAngle = calculateAngle(touch.clientX - rect.left, touch.clientY - rect.top);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging || isLocked) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  const touch = event.touches[0];
  if (!touch) return;

  const currentMouseAngle = calculateAngle(touch.clientX - rect.left, touch.clientY - rect.top);
  const angleDiff = currentMouseAngle - lastMouseAngle;

  currentAngle += angleDiff;
  currentAngle = currentAngle % 360;
  if (currentAngle < 0) currentAngle += 360;

  lastMouseAngle = currentMouseAngle;
}

// 드래그 종료
function handleTouchEnd() {
  if (!isDragging || isLocked) return;

  isDragging = false;
  checkAngle();
}

// 각도 체크
function checkAngle() {
  isLocked = true;

  // 각도 차이 계산 (최소 각도)
  let diff = Math.abs(currentAngle - targetAngle);
  if (diff > 180) diff = 360 - diff;

  let points = 0;
  let feedbackText = '';
  let feedbackType: 'perfect' | 'good' | 'miss' = 'miss';

  if (diff <= perfectThreshold) {
    // Perfect!
    points = 20;
    feedbackText = `PERFECT! ${Math.round(diff)}°`;
    feedbackType = 'perfect';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  } else if (diff <= goodThreshold) {
    // Good
    points = 10;
    feedbackText = `Good! ${Math.round(diff)}°`;
    feedbackType = 'good';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // Miss
    points = 0;
    feedbackText = `Miss! ${Math.round(diff)}°`;
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
    safeSetTimeout(() => {
      completeGame();
    }, 1000);
    return;
  }

  // 다음 라운드
  safeSetTimeout(() => {
    resetRound();
  }, 1500);
}

// 피드백 표시
function showFeedback(text: string, type: 'perfect' | 'good' | 'miss') {
  feedback.value = { text, type };
  safeSetTimeout(() => {
    feedback.value = null;
  }, 1200);
}

// 라운드 리셋
function resetRound() {
  currentAngle = 0;
  targetAngle = Math.floor(Math.random() * 360);
  isLocked = false;
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경 클리어
  clear();

  // 배경
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // 목표 각도 표시 (화살표)
  c.save();
  c.translate(centerX, centerY);
  c.rotate((targetAngle * Math.PI) / 180);

  // 목표 화살표 (점선)
  c.strokeStyle = '#FFD700';
  c.lineWidth = 4;
  c.setLineDash([10, 10]);
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(150, 0);
  c.stroke();
  c.setLineDash([]);

  // 화살표 끝
  c.fillStyle = '#FFD700';
  c.beginPath();
  c.moveTo(150, 0);
  c.lineTo(135, -10);
  c.lineTo(135, 10);
  c.closePath();
  c.fill();

  c.restore();

  // 중앙 원 (배경)
  c.fillStyle = 'white';
  c.beginPath();
  c.arc(centerX, centerY, 100, 0, Math.PI * 2);
  c.fill();

  c.strokeStyle = '#333';
  c.lineWidth = 3;
  c.stroke();

  // 현재 각도 표시 (물체)
  c.save();
  c.translate(centerX, centerY);
  c.rotate((currentAngle * Math.PI) / 180);

  // 다이아몬드 모양
  c.fillStyle = '#f44336';
  c.beginPath();
  c.moveTo(0, -40);
  c.lineTo(40, 0);
  c.lineTo(0, 40);
  c.lineTo(-40, 0);
  c.closePath();
  c.fill();

  c.strokeStyle = '#c62828';
  c.lineWidth = 3;
  c.stroke();

  // 방향 표시 (작은 원)
  c.fillStyle = '#FFD700';
  c.beginPath();
  c.arc(0, -40, 8, 0, Math.PI * 2);
  c.fill();

  c.restore();

  // 각도 텍스트
  c.fillStyle = 'white';
  c.font = 'bold 32px Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(`목표: ${targetAngle}°`, centerX, 80);
  c.fillText(`현재: ${Math.round(currentAngle)}°`, centerX, centerY);

  // 각도 차이
  if (isLocked) {
    let diff = Math.abs(currentAngle - targetAngle);
    if (diff > 180) diff = 360 - diff;
    c.font = 'bold 24px Arial';
    c.fillText(`차이: ${Math.round(diff)}°`, centerX, centerY + 50);
  }
}

// 게임 루프
function gameLoop() {
  if (gameCompleted) return;

  render();

  // 시간 체크
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  safeRequestAnimationFrame(gameLoop);
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

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();

  // 초기 목표 각도 설정
  targetAngle = Math.floor(Math.random() * 360);

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.rotate-object {
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
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
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
  font-size: 32px;
  font-weight: 800;
  padding: 15px 30px;
  border-radius: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: feedbackPop 1s ease-out;
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
