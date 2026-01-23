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
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  white-space: nowrap;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

/* Sizes */
.badge-small {
  padding: 0.125rem 0.5rem;
  font-size: var(--font-xs);
}

.badge-medium {
  padding: 0.25rem 0.75rem;
  font-size: var(--font-sm);
}

.badge-large {
  padding: 0.5rem 1rem;
  font-size: var(--font-md);
}

/* Variants */
.badge-primary {
  background: var(--primary);
  color: white;
}

.badge-secondary {
  background: var(--secondary);
  color: white;
}

.badge-success {
  background: var(--success);
  color: white;
}

.badge-warning {
  background: var(--warning);
  color: var(--text-dark);
}

.badge-error {
  background: var(--error);
  color: white;
}

.badge-info {
  background: var(--info);
  color: white;
}

/* Outlined */
.badge-outlined {
  background: transparent;
  border: 2px solid currentColor;
}

.badge-outlined.badge-primary {
  color: var(--primary);
}

.badge-outlined.badge-secondary {
  color: var(--secondary);
}

.badge-outlined.badge-success {
  color: var(--success);
}

.badge-outlined.badge-warning {
  color: var(--warning);
}

.badge-outlined.badge-error {
  color: var(--error);
}

.badge-outlined.badge-info {
  color: var(--info);
}

/* Rounded */
.badge-rounded {
  border-radius: var(--radius-full);
}
</style>
