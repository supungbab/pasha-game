<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'medium'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const handleToggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};
</script>

<template>
  <button
    :class="[
      'toggle',
      `toggle-${size}`,
      { 'toggle-active': modelValue, 'toggle-disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleToggle"
  >
    <span class="toggle-thumb" />
  </button>
</template>

<style scoped>
/* 캐주얼 미니게임 토글 */
.toggle {
  position: relative;
  border: none;
  border-radius: 999px;
  background: #E0E0E0;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px;
}

.toggle:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}

/* Sizes */
.toggle-small {
  width: 44px;
  height: 24px;
}

.toggle-small .toggle-thumb {
  width: 20px;
  height: 20px;
}

.toggle-medium {
  width: 52px;
  height: 28px;
}

.toggle-medium .toggle-thumb {
  width: 24px;
  height: 24px;
}

.toggle-large {
  width: 64px;
  height: 32px;
}

.toggle-large .toggle-thumb {
  width: 28px;
  height: 28px;
}

/* Thumb */
.toggle-thumb {
  display: block;
  border-radius: 50%;
  background: #FFFFFF;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Active */
.toggle-active {
  background: #4CAF50;
}

.toggle-small.toggle-active .toggle-thumb {
  transform: translateX(20px);
}

.toggle-medium.toggle-active .toggle-thumb {
  transform: translateX(24px);
}

.toggle-large.toggle-active .toggle-thumb {
  transform: translateX(32px);
}

/* Disabled */
.toggle-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
