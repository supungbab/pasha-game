<template>
  <div ref="containerRef" class="minigame skewer-game">
    <canvas
      ref="canvasRef"
      @touchstart.prevent
    ></canvas>
    <ScorePopup :popups="scorePopups" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers, useGameButtons, useJuicyFeedback } from '@/composables';
import { ScorePopup } from '@/components/common';
import type { Particle } from '@/utils/canvas';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const { ctx, helper, width, height, clear } = useCanvas(canvasRef, {
  width: 400,
  height: 600,
  backgroundColor: '#1A0F07'
});

const { safeSetTimeout, safeRequestAnimationFrame, cancelAnimationFrame } = useCleanupTimers();
const { setButton, setThreeButtons } = useGameButtons();
const { scorePopups, createScorePopup, createParticles: domParticles, shake } = useJuicyFeedback();

// ── State ──
const score = ref(0);
const canFinish = ref(false);

let animationId = 0;
let gameCompleted = false;
let startTime = 0;
let frameCount = 0;

// Particles (canvas-level)
let hitParticles: Particle[] = [];

// Flash overlay
let flashAlpha = 0;
let flashColor = '#FFFFFF';

// Combo
let comboCount = 0;

// Ambient steam
interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}
let steamParticles: SteamParticle[] = [];

// Completed skewers (trophy display)
interface CompletedSkewer {
  emojis: string[];
  age: number;
}
let completedSkewers: CompletedSkewer[] = [];

// ── Ingredient Types ──
type IngredientType = 'meat' | 'vegetable' | 'onion';
type VerticalPosition = 'top' | 'middle' | 'bottom';

interface Ingredient {
  type: IngredientType;
  emoji: string;
  x: number;
  y: number;
  verticalPos: VerticalPosition;
  speed: number;
  direction: 'left-to-right' | 'right-to-left';
  skewered: boolean;
  bobPhase: number;
}

interface Wave {
  ingredients: Ingredient[];
  completed: boolean;
  skeweredCount: number;
}

interface SkewerAnimation {
  active: boolean;
  direction: 'left' | 'center' | 'right';
  progress: number;
  ingredients: Ingredient[];
}

const currentWave = ref<Wave | null>(null);
const waveCount = ref(0);

const skewerAnimation = ref<SkewerAnimation>({
  active: false,
  direction: 'center',
  progress: 0,
  ingredients: []
});

// ── Constants ──
const baseSpeed = computed(() => 2.0 + props.difficulty * 0.5);
const OVERLAP_THRESHOLD = 40;

const Y_POSITIONS = {
  top: height * 0.20,
  middle: height * 0.36,
  bottom: height * 0.52
};

const SKEWER_START_X = width / 2;
const SKEWER_START_Y = height * 0.72;

const SKEWER_TARGET_X: Record<string, number> = {
  left: width * 0.25,
  center: width * 0.5,
  right: width * 0.75
};

const INGREDIENTS: { type: IngredientType; emoji: string }[] = [
  { type: 'meat', emoji: '🥩' },
  { type: 'vegetable', emoji: '🥬' },
  { type: 'onion', emoji: '🧅' }
];

const HIT_COLORS: Record<IngredientType, string[]> = {
  meat: ['#E53935', '#FF5722', '#FF8A65'],
  vegetable: ['#43A047', '#66BB6A', '#AED581'],
  onion: ['#FDD835', '#FFEE58', '#D4A017']
};

// ── Buttons ──
function setupButtons() {
  setThreeButtons(
    { onPress: () => handleSkewer('left') },
    { onPress: () => handleSkewer('center') },
    { onPress: () => handleSkewer('right') },
  );
}

// ── Utilities ──
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j]!;
    result[j] = temp!;
  }
  return result;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── Wave ──
