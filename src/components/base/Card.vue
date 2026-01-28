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

function handleClick() {
  if (props.clickable) {
    emit('click');
  }
}
</script>

<template>
  <div
    :class="[
      'card',
      `card-padding-${padding}`,
      `card-elevation-${elevation}`,
      { 'card-clickable': clickable }
    ]"
    @click="handleClick"
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
  background: var(--white);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
  border: 2px solid var(--neutral-cream);
  position: relative;
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
  padding: var(--spacing-xl);
}

/* Elevation */
.card-elevation-low {
  box-shadow: var(--shadow-sm);
}

.card-elevation-medium {
  box-shadow: var(--shadow-md);
}

.card-elevation-high {
  box-shadow: var(--shadow-lg);
}

/* Clickable */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-clickable:active {
  transform: translateY(0);
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--divider-color);
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-dark);
}

/* Body */
.card-body {
  color: var(--text-medium);
}

/* Footer */
.card-footer {
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--divider-color);
  margin-top: var(--spacing-md);
}

/* Active state feedback */
.card-clickable:active {
  transform: scale(0.98);
}
</style>
