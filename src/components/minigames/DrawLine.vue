<template>
  <div ref="containerRef" class="minigame draw-line">
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
import { ref, onMounted,  computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useJuicyFeedback } from '@/composables';
import { ScorePopup } from '@/components/common';
import { distance } from '@/utils/canvas';

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
  backgroundColor: '#F5F5F5'
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
const timeRemainingMs = ref(props.timeLimit * 1000); // 밀리초 단위로 관리
const isGameOver = ref(false);
const targetPath = ref<Point[]>([]);
const userPath = ref<Point[]>([]);
const isDrawing = ref(false);
const roundComplete = ref(false);
const accuracy = ref(0);
const roundCount = ref(0);
const totalAccuracy = ref(0);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { complexity: 'simple', tolerance: 40 },    // Lv.1
    { complexity: 'simple', tolerance: 35 },    // Lv.2
    { complexity: 'medium', tolerance: 30 },    // Lv.3
    { complexity: 'medium', tolerance: 25 },    // Lv.4
    { complexity: 'complex', tolerance: 20 },   // Lv.5
    { complexity: 'complex', tolerance: 15 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});

interface Point {
  x: number;
  y: number;
}

// Shape templates
const SHAPES = {
  simple: [
    // Horizontal line
    () => [{ x: 80, y: height / 2 }, { x: width - 80, y: height / 2 }],
    // Vertical line
    () => [{ x: width / 2, y: 150 }, { x: width / 2, y: height - 150 }],
    // Diagonal line
    () => [{ x: 80, y: 150 }, { x: width - 80, y: height - 150 }],
  ],
  medium: [
    // L shape
    () => [
      { x: 100, y: 150 },
      { x: 100, y: height - 200 },
      { x: width - 100, y: height - 200 }
    ],
    // V shape
    () => [
      { x: 80, y: 150 },
      { x: width / 2, y: height - 200 },
      { x: width - 80, y: 150 }
    ],
    // Z shape
    () => [
      { x: 80, y: 150 },
      { x: width - 80, y: 150 },
      { x: 80, y: height - 200 },
      { x: width - 80, y: height - 200 }
    ],
  ],
  complex: [
    // Triangle
    () => [
      { x: width / 2, y: 150 },
      { x: width - 80, y: height - 200 },
      { x: 80, y: height - 200 },
      { x: width / 2, y: 150 }
    ],
    // Star shape (simplified)
    () => {
      const cx = width / 2;
      const cy = height / 2;
      const outer = 120;
      const inner = 50;
      const points: Point[] = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
        points.push({ x: cx + Math.cos(outerAngle) * outer, y: cy + Math.sin(outerAngle) * outer });
        points.push({ x: cx + Math.cos(innerAngle) * inner, y: cy + Math.sin(innerAngle) * inner });
      }
      points.push(points[0]!); // Close the shape
      return points;
    },
    // Square
    () => [
      { x: 100, y: 180 },
      { x: width - 100, y: 180 },
      { x: width - 100, y: height - 200 },
      { x: 100, y: height - 200 },
      { x: 100, y: 180 }
    ],
  ]
};

let animationId: number = 0;
let timerInterval: number = 0;

// Generate target path
function generateTargetPath() {
  const settings = difficultySettings.value;
  const shapeSet = SHAPES[settings.complexity as keyof typeof SHAPES] ?? SHAPES.simple;
  const shapeGenerator = shapeSet[Math.floor(Math.random() * shapeSet.length)] ?? shapeSet[0];
  targetPath.value = shapeGenerator!();
  userPath.value = [];
  roundComplete.value = false;
  accuracy.value = 0;
}

// Interpolate points along the target path for comparison
function getTargetPathPoints(numPoints: number): Point[] {
  const path = targetPath.value;
  if (path.length < 2) return [];

  const points: Point[] = [];
  let totalLength = 0;
  const segments: { start: Point; end: Point; length: number }[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i]!;
    const next = path[i + 1]!;
    const len = distance(current.x, current.y, next.x, next.y);
    segments.push({ start: current, end: next, length: len });
    totalLength += len;
  }

  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / (numPoints - 1)) * totalLength;
    let currentDist = 0;

    for (const seg of segments) {
      if (currentDist + seg.length >= targetDist) {
        const t = (targetDist - currentDist) / seg.length;
        points.push({
          x: seg.start.x + (seg.end.x - seg.start.x) * t,
          y: seg.start.y + (seg.end.y - seg.start.y) * t
        });
        break;
      }
      currentDist += seg.length;
    }
  }

  return points;
}

