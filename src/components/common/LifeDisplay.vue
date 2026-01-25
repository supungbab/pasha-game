<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  lives: number;
  maxLives?: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxLives: 3,
  animated: true
});

const hearts = computed(() => {
  return Array.from({ length: props.maxLives }, (_, i) => ({
    index: i,
    filled: i < props.lives
  }));
});
</script>

<template>
  <div class="life-display">
    <span
      v-for="heart in hearts"
      :key="heart.index"
      class="heart"
      :class="{ empty: !heart.filled, animated: animated }"
    >
      {{ heart.filled ? '❤️' : '🖤' }}
    </span>
  </div>
</template>

<style scoped>
.life-display {
  display: inline-flex;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 2px solid #FFF8DC;
}

.heart {
  font-size: 24px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.heart.animated {
  animation: heartbeat 1s infinite;
}

.heart.empty {
  opacity: 0.3;
  filter: grayscale(100%);
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40% {
    transform: scale(1);
  }
}

.heart:last-child.animated {
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
