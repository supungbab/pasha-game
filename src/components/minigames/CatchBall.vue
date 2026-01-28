<template>
  <div class="minigame catch-ball">
    <canvas
      ref="canvasRef"
      @mousedown="handlePointerDown"
      @mousemove="handlePointerMove"
      @mouseup="handlePointerUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
import { circlesIntersect } from '@/utils/canvas';
import type { Particle } from '@/utils/canvas';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#1a1a2e'
});

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const balls = ref<Ball[]>([]);
const basket = ref({ x: width / 2, y: height - 80, width: 80, height: 50 });
const particles = ref<Particle[]>([]);
const catchCount = ref(0);
const missCount = ref(0);

// Pointer tracking
const isDragging = ref(false);
const lastPointerX = ref(0);

// Ball types
const BALL_TYPES = [
  { emoji: '⚽', color: '#FFFFFF', points: 5 },
  { emoji: '🏀', color: '#FF8C00', points: 5 },
  { emoji: '⚾', color: '#FFFFFF', points: 5 },
  { emoji: '🎾', color: '#CCFF00', points: 5 },
  { emoji: '⭐', color: '#FFD700', points: 10 }, // Bonus
];

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { ballSpeed: 3, spawnRate: 1200, basketWidth: 90 },   // Lv.1
    { ballSpeed: 3.5, spawnRate: 1000, basketWidth: 85 }, // Lv.2
    { ballSpeed: 4, spawnRate: 900, basketWidth: 80 },    // Lv.3
    { ballSpeed: 4.5, spawnRate: 800, basketWidth: 75 },  // Lv.4
    { ballSpeed: 5, spawnRate: 700, basketWidth: 70 },    // Lv.5
    { ballSpeed: 5.5, spawnRate: 600, basketWidth: 65 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface Ball {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  type: typeof BALL_TYPES[0];
  wobbleOffset: number;
  wobbleSpeed: number;
}

let animationId: number;
let spawnInterval: number;
let timerInterval: number;
let ballIdCounter = 0;

// Spawn ball
function spawnBall() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const isBonus = Math.random() < 0.15; // 15% chance for bonus star
  const type = isBonus ? BALL_TYPES[4] : BALL_TYPES[Math.floor(Math.random() * 4)];

  const ball: Ball = {
    id: ballIdCounter++,
    x: Math.random() * (width - 80) + 40,
    y: -30,
    radius: 25,
    speed: settings.ballSpeed * (0.8 + Math.random() * 0.4),
    type,
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.03
  };

  balls.value.push(ball);
}

// Update game state
function update() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  basket.value.width = settings.basketWidth;

  // Update balls
  balls.value = balls.value.filter(ball => {
    ball.y += ball.speed;
    ball.wobbleOffset += ball.wobbleSpeed;
    ball.x += Math.sin(ball.wobbleOffset) * 0.5;

    // Check if caught by basket
    const basketCenterX = basket.value.x;
    const basketTop = basket.value.y - basket.value.height / 2;

    if (
      ball.y + ball.radius >= basketTop &&
      ball.y - ball.radius <= basketTop + 20 &&
      Math.abs(ball.x - basketCenterX) <= basket.value.width / 2 + ball.radius / 2
    ) {
      // Caught!
      score.value += ball.type.points;
      catchCount.value++;

      // Create catch particles
      if (helper.value) {
        const catchParticles = helper.value.createParticles(ball.x, ball.y, ball.type.color, 8);
        particles.value.push(...catchParticles);
      }

      return false;
    }

    // Check if missed (fell below basket)
    if (ball.y > height + 30) {
      missCount.value++;
      return false;
    }

    return true;
  });

  // Update particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Background gradient
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw balls
  balls.value.forEach(ball => {
    // Shadow
    helper.value!.drawCircle(ball.x + 2, ball.y + 2, ball.radius, 'rgba(0, 0, 0, 0.3)');

    // Ball
    ctx.value!.font = `${ball.radius * 2}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(ball.type.emoji, ball.x, ball.y);
  });

  // Draw basket
  const bx = basket.value.x;
  const by = basket.value.y;
  const bw = basket.value.width;
  const bh = basket.value.height;

  // Basket body (brown wooden look)
  const basketGradient = ctx.value.createLinearGradient(bx - bw / 2, by, bx + bw / 2, by);
  basketGradient.addColorStop(0, '#8B4513');
  basketGradient.addColorStop(0.5, '#A0522D');
  basketGradient.addColorStop(1, '#8B4513');

  ctx.value.fillStyle = basketGradient;

  // Basket shape (trapezoid)
  ctx.value.beginPath();
  ctx.value.moveTo(bx - bw / 2, by - bh / 2);
  ctx.value.lineTo(bx + bw / 2, by - bh / 2);
  ctx.value.lineTo(bx + bw / 2 - 10, by + bh / 2);
  ctx.value.lineTo(bx - bw / 2 + 10, by + bh / 2);
  ctx.value.closePath();
  ctx.value.fill();

  // Basket rim
  ctx.value.strokeStyle = '#5D3A1A';
  ctx.value.lineWidth = 4;
  ctx.value.stroke();

  // Basket horizontal lines (weave pattern)
  ctx.value.strokeStyle = '#5D3A1A';
  ctx.value.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const yOffset = (i / 4) * bh;
    const xShrink = (i / 4) * 10;
    ctx.value.beginPath();
    ctx.value.moveTo(bx - bw / 2 + xShrink, by - bh / 2 + yOffset);
    ctx.value.lineTo(bx + bw / 2 - xShrink, by - bh / 2 + yOffset);
    ctx.value.stroke();
  }

  // Draw emoji on basket
  ctx.value.font = '30px Arial';
  ctx.value.fillText('🧺', bx, by);

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // Score display
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);

  // Catch count
  ctx.value.font = '18px Arial';
  ctx.value.fillText(`잡은 공: ${catchCount.value}`, 20, 70);
}

// Game loop
function gameLoop() {
  if (isGameOver.value) return;

  update();
  render();
  animationId = requestAnimationFrame(gameLoop);
}

// Pointer handlers
function handlePointerDown(event: MouseEvent) {
  isDragging.value = true;
  const coords = getCanvasCoordinates(event);
  lastPointerX.value = coords.x;
  basket.value.x = coords.x;
}

function handlePointerMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const coords = getCanvasCoordinates(event);
  basket.value.x = Math.max(basket.value.width / 2, Math.min(width - basket.value.width / 2, coords.x));
}

function handlePointerUp() {
  isDragging.value = false;
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  lastPointerX.value = coords.x;
  basket.value.x = coords.x;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  basket.value.x = Math.max(basket.value.width / 2, Math.min(width - basket.value.width / 2, coords.x));
}

function handleTouchEnd() {
  isDragging.value = false;
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value,
    count: catchCount.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  // Spawn balls periodically
  spawnInterval = window.setInterval(spawnBall, difficultySettings.value.spawnRate);

  // Timer countdown
  timerInterval = window.setInterval(() => {
    timeRemaining.value -= 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Initial balls
  setTimeout(spawnBall, 300);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  setTimeout(startGame, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
});
</script>

<style scoped>
.minigame {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #FFFFFF;
}
</style>
