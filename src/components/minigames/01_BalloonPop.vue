<template>
  <div ref="containerRef" class="minigame balloon-pop">
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
  backgroundColor: '#87CEEB'
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
const lastPopTime = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
const isGameOver = ref(false);
const balloons = ref<Balloon[]>([]);
const particles = ref<Particle[]>([]);

// Difficulty settings
const DEFAULT_SETTINGS = { speed: 50, size: 80, spawnRate: 1000 };
const difficultySettings = computed(() => {
  const settings = [
    { speed: 50, size: 80, spawnRate: 1000 },   // Lv.1
    { speed: 60, size: 75, spawnRate: 800 },    // Lv.2
    { speed: 70, size: 70, spawnRate: 700 },    // Lv.3
    { speed: 85, size: 65, spawnRate: 600 },    // Lv.4
    { speed: 100, size: 60, spawnRate: 500 },   // Lv.5
    { speed: 120, size: 55, spawnRate: 400 },   // Lv.6
  ];
  const index = Math.max(0, Math.min(props.difficulty - 1, 5));
  return settings[index] ?? DEFAULT_SETTINGS;
});

// Balloon colors
const BALLOON_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

interface Balloon {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  speed: number;
  swingOffset: number;
  swingSpeed: number;
  scale: number; // For squish animation
}

let animationId: number = 0;
let spawnInterval: number = 0;
let timerInterval: number = 0;
let balloonIdCounter = 0;

// Combo timeout (500ms 이내 연속 탭하면 콤보)
const COMBO_TIMEOUT = 500;

// Spawn a new balloon
function spawnBalloon() {
  if (isGameOver.value) return;

  const { size, speed } = difficultySettings.value;
  const actualSize = props.isHardMode ? size * 0.9 : size;
  const actualSpeed = props.isHardMode ? speed * 1.2 : speed;

  const colorIndex = Math.floor(Math.random() * BALLOON_COLORS.length);
  const balloon: Balloon = {
    id: balloonIdCounter++,
    x: Math.random() * (width - 100) + 50,
    y: height + 50,
    radius: actualSize / 2,
    color: BALLOON_COLORS[colorIndex] || '#FF6B6B',
    speed: actualSpeed / 60,
    swingOffset: Math.random() * Math.PI * 2,
    swingSpeed: 0.05 + Math.random() * 0.05,
    scale: 1,
  };

  balloons.value.push(balloon);
}

// Update game state
function update() {
  if (isGameOver.value) return;

  // Update balloons
  balloons.value = balloons.value.filter(balloon => {
    balloon.y -= balloon.speed;

    // Hard mode: swing animation
    if (props.isHardMode) {
      balloon.swingOffset += balloon.swingSpeed;
      balloon.x += Math.sin(balloon.swingOffset) * 2;
    }

    // Animate scale back to 1 (squish recovery)
    if (balloon.scale !== 1) {
      balloon.scale += (1 - balloon.scale) * 0.2;
      if (Math.abs(balloon.scale - 1) < 0.01) balloon.scale = 1;
    }

    // Remove if off screen
    return balloon.y > -balloon.radius;
  });

  // Update particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }
}

// Render game
function render() {
  if (!helper.value || !ctx.value) return;

  // Clear and draw background gradient
  clear();
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw balloons with squish effect
  balloons.value.forEach(balloon => {
    ctx.value!.save();
    ctx.value!.translate(balloon.x, balloon.y);

    // Apply squish scale (1.2 horizontal, 0.8 vertical when pressed)
    const scaleX = 1 + (balloon.scale - 1) * 0.3;
    const scaleY = 1 - (balloon.scale - 1) * 0.2;
    ctx.value!.scale(scaleX, scaleY);

    // Balloon body
    helper.value!.drawCircle(0, 0, balloon.radius, balloon.color);

    // Highlight
    helper.value!.drawCircle(
      -balloon.radius * 0.3,
      -balloon.radius * 0.3,
      balloon.radius * 0.25,
      'rgba(255, 255, 255, 0.6)'
    );

    ctx.value!.restore();

    // String (outside transform)
    ctx.value!.strokeStyle = '#666';
    ctx.value!.lineWidth = 2;
    ctx.value!.beginPath();
    ctx.value!.moveTo(balloon.x, balloon.y + balloon.radius);
    ctx.value!.quadraticCurveTo(
      balloon.x + 5,
      balloon.y + balloon.radius + 15,
      balloon.x,
      balloon.y + balloon.radius + 25
    );
    ctx.value!.stroke();
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

// Handle touch
function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();

  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  checkBalloonHit(coords.x, coords.y, touch.clientX, touch.clientY);
}

function checkBalloonHit(x: number, y: number, screenX: number, screenY: number) {
  const hitIndex = balloons.value.findIndex(balloon => {
    const dx = balloon.x - x;
    const dy = balloon.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= balloon.radius;
  });

  if (hitIndex !== -1) {
    const balloon = balloons.value[hitIndex];
    if (!balloon) return;

    const now = Date.now();

    // Check combo
    if (now - lastPopTime.value < COMBO_TIMEOUT) {
      combo.value++;
    } else {
      combo.value = 1;
    }
    lastPopTime.value = now;

    // Calculate points (base + combo bonus)
    const basePoints = 10;
    const comboBonus = combo.value > 1 ? (combo.value - 1) * 2 : 0;
    const points = basePoints + comboBonus;

    // Create pop particles
    if (helper.value) {
      const newParticles = helper.value.createParticles(balloon.x, balloon.y, balloon.color, 12);
      particles.value.push(...newParticles);
    }

    // Juicy feedback!
    createParticles(containerRef.value, screenX, screenY, balloon.color, 8);

    // Score popup based on combo
    if (combo.value >= 5) {
      createScorePopup(screenX, screenY - 20, `+${points} x${combo.value}!`, 'combo');
      shake(containerRef.value, 'light');
    } else if (combo.value >= 3) {
      createScorePopup(screenX, screenY - 20, `+${points} COMBO!`, 'score');
    } else {
      createScorePopup(screenX, screenY - 20, `+${points}`, 'score');
    }

    // Vibrate based on combo
    if (navigator.vibrate) {
      if (combo.value >= 5) {
        navigator.vibrate([30, 20, 30]);
      } else {
        navigator.vibrate(25);
      }
    }

    // Remove balloon and add score
    balloons.value.splice(hitIndex, 1);
    score.value += points;
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
    count: Math.floor(score.value / 10)
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
  // Spawn balloons periodically
  const spawnRate = difficultySettings.value?.spawnRate ?? 1000;
  spawnInterval = safeSetInterval(spawnBalloon, spawnRate);

  // Timer countdown
  timerInterval = safeSetInterval(() => {
    timeRemainingMs.value -= 100;
    if (timeRemainingMs.value <= 0) {
      timeRemainingMs.value = 0;
      endGame();
    }
  }, 100);

  // Initial balloons
  for (let i = 0; i < 3; i++) {
    safeSetTimeout(spawnBalloon, i * 300);
  }

  // Start game loop
  gameLoop();
}

onMounted(() => {
  // Pop-in animation for container
  if (containerRef.value) {
    containerRef.value.classList.add('juicy-pop');
  }

  safeSetTimeout(() => {
    startGame();
  }, 100);
});

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
