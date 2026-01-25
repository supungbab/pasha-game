<template>
  <div class="minigame fruit-slice">
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
import { lineIntersectsCircle } from '@/utils/canvas';
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
const fruits = ref<FruitObject[]>([]);
const particles = ref<Particle[]>([]);
const slicedFruits = ref<SlicedFruit[]>([]);
const totalFruits = ref(0);
const slicedCount = ref(0);

// Swipe tracking
const isSlicing = ref(false);
const sliceTrail = ref<{ x: number; y: number }[]>([]);
const lastSlicePoint = ref<{ x: number; y: number } | null>(null);

// Fruit emojis and colors
const FRUITS = [
  { emoji: '🍎', color: '#FF6B6B' },
  { emoji: '🍊', color: '#FFA500' },
  { emoji: '🍋', color: '#FFE66D' },
  { emoji: '🍇', color: '#8B5CF6' },
  { emoji: '🍓', color: '#EF4444' },
  { emoji: '🥝', color: '#22C55E' },
  { emoji: '🍑', color: '#FBBF24' },
];

const BOMB = { emoji: '💣', color: '#374151' };

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { fruitCount: 10, bombCount: 2, launchPower: 12, size: 60 },   // Lv.1
    { fruitCount: 12, bombCount: 3, launchPower: 13, size: 55 },   // Lv.2
    { fruitCount: 15, bombCount: 4, launchPower: 14, size: 50 },   // Lv.3
    { fruitCount: 18, bombCount: 5, launchPower: 15, size: 45 },   // Lv.4
    { fruitCount: 20, bombCount: 6, launchPower: 16, size: 40 },   // Lv.5
    { fruitCount: 25, bombCount: 7, launchPower: 17, size: 35 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface FruitObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'fruit' | 'bomb';
  emoji: string;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  sliced: boolean;
}

interface SlicedFruit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  half: 'left' | 'right';
  life: number;
}

let animationId: number;
let launchInterval: number;
let timerInterval: number;
let fruitIdCounter = 0;

// Launch a fruit or bomb
function launchFruit() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const bombChance = props.isHardMode ? 0.25 : settings.bombCount / (settings.fruitCount + settings.bombCount);
  const isBomb = Math.random() < bombChance;

  const fruitData = isBomb ? BOMB : FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const startX = Math.random() * (width - 100) + 50;
  const launchAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;

  const fruit: FruitObject = {
    id: fruitIdCounter++,
    x: startX,
    y: height + 30,
    vx: Math.cos(launchAngle) * settings.launchPower * (Math.random() * 0.3 + 0.85),
    vy: Math.sin(launchAngle) * settings.launchPower * (Math.random() * 0.3 + 0.85),
    type: isBomb ? 'bomb' : 'fruit',
    emoji: fruitData.emoji,
    color: fruitData.color,
    size: settings.size,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    sliced: false
  };

  fruits.value.push(fruit);
  if (!isBomb) totalFruits.value++;
}

// Update game state
function update() {
  if (isGameOver.value) return;

  const gravity = 0.35;

  // Update fruits
  fruits.value = fruits.value.filter(fruit => {
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;
    fruit.vy += gravity;
    fruit.rotation += fruit.rotationSpeed;

    // Remove if off screen (bottom)
    return fruit.y < height + 100;
  });

  // Update sliced fruits
  slicedFruits.value = slicedFruits.value.filter(piece => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += gravity;
    piece.rotation += piece.rotationSpeed;
    piece.life -= 0.02;

    return piece.life > 0 && piece.y < height + 100;
  });

  // Fade slice trail
  if (sliceTrail.value.length > 0 && !isSlicing.value) {
    sliceTrail.value = sliceTrail.value.slice(1);
  }
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Draw background gradient
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw slice trail
  if (sliceTrail.value.length > 1) {
    ctx.value.strokeStyle = '#FFD700';
    ctx.value.lineWidth = 4;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    ctx.value.beginPath();
    ctx.value.moveTo(sliceTrail.value[0].x, sliceTrail.value[0].y);
    for (let i = 1; i < sliceTrail.value.length; i++) {
      ctx.value.lineTo(sliceTrail.value[i].x, sliceTrail.value[i].y);
    }
    ctx.value.stroke();
  }

  // Draw fruits
  fruits.value.forEach(fruit => {
    if (fruit.sliced) return;

    ctx.value!.save();
    ctx.value!.translate(fruit.x, fruit.y);
    ctx.value!.rotate(fruit.rotation);

    // Draw emoji
    ctx.value!.font = `${fruit.size}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(fruit.emoji, 0, 0);

    ctx.value!.restore();
  });

  // Draw sliced fruit pieces
  slicedFruits.value.forEach(piece => {
    ctx.value!.save();
    ctx.value!.globalAlpha = piece.life;
    ctx.value!.translate(piece.x, piece.y);
    ctx.value!.rotate(piece.rotation);

    ctx.value!.font = `${piece.size}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';

    // Clip to show half
    ctx.value!.beginPath();
    if (piece.half === 'left') {
      ctx.value!.rect(-piece.size, -piece.size, piece.size, piece.size * 2);
    } else {
      ctx.value!.rect(0, -piece.size, piece.size, piece.size * 2);
    }
    ctx.value!.clip();

    ctx.value!.fillText(piece.emoji, 0, 0);
    ctx.value!.restore();
  });

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }
}

