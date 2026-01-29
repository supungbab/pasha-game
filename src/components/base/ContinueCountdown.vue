<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from './Button.vue';

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
            <Button variant="success" size="large" full-width @click="handleContinue">
              🎬 광고 시청하고 계속
            </Button>
            <Button variant="secondary" size="medium" full-width @click="handleDecline">
              포기
            </Button>
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.continue-container {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid #FFF8DC;
}

.continue-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #F44336;
}

.countdown-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 24px;
}

.countdown-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.countdown-bg {
  fill: none;
  stroke: #F5F5F5;
  stroke-width: 8;
}

.countdown-progress {
  fill: none;
  stroke: #FFD700;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 282.7;
  transition: stroke-dashoffset 1s linear;
}

.countdown-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  font-weight: 700;
  color: #FFD700;
}

.continue-message {
  font-size: 18px;
  margin: 0 0 24px 0;
  line-height: 1.6;
  color: #424242;
}

.continue-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.continue-note {
  font-size: 12px;
  color: #757575;
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
</style>
