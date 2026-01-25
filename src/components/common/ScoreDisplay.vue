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
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  min-width: 160px;
  transition: all 0.3s ease;
  border: 2px solid #FFF8DC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.score-display.complete {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.score-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.label {
  font-size: 14px;
  color: #424242;
}

.current {
  font-size: 24px;
  color: #FFD700;
}

.score-display.complete .current {
  color: white;
}

.separator {
  opacity: 0.5;
  color: #757575;
}

.target {
  font-size: 16px;
  color: #757575;
}

.progress-bar {
  height: 8px;
  background: #F5F5F5;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FFD700;
  transition: width 0.3s ease;
  border-radius: 999px;
}

.score-display.complete .progress-fill {
  background: white;
}
</style>
