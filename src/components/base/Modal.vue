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
/* 🎮 비시바시 스타일 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 1rem;
  overflow: hidden;
}

.modal-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  max-width: 90%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.4), 0 15px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  border: 4px solid var(--border);
  position: relative;
}

/* 상단 레인보우 라인 */
.modal-container::before {
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  padding-top: calc(1.25rem + 5px);
  border-bottom: 3px solid var(--border);
  background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%);
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-primary);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-close {
  background: linear-gradient(180deg, #FF6B6B 0%, var(--error) 100%);
  border: 3px solid var(--border);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  color: white;
  box-shadow: 0 3px 0 rgba(0,0,0,0.3);
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.modal-close:hover {
  box-shadow: 0 3px 0 rgba(0,0,0,0.3), 0 5px 15px rgba(255, 59, 48, 0.4);
}

.modal-close:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.3);
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
}

.modal-body p {
  margin: 0.5rem 0;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 3px solid var(--border);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%);
}

/* Transitions - 팝한 애니메이션 */
.modal-enter-active {
  animation: fadeIn 0.2s ease-out;
}

.modal-leave-active {
  animation: fadeOut 0.15s ease-out;
}

.modal-enter-active .modal-container {
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-leave-active .modal-container {
  animation: popOut 0.2s ease-out;
}

@keyframes popIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes popOut {
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
  .modal-container {
    border-width: 3px;
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    padding: 1rem;
    padding-top: calc(1rem + 5px);
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