function createWave(): Wave {
  const speed = baseSpeed.value;
  const shuffled = shuffle([...INGREDIENTS]);
  const positions: VerticalPosition[] = ['top', 'middle', 'bottom'];

  const ingredients: Ingredient[] = shuffled.map((ing, index) => {
    const direction: 'left-to-right' | 'right-to-left' =
      Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
    const startX = direction === 'left-to-right' ? -30 : width + 30;
    const verticalPos = positions[index] as VerticalPosition;

    return {
      type: ing.type,
      emoji: ing.emoji,
      x: startX,
      y: Y_POSITIONS[verticalPos],
      verticalPos,
      speed,
      direction,
      skewered: false,
      bobPhase: Math.random() * Math.PI * 2
    };
  });

  return { ingredients, completed: false, skeweredCount: 0 };
}

function checkIngredientsAtPosition(targetX: number): Ingredient[] {
  if (!currentWave.value) return [];
  return currentWave.value.ingredients.filter(ing => {
    if (ing.skewered) return false;
    return Math.abs(ing.x - targetX) <= OVERLAP_THRESHOLD;
  });
}

// ── Spawn Steam ──
function spawnSteam() {
  if (steamParticles.length > 12) return;
  steamParticles.push({
    x: width * 0.2 + Math.random() * width * 0.6,
    y: height * 0.66 + Math.random() * 10,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.3 - Math.random() * 0.5,
    size: 3 + Math.random() * 5,
    alpha: 0.15 + Math.random() * 0.1,
    life: 1
  });
}

// ── Hit Particles ──
function spawnHitParticles(x: number, y: number, type: IngredientType, count: number) {
  if (!helper.value) return;
  const colors = HIT_COLORS[type];
  for (const color of colors) {
    const newParticles = helper.value.createParticles(x, y, color, count);
    hitParticles.push(...newParticles);
  }
}

// ── Skewer Handler ──
function handleSkewer(direction: 'left' | 'center' | 'right') {
  if (gameCompleted || !currentWave.value || skewerAnimation.value.active) return;

  const targetX = SKEWER_TARGET_X[direction]!;
  const ingredientsAtPosition = checkIngredientsAtPosition(targetX);

  if (ingredientsAtPosition.length === 0) {
    // Miss
    comboCount = 0;
    flashAlpha = 0.2;
    flashColor = '#FF1744';

    shake(containerRef.value, 'light');
    if (navigator.vibrate) navigator.vibrate(100);

    const rect = canvasRef.value?.getBoundingClientRect();
    if (rect) {
      const sx = rect.left + (targetX / width) * rect.width;
      const sy = rect.top + (Y_POSITIONS.middle / height) * rect.height;
      createScorePopup(sx, sy, 'MISS!', 'miss');
    }
    return;
  }

  // Success
  const count = ingredientsAtPosition.length;
  ingredientsAtPosition.forEach(ing => { ing.skewered = true; });
  currentWave.value.skeweredCount += count;

  let points = 0;
  let popupText = '';
  let popupType: 'score' | 'combo' | 'bonus' = 'score';

  if (count === 3) {
    comboCount++;
    points = 50 + (comboCount > 1 ? comboCount * 10 : 0);
    popupText = comboCount > 1 ? `PERFECT! +${points}` : `PERFECT! +50`;
    popupType = 'bonus';
    flashAlpha = 0.45;
    flashColor = '#FFD700';
    shake(containerRef.value, 'strong');
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  } else if (count === 2) {
    comboCount++;
    points = 25;
    popupText = 'GOOD! +25';
    popupType = 'score';
    flashAlpha = 0.2;
    flashColor = '#4CAF50';
    shake(containerRef.value, 'light');
    if (navigator.vibrate) navigator.vibrate(50);
  } else {
    comboCount = 0;
    points = 10;
    popupText = '+10';
    if (navigator.vibrate) navigator.vibrate(30);
  }

  score.value += points;

  // Canvas particles at each ingredient
  ingredientsAtPosition.forEach(ing => {
    spawnHitParticles(ing.x, ing.y, ing.type, count === 3 ? 8 : 4);
  });

  // DOM feedback
  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const sx = rect.left + (targetX / width) * rect.width;
    const sy = rect.top + (Y_POSITIONS.middle / height) * rect.height;
    createScorePopup(sx, sy - 30, popupText, popupType);
    domParticles(containerRef.value, sx, sy, '#FFD700', count * 4);
  }

  // Start skewer animation
  skewerAnimation.value = {
    active: true,
    direction,
    progress: 0,
    ingredients: [...ingredientsAtPosition]
  };

  canFinish.value = true;

  if (score.value >= props.targetScore) {
    safeSetTimeout(() => completeGame(), 500);
  }
}

