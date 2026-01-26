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
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  border: none;
}

/* Sizes */
.badge-small {
  padding: 4px var(--spacing-sm);
  font-size: var(--font-xs);
  border-radius: var(--radius-sm);
}

.badge-medium {
  padding: 6px var(--spacing-md);
  font-size: var(--font-sm);
  border-radius: var(--radius-md);
}

.badge-large {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-md);
  border-radius: var(--radius-lg);
}

/* Variants */
.badge-primary {
  background: var(--primary-yellow);
  color: var(--text-dark);
}

.badge-secondary {
  background: var(--cyan);
  color: var(--white);
}

.badge-success {
  background: var(--success);
  color: var(--white);
}

.badge-warning {
  background: var(--secondary-yellow);
  color: var(--text-dark);
}

.badge-error {
  background: var(--error);
  color: var(--white);
}

.badge-info {
  background: var(--cyan);
  color: var(--white);
}

/* Outlined */
.badge-outlined {
  background: transparent;
  border: 2px solid;
}

.badge-outlined.badge-primary {
  color: var(--primary-yellow);
  border-color: var(--primary-yellow);
}

.badge-outlined.badge-secondary {
  color: var(--cyan);
  border-color: var(--cyan);
}

.badge-outlined.badge-success {
  color: var(--success);
  border-color: var(--success);
}

.badge-outlined.badge-warning {
  color: var(--secondary-yellow);
  border-color: var(--secondary-yellow);
}

.badge-outlined.badge-error {
  color: var(--error);
  border-color: var(--error);
}

.badge-outlined.badge-info {
  color: var(--cyan);
  border-color: var(--cyan);
}

/* Rounded */
.badge-rounded {
  border-radius: var(--radius-full);
}
</style>
