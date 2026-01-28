<script setup lang="ts">
import { ref } from 'vue';
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
const buttonRef = ref<HTMLButtonElement | null>(null);

// Touch state tracking (visual feedback only)
const isPressed = ref(false);
const isTouchInside = ref(false);
let touchId: number | null = null;

// Check if touch point is inside button
function isTouchInsideButton(touch: Touch): boolean {
  if (!buttonRef.value) return false;
  const rect = buttonRef.value.getBoundingClientRect();
  return (
    touch.clientX >= rect.left &&
    touch.clientX <= rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY <= rect.bottom
  );
}

// Main click handler - works for both mouse and touch
function handleClick(event: MouseEvent) {
  if (props.disabled) return;

  // Juicy feedback
  if (!props.noSound) {
    playSoundEffect('tap');
    vibrate(20);
  }

  // Add press animation class
  if (buttonRef.value) {
    buttonRef.value.classList.remove('juicy-press');
    void buttonRef.value.offsetWidth; // Force reflow
    buttonRef.value.classList.add('juicy-press');
  }

  emit('click', event);
}

// Touch start - visual feedback only
function handleTouchStart(event: TouchEvent) {
  if (props.disabled) return;

  const touch = event.touches[0];
  if (!touch) return;

  touchId = touch.identifier;
  isPressed.value = true;
  isTouchInside.value = true;

  // Small haptic feedback on touch down
  vibrate(10);
}

// Touch move - track if still inside (visual feedback)
function handleTouchMove(event: TouchEvent) {
  if (touchId === null) return;

  const touch = Array.from(event.touches).find(t => t.identifier === touchId);
  if (!touch) return;

  isTouchInside.value = isTouchInsideButton(touch);
}

// Touch end - reset visual state (click event handles action)
function handleTouchEnd() {
  isPressed.value = false;
  isTouchInside.value = false;
  touchId = null;
}

// Touch cancel - reset visual state
function handleTouchCancel() {
  isPressed.value = false;
  isTouchInside.value = false;
  touchId = null;
}
</script>

<template>
  <button
    ref="buttonRef"
    :class="[
      'btn',
      'juicy-button',
      `btn-${variant}`,
      `btn-${size}`,
      {
        'btn-full': fullWidth,
        'btn-disabled': disabled,
        'btn-pressed': isPressed,
        'btn-pressed-outside': isPressed && !isTouchInside
      }
    ]"
    :disabled="disabled"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <slot />
  </button>
</template>

<style scoped>
/* 캐주얼 미니게임 버튼 - Juicy Edition */
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

.btn:active:not(.btn-disabled) {
  transform: translateY(1px) scale(0.98);
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

.btn-primary:active:not(.btn-disabled) {
  box-shadow: var(--shadow-primary), 0 2px 0 rgba(200, 160, 0, 0.5);
}

.btn-secondary {
  background: var(--gradient-cyan);
  color: var(--white);
  box-shadow: var(--shadow-cyan), 0 4px 0 rgba(0, 120, 140, 0.5);
}

.btn-secondary:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan-hover), 0 6px 0 rgba(0, 120, 140, 0.5);
}

.btn-secondary:active:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan), 0 2px 0 rgba(0, 120, 140, 0.5);
}

.btn-success {
  background: var(--gradient-success);
  color: var(--white);
  box-shadow: var(--shadow-success), 0 4px 0 rgba(40, 110, 40, 0.5);
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-success-hover), 0 6px 0 rgba(40, 110, 40, 0.5);
}

.btn-success:active:not(.btn-disabled) {
  box-shadow: var(--shadow-success), 0 2px 0 rgba(40, 110, 40, 0.5);
}

.btn-danger {
  background: var(--gradient-danger);
  color: var(--white);
  box-shadow: var(--shadow-danger), 0 4px 0 rgba(160, 30, 30, 0.5);
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: var(--shadow-danger-hover), 0 6px 0 rgba(160, 30, 30, 0.5);
}

.btn-danger:active:not(.btn-disabled) {
  box-shadow: var(--shadow-danger), 0 2px 0 rgba(160, 30, 30, 0.5);
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

/* Touch pressed state */
.btn-pressed:not(.btn-disabled) {
  transform: translateY(2px) scale(0.95);
  transition: transform 0.1s ease;
}

.btn-pressed.btn-primary:not(.btn-disabled) {
  box-shadow: var(--shadow-primary), 0 1px 0 rgba(200, 160, 0, 0.5);
}

.btn-pressed.btn-secondary:not(.btn-disabled) {
  box-shadow: var(--shadow-cyan), 0 1px 0 rgba(0, 120, 140, 0.5);
}

.btn-pressed.btn-success:not(.btn-disabled) {
  box-shadow: var(--shadow-success), 0 1px 0 rgba(40, 110, 40, 0.5);
}

.btn-pressed.btn-danger:not(.btn-disabled) {
  box-shadow: var(--shadow-danger), 0 1px 0 rgba(160, 30, 30, 0.5);
}

/* Touch moved outside - visual hint that action won't trigger */
.btn-pressed-outside:not(.btn-disabled) {
  opacity: 0.7;
  transform: translateY(1px) scale(0.97);
}
</style>
