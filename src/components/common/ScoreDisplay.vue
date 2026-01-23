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
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  min-width: 10rem;
  transition: all 0.3s ease;
}

.score-display.complete {
  background: #4CAF50;
  color: white;
}

.score-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.label {
  font-size: 1rem;
  opacity: 0.8;
}

.current {
  font-size: 1.5rem;
  color: #FF6B6B;
}

.score-display.complete .current {
  color: white;
}

.separator {
  opacity: 0.5;
}

.target {
  font-size: 1rem;
  opacity: 0.7;
}

.progress-bar {
  height: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #FF6B6B, #4ECDC4);
  transition: width 0.3s ease;
  border-radius: 0.25rem;
}

.score-display.complete .progress-fill {
  background: white;
}
</style>
