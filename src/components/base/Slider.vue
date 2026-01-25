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
  gap: 16px;
  width: 100%;
}

.slider {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #F5F5F5;
  border-radius: 999px;
  outline: none;
  cursor: pointer;
  border: 1px solid #E0E0E0;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Webkit (Chrome, Safari) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

/* Firefox */
.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #FFD700;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
}

.slider::-moz-range-thumb:active {
  transform: scale(0.95);
}

/* Track */
.slider::-webkit-slider-runnable-track {
  height: 8px;
  background: #F5F5F5;
  border-radius: 999px;
}

.slider::-moz-range-track {
  height: 8px;
  background: #F5F5F5;
  border-radius: 999px;
}

.slider::-moz-range-progress {
  height: 8px;
  background: #FFD700;
  border-radius: 999px;
}

/* Value display */
.slider-value {
  font-size: 16px;
  font-weight: 700;
  min-width: 40px;
  text-align: right;
  color: #212121;
}
</style>
