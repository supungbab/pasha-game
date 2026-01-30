<template>
  <div ref="containerRef" class="minigame fruit-slice">
    <canvas
      ref="canvasRef"
      @mousedown="handlePointerDown"
      @mousemove="handlePointerMove"
      @mouseup="handlePointerUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></canvas>

    <!-- Score Popups -->
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useJuicyFeedback } from '@/composables';
import { ScorePopup } from '@/components/common';
import { lineIntersectsCircle } from '@/utils/canvas';
import type { Particle } from '@/utils/canvas';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Canvas setup
const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#FFF8DC'
});

// Timer utilities
const { safeSetTimeout, safeSetInterval, safeRequestAnimationFrame, clearInterval, cancelAnimationFrame } = useCleanupTimers();

// Juicy feedback
const {
  scorePopups,
  createScorePopup,
  createParticles,
  shake,
} = useJuicyFeedback();

// Game state
const score = ref(0);
const combo = ref(0);
const lastSliceTime = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
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
const lastScreenPoint = ref<{ x: number; y: number } | null>(null);

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
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});

// Combo timeout
const COMBO_TIMEOUT = 400;

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

let animationId: number = 0;
let launchInterval: number = 0;
let timerInterval: number = 0;
let fruitIdCounter = 0;

// Launch a fruit or bomb
function launchFruit() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const bombChance = props.isHardMode ? 0.25 : settings.bombCount / (settings.fruitCount + settings.bombCount);
  const isBomb = Math.random() < bombChance;

  const fruitData = isBomb ? BOMB : (FRUITS[Math.floor(Math.random() * FRUITS.length)] ?? FRUITS[0]!);
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

  // Draw background gradient (bright cream/yellow theme)
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#FFFEF5');
  gradient.addColorStop(1, '#FFF8DC');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw slice trail with glow effect
  if (sliceTrail.value.length > 1) {
    ctx.value.save();

    // Glow layer (orange/red for visibility on light background)
    ctx.value.shadowBlur = 12;
    ctx.value.shadowColor = '#FF6B6B';
    ctx.value.strokeStyle = '#FF6B6B';
    ctx.value.lineWidth = 6;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    ctx.value.beginPath();
    ctx.value.moveTo(sliceTrail.value[0]!.x, sliceTrail.value[0]!.y);
    for (let i = 1; i < sliceTrail.value.length; i++) {
      ctx.value.lineTo(sliceTrail.value[i]!.x, sliceTrail.value[i]!.y);
    }
    ctx.value.stroke();

    // Core line
    ctx.value.shadowBlur = 0;
    ctx.value.strokeStyle = '#FFFFFF';
    ctx.value.lineWidth = 3;
    ctx.value.stroke();

    ctx.value.restore();
  }

  // Draw fruits
  fruits.value.forEach(fruit => {
    if (fruit.sliced) return;

    ctx.value!.save();
    ctx.value!.translate(fruit.x, fruit.y);
    ctx.value!.rotate(fruit.rotation);

    // Reset shadow and styles for emoji
    ctx.value!.shadowBlur = 0;
    ctx.value!.shadowColor = 'transparent';
    ctx.value!.fillStyle = '#000000';

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

    // Reset shadow and styles for emoji
    ctx.value!.shadowBlur = 0;
    ctx.value!.shadowColor = 'transparent';
    ctx.value!.fillStyle = '#000000';

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
  animationId = safeRequestAnimationFrame(gameLoop);
}

// Slice detection
function checkSlice(x: number, y: number) {
  if (!lastSlicePoint.value) {
    lastSlicePoint.value = { x, y };
    return;
  }

  const startX = lastSlicePoint.value.x;
  const startY = lastSlicePoint.value.y;
  const screenX = lastScreenPoint.value?.x ?? 0;
  const screenY = lastScreenPoint.value?.y ?? 0;

  let slicedInThisFrame = 0;

  fruits.value.forEach(fruit => {
    if (fruit.sliced) return;

    if (lineIntersectsCircle(startX, startY, x, y, fruit.x, fruit.y, fruit.size / 2)) {
      if (fruit.type === 'bomb') {
        // Hit bomb - game over with strong shake!
        shake(containerRef.value, 'strong');
        if (navigator.vibrate) navigator.vibrate([100, 50, 200]);

        // Red flash particles
        createParticles(containerRef.value, screenX, screenY, '#FF0000', 15);
        createScorePopup(screenX, screenY - 30, '💥 BOOM!', 'combo');

        safeSetTimeout(() => endGame(true), 300);
        return;
      }

      // Slice fruit
      fruit.sliced = true;
      slicedCount.value++;
      slicedInThisFrame++;

      const now = Date.now();

      // Check combo
      if (now - lastSliceTime.value < COMBO_TIMEOUT) {
        combo.value++;
      } else {
        combo.value = 1;
      }
      lastSliceTime.value = now;

      // Calculate points with combo bonus
      const basePoints = 10;
      const comboBonus = combo.value > 1 ? (combo.value - 1) * 5 : 0;
      const points = basePoints + comboBonus;
      score.value += points;

      // Create sliced pieces
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

      // Juicy feedback!
      createParticles(containerRef.value, screenX, screenY, fruit.color, 6);

      // Score popup based on combo
      if (combo.value >= 5) {
        createScorePopup(screenX, screenY - 30, `+${points} x${combo.value}!`, 'combo');
        shake(containerRef.value, 'light');
      } else if (combo.value >= 3) {
        createScorePopup(screenX, screenY - 30, `+${points} COMBO!`, 'score');
      } else {
        createScorePopup(screenX, screenY - 30, `+${points}`, 'score');
      }

      // Haptic feedback
      if (navigator.vibrate) {
        if (combo.value >= 3) {
          navigator.vibrate([20, 10, 20]);
        } else {
          navigator.vibrate(15);
        }
      }
    }
  });

  lastSlicePoint.value = { x, y };
}

// Pointer handlers
function handlePointerDown(event: MouseEvent) {
  if (isGameOver.value) return;
  const coords = getCanvasCoordinates(event);
  lastScreenPoint.value = { x: event.clientX, y: event.clientY };
  startSlice(coords.x, coords.y);
}

function handlePointerMove(event: MouseEvent) {
  if (!isSlicing.value || isGameOver.value) return;
  const coords = getCanvasCoordinates(event);
  lastScreenPoint.value = { x: event.clientX, y: event.clientY };
  continueSlice(coords.x, coords.y);
}

function handlePointerUp() {
  endSlice();
}

function handleTouchStart(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  lastScreenPoint.value = { x: touch.clientX, y: touch.clientY };
  startSlice(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent) {
  if (!isSlicing.value || isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  lastScreenPoint.value = { x: touch.clientX, y: touch.clientY };
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
    timeRemaining: timeRemainingMs.value / 1000,
    accuracy,
    count: slicedCount.value,
    attempts: totalFruits.value
  };

  // Final feedback
  if (!hitBomb) {
    if (result.success) {
      shake(containerRef.value, 'light');
    } else {
      shake(containerRef.value, 'strong');
    }
  }

  safeSetTimeout(() => {
    emit('complete', result);
  }, hitBomb ? 500 : 300);
}

// Start game
function startGame() {
  // Launch fruits periodically
  launchInterval = safeSetInterval(() => {
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      safeSetTimeout(launchFruit, i * 200);
    }
  }, 800);

  // Timer countdown
  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100;
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0;
      endGame();
    }
  }, 100);

  // Initial fruit
  safeSetTimeout(launchFruit, 300);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  // Pop-in animation
  if (containerRef.value) {
    containerRef.value.classList.add('juicy-pop');
  }

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
  background: #FFF8DC;
}
</style>
