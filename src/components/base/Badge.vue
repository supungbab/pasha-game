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
/* 🎮 비시바시 스타일 배지 */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  white-space: nowrap;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border: 2px solid var(--border);
  box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Sizes */
.badge-small {
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  border-width: 2px;
  box-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.badge-medium {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
}

.badge-large {
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  border-width: 3px;
  box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
}

/* Variants - 그라디언트로 더 화려하게 */
.badge-primary {
  background: linear-gradient(180deg, #FF6B8A 0%, var(--primary) 100%);
  color: white;
}

.badge-secondary {
  background: linear-gradient(180deg, #00F0C0 0%, var(--secondary) 100%);
  color: white;
}

.badge-success {
  background: linear-gradient(180deg, #5DFF5D 0%, var(--success) 100%);
  color: white;
}

.badge-warning {
  background: linear-gradient(180deg, #FFE066 0%, var(--warning) 100%);
  color: var(--text-dark);
  text-shadow: none;
}

.badge-error {
  background: linear-gradient(180deg, #FF6B6B 0%, var(--error) 100%);
  color: white;
}

.badge-info {
  background: linear-gradient(180deg, #5AC8FA 0%, var(--info) 100%);
  color: white;
}

/* Outlined */
.badge-outlined {
  background: rgba(255,255,255,0.9);
  border-width: 3px;
}

.badge-outlined.badge-primary {
  color: var(--primary);
  border-color: var(--primary);
}

.badge-outlined.badge-secondary {
  color: var(--secondary);
  border-color: var(--secondary);
}

.badge-outlined.badge-success {
  color: var(--success);
  border-color: var(--success);
}

.badge-outlined.badge-warning {
  color: var(--warning);
  border-color: var(--warning);
}

.badge-outlined.badge-error {
  color: var(--error);
  border-color: var(--error);
}

.badge-outlined.badge-info {
  color: var(--info);
  border-color: var(--info);
}

/* Rounded */
.badge-rounded {
  border-radius: var(--radius-full);
}
</style>
