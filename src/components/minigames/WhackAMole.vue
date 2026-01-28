<template>
  <div ref="containerRef" class="minigame whack-a-mole">
    <canvas ref="canvasRef" @touchstart.prevent="handleTouch"></canvas>

    <!-- Score Popups -->
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useJuicyFeedback } from '@/composables';
import { ScorePopup } from '@/components/common';
import { pointInCircle } from '@/utils/canvas';

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
  backgroundColor: '#8B4513'
});

// Timer utilities
const { safeSetTimeout, safeSetInterval, clearInterval, cancelAnimationFrame } = useCleanupTimers();

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
const lastHitTime = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
const isGameOver = ref(false);
const holes = ref<Hole[]>([]);
const hitEffects = ref<HitEffect[]>([]);

// Combo timeout (600ms for moles)
const COMBO_TIMEOUT = 600;

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { showTime: 1500, spawnRate: 1500, maxMoles: 2 },   // Lv.1
    { showTime: 1300, spawnRate: 1300, maxMoles: 2 },   // Lv.2
    { showTime: 1000, spawnRate: 1000, maxMoles: 3 },   // Lv.3
    { showTime: 800, spawnRate: 800, maxMoles: 3 },     // Lv.4
    { showTime: 600, spawnRate: 600, maxMoles: 4 },     // Lv.5
    { showTime: 500, spawnRate: 500, maxMoles: 4 },     // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});

interface Hole {
  id: number;
  x: number;
  y: number;
  mole: Mole | null;
}

interface Mole {
  type: 'normal' | 'fake';
  showTime: number;
  progress: number; // 0-1, pop up progress
  state: 'appearing' | 'visible' | 'hiding' | 'hidden';
  startTime: number;
}

interface HitEffect {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

let animationId: number = 0;
let spawnInterval: number = 0;
let timerInterval: number = 0;

// Grid settings
const GRID_COLS = 3;
const GRID_ROWS = 3;
const HOLE_RADIUS = 45;
const MOLE_SIZE = 60;

// Initialize holes
function initHoles() {
  const startX = width / 2 - (GRID_COLS - 1) * 70;
  const startY = height / 2 - (GRID_ROWS - 1) * 80 + 50;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      holes.value.push({
        id: row * GRID_COLS + col,
        x: startX + col * 140,
        y: startY + row * 160,
        mole: null
      });
    }
  }
}

// Spawn mole
function spawnMole() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const emptyHoles = holes.value.filter(h => !h.mole);

  if (emptyHoles.length === 0) return;

  const activeMoles = holes.value.filter(h => h.mole).length;
  if (activeMoles >= settings.maxMoles) return;

  const hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
  const isFake = props.isHardMode && Math.random() < 0.2;

  hole.mole = {
    type: isFake ? 'fake' : 'normal',
    showTime: settings.showTime,
    progress: 0,
    state: 'appearing',
    startTime: Date.now()
  };
}

// Update game state
function update() {
  if (isGameOver.value) return;

  const now = Date.now();

  holes.value.forEach(hole => {
    if (!hole.mole) return;

    const mole = hole.mole;
    const elapsed = now - mole.startTime;

    switch (mole.state) {
      case 'appearing':
        mole.progress = Math.min(1, elapsed / 150);
        if (mole.progress >= 1) {
          mole.state = 'visible';
          mole.startTime = now;
        }
        break;

      case 'visible':
        if (elapsed >= mole.showTime) {
          mole.state = 'hiding';
          mole.startTime = now;
        }
        break;

      case 'hiding':
        mole.progress = 1 - Math.min(1, elapsed / 150);
        if (mole.progress <= 0) {
          hole.mole = null;
        }
        break;
    }
  });

  // Update hit effects
  hitEffects.value = hitEffects.value.filter(effect => {
    effect.y -= 2;
    effect.life -= 0.03;
    return effect.life > 0;
  });
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear
  clear();

  // Draw grass background
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.4, '#87CEEB');
  gradient.addColorStop(0.4, '#228B22');
  gradient.addColorStop(1, '#1a5c1a');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw holes and moles
  holes.value.forEach(hole => {
    // Hole shadow
    helper.value!.drawCircle(hole.x, hole.y + 5, HOLE_RADIUS, 'rgba(0, 0, 0, 0.3)');

    // Hole
    const holeGradient = ctx.value!.createRadialGradient(
      hole.x, hole.y, 0,
      hole.x, hole.y, HOLE_RADIUS
    );
    holeGradient.addColorStop(0, '#2d1b0e');
    holeGradient.addColorStop(1, '#4a2c17');
    ctx.value!.fillStyle = holeGradient;
    ctx.value!.beginPath();
    ctx.value!.ellipse(hole.x, hole.y, HOLE_RADIUS, HOLE_RADIUS * 0.6, 0, 0, Math.PI * 2);
    ctx.value!.fill();

    // Mole
    if (hole.mole && hole.mole.progress > 0) {
      const mole = hole.mole;
      const moleY = hole.y - 10 - (mole.progress * 40);

      // Clip to hole area
      ctx.value!.save();
      ctx.value!.beginPath();
      ctx.value!.rect(hole.x - HOLE_RADIUS, hole.y - 80, HOLE_RADIUS * 2, 80);
      ctx.value!.clip();

      // Draw mole emoji
      const emoji = mole.type === 'normal' ? '🐹' : '😈';
      ctx.value!.font = `${MOLE_SIZE}px Arial`;
      ctx.value!.textAlign = 'center';
      ctx.value!.textBaseline = 'middle';
      ctx.value!.fillText(emoji, hole.x, moleY);

      ctx.value!.restore();
    }

    // Hole front edge (grass)
    ctx.value!.fillStyle = '#228B22';
    ctx.value!.beginPath();
    ctx.value!.ellipse(hole.x, hole.y + 5, HOLE_RADIUS + 5, 15, 0, 0, Math.PI);
    ctx.value!.fill();
  });

  // Draw hit effects
  hitEffects.value.forEach(effect => {
    ctx.value!.globalAlpha = effect.life;
    ctx.value!.font = 'bold 24px Arial';
    ctx.value!.fillStyle = effect.color;
    ctx.value!.textAlign = 'center';
    ctx.value!.fillText(effect.text, effect.x, effect.y);
    ctx.value!.globalAlpha = 1;
  });
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
  checkMoleHit(coords.x, coords.y, event.clientX, event.clientY);
}

