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
/* 🎮 비시바시 스타일 버튼 */
.btn {
  font-family: inherit;
  font-weight: 700;
  border: 4px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  touch-action: manipulation;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:active:not(.btn-disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2);
}

/* Variants - 그라디언트로 더 화려하게 */
.btn-primary {
  background: linear-gradient(180deg, #FF6B8A 0%, var(--primary) 50%, #D91A40 100%);
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background: linear-gradient(180deg, var(--primary) 0%, #D91A40 100%);
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 12px 30px rgba(255, 45, 85, 0.5);
}

.btn-secondary {
  background: linear-gradient(180deg, #00F0C0 0%, var(--secondary) 50%, var(--secondary-dark) 100%);
  color: white;
}

.btn-secondary:hover:not(.btn-disabled) {
  background: linear-gradient(180deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 12px 30px rgba(0, 212, 170, 0.5);
}

.btn-success {
  background: linear-gradient(180deg, #5DFF5D 0%, var(--success) 50%, #228B22 100%);
  color: white;
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 12px 30px rgba(50, 205, 50, 0.5);
}

.btn-danger {
  background: linear-gradient(180deg, #FF6B6B 0%, var(--error) 50%, #CC0000 100%);
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: 0 6px 0 rgba(0,0,0,0.4), 0 12px 30px rgba(255, 59, 48, 0.5);
}

/* Sizes - 더 크고 임팩트 있게 */
.btn-small {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border-width: 3px;
  box-shadow: 0 4px 0 rgba(0,0,0,0.4), 0 6px 15px rgba(0,0,0,0.2);
}

.btn-small:active:not(.btn-disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2);
}

.btn-medium {
  padding: 0.9rem 1.8rem;
  font-size: 1.1rem;
}

.btn-large {
  padding: 1.2rem 2.5rem;
  font-size: 1.4rem;
  border-width: 5px;
  box-shadow: 0 8px 0 rgba(0,0,0,0.4), 0 12px 25px rgba(0,0,0,0.2);
}

.btn-large:active:not(.btn-disabled) {
  transform: translateY(6px);
  box-shadow: 0 2px 0 rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.2);
}

/* Full Width */
.btn-full {
  width: 100%;
}

/* Disabled */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(50%);
}

@media (max-width: 768px) {
  .btn {
    border-width: 3px;
    box-shadow: 0 4px 0 rgba(0,0,0,0.4), 0 6px 15px rgba(0,0,0,0.2);
  }

  .btn:active:not(.btn-disabled) {
    transform: translateY(3px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2);
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-width: 4px;
  }
}
</style>
