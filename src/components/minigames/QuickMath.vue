<template>
  <div class="quick-math">
    <div class="game-area">
      <div class="question-box">
        <div class="question">
          {{ currentQuestion.text }}
        </div>
      </div>

      <div class="answers-grid">
        <button
          v-for="answer in currentQuestion.answers"
          :key="answer"
          class="answer-btn"
          :class="{
            correct: feedback && answer === currentQuestion.correct,
            wrong: feedback && answer === selectedAnswer && answer !== currentQuestion.correct
          }"
          @touchstart.prevent="handleAnswer(answer)"
          :disabled="!!feedback"
        >
          {{ answer }}
        </button>
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
import { ref, onMounted, onUnmounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// 문제 타입
interface Question {
  text: string;
  correct: number;
  answers: number[];
}

// 게임 상태
const currentQuestion = ref<Question>({ text: '', correct: 0, answers: [] });
const score = ref(0);
const correctCount = ref(0);
const selectedAnswer = ref<number | null>(null);
const feedback = ref<{ text: string; type: 'correct' | 'wrong' } | null>(null);

let gameCompleted = false;
let startTime = 0;
let timeoutId: number | null = null;

// 난이도별 문제 범위
function getNumberRange() {
  switch (props.difficulty) {
    case 1:
      return { min: 1, max: 10 };
    case 2:
      return { min: 1, max: 20 };
    case 3:
      return { min: 5, max: 30 };
    case 4:
      return { min: 10, max: 50 };
    case 5:
      return { min: 20, max: 70 };
    default:
      return { min: 30, max: 99 };
  }
}

// 문제 생성
function generateQuestion() {
  const range = getNumberRange();
  const operators = ['+', '-'];

  // 난이도 4 이상이면 곱셈도 추가
  if (props.difficulty >= 4) {
    operators.push('×');
  }

  const operator = operators[Math.floor(Math.random() * operators.length)];
  let num1: number;
  let num2: number;
  let correct: number;

  if (operator === '×') {
    // 곱셈은 작은 수로
    num1 = Math.floor(Math.random() * 10) + 2;
    num2 = Math.floor(Math.random() * 10) + 2;
    correct = num1 * num2;
  } else if (operator === '-') {
    // 뺄셈은 음수가 안 나오도록
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * num1) + 1;
    correct = num1 - num2;
  } else {
    // 덧셈
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    correct = num1 + num2;
  }

  const text = `${num1} ${operator} ${num2} = ?`;

  // 오답 생성
  const wrongAnswers: number[] = [];
  const maxDiff = Math.max(10, Math.floor(correct * 0.3));

  while (wrongAnswers.length < 3) {
    const offset = Math.floor(Math.random() * maxDiff * 2) - maxDiff;
    const wrong = correct + offset;

    if (wrong !== correct && wrong > 0 && !wrongAnswers.includes(wrong)) {
      wrongAnswers.push(wrong);
    }
  }

  // 답안 섞기
  const answers = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);

  currentQuestion.value = {
    text,
    correct,
    answers
  };
}

// 답안 선택 핸들러
function handleAnswer(answer: number) {
  if (gameCompleted || feedback.value) return;

  selectedAnswer.value = answer;

  if (answer === currentQuestion.value.correct) {
    // 정답!
    correctCount.value++;
    score.value += 15;
    feedback.value = { text: '정답! 🎉', type: 'correct' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // 오답
    feedback.value = { text: `틀렸어요! 정답: ${currentQuestion.value.correct}`, type: 'wrong' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    setTimeout(() => {
      completeGame();
    }, 1000);
    return;
  }

  // 다음 문제
  setTimeout(() => {
    feedback.value = null;
    selectedAnswer.value = null;
    generateQuestion();
  }, 1200);
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

  setTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  generateQuestion();
  startTime = Date.now();

  // 제한시간 타이머
  timeoutId = window.setTimeout(() => {
    if (!gameCompleted) {
      completeGame();
    }
  }, props.timeLimit * 1000);
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.quick-math {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 90%;
  max-width: 600px;
}

.question-box {
  background: white;
  padding: clamp(20px, 5vw, 40px) clamp(30px, 6vw, 60px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.question {
  font-size: clamp(28px, 8vw, 48px);
  font-weight: 800;
  color: #2c3e50;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.answer-btn {
  padding: clamp(15px, 4vw, 30px);
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 700;
  color: #2c3e50;
  background: white;
  border: 4px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-family: 'Courier New', monospace;
}

.answer-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border-color: #F9A825;
}

.answer-btn:active:not(:disabled) {
  transform: translateY(-2px);
}

.answer-btn:disabled {
  cursor: not-allowed;
}

.answer-btn.correct {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-color: #2e7d32;
  animation: correctPulse 0.5s ease-out;
}

.answer-btn.wrong {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border-color: #c62828;
  animation: wrongShake 0.5s ease-out;
}

@keyframes correctPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes wrongShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.feedback {
  font-size: 32px;
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
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.separator {
  margin: 0 10px;
  opacity: 0.5;
}
</style>
