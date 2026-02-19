<template>
  <div ref="containerRef" class="rotate-object">
    <canvas
      ref="canvasRef"
      @touchstart.prevent
      @touchmove.prevent
      @touchend.prevent
    ></canvas>

    <!-- Score Popups -->
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useJuicyFeedback, useGameButtons } from '@/composables';
import { ScorePopup } from '@/components/common';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Canvas setup
const { ctx, width, height, clear } = useCanvas(canvasRef, {
  width: 400,
  height: 500,
  backgroundColor: '#FFF8E1'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

// 3-버튼 시스템: 슬롯 0=왼쪽회전, 2=오른쪽회전
const { setButton } = useGameButtons();

// Juicy feedback
const {
  scorePopups,
  createScorePopup,
  createParticles,
  shake,
} = useJuicyFeedback();

// ===== Shape definitions =====
interface Shape {
  name: string;
  color: string;
  borderColor: string;
  draw: (c: CanvasRenderingContext2D, size: number) => void;
}

const SHAPES: Shape[] = [
  {
    name: 'diamond', color: '#F44336', borderColor: '#C62828',
    draw(c, s) {
      c.beginPath();
      c.moveTo(0, -s); c.lineTo(s, 0); c.lineTo(0, s); c.lineTo(-s, 0);
      c.closePath();
    }
  },
  {
    name: 'star', color: '#FFD700', borderColor: '#F9A825',
    draw(c, s) {
      const spikes = 5, outer = s, inner = s * 0.45;
      c.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI / 2 * -1) + (Math.PI / spikes) * i;
        if (i === 0) c.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else c.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      c.closePath();
    }
  },
  {
    name: 'heart', color: '#E91E63', borderColor: '#AD1457',
    draw(c, s) {
      const k = s * 0.8;
      c.beginPath();
      c.moveTo(0, k * 0.3);
      c.bezierCurveTo(-k, -k * 0.5, -k * 0.5, -k, 0, -k * 0.4);
      c.bezierCurveTo(k * 0.5, -k, k, -k * 0.5, 0, k * 0.3);
      c.closePath();
    }
  },
  {
    name: 'arrow', color: '#2196F3', borderColor: '#1565C0',
    draw(c, s) {
      c.beginPath();
      c.moveTo(s, 0); c.lineTo(0, -s * 0.6); c.lineTo(0, -s * 0.25);
      c.lineTo(-s, -s * 0.25); c.lineTo(-s, s * 0.25); c.lineTo(0, s * 0.25);
      c.lineTo(0, s * 0.6);
      c.closePath();
    }
  },
  {
    name: 'triangle', color: '#4CAF50', borderColor: '#2E7D32',
    draw(c, s) {
      c.beginPath();
      c.moveTo(0, -s); c.lineTo(s * 0.866, s * 0.5); c.lineTo(-s * 0.866, s * 0.5);
      c.closePath();
    }
  },
  {
    name: 'cross', color: '#FF9800', borderColor: '#E65100',
    draw(c, s) {
      const w = s * 0.35;
      c.beginPath();
      c.moveTo(-w, -s); c.lineTo(w, -s); c.lineTo(w, -w);
      c.lineTo(s, -w); c.lineTo(s, w); c.lineTo(w, w);
      c.lineTo(w, s); c.lineTo(-w, s); c.lineTo(-w, w);
      c.lineTo(-s, w); c.lineTo(-s, -w); c.lineTo(-w, -w);
      c.closePath();
    }
  },
  {
    name: 'lightning', color: '#FFC107', borderColor: '#F9A825',
    draw(c, s) {
      c.beginPath();
      c.moveTo(s * 0.15, -s); c.lineTo(-s * 0.45, s * 0.05);
      c.lineTo(-s * 0.05, s * 0.05); c.lineTo(-s * 0.15, s);
      c.lineTo(s * 0.45, -s * 0.05); c.lineTo(s * 0.05, -s * 0.05);
      c.closePath();
    }
  },
  {
    name: 'hexagon', color: '#00BCD4', borderColor: '#00838F',
    draw(c, s) {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = Math.cos(angle) * s;
        const y = Math.sin(angle) * s;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath();
    }
  },
  {
    name: 'pentagon', color: '#795548', borderColor: '#4E342E',
    draw(c, s) {
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = Math.cos(angle) * s;
        const y = Math.sin(angle) * s;
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath();
    }
  },
  {
    name: 'crescent', color: '#9C27B0', borderColor: '#6A1B9A',
    draw(c, s) {
      c.beginPath();
      c.arc(0, 0, s, 0, Math.PI * 2);
      c.closePath();
      c.fill();
      c.beginPath();
      c.arc(s * 0.35, 0, s * 0.75, 0, Math.PI * 2);
      // We'll handle this specially in render
    }
  },
];

// ===== Game state =====
const TOTAL_ROUNDS = 10;
const POSSIBLE_ANGLES = [0, 60, 120, 180, 240, 300];

const score = ref(0);
const currentRound = ref(0);

let gameCompleted = false;
let startTime = 0;
let isTransitioning = false;

// Round state
let currentAngle = 0;
let targetAngle = 0;
let tapCount = 0;
let consecutivePerfects = 0;

// Shape queue (shuffled 10 shapes)
let shapeQueue: Shape[] = [];
let targetAngles: number[] = [];

// Animation
let rotateAnimProgress = 0; // 0 to 1
let rotateAnimFrom = 0;
let rotateAnimTo = 0;
let isAnimating = false;
let clearAnimProgress = 0; // For clear flash animation
let isClearAnim = false;

// ===== Initialization =====
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

function initGame() {
  shapeQueue = shuffleArray(SHAPES);
  targetAngles = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    // Random target angle from possible angles, avoid 0 (same as start)
    const nonZeroAngles = POSSIBLE_ANGLES.filter(a => a !== 0);
    targetAngles.push(nonZeroAngles[Math.floor(Math.random() * nonZeroAngles.length)]!);
  }
  currentRound.value = 0;
  currentAngle = 0;
  targetAngle = targetAngles[0]!;
  tapCount = 0;
  consecutivePerfects = 0;
}

