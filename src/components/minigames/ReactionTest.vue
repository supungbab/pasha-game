<template>
  <div class="reaction-test">
    <div class="game-area" :class="gameState" @touchstart.prevent="handleClick">
      <div class="signal-box">
        <div v-if="gameState === 'waiting'" class="message">
          <div class="emoji">⏱️</div>
          <div class="text">준비하세요...</div>
        </div>

        <div v-else-if="gameState === 'ready'" class="message">
          <div class="emoji red">🟥</div>
          <div class="text">대기...</div>
        </div>

        <div v-else-if="gameState === 'go'" class="message">
          <div class="emoji green">🟢</div>
          <div class="text shake">지금 탭!</div>
        </div>

        <div v-else-if="gameState === 'result'" class="message">
          <div class="emoji">{{ resultEmoji }}</div>
          <div class="text">{{ reactionTime }}ms</div>
          <div class="subtext">{{ resultText }}</div>
        </div>

        <div v-else-if="gameState === 'tooEarly'" class="message">
          <div class="emoji">❌</div>
          <div class="text">너무 빨라요!</div>
        </div>
      </div>
    </div>

    <div class="stats">
      <div class="round-info">
        라운드: {{ currentRound }} / {{ totalRounds }}
      </div>
      <div v-if="bestTime" class="best-time">
        최고 기록: {{ bestTime }}ms
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

// 게임 상태
const gameState = ref<GameState>('waiting');
const currentRound = ref(1);
const reactionTime = ref(0);
const reactionTimes = ref<number[]>([]);
const bestTime = ref<number | null>(null);

let goTimestamp = 0;
let timeoutId: number | null = null;
let gameCompleted = false;

// 난이도별 라운드 수
const totalRounds = computed(() => {
  return Math.min(3 + props.difficulty, 7);
});

// 결과 이모지
const resultEmoji = computed(() => {
  if (reactionTime.value < 200) return '🔥';
  if (reactionTime.value < 300) return '⚡';
  if (reactionTime.value < 400) return '👍';
  if (reactionTime.value < 500) return '👌';
  return '🙂';
});

// 결과 텍스트
const resultText = computed(() => {
  if (reactionTime.value < 200) return '엄청 빠름!';
  if (reactionTime.value < 300) return '매우 빠름!';
  if (reactionTime.value < 400) return '빠름!';
  if (reactionTime.value < 500) return '보통';
  return '느림';
});

// 클릭 핸들러
function handleClick() {
  if (gameCompleted) return;

  if (gameState.value === 'ready') {
    // 너무 일찍 클릭
    gameState.value = 'tooEarly';
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
      nextRound();
    }, 1500);

  } else if (gameState.value === 'go') {
    // 정상 반응
    const now = Date.now();
    const rt = now - goTimestamp;
    reactionTime.value = rt;
    reactionTimes.value.push(rt);

    // 최고 기록 업데이트
    if (!bestTime.value || rt < bestTime.value) {
      bestTime.value = rt;
    }

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    gameState.value = 'result';

    setTimeout(() => {
      if (currentRound.value >= totalRounds.value) {
        completeGame();
      } else {
        nextRound();
      }
    }, 1500);
  }
}

// 다음 라운드
function nextRound() {
  if (gameCompleted) return;

  currentRound.value++;
  if (currentRound.value > totalRounds.value) {
    completeGame();
    return;
  }

  startRound();
}

// 라운드 시작
function startRound() {
  gameState.value = 'ready';

  // 랜덤 대기 시간 (1~3초)
  const waitTime = 1000 + Math.random() * 2000;

  timeoutId = window.setTimeout(() => {
    if (!gameCompleted) {
      gameState.value = 'go';
      goTimestamp = Date.now();

      // 3초 내에 반응 없으면 다음 라운드
      timeoutId = window.setTimeout(() => {
        if (gameState.value === 'go' && !gameCompleted) {
          reactionTime.value = 999;
          reactionTimes.value.push(999);
          gameState.value = 'result';

          setTimeout(() => {
            if (currentRound.value >= totalRounds.value) {
              completeGame();
            } else {
              nextRound();
            }
          }, 1500);
        }
      }, 3000);
    }
  }, waitTime);
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  // 평균 반응 시간 계산
  const validTimes = reactionTimes.value.filter(t => t < 999);
  const avgTime = validTimes.length > 0
    ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
    : 999;

  // 점수 계산: 반응 속도가 빠를수록 높은 점수
  // 100ms = 100점, 200ms = 75점, 300ms = 50점, 500ms = 25점, 그 이상 = 10점
  const scorePerTime = validTimes.map(t => {
    if (t < 150) return 100;
    if (t < 250) return 75;
    if (t < 350) return 50;
    if (t < 500) return 25;
    return 10;
  });

  const totalScore = scorePerTime.reduce((a, b) => a + b, 0);

  const result: MiniGameResult = {
    success: avgTime < 500,
    score: totalScore,
    timeRemaining: 0,
    accuracy: validTimes.length / totalRounds.value
  };

  setTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  // 초기 대기 후 첫 라운드 시작
  setTimeout(() => {
    if (!gameCompleted) {
      startRound();
    }
  }, 1000);
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.reaction-test {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
}

.game-area {
  width: 100%;
  height: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game-area.waiting {
  background-color: rgba(255, 255, 255, 0.1);
}

.game-area.ready {
  background-color: rgba(220, 53, 69, 0.3);
}

.game-area.go {
  background-color: rgba(40, 167, 69, 0.3);
  animation: flash 0.5s ease-in-out;
}

@keyframes flash {
  0%, 100% {
    background-color: rgba(40, 167, 69, 0.3);
  }
  50% {
    background-color: rgba(40, 167, 69, 0.6);
  }
}

.game-area.result {
  background-color: rgba(255, 193, 7, 0.2);
}

.game-area.tooEarly {
  background-color: rgba(220, 53, 69, 0.4);
}

.signal-box {
  width: 90%;
  max-width: 400px;
  padding: 60px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.emoji {
  font-size: 100px;
  animation: float 2s ease-in-out infinite;
}

.emoji.red {
  animation: pulse-red 1s ease-in-out infinite;
}

.emoji.green {
  animation: pulse-green 0.5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-red {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

@keyframes pulse-green {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.15);
    filter: brightness(1.3);
  }
}

.text {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
}

.text.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.subtext {
  font-size: 20px;
  font-weight: 600;
  color: #6c757d;
  margin-top: -10px;
}

.stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.round-info {
  font-size: 20px;
  font-weight: 700;
  color: white;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.best-time {
  font-size: 18px;
  font-weight: 600;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
