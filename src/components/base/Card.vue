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
  background: #FFFFFF;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 2px solid #FFF8DC;
  position: relative;
  overflow: hidden;
}

/* Padding */
.card-padding-none {
  padding: 0;
}

.card-padding-small {
  padding: 8px;
}

.card-padding-medium {
  padding: 20px;
}

.card-padding-large {
  padding: 32px;
}

/* Elevation */
.card-elevation-low {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-elevation-medium {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-elevation-high {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* Clickable */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-clickable:active {
  transform: translateY(0);
}

/* Header */
.card-header {
  padding-bottom: 16px;
  border-bottom: 2px solid #F5F5F5;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #212121;
}

/* Body */
.card-body {
  flex: 1;
  color: #424242;
}

/* Footer */
.card-footer {
  padding-top: 16px;
  border-top: 2px solid #F5F5F5;
  margin-top: 16px;
}
</style>
