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
/* 🎮 비시바시 스타일 카드 */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  border: 4px solid var(--border);
  position: relative;
  overflow: hidden;
}

/* 상단 레인보우 라인 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg,
    var(--primary) 0%,
    var(--accent) 25%,
    var(--secondary) 50%,
    var(--purple, #AF52DE) 75%,
    var(--primary) 100%
  );
  background-size: 200% 100%;
  animation: rainbow-slide 3s linear infinite;
}

@keyframes rainbow-slide {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

/* Padding */
.card-padding-none {
  padding: 0;
  padding-top: 5px;
}

.card-padding-small {
  padding: var(--spacing-sm);
  padding-top: calc(var(--spacing-sm) + 5px);
}

.card-padding-medium {
  padding: var(--spacing-md);
  padding-top: calc(var(--spacing-md) + 5px);
}

.card-padding-large {
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 5px);
}

/* Elevation - 더 팝한 그림자 */
.card-elevation-low {
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3), 0 6px 15px rgba(0, 0, 0, 0.1);
}

.card-elevation-medium {
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.35), 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-elevation-high {
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.4), 0 15px 35px rgba(0, 0, 0, 0.2);
}

/* Clickable */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:hover {
  transform: translateY(-4px) translateX(-2px);
  box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.4), 0 20px 40px rgba(0, 0, 0, 0.25);
}

.card-clickable:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Header */
.card-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 3px solid var(--border);
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: bold;
  color: var(--text-primary);
}

/* Body */
.card-body {
  flex: 1;
  color: var(--text-primary);
}

/* Footer */
.card-footer {
  padding-top: var(--spacing-md);
  border-top: 3px solid var(--border);
  margin-top: var(--spacing-md);
}

@media (max-width: 768px) {
  .card {
    border-width: 3px;
  }

  .card-elevation-low {
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .card-elevation-medium {
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.35), 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  .card-elevation-high {
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.4), 0 10px 25px rgba(0, 0, 0, 0.2);
  }
}
</style>
