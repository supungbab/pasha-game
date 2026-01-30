<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();

const emit = defineEmits<{
  resume: [];
  exit: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div class="pause-overlay" @touchstart.prevent>
        <div class="pause-modal">
          <div class="pause-icon">⏸️</div>
          <h2 class="pause-title">{{ title || '일시정지' }}</h2>
          <p v-if="subtitle" class="pause-subtitle">{{ subtitle }}</p>
          <div class="pause-actions">
            <button class="pause-btn resume" @touchstart.prevent="emit('resume')">
              ▶️ 계속하기
            </button>
            <button class="pause-btn exit" @touchstart.prevent="emit('exit')">
              🏠 나가기
            </button>
          </div>
        </div>
      </div>
  </Teleport>
</template>

<style scoped>
.pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.pause-modal {
  background: white;
  border-radius: var(--radius-xl, 20px);
  padding: 2rem;
  text-align: center;
  min-width: 280px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.pause-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.pause-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark, #212121);
  margin: 0 0 0.5rem 0;
}

.pause-subtitle {
  font-size: 1rem;
  color: var(--text-light, #757575);
  margin: 0 0 1.5rem 0;
}

.pause-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pause-btn {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-lg, 16px);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pause-btn.resume {
  background: linear-gradient(180deg, #4CAF50 0%, #43A047 100%);
  color: white;
  box-shadow: 0 4px 0 #2E7D32;
}

.pause-btn.resume:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #2E7D32;
}

.pause-btn.exit {
  background: linear-gradient(180deg, #F5F5F5 0%, #E0E0E0 100%);
  color: #424242;
  box-shadow: 0 4px 0 #BDBDBD;
}

.pause-btn.exit:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #BDBDBD;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