// ===== Button handlers =====
function rotateLeft() {
  if (gameCompleted || isTransitioning || isAnimating) return;
  tapCount++;
  animateRotation(currentAngle, currentAngle - 60);
}

function rotateRight() {
  if (gameCompleted || isTransitioning || isAnimating) return;
  tapCount++;
  animateRotation(currentAngle, currentAngle + 60);
}

function animateRotation(from: number, to: number) {
  isAnimating = true;
  rotateAnimFrom = from;
  rotateAnimTo = to;
  rotateAnimProgress = 0;

  if (navigator.vibrate) {
    navigator.vibrate(15);
  }
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// ===== Check match =====
function checkMatch() {
  const normalCurrent = normalizeAngle(currentAngle);
  const normalTarget = normalizeAngle(targetAngle);

  if (normalCurrent === normalTarget) {
    // Match!
    handleRoundClear();
  }
}

function handleRoundClear() {
  isTransitioning = true;
  isClearAnim = true;
  clearAnimProgress = 0;

  // Score based on tap count
  let points = 0;
  let label = '';
  let popupType: 'combo' | 'score' | 'bonus' = 'score';

  if (tapCount === 1) {
    points = 20;
    label = 'PERFECT! +20';
    popupType = 'combo';
    consecutivePerfects++;
  } else if (tapCount === 2) {
    points = 15;
    label = 'GREAT! +15';
    popupType = 'score';
    consecutivePerfects = 0;
  } else if (tapCount === 3) {
    points = 10;
    label = 'GOOD +10';
    popupType = 'score';
    consecutivePerfects = 0;
  } else {
    points = 5;
    label = 'OK +5';
    popupType = 'score';
    consecutivePerfects = 0;
  }

  // Combo multiplier
  let multiplier = 1.0;
  if (consecutivePerfects >= 3) {
    multiplier = 1.5;
    label += ' x1.5';
  } else if (consecutivePerfects >= 2) {
    multiplier = 1.3;
    label += ' x1.3';
  }

  const finalPoints = Math.round(points * multiplier);
  score.value += finalPoints;

  // Popup feedback
  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const screenX = rect.left + rect.width / 2;
    const screenY = rect.top + rect.height * 0.35;
    createScorePopup(screenX, screenY - 20, label, popupType);
    createParticles(containerRef.value, screenX, screenY, shapeQueue[currentRound.value]?.color || '#FFD700', 8);
  }

  shake(containerRef.value, 'light');

  if (navigator.vibrate) {
    if (tapCount === 1) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    } else {
      navigator.vibrate([50, 30, 50]);
    }
  }

  // Next round after delay
  safeSetTimeout(() => {
    isClearAnim = false;
    currentRound.value++;

    if (currentRound.value >= TOTAL_ROUNDS) {
      completeGame();
      return;
    }

    // Setup next round
    currentAngle = 0;
    targetAngle = targetAngles[currentRound.value]!;
    tapCount = 0;
    isTransitioning = false;
  }, 600);
}