function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  checkMoleHit(coords.x, coords.y, touch.clientX, touch.clientY);
}

function checkMoleHit(x: number, y: number, screenX: number, screenY: number) {
  holes.value.forEach(hole => {
    if (!hole.mole) return;
    if (hole.mole.state === 'hidden' || hole.mole.state === 'hiding') return;

    // Check if click is within mole area
    const moleY = hole.y - 10 - (hole.mole.progress * 40);
    if (pointInCircle(x, y, hole.x, moleY, MOLE_SIZE / 2)) {
      const now = Date.now();

      if (hole.mole.type === 'normal') {
        // Check combo
        if (now - lastHitTime.value < COMBO_TIMEOUT) {
          combo.value++;
        } else {
          combo.value = 1;
        }
        lastHitTime.value = now;

        // Calculate points with combo
        const basePoints = 5;
        const comboBonus = combo.value > 1 ? (combo.value - 1) * 2 : 0;
        const points = basePoints + comboBonus;

        score.value += points;
        hitEffects.value.push({
          x: hole.x,
          y: moleY - 30,
          text: `+${points}`,
          life: 1,
          color: '#FFD700'
        });

        // Juicy feedback
        createParticles(containerRef.value, screenX, screenY, '#FFD700', 6);

        if (combo.value >= 5) {
          createScorePopup(screenX, screenY - 20, `+${points} x${combo.value}!`, 'combo');
          shake(containerRef.value, 'light');
        } else if (combo.value >= 3) {
          createScorePopup(screenX, screenY - 20, `+${points} COMBO!`, 'score');
        } else {
          createScorePopup(screenX, screenY - 20, `+${points}`, 'score');
        }

        // Vibrate
        if (navigator.vibrate) {
          if (combo.value >= 5) {
            navigator.vibrate([30, 20, 30]);
          } else {
            navigator.vibrate(25);
          }
        }
      } else {
        // Fake mole - penalty
        score.value = Math.max(0, score.value - 10);
        combo.value = 0;
        hitEffects.value.push({
          x: hole.x,
          y: moleY - 30,
          text: '-10',
          life: 1,
          color: '#FF4444'
        });

        // Juicy feedback for mistake
        createScorePopup(screenX, screenY - 20, '-10', 'miss');
        createParticles(containerRef.value, screenX, screenY, '#FF4444', 8);
        shake(containerRef.value, 'strong');

        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }

      // Hide mole
      hole.mole.state = 'hiding';
      hole.mole.startTime = Date.now();
    }
  });
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
    count: Math.floor(score.value / 5)
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
  initHoles();

  // Spawn moles periodically
  spawnInterval = safeSetInterval(spawnMole, difficultySettings.value.spawnRate);

  // Timer countdown (정수 밀리초 사용)
  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100;
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0;
      endGame();
    }
  }, 100);

  // Initial moles
  safeSetTimeout(spawnMole, 200);
  safeSetTimeout(spawnMole, 500);

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
