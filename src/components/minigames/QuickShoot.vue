<template>
  <div class="quick-shoot">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleShoot"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        명중: {{ hits }}
        <span class="separator">|</span>
        점수: {{ score }}
      </div>
      <div v-if="hitEffect" class="hit-effect">
        💥 HIT!
      </div>
    </div>

    <div class="crosshair" :style="{ left: crosshairX + 'px', top: crosshairY + 'px' }">
      ✛
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
const hits = ref(0);
const hitEffect = ref(false);
const crosshairX = ref(0);
const crosshairY = ref(0);

let ctx: CanvasRenderingContext2D;
let animationId: number;
let gameCompleted = false;
let startTime = 0;

// 타겟
interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  type: 'normal' | 'fast' | 'bonus';
  points: number;
}

const targets = ref<Target[]>([]);
let targetIdCounter = 0;
let lastTargetTime = 0;

// 난이도별 설정
const targetInterval = Math.max(1200 - props.difficulty * 150, 500);
const maxTargets = 3 + Math.floor(props.difficulty / 2);

// 타겟 생성
function createTarget() {
  const types = ['normal', 'normal', 'fast', 'bonus'] as const;
  const type = types[Math.floor(Math.random() * types.length)];

  let radius: number;
  let speedX: number;
  let speedY: number;
  let points: number;

  switch (type) {
    case 'fast':
      radius = 20 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 6;
      speedY = (Math.random() - 0.5) * 6;
      points = 15;
      break;
    case 'bonus':
      radius = 35 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 2;
      speedY = (Math.random() - 0.5) * 2;
      points = 20;
      break;
    default:
      radius = 25 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 4;
      speedY = (Math.random() - 0.5) * 4;
      points = 10;
  }

  const x = Math.random() * (canvasWidth - radius * 2) + radius;
  const y = Math.random() * (canvasHeight - radius * 2) + radius;

  targets.value.push({
    id: targetIdCounter++,
    x,
    y,
    radius,
    speedX,
    speedY,
    type,
    points
  });
}

// 마우스 이동 핸들러
function handleMouseMove(event: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  crosshairX.value = event.clientX;
  crosshairY.value = event.clientY;
}

// 사격 핸들러
function handleShoot(event: MouseEvent) {
  if (gameCompleted) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 타겟 히트 체크
  for (let i = targets.value.length - 1; i >= 0; i--) {
    const target = targets.value[i];
    const dx = x - target.x;
    const dy = y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= target.radius) {
      // Hit!
      score.value += target.points;
      hits.value++;
      targets.value.splice(i, 1);

      showHitEffect();

      // 진동 피드백
      if (navigator.vibrate) {
        if (target.type === 'bonus') {
          navigator.vibrate([50, 30, 50, 30, 50]);
        } else {
          navigator.vibrate(50);
        }
      }

      // 목표 점수 달성 확인
      if (score.value >= props.targetScore) {
        completeGame();
      }

      return;
    }
  }

  // Miss - 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

// 히트 이펙트 표시
function showHitEffect() {
  hitEffect.value = true;
  setTimeout(() => {
    hitEffect.value = false;
  }, 300);
}

// 업데이트
function update() {
  const now = Date.now();

  // 타겟 생성
  if (now - lastTargetTime > targetInterval && targets.value.length < maxTargets) {
    createTarget();
    lastTargetTime = now;
  }

  // 타겟 이동
  for (let i = targets.value.length - 1; i >= 0; i--) {
    const target = targets.value[i];

    target.x += target.speedX;
    target.y += target.speedY;

    // 벽 충돌
    if (target.x - target.radius <= 0 || target.x + target.radius >= canvasWidth) {
      target.speedX *= -1;
      target.x = Math.max(target.radius, Math.min(canvasWidth - target.radius, target.x));
    }
    if (target.y - target.radius <= 0 || target.y + target.radius >= canvasHeight) {
      target.speedY *= -1;
      target.y = Math.max(target.radius, Math.min(canvasHeight - target.radius, target.y));
    }
  }
}

// 렌더링
function render() {
  if (!ctx) return;

  // 배경
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#2c3e50');
  gradient.addColorStop(1, '#34495e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 그리드 (배경 장식)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvasWidth; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvasHeight);
    ctx.stroke();
  }
  for (let i = 0; i < canvasHeight; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvasWidth, i);
    ctx.stroke();
  }

  // 타겟 렌더링
  for (const target of targets.value) {
    // 타겟 색상
    let color: string;
    switch (target.type) {
      case 'fast':
        color = '#FF1744'; // 빨강 (빠른 타겟)
        break;
      case 'bonus':
        color = '#FFD700'; // 금색 (보너스)
        break;
      default:
        color = '#00BCD4'; // 청록색 (일반)
    }

    // 외곽 원
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();

    // 내부 원 (과녁 패턴)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 이모지
    ctx.font = `${target.radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', target.x, target.y);

    // 점수 표시
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`+${target.points}`, target.x, target.y + target.radius + 15);
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
    count: hits.value
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
  lastTargetTime = Date.now();

  // 초기 타겟 생성
  for (let i = 0; i < 2; i++) {
    createTarget();
  }

  // 마우스 이벤트 리스너
  window.addEventListener('mousemove', handleMouseMove);

  gameLoop();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.quick-shoot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  position: relative;
  overflow: hidden;
  cursor: none;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  cursor: none;
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
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.separator {
  margin: 0 10px;
  opacity: 0.5;
}

.hit-effect {
  font-size: 32px;
  font-weight: 800;
  color: #FFD700;
  text-shadow: 0 0 10px #FFD700;
  animation: hitPulse 0.3s ease-out;
}

@keyframes hitPulse {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.crosshair {
  position: fixed;
  font-size: 36px;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  transform: translate(-50%, -50%);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
               0 0 20px rgba(255, 255, 255, 0.3);
  animation: crosshairPulse 1s ease-in-out infinite;
  z-index: 1000;
}

@keyframes crosshairPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