// Calculate accuracy
function calculateAccuracy(): number {
  if (userPath.value.length < 2) return 0;

  const targetPoints = getTargetPathPoints(Math.max(userPath.value.length, 50));
  const tolerance = difficultySettings.value.tolerance;

  let matchedPoints = 0;

  userPath.value.forEach(userPoint => {
    const minDist = Math.min(...targetPoints.map(tp =>
      distance(userPoint.x, userPoint.y, tp.x, tp.y)
    ));
    if (minDist <= tolerance) {
      matchedPoints++;
    }
  });

  return Math.round((matchedPoints / userPath.value.length) * 100);
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Nothing special to update continuously
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Background
  helper.value.fillBackground('#F5F5F5');

  // Grid pattern
  ctx.value.strokeStyle = 'rgba(200, 200, 200, 0.5)';
  ctx.value.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, height);
    ctx.value.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.value.beginPath();
    ctx.value.moveTo(0, y);
    ctx.value.lineTo(width, y);
    ctx.value.stroke();
  }

  // Draw target path (dashed line)
  if (targetPath.value.length >= 2) {
    ctx.value.strokeStyle = '#3498DB';
    ctx.value.lineWidth = 8;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';
    ctx.value.setLineDash([15, 10]);

    const startPoint = targetPath.value[0]!;
    ctx.value.beginPath();
    ctx.value.moveTo(startPoint.x, startPoint.y);
    for (let i = 1; i < targetPath.value.length; i++) {
      ctx.value.lineTo(targetPath.value[i]!.x, targetPath.value[i]!.y);
    }
    ctx.value.stroke();
    ctx.value.setLineDash([]);

    // Draw start point
    helper.value.drawCircle(startPoint.x, startPoint.y, 15, '#2ECC71');
    ctx.value.font = 'bold 14px Arial';
    ctx.value.fillStyle = '#FFF';
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText('시작', startPoint.x, startPoint.y);

    // Draw end point
    const endPoint = targetPath.value[targetPath.value.length - 1]!;
    helper.value.drawCircle(endPoint.x, endPoint.y, 15, '#E74C3C');
    ctx.value.fillStyle = '#FFF';
    ctx.value.fillText('끝', endPoint.x, endPoint.y);
  }

  // Draw user path
  if (userPath.value.length >= 2) {
    ctx.value.strokeStyle = roundComplete.value
      ? (accuracy.value >= 70 ? '#2ECC71' : '#E74C3C')
      : '#FF6B6B';
    ctx.value.lineWidth = 6;
    ctx.value.lineCap = 'round';
    ctx.value.lineJoin = 'round';

    const userStart = userPath.value[0]!;
    ctx.value.beginPath();
    ctx.value.moveTo(userStart.x, userStart.y);
    for (let i = 1; i < userPath.value.length; i++) {
      ctx.value.lineTo(userPath.value[i]!.x, userPath.value[i]!.y);
    }
    ctx.value.stroke();
  }

  // UI
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#333';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);

  // Accuracy display
  if (roundComplete.value) {
    ctx.value.font = 'bold 48px Arial';
    ctx.value.fillStyle = accuracy.value >= 70 ? '#2ECC71' : '#E74C3C';
    ctx.value.textAlign = 'center';
    ctx.value.fillText(`${accuracy.value}%`, width / 2, 100);

    ctx.value.font = '20px Arial';
    ctx.value.fillStyle = '#666';
    ctx.value.fillText(accuracy.value >= 70 ? '정확해요!' : '다시 시도!', width / 2, 140);
  }

  // Instructions
  ctx.value.font = '16px Arial';
  ctx.value.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.value.textAlign = 'center';
  ctx.value.fillText('점선을 따라 그리세요', width / 2, height - 30);
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
  isDrawing.value = true;
  userPath.value = [];
  const coords = getCanvasCoordinates(event);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handlePointerMove(event: MouseEvent) {
  if (!isDrawing.value || roundComplete.value) return;
  const coords = getCanvasCoordinates(event);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handlePointerUp() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  evaluateDrawing();
}

function handleTouchStart(event: TouchEvent) {
  if (roundComplete.value) return;
  event.preventDefault();
  isDrawing.value = true;
  userPath.value = [];
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handleTouchMove(event: TouchEvent) {
  if (!isDrawing.value || roundComplete.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handleTouchEnd() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  evaluateDrawing();
}

function evaluateDrawing() {
  if (userPath.value.length < 5) return;

  roundComplete.value = true;
  accuracy.value = calculateAccuracy();
  totalAccuracy.value += accuracy.value;
  roundCount.value++;

  // Get popup position from center of canvas
  const canvasRect = canvasRef.value?.getBoundingClientRect();
  const screenX = canvasRect ? canvasRect.left + canvasRect.width / 2 : window.innerWidth / 2;
  const screenY = canvasRect ? canvasRect.top + 100 : 100;

  if (accuracy.value >= 70) {
    const points = Math.round(accuracy.value * 0.8);
    score.value += points;

    // Juicy success feedback
    if (accuracy.value >= 90) {
      createScorePopup(screenX, screenY, `+${points} 완벽해요! ⭐`, 'bonus');
      shake(containerRef.value, 'light');
    } else {
      createScorePopup(screenX, screenY, `+${points} 정확해요!`, 'score');
    }
    createParticles(containerRef.value, screenX, screenY, '#2ECC71', 8);

    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  } else {
    // Juicy fail feedback
    createScorePopup(screenX, screenY, `${accuracy.value}% 다시 시도!`, 'miss');
    createParticles(containerRef.value, screenX, screenY, '#E74C3C', 6);
    shake(containerRef.value, 'light');

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }

  // Generate new round after delay
  safeSetTimeout(() => {
    if (!isGameOver.value) {
      generateTargetPath();
    }
  }, 1500);
}

// End game
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);

  const avgAccuracy = roundCount.value > 0 ? Math.round(totalAccuracy.value / roundCount.value) : 0;

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemainingMs.value / 1000,
    accuracy: avgAccuracy,
    count: roundCount.value
  };

  // Success/fail shake
  if (result.success) {
    shake(containerRef.value, 'light');
  } else {
    shake(containerRef.value, 'strong');
  }

  safeSetTimeout(() => {
    emit('complete', result);
  }, 300);
}

// Start game
function startGame() {
  generateTargetPath();

  // Timer countdown (정수 밀리초 사용으로 부동소수점 오차 방지)
  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100;
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0;
      endGame();
    }
  }, 100);

  // Start game loop
  gameLoop();
}

onMounted(() => {
  // Pop-in animation for container
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
  background: #FFFFFF;
}
</style>