// ===== Rendering =====
function render() {
  if (!ctx.value) return;
  const c = ctx.value;

  clear();

  // Background gradient
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#FFF8E1');
  gradient.addColorStop(1, '#FFECB3');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.38;

  // ===== Header: Round & Score =====
  c.fillStyle = '#333';
  c.font = 'bold 22px Arial';
  c.textAlign = 'left';
  c.textBaseline = 'top';
  c.fillText(`라운드 ${currentRound.value + 1}/${TOTAL_ROUNDS}`, 20, 16);

  c.textAlign = 'right';
  c.fillText(`⭐ ${score.value}`, width - 20, 16);

  // Combo indicator
  if (consecutivePerfects >= 2) {
    c.textAlign = 'center';
    c.font = 'bold 16px Arial';
    c.fillStyle = '#FF6F00';
    c.fillText(`🔥 COMBO x${consecutivePerfects}`, centerX, 18);
  }

  // ===== Queue blocks (left: completed, right: upcoming) =====
  const blockSize = 28;
  const blockGap = 6;
  const queueY = centerY - 95;

  // Left side (completed)
  for (let i = currentRound.value - 1; i >= Math.max(0, currentRound.value - 3); i--) {
    const offset = currentRound.value - i;
    const bx = centerX - 75 - (offset - 1) * (blockSize + blockGap) - blockSize / 2;
    const shape = shapeQueue[i]!;

    c.globalAlpha = 0.3;
    c.fillStyle = shape.color;
    c.beginPath();
    c.roundRect(bx - blockSize / 2, queueY - blockSize / 2, blockSize, blockSize, 6);
    c.fill();

    // Draw mini shape
    c.save();
    c.translate(bx, queueY);
    c.fillStyle = shape.color;
    shape.draw(c, blockSize * 0.3);
    c.fill();
    c.restore();

    c.globalAlpha = 1;
  }

  // Right side (upcoming)
  for (let i = currentRound.value + 1; i < Math.min(TOTAL_ROUNDS, currentRound.value + 4); i++) {
    const offset = i - currentRound.value;
    const bx = centerX + 75 + (offset - 1) * (blockSize + blockGap) + blockSize / 2;
    const shape = shapeQueue[i]!;

    c.globalAlpha = 0.5;
    c.fillStyle = '#E0E0E0';
    c.beginPath();
    c.roundRect(bx - blockSize / 2, queueY - blockSize / 2, blockSize, blockSize, 6);
    c.fill();

    c.save();
    c.translate(bx, queueY);
    c.fillStyle = shape.color;
    c.globalAlpha = 0.6;
    shape.draw(c, blockSize * 0.3);
    c.fill();
    c.restore();

    c.globalAlpha = 1;
  }

  // ===== Central circle =====
  const circleRadius = 80;

  // Outer ring with target markers
  c.strokeStyle = '#E0E0E0';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(centerX, centerY, circleRadius + 15, 0, Math.PI * 2);
  c.stroke();

  // Draw 6 position markers on the ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180 - Math.PI / 2;
    const mx = centerX + Math.cos(angle) * (circleRadius + 15);
    const my = centerY + Math.sin(angle) * (circleRadius + 15);

    c.fillStyle = normalizeAngle(i * 60) === normalizeAngle(targetAngle) ? '#FFD700' : '#BDBDBD';
    c.beginPath();
    c.arc(mx, my, normalizeAngle(i * 60) === normalizeAngle(targetAngle) ? 8 : 4, 0, Math.PI * 2);
    c.fill();
  }

  // Target direction arrow on the ring
  const targetRad = (targetAngle * Math.PI) / 180 - Math.PI / 2;
  const arrowTipX = centerX + Math.cos(targetRad) * (circleRadius + 15);
  const arrowTipY = centerY + Math.sin(targetRad) * (circleRadius + 15);

  // Pulsing glow for target marker
  const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
  c.fillStyle = `rgba(255, 215, 0, ${pulse})`;
  c.beginPath();
  c.arc(arrowTipX, arrowTipY, 12, 0, Math.PI * 2);
  c.fill();

  // Target label
  c.fillStyle = '#FFD700';
  c.font = 'bold 13px Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const labelDist = circleRadius + 35;
  const labelX = centerX + Math.cos(targetRad) * labelDist;
  const labelY = centerY + Math.sin(targetRad) * labelDist;
  c.fillText('목표', labelX, labelY);

  // White circle background
  c.fillStyle = isClearAnim ? `rgba(76, 175, 80, ${0.2 + clearAnimProgress * 0.3})` : 'white';
  c.beginPath();
  c.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  c.fill();

  c.strokeStyle = isClearAnim ? '#4CAF50' : '#E0E0E0';
  c.lineWidth = 3;
  c.stroke();

  // ===== Current shape (rotated) =====
  const displayAngle = isAnimating
    ? rotateAnimFrom + (rotateAnimTo - rotateAnimFrom) * easeOutBack(rotateAnimProgress)
    : currentAngle;

  if (currentRound.value < TOTAL_ROUNDS) {
    const shape = shapeQueue[currentRound.value]!;
    const shapeSize = 35;

    c.save();
    c.translate(centerX, centerY);
    c.rotate((displayAngle * Math.PI) / 180);

    // Special handling for crescent
    if (shape.name === 'crescent') {
      c.fillStyle = shape.color;
      c.beginPath();
      c.arc(0, 0, shapeSize, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = shape.borderColor;
      c.lineWidth = 2;
      c.stroke();

      // Cut out crescent shape
      c.globalCompositeOperation = 'destination-out';
      c.fillStyle = 'white';
      c.beginPath();
      c.arc(shapeSize * 0.35, 0, shapeSize * 0.75, 0, Math.PI * 2);
      c.fill();
      c.globalCompositeOperation = 'source-over';
    } else {
      c.fillStyle = shape.color;
      shape.draw(c, shapeSize);
      c.fill();
      c.strokeStyle = shape.borderColor;
      c.lineWidth = 2;
      c.stroke();
    }

    // Direction indicator (gold dot at top)
    c.fillStyle = '#FFD700';
    c.strokeStyle = '#F9A825';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(0, -shapeSize - 10, 6, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    c.restore();
  }

  // ===== Progress dots at bottom of canvas =====
  const dotY = height - 50;
  const totalDotsWidth = (TOTAL_ROUNDS - 1) * 18;
  const dotStartX = centerX - totalDotsWidth / 2;

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const dx = dotStartX + i * 18;
    if (i < currentRound.value) {
      c.fillStyle = '#4CAF50';
    } else if (i === currentRound.value) {
      c.fillStyle = '#FFD700';
    } else {
      c.fillStyle = '#E0E0E0';
    }
    c.beginPath();
    c.arc(dx, dotY, i === currentRound.value ? 5 : 3.5, 0, Math.PI * 2);
    c.fill();
  }
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ===== Game loop =====
function gameLoop() {
  if (gameCompleted) return;

  // Update rotation animation
  if (isAnimating) {
    rotateAnimProgress += 0.12;
    if (rotateAnimProgress >= 1) {
      rotateAnimProgress = 1;
      currentAngle = rotateAnimTo;
      isAnimating = false;
      // Check match after animation completes
      checkMatch();
    }
  }

  // Update clear animation
  if (isClearAnim) {
    clearAnimProgress = Math.min(clearAnimProgress + 0.05, 1);
  }

  render();

  // Time check
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  safeRequestAnimationFrame(gameLoop);
}

// ===== Game complete =====
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining,
    count: currentRound.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

// ===== Mount =====
onMounted(() => {
  setButton(0, {
    visible: true, label: '◀',
    bg: 'linear-gradient(135deg, #7E57C2, #5E35B1)',
    border: '#4527A0',
    onPress: rotateLeft,
  });
  setButton(2, {
    visible: true, label: '▶',
    bg: 'linear-gradient(135deg, #FF9800, #F57C00)',
    border: '#E65100',
    onPress: rotateRight,
  });

  startTime = Date.now();
  initGame();

  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});
</script>

<style scoped>
.rotate-object {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-game);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

</style>
