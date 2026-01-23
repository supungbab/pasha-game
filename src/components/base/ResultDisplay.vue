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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 1rem;
}

.result-container {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: slideUp var(--transition-normal);
}

.result-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.result-badge.success {
  color: var(--success);
}

.result-badge.fail {
  color: var(--error);
}

.result-icon {
  font-size: 4rem;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: currentColor;
  color: white;
  animation: bounce 0.5s ease-out;
}

.result-status {
  font-size: 2rem;
  margin: 0;
}

.result-grade {
  margin-bottom: 1.5rem;
}

.grade-letter {
  font-size: 5rem;
  font-weight: bold;
  line-height: 1;
  animation: pulse 0.5s ease-out;
}

.perfect-label {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 0.5rem;
  animation: bounce 1s ease-in-out infinite;
}

.result-details {
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.detail-value {
  font-size: var(--font-lg);
  font-weight: bold;
  color: var(--text-primary);
}

.detail-value.score {
  font-size: var(--font-xl);
  color: var(--primary);
}

.continue-button {
  width: 100%;
  padding: 1rem;
  font-size: var(--font-lg);
  font-weight: bold;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.continue-button:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.continue-button:active {
  transform: translateY(0);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active .result-container,
.modal-leave-active .result-container {
  transition: transform var(--transition-normal);
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
