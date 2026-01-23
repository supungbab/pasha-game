<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  show: boolean;
  countdown: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  continue: [];
  decline: [];
}>();

const displayCountdown = ref(props.countdown);

watch(() => props.countdown, (newValue) => {
  displayCountdown.value = newValue;
});

const handleContinue = () => {
  emit('continue');
};

const handleDecline = () => {
  emit('decline');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="continue-overlay">
        <div class="continue-container">
          <h2 class="continue-title">게임 오버</h2>

          <div class="countdown-circle">
            <svg class="countdown-svg" viewBox="0 0 100 100">
              <circle
                class="countdown-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                class="countdown-progress"
                cx="50"
                cy="50"
                r="45"
                :style="{
                  strokeDashoffset: (1 - displayCountdown / 10) * 282.7
                }"
              />
            </svg>
            <div class="countdown-number">{{ displayCountdown }}</div>
          </div>

          <p class="continue-message">
            광고를 시청하고<br />
            계속 플레이하시겠습니까?
          </p>

          <div class="continue-actions">
            <button class="btn-continue" @click="handleContinue">
              🎬 광고 시청하고 계속
            </button>
            <button class="btn-decline" @click="handleDecline">
              포기
            </button>
          </div>

          <p class="continue-note">
            {{ displayCountdown }}초 후 자동으로 종료됩니다
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.continue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 1rem;
}

.continue-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: slideUp var(--transition-normal);
}

.continue-title {
  font-size: 2rem;
  margin: 0 0 1.5rem 0;
  color: var(--error);
}

.countdown-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
}

.countdown-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 8;
}

.countdown-progress {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 282.7; /* 2 * π * 45 */
  transition: stroke-dashoffset 1s linear;
}

.countdown-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  font-weight: bold;
  color: var(--primary);
}

.continue-message {
  font-size: var(--font-lg);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.continue-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn-continue {
  width: 100%;
  padding: 1rem;
  font-size: var(--font-md);
  font-weight: bold;
  background: var(--success);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-continue:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-continue:active {
  transform: translateY(0);
}

.btn-decline {
  width: 100%;
  padding: 0.75rem;
  font-size: var(--font-sm);
  font-weight: normal;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-decline:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--error);
  border-color: var(--error);
}

.continue-note {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
