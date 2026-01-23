<template>
  <div class="minigame color-match">
    <canvas ref="canvasRef" @click="handleClick" @touchstart="handleTouch"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
import { pointInCircle } from '@/utils/canvas';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#F7FFF7'
});

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const targetColor = ref<ColorOption | null>(null);
const colorOptions = ref<ColorCircle[]>([]);
const feedback = ref<{ text: string; color: string; life: number } | null>(null);
const successCount = ref(0);
const attempts = ref(0);

// Colors
const COLORS: ColorOption[] = [
  { name: 'red', color: '#FF6B6B', emoji: '🔴' },
  { name: 'yellow', color: '#FFE66D', emoji: '🟡' },
  { name: 'green', color: '#4ECDC4', emoji: '🟢' },
  { name: 'blue', color: '#4A90D9', emoji: '🔵' },
  { name: 'purple', color: '#9B59B6', emoji: '🟣' },
];

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { circleCount: 4, circleSize: 60, showTime: 2000 },   // Lv.1
    { circleCount: 4, circleSize: 55, showTime: 1800 },   // Lv.2
    { circleCount: 5, circleSize: 50, showTime: 1500 },   // Lv.3
    { circleCount: 5, circleSize: 45, showTime: 1200 },   // Lv.4
    { circleCount: 5, circleSize: 40, showTime: 1000 },   // Lv.5
    { circleCount: 5, circleSize: 35, showTime: 800 },    // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface ColorOption {
  name: string;
  color: string;
  emoji: string;
}

interface ColorCircle {
  x: number;
  y: number;
  radius: number;
  color: ColorOption;
  scale: number;
  targetScale: number;
}

let animationId: number;
let timerInterval: number;
let roundTimeout: number;

// Generate new round
function generateRound() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;

  // Pick target color
  targetColor.value = COLORS[Math.floor(Math.random() * COLORS.length)];

  // Generate color circles with one correct answer
  const circleCount = settings.circleCount;
  const correctIndex = Math.floor(Math.random() * circleCount);

  const circles: ColorCircle[] = [];
  const usedColors = new Set<string>();

  // Calculate positions in a circle layout
  const centerX = width / 2;
  const centerY = height / 2 + 80;
  const layoutRadius = 120;

  for (let i = 0; i < circleCount; i++) {
    let color: ColorOption;

    if (i === correctIndex) {
      color = targetColor.value;
    } else {
      // Pick a different color
      do {
        color = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (color.name === targetColor.value.name || usedColors.has(color.name));
    }

    usedColors.add(color.name);

    const angle = (i / circleCount) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * layoutRadius;
    const y = centerY + Math.sin(angle) * layoutRadius;

    circles.push({
      x,
      y,
      radius: settings.circleSize,
      color,
      scale: 0,
      targetScale: 1
    });
  }

  colorOptions.value = circles;

  // Auto advance if time runs out for this round
  clearTimeout(roundTimeout);
  roundTimeout = window.setTimeout(() => {
    if (!isGameOver.value && targetColor.value) {
      // Missed - no points
      attempts.value++;
      generateRound();
    }
  }, settings.showTime);
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Animate circle scales
  colorOptions.value.forEach(circle => {
    circle.scale += (circle.targetScale - circle.scale) * 0.15;
  });

  // Update feedback
  if (feedback.value) {
    feedback.value.life -= 0.05;
    if (feedback.value.life <= 0) {
      feedback.value = null;
    }
  }
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Background
  helper.value.fillBackground('#F0F8FF');

  // Draw target color indicator at top
  if (targetColor.value) {
    // Background box
    helper.value.drawRoundRect(width / 2 - 100, 80, 200, 120, 20, '#FFFFFF');
    helper.value.drawRoundRect(width / 2 - 100, 80, 200, 120, 20, '#E0E0E0', false);

    // "Find this color" text
    ctx.value.font = 'bold 18px Arial';
    ctx.value.fillStyle = '#333';
    ctx.value.textAlign = 'center';
    ctx.value.fillText('이 색을 찾으세요!', width / 2, 110);

    // Target color circle
    helper.value.drawCircle(width / 2, 160, 35, targetColor.value.color);

    // Emoji
    ctx.value.font = '40px Arial';
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText(targetColor.value.emoji, width / 2, 160);
  }

  // Draw color option circles
  colorOptions.value.forEach(circle => {
    if (circle.scale <= 0) return;

    const scaledRadius = circle.radius * circle.scale;

    // Shadow
    helper.value!.drawCircle(circle.x + 3, circle.y + 3, scaledRadius, 'rgba(0, 0, 0, 0.2)');

    // Circle
    helper.value!.drawCircle(circle.x, circle.y, scaledRadius, circle.color.color);

    // Highlight
    helper.value!.drawCircle(
      circle.x - scaledRadius * 0.25,
      circle.y - scaledRadius * 0.25,
      scaledRadius * 0.3,
      'rgba(255, 255, 255, 0.4)'
    );
  });

  // Draw feedback
  if (feedback.value && feedback.value.life > 0) {
    ctx.value.globalAlpha = feedback.value.life;
    ctx.value.font = 'bold 48px Arial';
    ctx.value.fillStyle = feedback.value.color;
    ctx.value.textAlign = 'center';
    ctx.value.fillText(feedback.value.text, width / 2, height / 2 + 80);
    ctx.value.globalAlpha = 1;
  }

  // Score display
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#333';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);
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
  checkColorHit(coords.x, coords.y);
}

function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  checkColorHit(coords.x, coords.y);
}

function checkColorHit(x: number, y: number) {
  if (!targetColor.value) return;

  const hitCircle = colorOptions.value.find(circle => {
    return pointInCircle(x, y, circle.x, circle.y, circle.radius * circle.scale);
  });

  if (hitCircle) {
    attempts.value++;
    clearTimeout(roundTimeout);

    if (hitCircle.color.name === targetColor.value.name) {
      // Correct!
      score.value += 10;
      successCount.value++;
      feedback.value = { text: '정답!', color: '#4ECDC4', life: 1 };

      // Animate selected circle
      hitCircle.targetScale = 1.3;
      setTimeout(() => {
        hitCircle.targetScale = 0;
      }, 200);
    } else {
      // Wrong!
      feedback.value = { text: '오답!', color: '#FF6B6B', life: 1 };

      // Shake animation (visual feedback)
      hitCircle.targetScale = 0.8;
      setTimeout(() => {
        hitCircle.targetScale = 0;
      }, 150);
    }

    // Generate new round after short delay
    setTimeout(() => {
      if (!isGameOver.value) {
        generateRound();
      }
    }, 400);
  }
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);
  clearTimeout(roundTimeout);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value,
    count: successCount.value,
    attempts: attempts.value,
    accuracy: attempts.value > 0 ? Math.round((successCount.value / attempts.value) * 100) : 0
  };

  emit('complete', result);
}

// Start game
function startGame() {
  // Timer countdown
  timerInterval = window.setInterval(() => {
    timeRemaining.value -= 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Generate first round
  generateRound();

  // Start game loop
  gameLoop();
}

onMounted(() => {
  setTimeout(startGame, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);
  clearTimeout(roundTimeout);
});
</script>

<style scoped>
.minigame {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
}
</style>
