<template>
  <div class="minigame dodge-it">
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
import { ref, onMounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers } from '@/composables';
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

// Timer utilities
const { safeSetTimeout, safeSetInterval, safeRequestAnimationFrame, cancelAnimationFrame, clearInterval } = useCleanupTimers();

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const player = ref({ x: width / 2, y: height - 100, radius: 25 });
const obstacles = ref<Obstacle[]>([]);
const particles = ref<Particle[]>([]);
const survivalTime = ref(0);
const isDragging = ref(false);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { obstacleSpeed: 3, spawnRate: 1200, obstacleSize: 30 },   // Lv.1
    { obstacleSpeed: 3.5, spawnRate: 1000, obstacleSize: 32 }, // Lv.2
    { obstacleSpeed: 4, spawnRate: 900, obstacleSize: 34 },    // Lv.3
    { obstacleSpeed: 4.5, spawnRate: 800, obstacleSize: 36 },  // Lv.4
    { obstacleSpeed: 5, spawnRate: 700, obstacleSize: 38 },    // Lv.5
    { obstacleSpeed: 5.5, spawnRate: 600, obstacleSize: 40 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});

interface Obstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  type: 'car' | 'rock' | 'barrel';
  rotation: number;
}

const OBSTACLE_TYPES = [
  { type: 'car', emoji: '🚗', color: '#E74C3C' },
  { type: 'rock', emoji: '🪨', color: '#7F8C8D' },
  { type: 'barrel', emoji: '🛢️', color: '#E67E22' },
];

let animationId: number;
let spawnInterval: number;
let timerInterval: number;
let scoreInterval: number;
let obstacleIdCounter = 0;

// Spawn obstacle
function spawnObstacle() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const typeIndex = Math.floor(Math.random() * OBSTACLE_TYPES.length);
  const obstacleType = OBSTACLE_TYPES[typeIndex] ?? OBSTACLE_TYPES[0]!;

  const obstacle: Obstacle = {
    id: obstacleIdCounter++,
    x: Math.random() * (width - 60) + 30,
    y: -40,
    radius: settings.obstacleSize,
    speed: settings.obstacleSpeed * (0.8 + Math.random() * 0.4),
    type: obstacleType.type as 'car' | 'rock' | 'barrel',
    rotation: 0
  };

  obstacles.value.push(obstacle);
}

// Update game state
function update() {
  if (isGameOver.value) return;

  const playerPos = player.value;

  // Update obstacles
  obstacles.value = obstacles.value.filter(obs => {
    obs.y += obs.speed;
    obs.rotation += 0.05;

    // Check collision with player
    if (circlesIntersect(
      playerPos.x, playerPos.y, playerPos.radius * 0.8,
      obs.x, obs.y, obs.radius * 0.8
    )) {
      // Hit!
      if (helper.value) {
        const hitParticles = helper.value.createParticles(playerPos.x, playerPos.y, '#FF4444', 20);
        particles.value.push(...hitParticles);
      }
      endGame();
      return false;
    }

    return obs.y < height + 50;
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

  // Draw road background
  const roadGradient = ctx.value.createLinearGradient(0, 0, 0, height);
  roadGradient.addColorStop(0, '#2C3E50');
  roadGradient.addColorStop(1, '#1a252f');
  ctx.value.fillStyle = roadGradient;
  ctx.value.fillRect(0, 0, width, height);

  // Road lanes
  ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.value.lineWidth = 4;
  ctx.value.setLineDash([30, 20]);

  // Draw lane dividers
  for (let i = 1; i < 4; i++) {
    const x = (width / 4) * i;
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, height);
    ctx.value.stroke();
  }
  ctx.value.setLineDash([]);

  // Draw obstacles
  obstacles.value.forEach(obs => {
    const obsType = OBSTACLE_TYPES.find(t => t.type === obs.type) ?? OBSTACLE_TYPES[0]!;

    ctx.value!.save();
    ctx.value!.translate(obs.x, obs.y);

    // Shadow
    ctx.value!.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.value!.beginPath();
    ctx.value!.ellipse(3, 5, obs.radius, obs.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.value!.fill();

    // Emoji
    ctx.value!.font = `${obs.radius * 1.8}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(obsType.emoji, 0, 0);

    ctx.value!.restore();
  });

  // Draw player
  const px = player.value.x;
  const py = player.value.y;
  const pr = player.value.radius;

  // Player shadow
  ctx.value.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.value.beginPath();
  ctx.value.ellipse(px + 2, py + 4, pr, pr * 0.5, 0, 0, Math.PI * 2);
  ctx.value.fill();

  // Player car
  ctx.value.font = `${pr * 2.2}px Arial`;
  ctx.value.textAlign = 'center';
  ctx.value.textBaseline = 'middle';
  ctx.value.fillText('🏎️', px, py);

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // UI
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);

  ctx.value.font = '18px Arial';
  ctx.value.fillStyle = '#AAA';
  ctx.value.fillText(`생존: ${survivalTime.value.toFixed(1)}초`, 20, 70);

  // Instructions
  ctx.value.font = '16px Arial';
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.value.textAlign = 'center';
  ctx.value.fillText('드래그하여 장애물을 피하세요!', width / 2, height - 20);
}

// Game loop
function gameLoop() {
  if (isGameOver.value) return;

  update();
  render();
  animationId = safeRequestAnimationFrame(gameLoop);
}

// Pointer handlers
function handlePointerDown(event: MouseEvent) {
  isDragging.value = true;
  const coords = getCanvasCoordinates(event);
  movePlayer(coords.x);
}

function handlePointerMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const coords = getCanvasCoordinates(event);
  movePlayer(coords.x);
}

function handlePointerUp() {
  isDragging.value = false;
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  movePlayer(coords.x);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  movePlayer(coords.x);
}

function handleTouchEnd() {
  isDragging.value = false;
}

function movePlayer(x: number) {
  const minX = player.value.radius + 10;
  const maxX = width - player.value.radius - 10;
  player.value.x = Math.max(minX, Math.min(maxX, x));
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearInterval(scoreInterval);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  const settings = difficultySettings.value;
  if (!settings) return;

  // Spawn obstacles periodically
  spawnInterval = safeSetInterval(spawnObstacle, settings.spawnRate);

  // Timer countdown
  timerInterval = safeSetInterval(() => {
    timeRemaining.value -= 0.1;
    survivalTime.value += 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Score based on survival time
  scoreInterval = safeSetInterval(() => {
    if (!isGameOver.value) {
      score.value += 5;
    }
  }, 1000);

  // Initial obstacles
  safeSetTimeout(spawnObstacle, 500);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  safeSetTimeout(startGame, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
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
