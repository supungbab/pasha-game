<template>
  <div class="speed-run">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleJump"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        거리: {{ Math.floor(distance) }}m
      </div>
    </div>

    <div class="instruction">
      장애물을 점프로 피하세요!
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

const distance = ref(0);

let gameCompleted = false;
let startTime = 0;

// 플레이어
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
}

const player: Player = {
  x: 150,
  y: 450,
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false
};

// 장애물
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

const obstacles = ref<Obstacle[]>([]);
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const GROUND_Y = 450;

// 난이도별 속도
const gameSpeed = 4 + props.difficulty * 0.5;
let obstacleSpawnTimer = 0;
const obstacleSpawnInterval = Math.max(70 - props.difficulty * 8, 35); // 더 자주 장애물 생성

// 장애물 생성
function createObstacle(): Obstacle {
  const obsWidth = 30 + Math.random() * 20;
  const obsHeight = 40 + Math.random() * 30;

  return {
    x: width,
    y: GROUND_Y + player.height - obsHeight,
    width: obsWidth,
    height: obsHeight,
    passed: false
  };
}

// 점프
function handleJump() {
  if (gameCompleted) return;

  if (!player.isJumping) {
    player.velocityY = JUMP_FORCE;
    player.isJumping = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }
}

// 충돌 체크
function checkCollision(obs: Obstacle): boolean {
  return (
    player.x < obs.x + obs.width &&
    player.x + player.width > obs.x &&
    player.y < obs.y + obs.height &&
    player.y + player.height > obs.y
  );
}

// 업데이트
function update() {
  // 플레이어 물리
  if (player.isJumping) {
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // 착지
    if (player.y >= GROUND_Y) {
      player.y = GROUND_Y;
      player.velocityY = 0;
      player.isJumping = false;
    }
  }

  // 거리 증가 (감속하여 목표 도달까지 시간 확보)
  distance.value += gameSpeed * 0.05;

  // 장애물 이동 및 생성
  obstacleSpawnTimer++;
  if (obstacleSpawnTimer >= obstacleSpawnInterval) {
    obstacles.value.push(createObstacle());
    obstacleSpawnTimer = 0;
  }

  for (let i = obstacles.value.length - 1; i >= 0; i--) {
    const obs = obstacles.value[i];
    if (!obs) continue;
    obs.x -= gameSpeed;

    // 충돌 체크
    if (!obs.passed && checkCollision(obs)) {
      // 게임 오버
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      completeGame();
      return;
    }

    // 통과 확인
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;

      // 진동 피드백
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }

    // 화면 밖으로 나간 장애물 제거
    if (obs.x + obs.width < 0) {
      obstacles.value.splice(i, 1);
    }
  }

  // 목표 달성 확인
  if (distance.value >= props.targetScore) {
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

  // 구름 (장식)
  c.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const cloudOffset = (distance.value * 5) % 800;
  for (let i = -1; i <= 2; i++) {
    const cloudX = i * 400 - cloudOffset;
    if (cloudX > -100 && cloudX < width + 100) {
      c.beginPath();
      c.arc(cloudX, 100, 25, 0, Math.PI * 2);
      c.arc(cloudX + 30, 100, 35, 0, Math.PI * 2);
      c.arc(cloudX + 60, 100, 25, 0, Math.PI * 2);
      c.fill();
    }
  }

  // 땅
  c.fillStyle = '#8B4513';
  c.fillRect(0, GROUND_Y + player.height, width, height - GROUND_Y - player.height);

  // 땅 위 잔디
  c.fillStyle = '#90EE90';
  c.fillRect(0, GROUND_Y + player.height, width, 5);

  // 땅 패턴 (이동)
  c.fillStyle = '#654321';
  const groundOffset = (distance.value * 10) % 40;
  for (let gx = -groundOffset; gx < width; gx += 40) {
    c.fillRect(gx, GROUND_Y + player.height + 10, 30, 10);
  }

  // 장애물
  for (const obs of obstacles.value) {
    c.fillStyle = '#DC143C';
    c.fillRect(obs.x, obs.y, obs.width, obs.height);

    // 테두리
    c.strokeStyle = '#8B0000';
    c.lineWidth = 2;
    c.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // 위험 패턴
    c.fillStyle = '#FFD700';
    c.fillRect(obs.x, obs.y, obs.width, 5);
  }

  // 플레이어 (러너 이모지)
  c.font = `${player.height}px Arial`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('🏃', player.x + player.width / 2, player.y + player.height / 2);

  // 목표 거리 표시
  c.fillStyle = 'white';
  c.font = 'bold 20px Arial';
  c.textAlign = 'left';
  c.fillText(`목표: ${props.targetScore}m`, 20, 50);
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

  const finalDistance = Math.floor(distance.value);

  const result: MiniGameResult = {
    success: finalDistance >= props.targetScore,
    score: finalDistance, // 거리 = 점수 (목표와 동일 단위)
    timeRemaining
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();

  // 첫 장애물을 빠르게 생성하기 위해 타이머 미리 진행
  obstacleSpawnTimer = Math.floor(obstacleSpawnInterval * 0.6);

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.speed-run {
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
  right: 20px;
  pointer-events: none;
}

.score-display {
  font-size: 32px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  min-width: 180px;
  text-align: center;
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
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}
</style>