// Game loop
function gameLoop() {
  if (isGameOver.value) return;

  update();
  render();
  animationId = requestAnimationFrame(gameLoop);
}

// Slice detection
function checkSlice(x: number, y: number) {
  if (!lastSlicePoint.value) {
    lastSlicePoint.value = { x, y };
    return;
  }

  const startX = lastSlicePoint.value.x;
  const startY = lastSlicePoint.value.y;

  fruits.value.forEach(fruit => {
    if (fruit.sliced) return;

    if (lineIntersectsCircle(startX, startY, x, y, fruit.x, fruit.y, fruit.size / 2)) {
      if (fruit.type === 'bomb') {
        // Hit bomb - game over
        endGame(true);
        return;
      }

      // Slice fruit
      fruit.sliced = true;
      slicedCount.value++;
      score.value += 10;

      // Create sliced pieces
      const angle = Math.atan2(y - startY, x - startX);
      slicedFruits.value.push(
        {
          x: fruit.x - 10,
          y: fruit.y,
          vx: -3 + Math.random() * -2,
          vy: -5 + Math.random() * 2,
          emoji: fruit.emoji,
          size: fruit.size,
          rotation: fruit.rotation,
          rotationSpeed: -0.1,
          half: 'left',
          life: 1
        },
        {
          x: fruit.x + 10,
          y: fruit.y,
          vx: 3 + Math.random() * 2,
          vy: -5 + Math.random() * 2,
          emoji: fruit.emoji,
          size: fruit.size,
          rotation: fruit.rotation,
          rotationSpeed: 0.1,
          half: 'right',
          life: 1
        }
      );

      // Create juice particles
      if (helper.value) {
        const juiceParticles = helper.value.createParticles(fruit.x, fruit.y, fruit.color, 8);
        particles.value.push(...juiceParticles);
      }
    }
  });

  lastSlicePoint.value = { x, y };
}

// Pointer handlers
function handlePointerDown(event: MouseEvent) {
  if (isGameOver.value) return;
  const coords = getCanvasCoordinates(event);
  startSlice(coords.x, coords.y);
}

function handlePointerMove(event: MouseEvent) {
  if (!isSlicing.value || isGameOver.value) return;
  const coords = getCanvasCoordinates(event);
  continueSlice(coords.x, coords.y);
}

function handlePointerUp() {
  endSlice();
}

function handleTouchStart(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  startSlice(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent) {
  if (!isSlicing.value || isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  continueSlice(coords.x, coords.y);
}

function handleTouchEnd() {
  endSlice();
}

function startSlice(x: number, y: number) {
  isSlicing.value = true;
  sliceTrail.value = [{ x, y }];
  lastSlicePoint.value = { x, y };
}

function continueSlice(x: number, y: number) {
  sliceTrail.value.push({ x, y });
  if (sliceTrail.value.length > 15) {
    sliceTrail.value.shift();
  }
  checkSlice(x, y);
}

function endSlice() {
  isSlicing.value = false;
  lastSlicePoint.value = null;
}

// End game
function endGame(hitBomb = false) {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(launchInterval);
  clearInterval(timerInterval);

  const accuracy = totalFruits.value > 0 ? Math.round((slicedCount.value / totalFruits.value) * 100) : 0;

  const result: MiniGameResult = {
    success: !hitBomb && accuracy >= 70,
    score: score.value,
    timeRemaining: timeRemaining.value,
    accuracy,
    count: slicedCount.value,
    attempts: totalFruits.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  // Launch fruits periodically
  launchInterval = window.setInterval(() => {
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      setTimeout(launchFruit, i * 200);
    }
  }, 800);

  // Timer countdown
  timerInterval = window.setInterval(() => {
    timeRemaining.value -= 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Initial fruit
  setTimeout(launchFruit, 300);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  setTimeout(startGame, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  clearInterval(launchInterval);
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
