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
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
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
    @click="handleClick($event)"
  >
    <slot />
  </button>
</template>

<style scoped>
/* 캐주얼 미니게임 버튼 */
.btn {
  font-family: inherit;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
  overflow: hidden;
}

.btn:hover:not(.btn-disabled) {
  transform: translateY(-2px);
}

.btn:active:not(.btn-disabled) {
  transform: translateY(0);
}

/* Variants */
.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-dark);
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-primary-hover);
}

.btn-secondary {
  background: var(--gradient-cyan);
  color: var(--white);
  box-shadow: var(--shadow-cyan);
}

.btn-secondary:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan-hover);
}

.btn-success {
  background: var(--gradient-success);
  color: var(--white);
  box-shadow: var(--shadow-success);
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-success-hover);
}

.btn-danger {
  background: var(--gradient-danger);
  color: var(--white);
  box-shadow: var(--shadow-danger);
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-danger-hover);
}

/* Sizes */
.btn-small {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-sm);
  border-radius: var(--radius-md);
}

.btn-medium {
  padding: 12px 24px;
  font-size: var(--font-md);
  border-radius: var(--radius-lg);
}

.btn-large {
  padding: var(--spacing-md) 32px;
  font-size: var(--font-lg);
  border-radius: var(--radius-xl);
}

/* Full Width */
.btn-full {
  width: 100%;
}

/* Disabled */
.btn-disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(50%);
}
</style>
