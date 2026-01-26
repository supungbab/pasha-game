<script setup lang="ts">
import { computed } from 'vue';
import type { DifficultyLevel } from '@/types/game';
import { getDifficultyInfo, getDifficultyColor } from '@/utils/difficulty';

interface Props {
  level: DifficultyLevel;
  isHardMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isHardMode: false
});

const difficultyInfo = computed(() => getDifficultyInfo(props.level));
const color = computed(() => getDifficultyColor(props.level));
</script>

<template>
  <div class="difficulty-badge" :class="{ 'hard-mode': isHardMode }" :style="{ '--color': color }">
    <span v-if="isHardMode" class="hard-mode-icon">🔥</span>
    <span class="emoji">{{ difficultyInfo.emoji }}</span>
    <span class="name">{{ difficultyInfo.name }}</span>
  </div>
</template>

<style scoped>
.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color);
  color: white;
  border-radius: var(--radius-lg);
  font-weight: 700;
  font-size: var(--font-sm);
  box-shadow: var(--shadow-sm);
}

.difficulty-badge.hard-mode {
  background: var(--color);
  box-shadow: var(--shadow-danger-hover);
  animation: pulse 1s infinite;
}

.hard-mode-icon {
  font-size: var(--font-lg);
  animation: flame 0.5s infinite;
}

.emoji {
  font-size: var(--font-md);
}

.name {
  text-shadow: none;
}

@keyframes flame {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-2px) rotate(5deg);
  }
}
</style>
