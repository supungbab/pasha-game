<template>
  <div class="minigame sort-it">
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
import { pointInRect } from '@/utils/canvas';
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
  backgroundColor: '#2C3E50'
});

// Timer utilities
const { safeSetTimeout, safeSetInterval, safeRequestAnimationFrame, cancelAnimationFrame, clearInterval } = useCleanupTimers();

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const items = ref<SortItem[]>([]);
const particles = ref<Particle[]>([]);
const isDragging = ref(false);
const draggedItem = ref<SortItem | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const roundComplete = ref(false);
const roundCount = ref(0);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { itemCount: 4, itemSize: 70 },   // Lv.1
    { itemCount: 5, itemSize: 65 },   // Lv.2
    { itemCount: 5, itemSize: 60 },   // Lv.3
    { itemCount: 6, itemSize: 55 },   // Lv.4
    { itemCount: 6, itemSize: 50 },   // Lv.5
    { itemCount: 7, itemSize: 45 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface SortItem {
  id: number;
  value: number;
  x: number;
  y: number;
  targetX: number;
  size: number;
  color: string;
  originalIndex: number;
  currentIndex: number;
}

const ITEM_COLORS = ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6', '#1ABC9C'];

let animationId: number;
let timerInterval: number;

// Generate items to sort
function generateItems() {
  const settings = difficultySettings.value;
  const count = settings.itemCount;
  const size = settings.itemSize;

  // Create array of numbers 1 to count
  const values = Array.from({ length: count }, (_, i) => i + 1);

  // Shuffle values
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  // Calculate positions
  const totalWidth = count * size + (count - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;
  const y = height / 2;

  const newItems: SortItem[] = values.map((value, index) => ({
    id: index,
    value,
    x: startX + index * (size + 10),
    y,
    targetX: startX + index * (size + 10),
    size,
    color: ITEM_COLORS[(value - 1) % ITEM_COLORS.length],
    originalIndex: index,
    currentIndex: index
  }));

  items.value = newItems;
  roundComplete.value = false;
}

// Check if items are sorted
function checkSorted(): boolean {
  for (let i = 0; i < items.value.length - 1; i++) {
    const currentItem = items.value.find(item => item.currentIndex === i);
    const nextItem = items.value.find(item => item.currentIndex === i + 1);
    if (!currentItem || !nextItem || currentItem.value > nextItem.value) {
      return false;
    }
  }
  return true;
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Animate items to target positions
  items.value.forEach(item => {
    if (item !== draggedItem.value) {
      const dx = item.targetX - item.x;
      item.x += dx * 0.2;
    }
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
  gradient.addColorStop(0, '#2C3E50');
  gradient.addColorStop(1, '#1a252f');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw instruction
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'center';
  ctx.value.fillText('숫자를 순서대로 정렬하세요!', width / 2, 100);

  // Draw arrow indicators
  ctx.value.font = '30px Arial';
  ctx.value.fillText('1️⃣ ➡️ 🔢', width / 2, 150);

  // Draw slot indicators
  const settings = difficultySettings.value;
  const count = settings.itemCount;
  const size = settings.itemSize;
  const totalWidth = count * size + (count - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * (size + 10);
    const y = height / 2;

    // Slot background
    helper.value.drawRoundRect(x - size / 2, y - size / 2, size, size, 10, 'rgba(255, 255, 255, 0.1)');
  }

  // Sort items by currentIndex for proper z-order (dragged item on top)
  const sortedItems = [...items.value].sort((a, b) => {
    if (a === draggedItem.value) return 1;
    if (b === draggedItem.value) return -1;
    return 0;
  });

  // Draw items
  sortedItems.forEach(item => {
    const x = item.x;
    const y = item.y;
    const s = item.size;
    const isDragged = item === draggedItem.value;

    // Shadow
    if (isDragged) {
      helper.value!.drawRoundRect(x - s / 2 + 5, y - s / 2 + 8, s, s, 12, 'rgba(0, 0, 0, 0.4)');
    } else {
      helper.value!.drawRoundRect(x - s / 2 + 2, y - s / 2 + 3, s, s, 10, 'rgba(0, 0, 0, 0.3)');
    }

    // Item background
    const itemScale = isDragged ? 1.1 : 1;
    const scaledSize = s * itemScale;
    helper.value!.drawRoundRect(
      x - scaledSize / 2,
      y - scaledSize / 2,
      scaledSize,
      scaledSize,
      10,
      item.color
    );

    // Highlight
    const highlightGradient = ctx.value!.createLinearGradient(
      x - scaledSize / 2,
      y - scaledSize / 2,
      x - scaledSize / 2,
      y
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.value!.fillStyle = highlightGradient;
    ctx.value!.beginPath();
    ctx.value!.roundRect(x - scaledSize / 2, y - scaledSize / 2, scaledSize, scaledSize / 2, [10, 10, 0, 0]);
    ctx.value!.fill();

    // Number
    ctx.value!.font = `bold ${scaledSize * 0.5}px Arial`;
    ctx.value!.fillStyle = '#FFF';
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(item.value.toString(), x, y);
  });

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // Success message
  if (roundComplete.value) {
    ctx.value.font = 'bold 48px Arial';
    ctx.value.fillStyle = '#2ECC71';
    ctx.value.textAlign = 'center';
    ctx.value.fillText('정렬 완료!', width / 2, height - 150);
  }

  // UI
  ctx.value.font = 'bold 20px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);

  ctx.value.textAlign = 'right';
  ctx.value.fillText(`라운드: ${roundCount.value + 1}`, width - 20, 40);
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
  if (roundComplete.value) return;
  const coords = getCanvasCoordinates(event);
  startDrag(coords.x, coords.y);
}

function handlePointerMove(event: MouseEvent) {
  if (!isDragging.value || roundComplete.value) return;
  const coords = getCanvasCoordinates(event);
  moveDrag(coords.x, coords.y);
}

function handlePointerUp() {
  endDrag();
}

function handleTouchStart(event: TouchEvent) {
  if (roundComplete.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  startDrag(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || roundComplete.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  moveDrag(coords.x, coords.y);
}

function handleTouchEnd() {
  endDrag();
}

function startDrag(x: number, y: number) {
  const item = items.value.find(i =>
    pointInRect(x, y, i.x - i.size / 2, i.y - i.size / 2, i.size, i.size)
  );

  if (item) {
    isDragging.value = true;
    draggedItem.value = item;
    dragOffset.value = { x: x - item.x, y: y - item.y };
  }
}

function moveDrag(x: number, y: number) {
  if (!draggedItem.value) return;

  draggedItem.value.x = x - dragOffset.value.x;
  draggedItem.value.y = y - dragOffset.value.y;

  // Find which slot the item is over
  const settings = difficultySettings.value;
  const count = settings.itemCount;
  const size = settings.itemSize;
  const totalWidth = count * size + (count - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;

  const draggedIndex = Math.round((draggedItem.value.x - startX) / (size + 10));
  const clampedIndex = Math.max(0, Math.min(count - 1, draggedIndex));

  if (clampedIndex !== draggedItem.value.currentIndex) {
    // Swap with item at that position
    const otherItem = items.value.find(i => i !== draggedItem.value && i.currentIndex === clampedIndex);
    if (otherItem) {
      otherItem.currentIndex = draggedItem.value.currentIndex;
      otherItem.targetX = startX + otherItem.currentIndex * (size + 10);
    }
    draggedItem.value.currentIndex = clampedIndex;
  }
}

function endDrag() {
  if (!draggedItem.value) return;

  const settings = difficultySettings.value;
  const size = settings.itemSize;
  const totalWidth = settings.itemCount * size + (settings.itemCount - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;

  // Snap to position
  draggedItem.value.targetX = startX + draggedItem.value.currentIndex * (size + 10);
  draggedItem.value.y = height / 2;

  isDragging.value = false;
  draggedItem.value = null;

  // Check if sorted
  if (checkSorted()) {
    roundComplete.value = true;
    score.value += 100;
    roundCount.value++;

    // Create celebration particles
    if (helper.value) {
      items.value.forEach(item => {
        const celebrateParticles = helper.value!.createParticles(item.x, item.y, item.color, 5);
        particles.value.push(...celebrateParticles);
      });
    }

    // Generate new round after delay
    safeSetTimeout(() => {
      if (!isGameOver.value) {
        generateItems();
      }
    }, 1500);
  }
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value,
    count: roundCount.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  generateItems();

  // Timer countdown
  timerInterval = safeSetInterval(() => {
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
