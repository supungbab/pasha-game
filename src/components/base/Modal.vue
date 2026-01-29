<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import Button from './Button.vue';

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

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    emit('close');
  }
}

function handleClose() {
  emit('close');
}

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
      <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container">
          <div v-if="title" class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <Button
              variant="danger"
              size="small"
              class="modal-close"
              @click="handleClose"
            >✕</Button>
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
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
  overflow: hidden;
}

.modal-container {
  background: var(--white);
  border-radius: var(--radius-2xl);
  max-width: 90%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  border: 2px solid var(--neutral-cream);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--radius-xl) var(--radius-2xl);
  border-bottom: 2px solid var(--divider-color);
}

.modal-title {
  margin: 0;
  font-size: var(--radius-2xl);
  font-weight: 700;
  color: var(--text-dark);
}

.modal-close {
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0;
  font-size: var(--font-lg);
  flex-shrink: 0;
}

.modal-body {
  padding: var(--radius-2xl);
  flex: 1;
  overflow: auto;
  color: var(--text-medium);
  font-size: var(--font-md);
  line-height: 1.6;
}

.modal-body p {
  margin: var(--spacing-sm) 0;
}

.modal-footer {
  padding: var(--spacing-md) var(--radius-2xl);
  border-top: 2px solid var(--divider-color);
  display: flex;
  gap: var(--spacing-md);
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

@media (max-width: 480px) {
  .modal-header {
    padding: var(--spacing-md);
  }

  .modal-title {
    font-size: var(--radius-xl);
  }

  .modal-body {
    padding: var(--spacing-md);
  }

  .modal-footer {
    padding: var(--spacing-md);
  }
}
</style>
