<template>
  <Teleport to="body">
    <div class="score-popups-container">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="juicy-score-popup"
        :class="popup.type"
        :style="{
          left: `${popup.x}px`,
          top: `${popup.y}px`,
        }"
      >
        {{ popup.text }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ScorePopupType } from '@/composables/useJuicyFeedback';

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  type: ScorePopupType;
}

defineProps<{
  popups: ScorePopup[];
}>();
</script>

<style scoped>
.score-popups-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}
</style>
