<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface Props {
  show: boolean;
  title?: string;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true
});

const emit = defineEmits<{
  close: [];
}>();

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close');
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div v-if="title" class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="modal-close" @click="emit('close')">✕</button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 캐주얼 미니게임 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow: hidden;
}

.modal-container {
  background: #FFFFFF;
  border-radius: 24px;
  max-width: 90%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  border: 2px solid #FFF8DC;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid #F5F5F5;
}

.modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #212121;
}

.modal-close {
  background: #F44336;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.modal-close:hover {
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  transform: translateY(-1px);
}

.modal-close:active {
  transform: translateY(0);
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow: auto;
  color: #424242;
  font-size: 16px;
  line-height: 1.6;
}

.modal-body p {
  margin: 8px 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 2px solid #F5F5F5;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active {
  animation: fadeIn 0.3s ease;
}

.modal-leave-active {
  animation: fadeOut 0.3s ease;
}

.modal-enter-active .modal-container {
  animation: scaleIn 0.3s ease;
}

.modal-leave-active .modal-container {
  animation: scaleOut 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px;
  }
}
</style>
