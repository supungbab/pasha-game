<script setup lang="ts">
import { computed } from 'vue';
import type { MiniGameResult } from '@/types/minigame';
import { calculateGrade, getGradeColor } from '@/utils/difficulty';

interface Props {
  result: MiniGameResult;
  targetScore: number;
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  continue: [];
}>();

const grade = computed(() => calculateGrade(props.result.score, props.targetScore));
const gradeColor = computed(() => getGradeColor(grade.value));
const isPerfect = computed(() => props.result.perfect || grade.value === 'S');
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="result-overlay">
        <div class="result-container">
          <!-- Success/Fail Badge -->
          <div :class="['result-badge', { success: result.success, fail: !result.success }]">
            <span class="result-icon">{{ result.success ? '✓' : '✗' }}</span>
            <h2 class="result-status">
              {{ result.success ? '성공!' : '실패...' }}
            </h2>
          </div>

          <!-- Grade (if success) -->
          <div v-if="result.success" class="result-grade" :style="{ color: gradeColor }">
            <div class="grade-letter">{{ grade }}</div>
            <div v-if="isPerfect" class="perfect-label">🎉 PERFECT! 🎉</div>
          </div>

          <!-- Score Details -->
          <div class="result-details">
            <div class="detail-item">
              <span class="detail-label">획득 점수</span>
              <span class="detail-value score">{{ result.score }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">목표 점수</span>
              <span class="detail-value">{{ targetScore }}</span>
            </div>

            <div v-if="result.accuracy !== undefined" class="detail-item">
              <span class="detail-label">정확도</span>
              <span class="detail-value">{{ result.accuracy.toFixed(1) }}%</span>
            </div>

            <div v-if="result.count !== undefined" class="detail-item">
              <span class="detail-label">성공 횟수</span>
              <span class="detail-value">{{ result.count }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">남은 시간</span>
              <span class="detail-value">{{ result.timeRemaining.toFixed(1) }}초</span>
            </div>
          </div>

          <!-- Continue Button -->
          <button class="continue-button" @click="emit('continue')">
            계속하기
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.result-container {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid #FFF8DC;
}

.result-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.result-badge.success {
  color: #4CAF50;
}

.result-badge.fail {
  color: #F44336;
}

.result-icon {
  font-size: 64px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: currentColor;
  color: white;
}

.result-status {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #212121;
}

.result-grade {
  margin-bottom: 24px;
}

.grade-letter {
  font-size: 80px;
  font-weight: 700;
  line-height: 1;
}

.perfect-label {
  font-size: 20px;
  font-weight: 700;
  margin-top: 8px;
}

.result-details {
  background: #F5F5F5;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #E0E0E0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #757575;
}

.detail-value {
  font-size: 18px;
  font-weight: 700;
  color: #212121;
}

.detail-value.score {
  font-size: 24px;
  color: #FFD700;
}

.continue-button {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  color: #212121;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);
}

.continue-button:active {
  transform: translateY(0);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .result-container,
.modal-leave-active .result-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .result-container,
.modal-leave-to .result-container {
  transform: scale(0.9);
}
</style>
