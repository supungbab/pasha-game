<script setup lang="ts">
interface Props {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>

<template>
  <div class="slider-container">
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="slider"
      @input="handleInput"
    />
    <span v-if="showValue" class="slider-value">{{ modelValue }}</span>
  </div>
</template>

<style scoped>
.slider-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
}

.slider {
  flex: 1;
  height: 0.5rem;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Webkit (Chrome, Safari) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

/* Firefox */
.slider::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb:active {
  transform: scale(0.95);
}

/* Track fill effect */
.slider::-webkit-slider-runnable-track {
  height: 0.5rem;
  background: linear-gradient(
    to right,
    var(--primary) 0%,
    var(--primary) calc(var(--value, 50) * 1%),
    var(--border) calc(var(--value, 50) * 1%),
    var(--border) 100%
  );
  border-radius: var(--radius-full);
}

.slider::-moz-range-track {
  height: 0.5rem;
  background: var(--border);
  border-radius: var(--radius-full);
}

.slider::-moz-range-progress {
  height: 0.5rem;
  background: var(--primary);
  border-radius: var(--radius-full);
}

/* Value display */
.slider-value {
  font-size: var(--font-md);
  font-weight: bold;
  min-width: 2.5rem;
  text-align: right;
  color: var(--text-primary);
}
</style>