// ── Finish Handler ──
function handleFinish() {
  if (gameCompleted || !canFinish.value) return;

  score.value += 20;
  canFinish.value = false;

  completedSkewers.push({
    emojis: skewerAnimation.value.ingredients.map(i => i.emoji),
    age: 0
  });

  flashAlpha = 0.15;
  flashColor = '#FFD700';

  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const sx = rect.left + rect.width / 2;
    const sy = rect.top + rect.height * 0.3;
    createScorePopup(sx, sy, 'FINISH! +20', 'bonus');
    domParticles(containerRef.value, sx, sy + 20, '#FF9800', 8);
  }

  if (navigator.vibrate) navigator.vibrate([30, 30, 30, 30]);

  waveCount.value++;
  safeSetTimeout(() => {
    if (!gameCompleted) currentWave.value = createWave();
  }, 300);

  if (score.value >= props.targetScore) {
    safeSetTimeout(() => completeGame(), 500);
  }
}

// ── Update ──
function update() {
  frameCount++;

  // Steam
  if (frameCount % 8 === 0) spawnSteam();
  steamParticles = steamParticles.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.008;
    s.alpha *= 0.995;
    return s.life > 0;
  });

  // Completed skewer age
  completedSkewers.forEach(s => { s.age++; });

  if (!currentWave.value) return;

  // Move ingredients
  for (const ing of currentWave.value.ingredients) {
    if (ing.skewered) continue;
    ing.x += ing.direction === 'left-to-right' ? ing.speed : -ing.speed;
  }

  // Wave completion
  const allGone = currentWave.value.ingredients.every(ing =>
    ing.skewered || ing.x < -50 || ing.x > width + 50
  );

  if (allGone && !currentWave.value.completed) {
    currentWave.value.completed = true;
    canFinish.value = false;
    comboCount = 0;

    safeSetTimeout(() => {
      if (!gameCompleted) {
        waveCount.value++;
        currentWave.value = createWave();
      }
    }, 500);
  }

  // Skewer animation
  if (skewerAnimation.value.active) {
    skewerAnimation.value.progress += 0.06;
    if (skewerAnimation.value.progress >= 1) {
      skewerAnimation.value.active = false;
    }
  }

  // Flash decay
  if (flashAlpha > 0) {
    flashAlpha *= 0.88;
    if (flashAlpha < 0.005) flashAlpha = 0;
  }
}

