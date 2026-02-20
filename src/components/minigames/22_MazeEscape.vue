<template>
  <div class="maze-escape">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouch"
    ></canvas>

    <div class="ui-overlay">
      <div v-if="!isComplete" class="instruction">
        셀을 탭하거나 버튼으로 이동하세요!
      </div>
      <div v-else class="success-message">
        🎉 탈출 성공!
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
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

// 3-버튼 시스템: ← | ↑ | →
const { setButton } = useGameButtons();

const isComplete = ref(false);

let gameCompleted = false;
let startTime = 0;

// 미로 설정
const cellSize = 40;
let mazeWidth = 15;
let mazeHeight = 12;
let maze: number[][] = [];

// 플레이어 위치
let playerX = 0;
let playerY = 0;

// 출구 위치
let exitX = 0;
let exitY = 0;

// 미로 생성 (간단한 랜덤 미로)
function generateMaze() {
  mazeWidth = Math.min(12 + props.difficulty, 18);
  mazeHeight = Math.min(10 + Math.floor(props.difficulty / 2), 14);

  // 초기화 (모두 벽)
  maze = Array.from({ length: mazeHeight }, () =>
    Array.from({ length: mazeWidth }, () => 1)
  );

  // 재귀적 백트래킹으로 미로 생성
  function carve(x: number, y: number) {
    maze[y]![x] = 0;

    const dirs: [number, number][] = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0]
    ];

    // 랜덤하게 섞기
    dirs.sort(() => Math.random() - 0.5);

    for (const dir of dirs) {
      const dx = dir[0];
      const dy = dir[1];
      const nx = x + dx * 2;
      const ny = y + dy * 2;

      if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && maze[ny]?.[nx] === 1) {
        maze[y + dy]![x + dx] = 0;
        carve(nx, ny);
      }
    }
  }

  // 시작점에서 미로 생성
  playerX = 1;
  playerY = 1;
  carve(playerX, playerY);

  // 출구 설정 (오른쪽 아래 근처)
  exitX = mazeWidth - 2;
  exitY = mazeHeight - 2;
  maze[exitY]![exitX] = 0;

  // 출구까지 경로 보장 (간단하게)
  for (let i = 1; i < mazeWidth - 1; i++) {
    if (Math.random() < 0.7) {
      maze[exitY]![i] = 0;
    }
  }
  for (let i = 1; i < mazeHeight - 1; i++) {
    if (Math.random() < 0.7) {
      maze[i]![exitX] = 0;
    }
  }
}

// 이동
function move(dx: number, dy: number) {
  if (gameCompleted || isComplete.value) return;

  const newX = playerX + dx;
  const newY = playerY + dy;

  // 범위 체크
  if (newX < 0 || newX >= mazeWidth || newY < 0 || newY >= mazeHeight) {
    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  // 벽 체크
  if (maze[newY]?.[newX] === 1) {
    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  // 이동
  playerX = newX;
  playerY = newY;

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }

  // 출구 도달 체크
  if (playerX === exitX && playerY === exitY) {
    handleEscape();
  }
}

// 터치 이동
function handleTouch(event: TouchEvent) {
  if (gameCompleted || isComplete.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;
  const touchX = (touch.clientX - rect.left) * (width / rect.width);
  const touchY = (touch.clientY - rect.top) * (height / rect.height);

  processMove(touchX, touchY);
}

// 공통 이동 처리
function processMove(inputX: number, inputY: number) {
  const offsetX = (width - mazeWidth * cellSize) / 2;
  const offsetY = (height - mazeHeight * cellSize) / 2;

  const cellX = Math.floor((inputX - offsetX) / cellSize);
  const cellY = Math.floor((inputY - offsetY) / cellSize);

  // 인접한 셀인지 확인
  const dx = cellX - playerX;
  const dy = cellY - playerY;

  if (Math.abs(dx) + Math.abs(dy) === 1) {
    move(dx, dy);
  }
}

// 탈출 성공
function handleEscape() {
  isComplete.value = true;

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate([50, 50, 50, 50, 50]);
  }

  safeSetTimeout(() => {
    completeGame();
  }, 1500);
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경
  clear();
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#2c3e50');
  gradient.addColorStop(1, '#34495e');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 미로 중앙 정렬
  const offsetX = (width - mazeWidth * cellSize) / 2;
  const offsetY = (height - mazeHeight * cellSize) / 2;

  // 미로 그리기
  for (let y = 0; y < mazeHeight; y++) {
    for (let x = 0; x < mazeWidth; x++) {
      const px = offsetX + x * cellSize;
      const py = offsetY + y * cellSize;

      if (maze[y]?.[x] === 1) {
        // 벽
        c.fillStyle = '#34495e';
        c.fillRect(px, py, cellSize, cellSize);

        c.strokeStyle = '#2c3e50';
        c.lineWidth = 1;
        c.strokeRect(px, py, cellSize, cellSize);
      } else {
        // 길
        c.fillStyle = '#ecf0f1';
        c.fillRect(px, py, cellSize, cellSize);

        c.strokeStyle = '#bdc3c7';
        c.lineWidth = 1;
        c.strokeRect(px, py, cellSize, cellSize);
      }
    }
  }

  // 출구
  const exitPx = offsetX + exitX * cellSize;
  const exitPy = offsetY + exitY * cellSize;
  c.fillStyle = '#4CAF50';
  c.fillRect(exitPx, exitPy, cellSize, cellSize);

  c.font = `${cellSize * 0.6}px Arial`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('🚪', exitPx + cellSize / 2, exitPy + cellSize / 2);

  // 플레이어
  const playerPx = offsetX + playerX * cellSize;
  const playerPy = offsetY + playerY * cellSize;
  c.fillStyle = '#3498db';
  c.fillRect(playerPx, playerPy, cellSize, cellSize);

  c.font = `${cellSize * 0.6}px Arial`;
  c.fillText('🔵', playerPx + cellSize / 2, playerPy + cellSize / 2);
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

  // 점수: 탈출 성공 시 시간 보너스
  let finalScore = 0;
  if (isComplete.value) {
    finalScore = Math.floor(100 + timeRemaining * 10);
  } else {
    finalScore = 10; // 실패
  }

  const result: MiniGameResult = {
    success: finalScore >= props.targetScore,
    score: finalScore,
    timeRemaining
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

// 키보드 이벤트 핸들러
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      move(0, -1);
      break;
    case 'ArrowDown':
    case 's':
      move(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
      move(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
      move(1, 0);
      break;
  }
}

onMounted(() => {
  // 3-버튼: ← | ↑ | → (아래 이동은 캔버스 탭으로)
  setButton(0, { visible: true, label: '←', disabled: false, onPress: () => move(-1, 0) });
  setButton(1, { visible: true, label: '↑', disabled: false, onPress: () => move(0, -1) });
  setButton(2, { visible: true, label: '→', disabled: false, onPress: () => move(1, 0) });

  startTime = Date.now();

  generateMaze();

  // 키보드 이벤트
  window.addEventListener('keydown', handleKeyDown);

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// 클린업은 useCleanupTimers가 자동으로 처리하고, 키보드 이벤트는 수동으로 정리
import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.maze-escape {
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
  cursor: pointer;
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.instruction {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.success-message {
  font-size: clamp(24px, 6vw, 36px);
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: clamp(12px, 3vw, 20px) clamp(20px, 5vw, 40px);
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 24px;
  border: 3px solid #2e7d32;
  animation: successPop 0.5s ease-out;
}

@keyframes successPop {
  0% {
    transform: translateX(-50%) scale(0.5);
  }
  50% {
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

</style>
