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
/* 🎮 비시바시 스타일 토글 */
.toggle {
  position: relative;
  border: 3px solid var(--border);
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #e0e0e0 0%, #bdbdbd 100%);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 3px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 0 rgba(0,0,0,0.2);
}

.toggle:focus {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}

/* Sizes */
.toggle-small {
  width: 2.8rem;
  height: 1.4rem;
}

.toggle-small .toggle-thumb {
  width: 1rem;
  height: 1rem;
}

.toggle-medium {
  width: 3.4rem;
  height: 1.7rem;
}

.toggle-medium .toggle-thumb {
  width: 1.3rem;
  height: 1.3rem;
}

.toggle-large {
  width: 4rem;
  height: 2rem;
}

.toggle-large .toggle-thumb {
  width: 1.6rem;
  height: 1.6rem;
}

/* Thumb */
.toggle-thumb {
  display: block;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
  transition: transform var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.8);
  border: 2px solid var(--border);
}

/* Active */
.toggle-active {
  background: linear-gradient(180deg, #5DFF5D 0%, var(--success) 100%);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 0 rgba(0,0,0,0.2), 0 0 10px rgba(50, 205, 50, 0.4);
}

.toggle-small.toggle-active .toggle-thumb {
  transform: translateX(1.4rem);
}

.toggle-medium.toggle-active .toggle-thumb {
  transform: translateX(1.7rem);
}

.toggle-large.toggle-active .toggle-thumb {
  transform: translateX(2rem);
}

/* Disabled */
.toggle-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

@media (max-width: 480px) {
  .toggle {
    border-width: 2px;
  }

  .toggle-thumb {
    border-width: 2px;
  }
}
</style>
