<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

interface Props {
  timeLimit: number;
  paused?: boolean;
  warningThreshold?: number;
  borderWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  paused: false,
  warningThreshold: 3,
  borderWidth: 6
});

const emit = defineEmits<{
  timeUp: [];
  warning: [];
  tick: [remainingTime: number];
}>();

const remainingTime = ref(props.timeLimit);
// Progress: 100% (full) -> 0% (empty) as time decreases
const progress = computed(() => (remainingTime.value / props.timeLimit) * 100);
const isWarning = computed(() => remainingTime.value <= props.warningThreshold);
const isCritical = computed(() => remainingTime.value <= props.warningThreshold / 2);

let intervalId: number | null = null;
let hasWarned = false;

function start() {
  if (intervalId !== null) return;

  remainingTime.value = props.timeLimit;
  hasWarned = false;

  intervalId = window.setInterval(() => {
    if (props.paused) return;

    remainingTime.value = Math.max(0, remainingTime.value - 0.1);

    if (remainingTime.value <= 0) {
      remainingTime.value = 0;
      stop();
      emit('timeUp');
    } else {
      emit('tick', remainingTime.value);

      if (!hasWarned && remainingTime.value <= props.warningThreshold) {
        hasWarned = true;
        emit('warning');
      }
    }
  }, 100);
}

function stop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function reset() {
  stop();
  remainingTime.value = props.timeLimit;
  hasWarned = false;
}

watch(() => props.timeLimit, () => {
  reset();
  start();
}, { immediate: true });

onUnmounted(() => {
  stop();
});

defineExpose({
  start,
  stop,
  reset,
  remainingTime
});
</script>

<template>
  <div
    class="timer-border-container"
    :class="{ warning: isWarning, critical: isCritical }"
  >
    <!-- Border progress using SVG - counter-clockwise from top-left -->
    <svg class="timer-border-svg" preserveAspectRatio="none">
      <!-- Background border (subtle gray) -->
      <rect
        class="border-bg"
        x="3" y="3"
        :width="'calc(100% - 6px)'"
        :height="'calc(100% - 6px)'"
        rx="13" ry="13"
        fill="none"
        :stroke-width="borderWidth"
      />
      <!-- Progress border (yellow, animated counter-clockwise) -->
      <rect
        class="border-progress"
        x="3" y="3"
        :width="'calc(100% - 6px)'"
        :height="'calc(100% - 6px)'"
        rx="13" ry="13"
        fill="none"
        :stroke-width="borderWidth"
        :style="{
          '--progress': progress / 100
        }"
      />
    </svg>

    <!-- Time display overlay (small pill at bottom) -->
    <div class="time-display">
      <span class="time-value">{{ remainingTime.toFixed(1) }}s</span>
    </div>

    <!-- Content slot -->
    <div class="timer-border-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.timer-border-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}

.timer-border-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.border-bg {
  stroke: rgba(255, 215, 0, 0.15);
}

.border-progress {
  stroke: var(--primary-yellow, #FFD700);
  stroke-linecap: round;
  /* Counter-clockwise animation using stroke-dasharray */
  stroke-dasharray: 1000%;
  stroke-dashoffset: calc(1000% * (1 - var(--progress)));
  transition: stroke-dashoffset 0.1s linear, stroke 0.3s ease;
  /* Rotate to start from top and go counter-clockwise */
  transform-origin: center;
  transform: scaleX(-1);
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.5));
}

/* Normal state - bright yellow */
.timer-border-container .border-progress {
  stroke: var(--primary-yellow, #FFD700);
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
}

/* Warning state - orange */
.timer-border-container.warning .border-progress {
  stroke: var(--warning, #FF9800);
  filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.7));
  animation: borderGlow 0.5s ease-in-out infinite;
}

/* Critical state - red */
.timer-border-container.critical .border-progress {
  stroke: var(--error, #F44336);
  filter: drop-shadow(0 0 10px rgba(244, 67, 54, 0.8));
  animation: borderGlow 0.25s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 8px currentColor);
  }
  50% {
    opacity: 0.8;
    filter: drop-shadow(0 0 12px currentColor);
  }
}

/* Time display pill */
.time-display {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  color: #212121;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4), 0 2px 0 rgba(200, 160, 0, 0.5);
  transition: all 0.3s ease;
}

.timer-border-container.warning .time-display {
  background: linear-gradient(180deg, #FF9800 0%, #F57C00 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.5), 0 2px 0 rgba(200, 120, 0, 0.5);
  animation: timeBounce 0.5s ease-in-out infinite;
}

.timer-border-container.critical .time-display {
  background: linear-gradient(180deg, #F44336 0%, #D32F2F 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.6), 0 2px 0 rgba(180, 40, 40, 0.5);
  animation: timeBounce 0.25s ease-in-out infinite;
}

@keyframes timeBounce {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.08);
  }
}

.timer-border-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: 6px; /* Space for border */
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .time-display {
    bottom: 12px;
    padding: 6px 16px;
    font-size: 16px;
  }
}
</style>
