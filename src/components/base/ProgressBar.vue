<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: false,
  color: 'var(--primary)',
  height: 'medium',
  animated: true
});

const percentage = computed(() => {
  return Math.min(100, Math.max(0, (props.value / props.max) * 100));
});

const label = computed(() => {
  return `${Math.round(percentage.value)}%`;
});
</script>

<template>
  <div class="progress-bar-container">
    <div :class="['progress-bar', `progress-bar-${height}`]">
      <div
        :class="['progress-fill', { animated }]"
        :style="{
          width: `${percentage}%`,
          background: color
        }"
      />
    </div>

    <span v-if="showLabel" class="progress-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
}

.progress-bar {
  flex: 1;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-bar-small {
  height: 0.25rem;
}

.progress-bar-medium {
  height: 0.5rem;
}

.progress-bar-large {
  height: 1rem;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-fill.animated {
  transition: width 0.5s ease;
}

.progress-label {
  font-size: var(--font-sm);
  font-weight: bold;
  min-width: 3rem;
  text-align: right;
}
</style>
