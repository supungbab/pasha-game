<template>
  <div class="minigame balloon-pop">
    <canvas ref="canvasRef" @click="handleClick" @touchstart="handleTouch"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
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
  backgroundColor: '#87CEEB'
});

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const balloons = ref<Balloon[]>([]);
const particles = ref<Particle[]>([]);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { speed: 50, size: 80, spawnRate: 1000 },   // Lv.1
    { speed: 60, size: 75, spawnRate: 800 },    // Lv.2
    { speed: 70, size: 70, spawnRate: 700 },    // Lv.3
    { speed: 85, size: 65, spawnRate: 600 },    // Lv.4
    { speed: 100, size: 60, spawnRate: 500 },   // Lv.5
    { speed: 120, size: 55, spawnRate: 400 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
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
}

let animationId: number;
let spawnInterval: number;
let timerInterval: number;
let balloonIdCounter = 0;

// Spawn a new balloon
function spawnBalloon() {
  if (isGameOver.value) return;

  const { size, speed } = difficultySettings.value;
  const actualSize = props.isHardMode ? size * 0.9 : size;
  const actualSpeed = props.isHardMode ? speed * 1.2 : speed;

  const balloon: Balloon = {
    id: balloonIdCounter++,
    x: Math.random() * (width - 100) + 50,
    y: height + 50,
    radius: actualSize / 2,
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
    speed: actualSpeed / 60, // Convert to per-frame speed
    swingOffset: Math.random() * Math.PI * 2,
    swingSpeed: 0.05 + Math.random() * 0.05
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

  // Draw balloons
  balloons.value.forEach(balloon => {
    // Balloon body
    helper.value!.drawCircle(balloon.x, balloon.y, balloon.radius, balloon.color);

    // Highlight
    helper.value!.drawCircle(
      balloon.x - balloon.radius * 0.3,
      balloon.y - balloon.radius * 0.3,
      balloon.radius * 0.25,
      'rgba(255, 255, 255, 0.6)'
    );

    // String
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

// Handle click/tap
function handleClick(event: MouseEvent) {
  if (isGameOver.value) return;

  const coords = getCanvasCoordinates(event);
  checkBalloonHit(coords.x, coords.y);
}

function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();

  const touch = event.touches[0];
  const coords = getCanvasCoordinates(touch);
  checkBalloonHit(coords.x, coords.y);
}

function checkBalloonHit(x: number, y: number) {
  const hitIndex = balloons.value.findIndex(balloon => {
    const dx = balloon.x - x;
    const dy = balloon.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= balloon.radius;
  });

  if (hitIndex !== -1) {
    const balloon = balloons.value[hitIndex];

    // Create pop particles
    if (helper.value) {
      const newParticles = helper.value.createParticles(balloon.x, balloon.y, balloon.color, 12);
      particles.value.push(...newParticles);
    }

    // Remove balloon and add score
    balloons.value.splice(hitIndex, 1);
    score.value += 10;
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
    timeRemaining: timeRemaining.value,
    count: Math.floor(score.value / 10)
  };

  emit('complete', result);
}

// Start game
function startGame() {
  // Spawn balloons periodically
  spawnInterval = window.setInterval(spawnBalloon, difficultySettings.value.spawnRate);

  // Timer countdown
  timerInterval = window.setInterval(() => {
    timeRemaining.value -= 0.1;
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0;
      endGame();
    }
  }, 100);

  // Initial balloons
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnBalloon, i * 300);
  }

  // Start game loop
  gameLoop();
}

onMounted(() => {
  setTimeout(startGame, 100);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  clearInterval(spawnInterval);
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
