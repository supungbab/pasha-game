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
/* 캐주얼 미니게임 카드 */
.card {
  background: var(--white);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
  border: 2px solid var(--neutral-cream);
  position: relative;
  overflow: hidden;
}

/* Padding */
.card-padding-none {
  padding: 0;
}

.card-padding-small {
  padding: var(--spacing-sm);
}

.card-padding-medium {
  padding: var(--radius-xl);
}

.card-padding-large {
  padding: 32px;
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
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--divider-color);
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--radius-xl);
  font-weight: 700;
  color: var(--text-dark);
}

/* Body */
.card-body {
  flex: 1;
  color: var(--text-medium);
}

/* Footer */
.card-footer {
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--divider-color);
  margin-top: var(--spacing-md);
}
</style>
