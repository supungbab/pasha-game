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
  color: '#FFD700',
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
  gap: 8px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  background: #F5F5F5;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  border: 1px solid #E0E0E0;
}

.progress-bar-small {
  height: 8px;
}

.progress-bar-medium {
  height: 12px;
}

.progress-bar-large {
  height: 16px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-fill.animated {
  transition: width 0.5s ease;
}

.progress-label {
  font-size: 14px;
  font-weight: 700;
  min-width: 3rem;
  text-align: right;
  color: #424242;
}
</style>
