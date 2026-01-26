<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  currentScore: number;
  targetScore: number;
  showTarget?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showTarget: true,
  animated: true
});

const displayScore = ref(props.currentScore);
const animationFrame = ref<number | null>(null);

const progress = computed(() => {
  if (props.targetScore === 0) return 0;
  return Math.min(100, (props.currentScore / props.targetScore) * 100);
});

const isComplete = computed(() => props.currentScore >= props.targetScore);

// Animate score changes
watch(() => props.currentScore, (newScore) => {
  if (!props.animated) {
    displayScore.value = newScore;
    return;
  }

  // Cancel existing animation
  if (animationFrame.value !== null) {
    cancelAnimationFrame(animationFrame.value);
  }

  const startScore = displayScore.value;
  const diff = newScore - startScore;
  const duration = 500; // ms
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);

    displayScore.value = Math.round(startScore + diff * eased);

    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(animate);
    } else {
      animationFrame.value = null;
    }
  };

  animationFrame.value = requestAnimationFrame(animate);
});
</script>

<template>
  <div class="score-display" :class="{ complete: isComplete }">
    <div class="score-text">
      <span class="label">점수:</span>
      <span class="current">{{ displayScore }}</span>
      <template v-if="showTarget">
        <span class="separator">/</span>
        <span class="target">{{ targetScore }}</span>
      </template>
    </div>

    <div v-if="showTarget" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
    </div>
  </div>
</template>

<style scoped>
.score-display {
  padding: 12px var(--spacing-md);
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  min-width: 160px;
  transition: all 0.3s ease;
  border: 2px solid var(--neutral-cream);
  box-shadow: var(--shadow-sm);
}

.score-display.complete {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.score-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.label {
  font-size: var(--font-sm);
  color: var(--text-medium);
}

.current {
  font-size: var(--radius-2xl);
  color: var(--primary-yellow);
}

.score-display.complete .current {
  color: white;
}

.separator {
  opacity: 0.5;
  color: var(--text-light);
}

.target {
  font-size: var(--font-md);
  color: var(--text-light);
}

.progress-bar {
  height: var(--spacing-sm);
  background: var(--light-gray);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-yellow);
  transition: width 0.3s ease;
  border-radius: var(--radius-full);
}

.score-display.complete .progress-fill {
  background: white;
}
</style>
