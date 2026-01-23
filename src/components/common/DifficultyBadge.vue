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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color);
  color: white;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.difficulty-badge.hard-mode {
  background: linear-gradient(135deg, var(--color), #F44336);
  animation: hardModePulse 1s infinite;
}

.hard-mode-icon {
  font-size: 1.2rem;
  animation: flame 0.5s infinite;
}

.emoji {
  font-size: 1rem;
}

.name {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

@keyframes hardModePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
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
