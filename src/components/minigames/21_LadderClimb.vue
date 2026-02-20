<template>
  <div class="ladder-climb">
    <canvas ref="canvasRef"></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        높이: {{ Math.floor(climberY) }}m
      </div>
      <div class="instruction">
        좌우 버튼을 번갈아 탭하세요!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  height: 600,
  backgroundColor: '#87CEEB'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame, cancelAnimationFrame } = useCleanupTimers();

// 3-버튼 시스템: 슬롯 0=왼쪽, 2=오른쪽 (슬롯 1은 비활성)
const { setTwoButtons } = useGameButtons();

// 게임 상태
const climberY = ref(0);
const isLeftPressed = ref(false);
const isRightPressed = ref(false);

let animationId: number = 0;
let gameCompleted = false;
let startTime = 0;

// 등반자 상태
let climberX = 200; // width / 2
let climberHeight = 0; // 실제 높이 (점수 계산용)
let lastPressedSide: 'left' | 'right' | null = null;
let canClimb = true;

// 난이도별 등반 속도
const climbSpeed = 5 + props.difficulty;

// 버튼 누르기 핸들러
function handlePress(side: 'left' | 'right') {
  if (gameCompleted || !canClimb) return;

  // 같은 버튼 연속 누르기 방지
  if (lastPressedSide === side) {
    // 실패 - 진동
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  if (side === 'left') {
    isLeftPressed.value = true;
  } else {
    isRightPressed.value = true;
  }

  // 등반!
  climberHeight += climbSpeed;
  climberY.value = climberHeight;
  lastPressedSide = side;

  // 성공 진동
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // 목표 높이 달성 확인
  if (climberHeight >= props.targetScore) {
    completeGame();
  }
}

// 버튼 떼기 핸들러
function handleRelease() {
  isLeftPressed.value = false;
  isRightPressed.value = false;
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경 클리어
  clear();

  // 배경 (하늘)
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 구름 (장식)
  c.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const cloudY1 = (height - climberHeight * 2) % height;
  const cloudY2 = (height - climberHeight * 2 + 200) % height;
  c.beginPath();
  c.arc(100, cloudY1, 20, 0, Math.PI * 2);
  c.arc(120, cloudY1, 25, 0, Math.PI * 2);
  c.arc(140, cloudY1, 20, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(300, cloudY2, 22, 0, Math.PI * 2);
  c.arc(325, cloudY2, 28, 0, Math.PI * 2);
  c.arc(350, cloudY2, 22, 0, Math.PI * 2);
  c.fill();

  // 사다리 (중앙)
  const ladderX = width / 2;
  const ladderWidth = 60;

  // 사다리 기둥
  c.fillStyle = '#8B4513';
  c.fillRect(ladderX - ladderWidth / 2, 0, 8, height);
  c.fillRect(ladderX + ladderWidth / 2 - 8, 0, 8, height);

  // 사다리 가로대
  c.fillStyle = '#A0522D';
  const stepHeight = 40;
  const offset = climberHeight % stepHeight;
  for (let y = -offset; y < height; y += stepHeight) {
    c.fillRect(ladderX - ladderWidth / 2, y, ladderWidth, 6);
  }

  // 등반자 위치 업데이트
  climberX = width / 2;

  // 등반자 (이모지)
  const charY = height - 150;
  c.font = '48px Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('🧗', climberX, charY);

  // 손 위치 표시 (애니메이션)
  if (isLeftPressed.value) {
    c.fillStyle = 'rgba(255, 215, 0, 0.5)';
    c.beginPath();
    c.arc(climberX - 30, charY - 15, 15, 0, Math.PI * 2);
    c.fill();
  }
  if (isRightPressed.value) {
    c.fillStyle = 'rgba(255, 215, 0, 0.5)';
    c.beginPath();
    c.arc(climberX + 30, charY - 15, 15, 0, Math.PI * 2);
    c.fill();
  }

  // 목표 높이 표시
  c.fillStyle = 'rgba(76, 175, 80, 0.3)';
  const targetY = height - ((props.targetScore * 2) % height);
  c.fillRect(0, targetY, width, 2);
  c.fillStyle = '#4CAF50';
  c.font = 'bold 16px Arial';
  c.textAlign = 'right';
  c.fillText(`목표: ${props.targetScore}m`, width - 15, targetY - 8);

  // 높이 표시선 (50m 단위)
  c.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  c.lineWidth = 1;
  c.setLineDash([5, 5]);
  const lineInterval = 50;
  const lineOffset = climberHeight % lineInterval;
  for (let h = 0; h < height; h += 100) {
    const y = height - ((lineOffset * 2 + h) % height);
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(width, y);
    c.stroke();
  }
  c.setLineDash([]);
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

  animationId = safeRequestAnimationFrame(gameLoop);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;
  canClimb = false;

  cancelAnimationFrame(animationId);

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  // 점수는 올라간 높이
  const finalScore = Math.floor(climberHeight);

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
  setTwoButtons(
    { onPress: () => handlePress('left'), onRelease: handleRelease },
    { onPress: () => handlePress('right'), onRelease: handleRelease },
  );

  startTime = Date.now();

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.ladder-climb {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-game);
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
  gap: 15px;
  pointer-events: none;
}

.score-display {
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 800;
  color: #333;
  text-shadow: none;
  padding: clamp(10px, 3vw, 15px) clamp(15px, 5vw, 30px);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: min(200px, 60vw);
  text-align: center;
}

.instruction {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-shadow: none;
  background: rgba(255, 255, 255, 0.85);
  padding: 10px 20px;
  border-radius: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
