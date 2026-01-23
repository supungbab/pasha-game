<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  fullWidth: false
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-full': fullWidth, 'btn-disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font-family: inherit;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  touch-action: manipulation;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:active:not(.btn-disabled) {
  transform: scale(0.95);
}

/* Variants */
.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background: #ff5252;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.btn-secondary {
  background: var(--secondary);
  color: white;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: #3bb5ad;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover:not(.btn-disabled) {
  background: #45a049;
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  background: #da190b;
}

/* Sizes */
.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.25rem;
}

/* Full Width */
.btn-full {
  width: 100%;
}

/* Disabled */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
