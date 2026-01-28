<template>
  <div class="balance-it">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @touchmove.prevent="handleTouchMove"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        균형 시간: {{ Math.floor(balanceTime) }}초
      </div>
    </div>

    <div class="instruction">
      터치하여 시소의 균형을 유지하세요!
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

const balanceTime = ref(0);

let ctx: CanvasRenderingContext2D;
let animationId: number;
let gameCompleted = false;
let startTime = 0;

// 시소 상태
let seesawAngle = 0; // -30 ~ 30도
let targetAngle = 0;
let mouseX = canvasWidth / 2;

// 상자들
interface Box {
  x: number;
  size: number;
  weight: number;
}

const boxes = ref<Box[]>([]);

// 난이도별 설정
const maxAngle = 25;
const balanceThreshold = 5; // 균형 범위
let lastBalanceTime = 0;

// 상자 생성
function generateBoxes() {
  boxes.value = [];
  const count = 2 + props.difficulty;

  for (let i = 0; i < count; i++) {
    const size = 30 + Math.random() * 20;
    const weight = size / 50;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (100 + Math.random() * 200);

    boxes.value.push({
      x,
      size,
      weight
    });
  }
}

// 마우스 이동
function handleMouseMove(event: MouseEvent) {
  if (gameCompleted) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
}

function handleTouchMove(event: TouchEvent) {
  if (gameCompleted) return;

  const rect = canvasRef.value!.getBoundingClientRect();
  const touch = event.touches[0];
  mouseX = touch.clientX - rect.left;
}

// 업데이트
function update() {
  // 상자들의 토크 계산
  let totalTorque = 0;
  for (const box of boxes.value) {
    totalTorque += box.x * box.weight;
  }

  // 마우스 위치에 따른 조정
  const mouseOffset = (mouseX - canvasWidth / 2) / 20;
  targetAngle = totalTorque * 5 - mouseOffset;
  targetAngle = Math.max(-maxAngle, Math.min(maxAngle, targetAngle));

  // 시소 각도 부드럽게 변화
  const diff = targetAngle - seesawAngle;
  seesawAngle += diff * 0.1;

  // 균형 체크
  if (Math.abs(seesawAngle) < balanceThreshold) {
    const now = Date.now();
    const deltaTime = (now - lastBalanceTime) / 1000;
    if (lastBalanceTime > 0) {
      balanceTime.value += deltaTime;

      // 목표 시간 달성
      if (balanceTime.value >= props.targetScore / 10) {
        completeGame();
      }
    }
    lastBalanceTime = now;

    // 진동 피드백 (가끔)
    if (Math.floor(balanceTime.value * 10) % 10 === 0 && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } else {
    lastBalanceTime = 0;
  }

  // 시소가 너무 기울면 게임 오버
  if (Math.abs(seesawAngle) > maxAngle) {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    completeGame();
  }
}

// 렌더링
function render() {
  if (!ctx) return;

  // 배경
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // 균형 구역 표시
  ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
  ctx.fillRect(0, centerY - 50, canvasWidth, 100);

  // 균형 표시
  ctx.strokeStyle = Math.abs(seesawAngle) < balanceThreshold ? '#4CAF50' : '#f44336';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvasWidth, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 시소
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((seesawAngle * Math.PI) / 180);

  // 시소 판자
  const seesawWidth = 400;
  const seesawHeight = 20;

  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 3;
  ctx.strokeRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

  // 상자들
  for (const box of boxes.value) {
    const boxY = -seesawHeight / 2 - box.size;

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(box.x - box.size / 2, boxY, box.size, box.size);

    ctx.strokeStyle = '#F9A825';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x - box.size / 2, boxY, box.size, box.size);

    // 무게 표시
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', box.x, boxY + box.size / 2);
  }

  ctx.restore();

  // 받침대 (삼각형)
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX - 30, centerY + 50);
  ctx.lineTo(centerX + 30, centerY + 50);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 각도 표시
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`각도: ${Math.round(seesawAngle)}°`, centerX, 80);

  // 균형 상태 표시
  if (Math.abs(seesawAngle) < balanceThreshold) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('균형! ⚖️', centerX, 130);
  } else {
    ctx.fillStyle = '#f44336';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(seesawAngle < 0 ? '← 왼쪽으로!' : '오른쪽으로! →', centerX, 130);
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

  // 점수는 균형 유지 시간 × 10
  const finalScore = Math.floor(balanceTime.value * 10);

  const result: MiniGameResult = {
    success: finalScore >= props.targetScore,
    score: finalScore,
    timeRemaining
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
  lastBalanceTime = Date.now();

  generateBoxes();
  gameLoop();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.balance-it {
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
  cursor: crosshair;
}

.ui-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  pointer-events: none;
}

.score-display {
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  text-align: center;
}

.instruction {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
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
