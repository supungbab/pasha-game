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
.toggle {
  position: relative;
  border: none;
  border-radius: var(--radius-full);
  background: var(--border);
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: 2px;
}

.toggle:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Sizes */
.toggle-small {
  width: 2.5rem;
  height: 1.25rem;
}

.toggle-small .toggle-thumb {
  width: 1rem;
  height: 1rem;
}

.toggle-medium {
  width: 3rem;
  height: 1.5rem;
}

.toggle-medium .toggle-thumb {
  width: 1.25rem;
  height: 1.25rem;
}

.toggle-large {
  width: 3.5rem;
  height: 1.75rem;
}

.toggle-large .toggle-thumb {
  width: 1.5rem;
  height: 1.5rem;
}

/* Thumb */
.toggle-thumb {
  display: block;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Active */
.toggle-active {
  background: var(--success);
}

.toggle-small.toggle-active .toggle-thumb {
  transform: translateX(1.25rem);
}

.toggle-medium.toggle-active .toggle-thumb {
  transform: translateX(1.5rem);
}

.toggle-large.toggle-active .toggle-thumb {
  transform: translateX(1.75rem);
}

/* Disabled */
.toggle-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
