<template>
  <div class="minigame number-match">
    <canvas ref="canvasRef" @click="handleClick" @touchstart="handleTouch"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
import { pointInRect } from '@/utils/canvas';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#2C3E50'
});

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const numbers = ref<NumberTile[]>([]);
const currentTarget = ref(1);
const maxNumber = ref(9);
const feedback = ref<{ text: string; color: string; life: number; x: number; y: number } | null>(null);
const successCount = ref(0);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { gridSize: 3, tileSize: 100 },  // Lv.1: 3x3 = 9 numbers
    { gridSize: 3, tileSize: 95 },   // Lv.2
    { gridSize: 4, tileSize: 80 },   // Lv.3: 4x4 = 16 numbers
    { gridSize: 4, tileSize: 75 },   // Lv.4
    { gridSize: 5, tileSize: 65 },   // Lv.5: 5x5 = 25 numbers
    { gridSize: 5, tileSize: 60 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface NumberTile {
  value: number;
  x: number;
  y: number;
  size: number;
  active: boolean;
  scale: number;
  targetScale: number;
  color: string;
}

const TILE_COLORS = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'];

let animationId: number;
let timerInterval: number;

// Generate number grid
function generateNumbers() {
  const settings = difficultySettings.value;
  const gridSize = settings.gridSize;
  const tileSize = settings.tileSize;
  const totalNumbers = gridSize * gridSize;

  maxNumber.value = totalNumbers;
  currentTarget.value = 1;

  // Create array of numbers 1 to totalNumbers and shuffle
  const numberArray = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  shuffleArray(numberArray);

  // Calculate grid position
  const gridWidth = gridSize * tileSize + (gridSize - 1) * 10;
  const startX = (width - gridWidth) / 2 + tileSize / 2;
  const startY = (height - gridWidth) / 2 + tileSize / 2 + 50;

  const tiles: NumberTile[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      tiles.push({
        value: numberArray[index],
        x: startX + col * (tileSize + 10),
        y: startY + row * (tileSize + 10),
        size: tileSize,
        active: true,
        scale: 0,
        targetScale: 1,
        color: TILE_COLORS[numberArray[index] % TILE_COLORS.length]
      });
    }
  }

  numbers.value = tiles;

  // Animate tiles appearing
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.targetScale = 1;
    }, i * 30);
  });
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Animate tile scales
  numbers.value.forEach(tile => {
    tile.scale += (tile.targetScale - tile.scale) * 0.2;
  });

  // Update feedback
  if (feedback.value) {
    feedback.value.y -= 2;
    feedback.value.life -= 0.05;
    if (feedback.value.life <= 0) {
      feedback.value = null;
    }
  }

  // Check if all numbers found
  if (currentTarget.value > maxNumber.value) {
    endGame();
  }
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Background
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#2C3E50');
  gradient.addColorStop(1, '#1a252f');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw instruction
  ctx.value.font = 'bold 28px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'center';
  ctx.value.fillText(`${currentTarget.value} 를 찾으세요!`, width / 2, 80);

  // Draw number emoji hint
  const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  if (currentTarget.value <= 9) {
    ctx.value.font = '40px Arial';
    ctx.value.fillText(numberEmojis[currentTarget.value], width / 2, 130);
  }

  // Draw tiles
  numbers.value.forEach(tile => {
    if (!tile.active || tile.scale <= 0.01) return;

    const scaledSize = tile.size * tile.scale;
    const x = tile.x - scaledSize / 2;
    const y = tile.y - scaledSize / 2;

    // Shadow
    helper.value!.drawRoundRect(x + 3, y + 3, scaledSize, scaledSize, 10, 'rgba(0, 0, 0, 0.3)');

    // Tile background
    helper.value!.drawRoundRect(x, y, scaledSize, scaledSize, 10, tile.color);

    // Tile highlight
    const highlightGradient = ctx.value!.createLinearGradient(x, y, x, y + scaledSize);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    ctx.value!.fillStyle = highlightGradient;
    ctx.value!.beginPath();
    ctx.value!.roundRect(x, y, scaledSize, scaledSize / 2, [10, 10, 0, 0]);
    ctx.value!.fill();

    // Number text
    ctx.value!.font = `bold ${scaledSize * 0.5}px Arial`;
    ctx.value!.fillStyle = '#FFF';
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(tile.value.toString(), tile.x, tile.y);
  });

  // Draw feedback
  if (feedback.value && feedback.value.life > 0) {
    ctx.value.globalAlpha = feedback.value.life;
    ctx.value.font = 'bold 36px Arial';
    ctx.value.fillStyle = feedback.value.color;
    ctx.value.textAlign = 'center';
    ctx.value.fillText(feedback.value.text, feedback.value.x, feedback.value.y);
    ctx.value.globalAlpha = 1;
  }

  // Progress indicator
  ctx.value.font = '18px Arial';
  ctx.value.fillStyle = '#AAA';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`진행: ${currentTarget.value - 1}/${maxNumber.value}`, 20, height - 30);

  // Score
  ctx.value.textAlign = 'right';
  ctx.value.fillText(`점수: ${score.value}`, width - 20, height - 30);
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
  checkTileHit(coords.x, coords.y);
}

function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  checkTileHit(coords.x, coords.y);
}

function checkTileHit(x: number, y: number) {
  const hitTile = numbers.value.find(tile => {
    if (!tile.active) return false;
    const halfSize = (tile.size * tile.scale) / 2;
    return pointInRect(x, y, tile.x - halfSize, tile.y - halfSize, tile.size * tile.scale, tile.size * tile.scale);
  });

  if (hitTile) {
    if (hitTile.value === currentTarget.value) {
      // Correct!
      score.value += 10;
      successCount.value++;
      hitTile.active = false;
      hitTile.targetScale = 0;

      feedback.value = {
        text: '정답!',
        color: '#2ECC71',
        life: 1,
        x: hitTile.x,
        y: hitTile.y - 30
      };

      currentTarget.value++;
    } else {
      // Wrong!
      feedback.value = {
        text: '오답!',
        color: '#E74C3C',
        life: 1,
        x: hitTile.x,
        y: hitTile.y - 30
      };

      // Shake animation
      const originalX = hitTile.x;
      let shakeCount = 0;
      const shakeInterval = setInterval(() => {
        hitTile.x = originalX + (shakeCount % 2 === 0 ? 5 : -5);
        shakeCount++;
        if (shakeCount >= 6) {
          hitTile.x = originalX;
          clearInterval(shakeInterval);
        }
      }, 50);
    }
  }
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);

  const accuracy = maxNumber.value > 0 ? Math.round((successCount.value / maxNumber.value) * 100) : 0;

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value,
    accuracy,
    count: successCount.value,
    perfect: successCount.value === maxNumber.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  generateNumbers();

  // Timer countdown
  timerInterval = window.setInterval(() => {
    timeRemaining.value -= 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  setTimeout(startGame, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
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
