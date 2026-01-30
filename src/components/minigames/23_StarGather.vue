<template>
  <div class="minigame star-gather">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers } from '@/composables';
import { circlesIntersect } from '@/utils/canvas';
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
  backgroundColor: '#0f0c29'
});

// Timer utilities
const { safeSetTimeout, safeSetInterval, safeRequestAnimationFrame, cancelAnimationFrame, clearInterval } = useCleanupTimers();

// Game state
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const player = ref({ x: width / 2, y: height / 2, radius: 20, targetX: width / 2, targetY: height / 2 });
const stars = ref<Star[]>([]);
const particles = ref<Particle[]>([]);
const starCount = ref(0);
const isDragging = ref(false);

// Difficulty settings
const difficultySettings = computed(() => {
  const settings = [
    { starCount: 5, moveSpeed: 8, playerSize: 25 },    // Lv.1
    { starCount: 6, moveSpeed: 9, playerSize: 24 },    // Lv.2
    { starCount: 7, moveSpeed: 10, playerSize: 23 },   // Lv.3
    { starCount: 8, moveSpeed: 11, playerSize: 22 },   // Lv.4
    { starCount: 9, moveSpeed: 12, playerSize: 21 },   // Lv.5
    { starCount: 10, moveSpeed: 13, playerSize: 20 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});

interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  scale: number;
  pulsePhase: number;
  type: 'normal' | 'golden';
  points: number;
}

let animationId: number;
let timerInterval: number;
let starIdCounter = 0;

// Spawn stars
function spawnStars() {
  const settings = difficultySettings.value;
  const newStars: Star[] = [];

  for (let i = 0; i < settings.starCount; i++) {
    const isGolden = Math.random() < 0.15;

    newStars.push({
      id: starIdCounter++,
      x: Math.random() * (width - 80) + 40,
      y: Math.random() * (height - 150) + 50,
      radius: isGolden ? 25 : 20,
      collected: false,
      scale: 0,
      pulsePhase: Math.random() * Math.PI * 2,
      type: isGolden ? 'golden' : 'normal',
      points: isGolden ? 20 : 10
    });
  }

  stars.value = newStars;

  // Animate stars appearing
  newStars.forEach((star, i) => {
    safeSetTimeout(() => {
      star.scale = 1;
    }, i * 50);
  });
}

// Update game state
function update() {
  if (isGameOver.value) return;

  const p = player.value;
  const settings = difficultySettings.value;

  // Smooth player movement towards target
  const dx = p.targetX - p.x;
  const dy = p.targetY - p.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 1) {
    const speed = Math.min(settings.moveSpeed, distance);
    p.x += (dx / distance) * speed;
    p.y += (dy / distance) * speed;
  }

  // Check star collisions
  let collectedThisFrame = false;
  stars.value.forEach(star => {
    if (star.collected) return;

    // Pulse animation
    star.pulsePhase += 0.1;

    // Check collision
    if (circlesIntersect(p.x, p.y, p.radius, star.x, star.y, star.radius * star.scale)) {
      star.collected = true;
      score.value += star.points;
      starCount.value++;
      collectedThisFrame = true;

      // Create particles
      if (helper.value) {
        const color = star.type === 'golden' ? '#FFD700' : '#FFF';
        const collectParticles = helper.value.createParticles(star.x, star.y, color, 10);
        particles.value.push(...collectParticles);
      }
    }
  });

  // Check if all stars collected
  const remainingStars = stars.value.filter(s => !s.collected).length;
  if (remainingStars === 0 && !collectedThisFrame) {
    // Spawn new stars
    safeSetTimeout(spawnStars, 300);
  }

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

  // Draw space background
  const gradient = ctx.value.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height);
  gradient.addColorStop(0, '#1a1a3e');
  gradient.addColorStop(1, '#0f0c29');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // Draw background stars
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 50; i++) {
    const starX = (i * 137 + 50) % width;
    const starY = (i * 89 + 30) % height;
    const starSize = 0.5 + (i % 3) * 0.5;
    ctx.value.beginPath();
    ctx.value.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.value.fill();
  }

  // Draw collectible stars
  stars.value.forEach(star => {
    if (star.collected || star.scale <= 0) return;

    const pulseScale = 1 + Math.sin(star.pulsePhase) * 0.1;
    const actualSize = star.radius * star.scale * pulseScale;

    ctx.value!.save();
    ctx.value!.translate(star.x, star.y);

    // Glow effect
    if (star.type === 'golden') {
      ctx.value!.shadowColor = '#FFD700';
      ctx.value!.shadowBlur = 20;
    } else {
      ctx.value!.shadowColor = '#FFFFFF';
      ctx.value!.shadowBlur = 15;
    }

    // Draw star emoji
    ctx.value!.font = `${actualSize * 2}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(star.type === 'golden' ? '🌟' : '⭐', 0, 0);

    ctx.value!.restore();
  });

  // Draw player
  const p = player.value;

  // Player trail effect
  ctx.value.fillStyle = 'rgba(100, 149, 237, 0.3)';
  ctx.value.beginPath();
  ctx.value.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2);
  ctx.value.fill();

  // Player
  ctx.value.font = `${p.radius * 2.5}px Arial`;
  ctx.value.textAlign = 'center';
  ctx.value.textBaseline = 'middle';
  ctx.value.fillText('🚀', p.x, p.y);

  // Draw particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // UI
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFD700';
  ctx.value.textAlign = 'left';
  ctx.value.shadowColor = 'transparent';
  ctx.value.fillText(`⭐ ${score.value}`, 20, 40);

  ctx.value.font = '18px Arial';
  ctx.value.fillStyle = '#AAA';
  ctx.value.fillText(`수집: ${starCount.value}개`, 20, 70);

  // Remaining stars indicator
  const remaining = stars.value.filter(s => !s.collected).length;
  ctx.value.textAlign = 'right';
  ctx.value.fillText(`남은 별: ${remaining}`, width - 20, 40);

  // Instructions
  ctx.value.font = '16px Arial';
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.value.textAlign = 'center';
  ctx.value.fillText('터치하여 별을 모으세요!', width / 2, height - 20);
}

// Game loop
function gameLoop() {
  if (isGameOver.value) return;

  update();
  render();
  animationId = safeRequestAnimationFrame(gameLoop);
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  setPlayerTarget(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  setPlayerTarget(coords.x, coords.y);
}

function handleTouchEnd() {
  isDragging.value = false;
}

function setPlayerTarget(x: number, y: number) {
  player.value.targetX = Math.max(player.value.radius, Math.min(width - player.value.radius, x));
  player.value.targetY = Math.max(player.value.radius, Math.min(height - player.value.radius, y));
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
    count: starCount.value
  };

  emit('complete', result);
}

// Start game
function startGame() {
  player.value.radius = difficultySettings.value.playerSize;

  // Spawn initial stars
  spawnStars();

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
