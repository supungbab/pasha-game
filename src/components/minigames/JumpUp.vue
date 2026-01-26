<template>
  <div class="jump-up">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleJump"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        높이: {{ Math.floor(maxHeight) }}m
      </div>
    </div>

    <div class="instruction">
      탭하여 점프하세요!
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

const maxHeight = ref(0);

let ctx: CanvasRenderingContext2D;
let animationId: number;
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
  x: 400,
  y: 500,
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false
};

// 플랫폼
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

const platforms = ref<Platform[]>([]);
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

let cameraY = 0;
let currentHeight = 0;

// 난이도별 플랫폼 간격
const platformGap = Math.max(100 - props.difficulty * 5, 70);

// 플랫폼 생성
function createPlatform(y: number): Platform {
  const width = Math.max(120 - props.difficulty * 5, 80);
  const x = Math.random() * (canvasWidth - width);

  return {
    x,
    y,
    width,
    height: 15,
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

// 업데이트
function update() {
  // 플레이어 물리
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  // 플랫폼 충돌 체크
  if (player.velocityY > 0) {
    for (const platform of platforms.value) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height + 10
      ) {
        // 착지
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isJumping = false;

        // 높이 계산
        if (!platform.passed) {
          platform.passed = true;
          currentHeight += 10;
          if (currentHeight > maxHeight.value) {
            maxHeight.value = currentHeight;
          }

          // 목표 달성 확인
          if (maxHeight.value >= props.targetScore) {
            completeGame();
          }

          // 진동 피드백
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }

        break;
      }
    }
  }

  // 카메라 이동 (플레이어가 위쪽에 있으면)
  if (player.y < canvasHeight / 3) {
    const diff = canvasHeight / 3 - player.y;
    cameraY += diff;
    player.y = canvasHeight / 3;

    // 플랫폼도 같이 이동
    for (const platform of platforms.value) {
      platform.y += diff;
    }
  }

  // 화면 아래로 떨어진 플랫폼 제거
  platforms.value = platforms.value.filter(p => p.y < canvasHeight + 100);

  // 새 플랫폼 생성
  const highestPlatform = platforms.value.reduce((min, p) => Math.min(min, p.y), canvasHeight);
  if (highestPlatform > -200) {
    platforms.value.push(createPlatform(highestPlatform - platformGap));
  }

  // 바닥에 떨어지면 게임 오버
  if (player.y > canvasHeight) {
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

  // 구름 (장식)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const cloudOffset = cameraY % 300;
  for (let i = 0; i < 5; i++) {
    const y = i * 300 + cloudOffset;
    if (y > -100 && y < canvasHeight + 100) {
      ctx.beginPath();
      ctx.arc(150 + i * 100, y, 25, 0, Math.PI * 2);
      ctx.arc(180 + i * 100, y, 35, 0, Math.PI * 2);
      ctx.arc(210 + i * 100, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 플랫폼
  for (const platform of platforms.value) {
    ctx.fillStyle = platform.passed ? '#90EE90' : '#8B4513';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    // 테두리
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  // 플레이어 (이모지)
  ctx.font = `${player.height}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔴', player.x + player.width / 2, player.y + player.height / 2);

  // 목표 높이 표시 (참고용)
  const targetY = canvasHeight - 50;
  ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
  ctx.fillRect(0, targetY, canvasWidth, 2);
  ctx.fillStyle = '#4CAF50';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`목표: ${props.targetScore}m`, canvasWidth - 20, targetY - 10);
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

  const finalScore = Math.floor(maxHeight.value);

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

  // 초기 플랫폼 생성
  platforms.value.push(createPlatform(500));
  for (let i = 1; i <= 5; i++) {
    platforms.value.push(createPlatform(500 - i * platformGap));
  }

  gameLoop();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.jump-up {
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
  min-width: 200px;
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
