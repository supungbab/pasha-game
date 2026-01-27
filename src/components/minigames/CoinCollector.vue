<template>
  <div class="minigame coin-collector">
    <canvas ref="canvasRef" @click="handleClick" @touchstart="handleTouch"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
import { useCleanupTimers } from '@/composables/useCleanupTimers';
import { pointInCircle } from '@/utils/canvas';
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
const { safeSetTimeout, safeSetInterval, clearInterval, cancelAnimationFrame } = useCleanupTimers();

// Game state
const score = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
const isGameOver = ref(false);
const coins = ref<FallingItem[]>([]);
const bombs = ref<FallingItem[]>([]);
const particles = ref<Particle[]>([]);
const coinCount = ref(0);
const bombHits = ref(0);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { fallSpeed: 2, spawnRate: 800, bombChance: 0.15, itemSize: 45 },   // Lv.1
    { fallSpeed: 2.5, spawnRate: 700, bombChance: 0.18, itemSize: 42 }, // Lv.2
    { fallSpeed: 3, spawnRate: 600, bombChance: 0.20, itemSize: 40 },   // Lv.3
    { fallSpeed: 3.5, spawnRate: 500, bombChance: 0.22, itemSize: 38 }, // Lv.4
    { fallSpeed: 4, spawnRate: 450, bombChance: 0.25, itemSize: 35 },   // Lv.5
    { fallSpeed: 4.5, spawnRate: 400, bombChance: 0.28, itemSize: 32 }, // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface FallingItem {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  collected: boolean;
  type: 'coin' | 'gem' | 'bomb';
  points: number;
}

const ITEM_TYPES = {
  coin: { emoji: '🪙', points: 5, color: '#FFD700' },
  gem: { emoji: '💎', points: 15, color: '#00BFFF' },
  bomb: { emoji: '💣', points: -20, color: '#FF4444' }
};

let animationId: number = 0;
let spawnInterval: number = 0;
let timerInterval: number = 0;
let itemIdCounter = 0;

// Spawn item
function spawnItem() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const isBomb = Math.random() < settings.bombChance;
  const isGem = !isBomb && Math.random() < 0.15;

  const type = isBomb ? 'bomb' : (isGem ? 'gem' : 'coin');
  const itemInfo = ITEM_TYPES[type];

  const item: FallingItem = {
    id: itemIdCounter++,
    x: Math.random() * (width - 80) + 40,
    y: -40,
    size: settings.itemSize,
    speed: settings.fallSpeed * (0.8 + Math.random() * 0.4),
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    collected: false,
    type,
    points: itemInfo.points
  };

  if (type === 'bomb') {
    bombs.value.push(item);
  } else {
    coins.value.push(item);
  }
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Update coins
  coins.value = coins.value.filter(coin => {
    if (coin.collected) return false;

    coin.y += coin.speed;
    coin.rotation += coin.rotationSpeed;

    return coin.y < height + 50;
  });

  // Update bombs
  bombs.value = bombs.value.filter(bomb => {
    if (bomb.collected) return false;

    bomb.y += bomb.speed;
    bomb.rotation += bomb.rotationSpeed;

    return bomb.y < height + 50;
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

  // Background gradient (night sky)
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw some stars in background
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 30; i++) {
    const starX = (i * 137 + 50) % width;
    const starY = (i * 89 + 30) % (height - 100);
    const starSize = 1 + (i % 3);
    ctx.value.beginPath();
    ctx.value.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.value.fill();
  }

  // Draw coins
  coins.value.forEach(coin => {
    if (coin.collected) return;

    ctx.value!.save();
    ctx.value!.translate(coin.x, coin.y);
    ctx.value!.rotate(coin.rotation);

    // Glow effect for gems
    if (coin.type === 'gem') {
      ctx.value!.shadowColor = '#00BFFF';
      ctx.value!.shadowBlur = 20;
    }

    ctx.value!.font = `${coin.size}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(ITEM_TYPES[coin.type].emoji, 0, 0);

    ctx.value!.restore();
  });

  // Draw bombs
  bombs.value.forEach(bomb => {
    if (bomb.collected) return;

    ctx.value!.save();
    ctx.value!.translate(bomb.x, bomb.y);
    ctx.value!.rotate(bomb.rotation);

    ctx.value!.font = `${bomb.size}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(ITEM_TYPES.bomb.emoji, 0, 0);

    ctx.value!.restore();
  });

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // UI
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFD700';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`🪙 ${score.value}`, 20, 40);

  ctx.value.font = '18px Arial';
  ctx.value.fillStyle = '#AAA';
  ctx.value.fillText(`수집: ${coinCount.value}개`, 20, 70);

  // Instructions
  ctx.value.font = '16px Arial';
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.value.textAlign = 'center';
  ctx.value.fillText('동전을 탭하세요! 💣폭탄 주의!', width / 2, height - 30);
}

// Game loop
function gameLoop() {
  if (isGameOver.value) return;

  update();
  render();
  animationId = requestAnimationFrame(gameLoop);
}

// Handle click/tap
function handleClick(event: MouseEvent) {
  if (isGameOver.value) return;
  const coords = getCanvasCoordinates(event);
  checkItemHit(coords.x, coords.y);
}

function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();

  // Handle multiple touches
  for (let i = 0; i < event.touches.length; i++) {
    const touch = event.touches[i];
    const coords = getCanvasCoordinates(touch);
    checkItemHit(coords.x, coords.y);
  }
}

function checkItemHit(x: number, y: number) {
  // Check coins first
  const coinIndex = coins.value.findIndex(coin => {
    if (coin.collected) return false;
    return pointInCircle(x, y, coin.x, coin.y, coin.size / 2 + 10);
  });

  if (coinIndex !== -1) {
    const coin = coins.value[coinIndex];
    coin.collected = true;
    score.value += coin.points;
    coinCount.value++;

    // Create particles
    if (helper.value) {
      const color = ITEM_TYPES[coin.type].color;
      const newParticles = helper.value.createParticles(coin.x, coin.y, color, 10);
      particles.value.push(...newParticles);
    }

    return;
  }

  // Check bombs
  const bombIndex = bombs.value.findIndex(bomb => {
    if (bomb.collected) return false;
    return pointInCircle(x, y, bomb.x, bomb.y, bomb.size / 2 + 10);
  });

  if (bombIndex !== -1) {
    const bomb = bombs.value[bombIndex];
    bomb.collected = true;
    score.value = Math.max(0, score.value + bomb.points);
    bombHits.value++;

    // Create explosion particles
    if (helper.value) {
      const explodeParticles = helper.value.createParticles(bomb.x, bomb.y, '#FF4444', 15);
      particles.value.push(...explodeParticles);
    }
  }
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
    timeRemaining: timeRemainingMs.value / 1000,
    count: coinCount.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  // Spawn items periodically
  spawnInterval = safeSetInterval(spawnItem, difficultySettings.value.spawnRate);

  // Timer countdown (정수 밀리초 사용)
  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100;
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0;
      endGame();
    }
  }, 100);

  // Initial items
  for (let i = 0; i < 3; i++) {
    safeSetTimeout(spawnItem, i * 200);
  }

  // Start game loop
  gameLoop();
}

onMounted(() => {
  safeSetTimeout(startGame, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
onUnmounted(() => {
  isGameOver.value = true;
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
