<script setup lang="ts">
import { useAudio } from '@/composables';

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  noSound?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  fullWidth: false,
  noSound: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent | TouchEvent];
}>();

const { playSoundEffect, vibrate } = useAudio();

function handleClick(event: MouseEvent) {
  if (props.disabled) return;

  if (!props.noSound) {
    playSoundEffect('tap');
    vibrate(20);
  }

  emit('click', event);
}

function handleTouchStart(event: TouchEvent) {
  if (props.disabled) return;
  event.preventDefault();
  (event.target as HTMLElement).classList.add('btn-pressed');
  vibrate(10);
}

function handleTouchEnd(event: TouchEvent) {
  event.preventDefault();
  (event.target as HTMLElement).classList.remove('btn-pressed');
}
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      {
        'btn-full': fullWidth,
        'btn-disabled': disabled,
      }
    ]"
    :disabled="disabled"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font-family: inherit;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55),
              box-shadow 0.2s ease;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
  overflow: hidden;
}

.btn:hover:not(.btn-disabled) {
  transform: translateY(-3px) scale(1.02);
}

.btn:active:not(.btn-disabled),
.btn.btn-pressed:not(.btn-disabled) {
  transform: translateY(2px) scale(0.95);
  transition: transform 0.1s ease;
}

/* Variants */
.btn-primary {
  background: var(--gradient-primary);
  color: var(--text-dark);
  box-shadow: var(--shadow-primary), 0 4px 0 rgba(200, 160, 0, 0.5);
}

.btn-primary:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-primary-hover), 0 6px 0 rgba(200, 160, 0, 0.5);
}

.btn-primary:active:not(.btn-disabled),
.btn-primary.btn-pressed:not(.btn-disabled) {
  box-shadow: var(--shadow-primary), 0 1px 0 rgba(200, 160, 0, 0.5);
}

.btn-secondary {
  background: var(--gradient-cyan);
  color: var(--white);
  box-shadow: var(--shadow-cyan), 0 4px 0 rgba(0, 120, 140, 0.5);
}

.btn-secondary:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan-hover), 0 6px 0 rgba(0, 120, 140, 0.5);
}

.btn-secondary:active:not(.btn-disabled),
.btn-secondary.btn-pressed:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan), 0 1px 0 rgba(0, 120, 140, 0.5);
}

.btn-success {
  background: var(--gradient-success);
  color: var(--white);
  box-shadow: var(--shadow-success), 0 4px 0 rgba(40, 110, 40, 0.5);
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-success-hover), 0 6px 0 rgba(40, 110, 40, 0.5);
}

.btn-success:active:not(.btn-disabled),
.btn-success.btn-pressed:not(.btn-disabled) {
  box-shadow: var(--shadow-success), 0 1px 0 rgba(40, 110, 40, 0.5);
}

.btn-danger {
  background: var(--gradient-danger);
  color: var(--white);
  box-shadow: var(--shadow-danger), 0 4px 0 rgba(160, 30, 30, 0.5);
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-danger-hover), 0 6px 0 rgba(160, 30, 30, 0.5);
}

.btn-danger:active:not(.btn-disabled),
.btn-danger.btn-pressed:not(.btn-disabled) {
  box-shadow: var(--shadow-danger), 0 1px 0 rgba(160, 30, 30, 0.5);
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
  box-shadow: none !important;
}
</style>
