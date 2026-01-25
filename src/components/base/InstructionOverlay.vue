<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  instruction: string;
  emoji: string;
  duration?: number;
  show: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1500
});

const emit = defineEmits<{
  complete: [];
}>();

const isVisible = ref(false);

onMounted(() => {
  if (props.show) {
    isVisible.value = true;

    setTimeout(() => {
      isVisible.value = false;
      setTimeout(() => {
        emit('complete');
      }, 300); // Wait for fade out animation
    }, props.duration);
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible && show" class="instruction-overlay">
        <div class="instruction-content">
          <div class="instruction-emoji">{{ emoji }}</div>
          <h2 class="instruction-text">{{ instruction }}</h2>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.instruction-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.instruction-content {
  text-align: center;
  color: white;
}

.instruction-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  animation: pulse 1s ease-in-out infinite;
}

.instruction-text {
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  margin: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
