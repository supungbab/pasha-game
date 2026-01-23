<script setup lang="ts">
interface Props {
  title?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: 'low' | 'medium' | 'high';
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'medium',
  elevation: 'medium',
  clickable: false
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <div
    :class="[
      'card',
      `card-padding-${padding}`,
      `card-elevation-${elevation}`,
      { 'card-clickable': clickable }
    ]"
    @click="clickable && emit('click')"
  >
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

/* Padding */
.card-padding-none {
  padding: 0;
}

.card-padding-small {
  padding: var(--spacing-sm);
}

.card-padding-medium {
  padding: var(--spacing-md);
}

.card-padding-large {
  padding: var(--spacing-lg);
}

/* Elevation */
.card-elevation-low {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-elevation-medium {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-elevation-high {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* Clickable */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-clickable:active {
  transform: translateY(0);
}

/* Header */
.card-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: bold;
}

/* Body */
.card-body {
  flex: 1;
}

/* Footer */
.card-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border);
  margin-top: var(--spacing-md);
}
</style>