// ── Render ──
function render() {
  if (!ctx.value || !helper.value) return;
  const c = ctx.value;
  const h = helper.value;

  clear();

  // ── Background: dark warm night market ──
  const bgGrad = c.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0F0A06');
  bgGrad.addColorStop(0.25, '#1A0F07');
  bgGrad.addColorStop(0.55, '#2D1B0E');
  bgGrad.addColorStop(1, '#1A0F07');
  c.fillStyle = bgGrad;
  c.fillRect(0, 0, width, height);

  // Warm ambient glow from grill
  const ambGlow = c.createRadialGradient(width / 2, height * 0.7, 30, width / 2, height * 0.7, 280);
  ambGlow.addColorStop(0, 'rgba(255, 120, 30, 0.12)');
  ambGlow.addColorStop(0.6, 'rgba(255, 60, 10, 0.04)');
  ambGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = ambGlow;
  c.fillRect(0, 0, width, height);

  // ── Steam particles ──
  steamParticles.forEach(s => {
    c.globalAlpha = s.alpha * s.life;
    c.beginPath();
    c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    c.fillStyle = 'rgba(200, 180, 160, 0.5)';
    c.fill();
  });
  c.globalAlpha = 1;

  // ── Lanes (atmospheric) ──
  const lanes = [Y_POSITIONS.top, Y_POSITIONS.middle, Y_POSITIONS.bottom];
  lanes.forEach(ly => {
    // Soft glow band
    const laneGrad = c.createLinearGradient(0, ly - 22, 0, ly + 22);
    laneGrad.addColorStop(0, 'rgba(255, 152, 0, 0)');
    laneGrad.addColorStop(0.5, 'rgba(255, 152, 0, 0.04)');
    laneGrad.addColorStop(1, 'rgba(255, 152, 0, 0)');
    c.fillStyle = laneGrad;
    c.fillRect(0, ly - 22, width, 44);

    // Thin warm line
    c.strokeStyle = 'rgba(255, 183, 77, 0.12)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(15, ly);
    c.lineTo(width - 15, ly);
    c.stroke();
  });

  // ── Target zone columns (subtle) ──
  for (const dir of ['left', 'center', 'right'] as const) {
    const tx = SKEWER_TARGET_X[dir]!;
    const zGrad = c.createLinearGradient(tx - 18, 0, tx + 18, 0);
    zGrad.addColorStop(0, 'rgba(255, 152, 0, 0)');
    zGrad.addColorStop(0.5, 'rgba(255, 152, 0, 0.03)');
    zGrad.addColorStop(1, 'rgba(255, 152, 0, 0)');
    c.fillStyle = zGrad;
    c.fillRect(tx - 18, Y_POSITIONS.top - 25, 36, Y_POSITIONS.bottom - Y_POSITIONS.top + 50);
  }

  // ── Grill / counter surface ──
  const counterY = height * 0.64;
  const counterGrad = c.createLinearGradient(0, counterY, 0, height);
  counterGrad.addColorStop(0, '#4A2E14');
  counterGrad.addColorStop(0.03, '#3D2410');
  counterGrad.addColorStop(0.08, '#33200E');
  counterGrad.addColorStop(1, '#1A0F07');
  c.fillStyle = counterGrad;
  c.fillRect(0, counterY, width, height - counterY);

  // Counter edge
  c.strokeStyle = 'rgba(255, 183, 77, 0.25)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, counterY);
  c.lineTo(width, counterY);
  c.stroke();

  // Grill grate
  c.strokeStyle = 'rgba(80, 50, 25, 0.5)';
  c.lineWidth = 3;
  for (let gx = 25; gx < width; gx += 18) {
    c.beginPath();
    c.moveTo(gx, counterY + 8);
    c.lineTo(gx, counterY + 45);
    c.stroke();
  }

  // Hot glow on grill
  const grillGlow = c.createRadialGradient(width / 2, counterY + 25, 15, width / 2, counterY + 25, 150);
  grillGlow.addColorStop(0, 'rgba(255, 80, 20, 0.15)');
  grillGlow.addColorStop(0.6, 'rgba(255, 50, 10, 0.04)');
  grillGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = grillGlow;
  c.fillRect(0, counterY, width, 60);

  // ── Ingredients ──
  if (currentWave.value) {
    for (const ing of currentWave.value.ingredients) {
      if (ing.skewered) continue;

      const bob = Math.sin(frameCount * 0.07 + ing.bobPhase) * 3;
      const drawY = ing.y + bob;

      // Shadow
      c.globalAlpha = 0.25;
      h.drawCircle(ing.x + 2, drawY + 5, 16, 'rgba(0,0,0,0.6)');
      c.globalAlpha = 1;

      // Glow when near a target zone
      let nearZone = false;
      for (const dir of ['left', 'center', 'right'] as const) {
        if (Math.abs(ing.x - SKEWER_TARGET_X[dir]!) < OVERLAP_THRESHOLD) {
          nearZone = true;
          break;
        }
      }
      if (nearZone) {
        const glowPulse = 0.25 + Math.sin(frameCount * 0.12) * 0.1;
        const gGrad = c.createRadialGradient(ing.x, drawY, 4, ing.x, drawY, 32);
        gGrad.addColorStop(0, `rgba(255, 215, 0, ${glowPulse})`);
        gGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        c.fillStyle = gGrad;
        c.beginPath();
        c.arc(ing.x, drawY, 32, 0, Math.PI * 2);
        c.fill();
      }

      // Motion trail (ghost)
      c.globalAlpha = 0.15;
      const trailOffset = ing.direction === 'left-to-right' ? -ing.speed * 3 : ing.speed * 3;
      c.font = '36px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(ing.emoji, ing.x + trailOffset, drawY);
      c.globalAlpha = 0.07;
      c.fillText(ing.emoji, ing.x + trailOffset * 2, drawY);
      c.globalAlpha = 1;

      // Main emoji
      c.font = '42px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(ing.emoji, ing.x, drawY);
    }
  }

  // ── Skewer Animation ──
  if (skewerAnimation.value.active) {
    const anim = skewerAnimation.value;
    const p = anim.progress;
    const eased = easeOutCubic(Math.min(p * 1.3, 1)); // slightly overshoot for speed feel

    const sx = SKEWER_START_X;
    const sy = SKEWER_START_Y;
    const tx = SKEWER_TARGET_X[anim.direction]!;
    const ty = Y_POSITIONS.top - 35;

    const cx = sx + (tx - sx) * eased;
    const cy = sy + (ty - sy) * eased;

    // Skewer glow trail
    c.strokeStyle = 'rgba(255, 140, 40, 0.12)';
    c.lineWidth = 16;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(sx, sy);
    c.lineTo(cx, cy);
    c.stroke();

    // Skewer stick (wood gradient)
    const stickGrad = c.createLinearGradient(sx, sy, cx, cy);
    stickGrad.addColorStop(0, '#6B3A20');
    stickGrad.addColorStop(0.4, '#A0522D');
    stickGrad.addColorStop(0.7, '#8B5E3C');
    stickGrad.addColorStop(1, '#5D3A1A');
    c.strokeStyle = stickGrad;
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(sx, sy);
    c.lineTo(cx, cy);
    c.stroke();

    // Metal tip
    const angle = Math.atan2(cy - sy, cx - sx);
    c.save();
    c.translate(cx, cy);
    c.rotate(angle - Math.PI / 2);
    const tipGrad = c.createLinearGradient(-7, 0, 7, 0);
    tipGrad.addColorStop(0, '#888');
    tipGrad.addColorStop(0.5, '#DDD');
    tipGrad.addColorStop(1, '#888');
    c.fillStyle = tipGrad;
    c.beginPath();
    c.moveTo(-7, 0);
    c.lineTo(7, 0);
    c.lineTo(0, -20);
    c.closePath();
    c.fill();
    c.restore();

    // Ingredients on skewer
    if (p > 0.15) {
      const ingAlpha = Math.min((p - 0.15) / 0.25, 1);
      anim.ingredients.forEach((ing, i) => {
        const ip = eased * (0.25 + i * 0.2);
        const ix = sx + (tx - sx) * ip;
        const iy = sy + (ty - sy) * ip;

        // Bounce-in
        const bp = Math.max(0, p - 0.15 - i * 0.08);
        const bounceScale = bp < 0.15
          ? 1 + Math.sin(bp / 0.15 * Math.PI) * 0.35
          : 1;

        c.globalAlpha = ingAlpha;
        c.font = `${Math.round(38 * bounceScale)}px Arial`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(ing.emoji, ix, iy);
      });
      c.globalAlpha = 1;
    }
  }

  // ── Skewer base point (idle) ──
  if (!skewerAnimation.value.active) {
    const pulse = 0.3 + Math.sin(frameCount * 0.06) * 0.15;
    const baseGlow = c.createRadialGradient(SKEWER_START_X, SKEWER_START_Y, 4, SKEWER_START_X, SKEWER_START_Y, 28);
    baseGlow.addColorStop(0, `rgba(255, 152, 0, ${pulse})`);
    baseGlow.addColorStop(1, 'rgba(255, 152, 0, 0)');
    c.fillStyle = baseGlow;
    c.beginPath();
    c.arc(SKEWER_START_X, SKEWER_START_Y, 28, 0, Math.PI * 2);
    c.fill();

    h.drawEmoji('🍢', SKEWER_START_X, SKEWER_START_Y, 26);
  }

  // ── Completed skewers (trophy row at top) ──
  if (completedSkewers.length > 0) {
    completedSkewers.forEach((sk, i) => {
      const sx = 25 + i * 45;
      if (sx > width - 80) return;

      // Entry bounce
      const entryScale = sk.age < 15
        ? 0.5 + 0.5 * easeOutCubic(sk.age / 15)
        : 1;

      c.globalAlpha = 0.85;
      c.font = `${Math.round(20 * entryScale)}px Arial`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🍢', sx, 18);
    });
    c.globalAlpha = 1;
  }

  // ── Hit Particles ──
  hitParticles = h.updateAndDrawParticles(hitParticles);

  // ── HUD: Score ──
  c.font = 'bold 22px Arial';
  c.textAlign = 'right';
  c.textBaseline = 'top';
  const sText = `${score.value}`;
  const tText = `/${props.targetScore}`;
  const sW = c.measureText(sText).width;
  const tW = c.measureText(tText).width;
  const pillW = sW + tW + 24;

  h.drawRoundRect(width - pillW - 14, 8, pillW + 4, 34, 17, 'rgba(0,0,0,0.45)');

  c.fillStyle = '#FFD700';
  c.font = 'bold 22px Arial';
  c.fillText(sText, width - tW - 16, 14);
  c.fillStyle = 'rgba(255, 215, 0, 0.45)';
  c.font = '16px Arial';
  c.fillText(tText, width - 14, 17);

  // ── HUD: Wave ──
  c.font = 'bold 13px Arial';
  c.fillStyle = 'rgba(255, 183, 77, 0.5)';
  c.textAlign = 'left';
  c.fillText(`WAVE ${waveCount.value + 1}`, 14, 18);

  // ── HUD: Combo ──
  if (comboCount > 1) {
    const cPulse = 0.6 + Math.sin(frameCount * 0.15) * 0.3;
    c.globalAlpha = cPulse;
    c.font = 'bold 20px Arial';
    c.fillStyle = '#FF9800';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    // Glow behind text
    const comboGlow = c.createRadialGradient(width / 2, height * 0.11, 5, width / 2, height * 0.11, 60);
    comboGlow.addColorStop(0, 'rgba(255, 152, 0, 0.2)');
    comboGlow.addColorStop(1, 'rgba(255, 152, 0, 0)');
    c.fillStyle = comboGlow;
    c.beginPath();
    c.arc(width / 2, height * 0.11, 60, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#FF9800';
    c.fillText(`${comboCount}x COMBO`, width / 2, height * 0.11);
    c.globalAlpha = 1;
  }

  // ── Flash overlay ──
  if (flashAlpha > 0) {
    c.globalAlpha = flashAlpha;
    c.fillStyle = flashColor;
    c.fillRect(0, 0, width, height);
    c.globalAlpha = 1;
  }
}

// ── Game Loop ──
function gameLoop() {
  if (gameCompleted) return;

  update();
  render();

  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  animationId = safeRequestAnimationFrame(gameLoop);
}

// ── Complete ──
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;
  cancelAnimationFrame(animationId);

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining
  };

  if (result.success) {
    shake(containerRef.value, 'light');
  } else {
    shake(containerRef.value, 'strong');
  }

  safeSetTimeout(() => {
    emit('complete', result);
  }, 300);
}

// ── Button toggle ──
watch(canFinish, (val) => {
  if (val) {
    setButton(1, { label: 'DONE', onPress: handleFinish, disabled: false });
  } else {
    setButton(1, { label: '', onPress: () => handleSkewer('center'), disabled: false });
  }
});

// ── Lifecycle ──
onMounted(() => {
  setupButtons();
  startTime = Date.now();

  if (containerRef.value) {
    containerRef.value.classList.add('juicy-pop');
  }

  safeSetTimeout(() => {
    if (canvasRef.value) {
      canvasRef.value.style.removeProperty('width');
      canvasRef.value.style.removeProperty('height');
    }
    currentWave.value = createWave();
    gameLoop();
  }, 100);
});

onUnmounted(() => {
  gameCompleted = true;
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
  aspect-ratio: 400 / 600;
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  background: #1A0F07;
}
</style>
