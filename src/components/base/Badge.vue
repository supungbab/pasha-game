<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  outlined?: boolean;
  rounded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  outlined: false,
  rounded: false
});
</script>

<template>
  <span
    :class="[
      'badge',
      `badge-${variant}`,
      `badge-${size}`,
      { 'badge-outlined': outlined, 'badge-rounded': rounded }
    ]"
  >
    <slot />
  </span>
</template>

<style scoped>
/* 캐주얼 미니게임 배지 */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  white-space: nowrap;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: none;
}

/* Sizes */
.badge-small {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 8px;
}

.badge-medium {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 12px;
}

.badge-large {
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 16px;
}

/* Variants */
.badge-primary {
  background: #FFD700;
  color: #212121;
}

.badge-secondary {
  background: #00BCD4;
  color: #FFFFFF;
}

.badge-success {
  background: #4CAF50;
  color: #FFFFFF;
}

.badge-warning {
  background: #FFC107;
  color: #212121;
}

.badge-error {
  background: #F44336;
  color: #FFFFFF;
}

.badge-info {
  background: #00BCD4;
  color: #FFFFFF;
}

/* Outlined */
.badge-outlined {
  background: transparent;
  border: 2px solid;
}

.badge-outlined.badge-primary {
  color: #FFD700;
  border-color: #FFD700;
}

.badge-outlined.badge-secondary {
  color: #00BCD4;
  border-color: #00BCD4;
}

.badge-outlined.badge-success {
  color: #4CAF50;
  border-color: #4CAF50;
}

.badge-outlined.badge-warning {
  color: #FFC107;
  border-color: #FFC107;
}

.badge-outlined.badge-error {
  color: #F44336;
  border-color: #F44336;
}

.badge-outlined.badge-info {
  color: #00BCD4;
  border-color: #00BCD4;
}

/* Rounded */
.badge-rounded {
  border-radius: 999px;
}
</style>
