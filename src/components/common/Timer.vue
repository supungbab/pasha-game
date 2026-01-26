<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

interface Props {
  timeLimit: number;
  paused?: boolean;
  warningThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  paused: false,
  warningThreshold: 3
});

const emit = defineEmits<{
  timeUp: [];
  warning: [];
  tick: [remainingTime: number];
}>();

const remainingTime = ref(props.timeLimit);
const isWarning = computed(() => remainingTime.value <= props.warningThreshold);

let intervalId: number | null = null;
let hasWarned = false;

function start() {
  if (intervalId !== null) return;

  remainingTime.value = props.timeLimit;
  hasWarned = false;

  intervalId = window.setInterval(() => {
    if (props.paused) return;

    remainingTime.value -= 0.1;

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
  <div class="timer" :class="{ warning: isWarning }">
    <span class="timer-icon">⏱️</span>
    <span class="timer-value">{{ remainingTime.toFixed(1) }}초</span>
  </div>
</template>

<style scoped>
.timer {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-dark);
  transition: all 0.3s ease;
  border: 2px solid var(--neutral-cream);
  box-shadow: var(--shadow-sm);
}

.timer.warning {
  background: var(--warning);
  color: white;
  border-color: var(--warning);
  animation: blink 0.5s infinite;
}

.timer-icon {
  font-size: var(--radius-2xl);
}

.timer-value {
  min-width: 64px;
  text-align: center;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
