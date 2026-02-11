<template>
  <div class="balance-it">
    <canvas
      ref="canvasRef"
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
  backgroundColor: '#87CEEB'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

const balanceTime = ref(0);

let gameCompleted = false;
let startTime = 0;

// 시소 상태
let seesawAngle = 0; // -30 ~ 30도
let targetAngle = 0;
let mouseX = 400; // width / 2 초기값

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

function handleTouchMove(event: TouchEvent) {
  if (gameCompleted) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;
  mouseX = (touch.clientX - rect.left) * (width / rect.width);
}

// 업데이트
function update() {
  // 상자들의 토크 계산
  let totalTorque = 0;
  for (const box of boxes.value) {
    totalTorque += box.x * box.weight;
  }

  // 마우스 위치에 따른 조정
  const mouseOffset = (mouseX - width / 2) / 20;
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
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경
  clear();
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // 균형 구역 표시
  c.fillStyle = 'rgba(76, 175, 80, 0.1)';
  c.fillRect(0, centerY - 50, width, 100);

  // 균형 표시
  c.strokeStyle = Math.abs(seesawAngle) < balanceThreshold ? '#4CAF50' : '#f44336';
  c.lineWidth = 4;
  c.setLineDash([10, 10]);
  c.beginPath();
  c.moveTo(0, centerY);
  c.lineTo(width, centerY);
  c.stroke();
  c.setLineDash([]);

  // 시소
  c.save();
  c.translate(centerX, centerY);
  c.rotate((seesawAngle * Math.PI) / 180);

  // 시소 판자
  const seesawWidth = 400;
  const seesawHeight = 20;

  c.fillStyle = '#8B4513';
  c.fillRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

  c.strokeStyle = '#654321';
  c.lineWidth = 3;
  c.strokeRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

  // 상자들
  for (const box of boxes.value) {
    const boxY = -seesawHeight / 2 - box.size;

    c.fillStyle = '#FFD700';
    c.fillRect(box.x - box.size / 2, boxY, box.size, box.size);

    c.strokeStyle = '#F9A825';
    c.lineWidth = 2;
    c.strokeRect(box.x - box.size / 2, boxY, box.size, box.size);

    // 무게 표시
    c.fillStyle = '#2c3e50';
    c.font = 'bold 16px Arial';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('📦', box.x, boxY + box.size / 2);
  }

  c.restore();

  // 받침대 (삼각형)
  c.fillStyle = '#2c3e50';
  c.beginPath();
  c.moveTo(centerX, centerY);
  c.lineTo(centerX - 30, centerY + 50);
  c.lineTo(centerX + 30, centerY + 50);
  c.closePath();
  c.fill();

  c.strokeStyle = '#1a1a1a';
  c.lineWidth = 3;
  c.stroke();

  // 각도 표시
  c.fillStyle = 'white';
  c.font = 'bold 24px Arial';
  c.textAlign = 'center';
  c.fillText(`각도: ${Math.round(seesawAngle)}°`, centerX, 80);

  // 균형 상태 표시
  if (Math.abs(seesawAngle) < balanceThreshold) {
    c.fillStyle = '#4CAF50';
    c.font = 'bold 32px Arial';
    c.fillText('균형! ⚖️', centerX, 130);
  } else {
    c.fillStyle = '#f44336';
    c.font = 'bold 28px Arial';
    c.fillText(seesawAngle < 0 ? '← 왼쪽으로!' : '오른쪽으로! →', centerX, 130);
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

  safeRequestAnimationFrame(gameLoop);
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

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();
  lastBalanceTime = Date.now();

  generateBoxes();

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.balance-it {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-game);
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
  color: #333;
  text-shadow: none;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.instruction {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-shadow: none;
  background: rgba(255, 255, 255, 0.85);
  padding: 12px 24px;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
</style>
