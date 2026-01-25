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
/* 캐주얼 미니게임 버튼 */
.btn {
  font-family: inherit;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  color: #212121;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.btn-primary:hover:not(.btn-disabled) {
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.btn-secondary {
  background: linear-gradient(180deg, #00BCD4 0%, #0097A7 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
}

.btn-secondary:hover:not(.btn-disabled) {
  box-shadow: 0 6px 16px rgba(0, 188, 212, 0.4);
}

.btn-success {
  background: linear-gradient(180deg, #4CAF50 0%, #388E3C 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.btn-danger {
  background: linear-gradient(180deg, #F44336 0%, #D32F2F 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.4);
}

/* Sizes */
.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 12px;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 16px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 20px;
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
</style>
