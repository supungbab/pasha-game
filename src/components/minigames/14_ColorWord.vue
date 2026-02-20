<template>
  <div class="color-word">
    <div class="game-area">
      <div class="instruction">
        글자가 아닌 <strong>색깔</strong>을 선택하세요!
      </div>

      <div class="word-display" :style="{ color: currentWord.color }">
        {{ currentWord.text }}
      </div>

      <div v-if="feedback" class="feedback" :class="feedback.type">
        {{ feedback.text }}
      </div>
    </div>

    <div class="ui-overlay">
      <div class="score-display">
        정답: {{ correctCount }}
        <span class="separator">|</span>
        점수: {{ score }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCleanupTimers, useGameButtons } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Timer utilities
const { safeSetTimeout } = useCleanupTimers();

// 색상 정의 (3개 슬롯)
interface ColorOption {
  name: string;
  value: string;
}

const colorOptions: ColorOption[] = [
  { name: '빨강', value: '#f44336' },
  { name: '파랑', value: '#2196F3' },
  { name: '초록', value: '#4CAF50' },
];

// 3-버튼 시스템
const { setButton } = useGameButtons();

// 게임 상태
interface WordDisplay {
  text: string;
  color: string;
}

const currentWord = ref<WordDisplay>({ text: '', color: '' });
const score = ref(0);
const correctCount = ref(0);
const selectedColor = ref<string | null>(null);
const feedback = ref<{ text: string; type: 'correct' | 'wrong' } | null>(null);

let gameCompleted = false;
let startTime = 0;

// 3-버튼 세팅 (색상별 배경색)
function setupButtons() {
  colorOptions.forEach((opt, i) => {
    setButton(i as 0 | 1 | 2, {
      visible: true,
      label: opt.name,
      disabled: false,
      bg: opt.value,
      border: opt.value,
      onPress: () => handleColorSelect(opt),
    });
  });
}

// 버튼 disabled 상태 토글
function setButtonsDisabled(disabled: boolean) {
  colorOptions.forEach((_, i) => {
    setButton(i as 0 | 1 | 2, { disabled });
  });
}

// 새로운 단어 생성
function generateWord() {
  // 텍스트와 색상을 다르게 설정 (스트룹 효과)
  const textIndex = Math.floor(Math.random() * colorOptions.length);
  let colorIndex = Math.floor(Math.random() * colorOptions.length);

  // 난이도 1-2는 가끔 일치하게
  if (props.difficulty <= 2 && Math.random() < 0.3) {
    colorIndex = textIndex;
  } else {
    // 텍스트와 색상이 다르도록
    while (colorIndex === textIndex) {
      colorIndex = Math.floor(Math.random() * colorOptions.length);
    }
  }

  const textOption = colorOptions[textIndex];
  const colorOption = colorOptions[colorIndex];

  if (!textOption || !colorOption) return;

  currentWord.value = {
    text: textOption.name,
    color: colorOption.value
  };
}

// 색상 선택 핸들러
function handleColorSelect(option: ColorOption) {
  if (gameCompleted || feedback.value) return;

  selectedColor.value = option.value;
  setButtonsDisabled(true);

  if (option.value === currentWord.value.color) {
    // 정답!
    correctCount.value++;
    score.value += 10;
    feedback.value = { text: '정답! 🎉', type: 'correct' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // 목표 점수 달성 확인
    if (score.value >= props.targetScore) {
      safeSetTimeout(() => {
        completeGame();
      }, 800);
      return;
    }
  } else {
    // 오답
    feedback.value = { text: '틀렸어요! 😢', type: 'wrong' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // 다음 문제
  safeSetTimeout(() => {
    feedback.value = null;
    selectedColor.value = null;
    setButtonsDisabled(false);
    generateWord();
  }, 800);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining,
    count: correctCount.value,
    accuracy: correctCount.value / Math.max(correctCount.value + 1, 1)
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  setupButtons();
  generateWord();
  startTime = Date.now();

  // 제한시간 타이머
  safeSetTimeout(() => {
    if (!gameCompleted) {
      completeGame();
    }
  }, props.timeLimit * 1000);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.color-word {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-game);
  position: relative;
  overflow: hidden;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 5vw, 40px);
  width: 90%;
  max-width: 700px;
  padding: 0 10px;
  box-sizing: border-box;
  min-height: 0;
}

.instruction {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-shadow: none;
  text-align: center;
  background: rgba(255, 255, 255, 0.85);
  padding: 15px 30px;
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.word-display {
  font-size: clamp(48px, 12vw, 96px);
  font-weight: 900;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  background: white;
  padding: clamp(20px, 5vw, 40px) clamp(30px, 8vw, 80px);
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  animation: wordPop 0.5s ease-out;
  max-width: 90%;
  text-align: center;
}

@keyframes wordPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}


.feedback {
  font-size: 36px;
  font-weight: 800;
  padding: 20px 40px;
  border-radius: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: feedbackPop 0.5s ease-out;
}

.feedback.correct {
  color: white;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: 3px solid #2e7d32;
}

.feedback.wrong {
  color: white;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: 3px solid #c62828;
}

@keyframes feedbackPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.score-display {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.separator {
  margin: 0 10px;
  opacity: 0.5;
}
</style>
