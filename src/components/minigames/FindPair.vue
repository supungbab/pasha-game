<template>
  <div class="find-pair">
    <div class="game-board">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card"
        :class="{ flipped: card.isFlipped, matched: card.isMatched }"
        @touchstart.prevent="handleCardClick(card)"
      >
        <div class="card-inner">
          <div class="card-front">
            {{ card.emoji }}
          </div>
          <div class="card-back">
            🎴
          </div>
        </div>
      </div>
    </div>

    <div class="ui-overlay">
      <div class="score-display">
        매칭: {{ matches }} / {{ totalPairs }}
        <span class="separator">|</span>
        점수: {{ score }}
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

// 카드 타입
interface Card {
  id: number;
  emoji: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

// 게임 상태
const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]);
const matches = ref(0);
const score = ref(0);
const isChecking = ref(false);

let gameCompleted = false;
let startTime = 0;
let timeoutId: number | null = null;

// 난이도별 카드 쌍 개수
const totalPairs = computed(() => {
  return Math.min(4 + props.difficulty, 8);
});

// 이모지 세트
const emojiSet = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍'];

// 카드 초기화
function initCards() {
  const selectedEmojis = emojiSet.slice(0, totalPairs.value);
  const cardData: Array<{ emoji: string; pairId: number }> = [];

  // 카드 쌍 생성
  selectedEmojis.forEach((emoji, index) => {
    cardData.push({ emoji, pairId: index });
    cardData.push({ emoji, pairId: index });
  });

  // 셔플
  for (let i = cardData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
  }

  // Card 객체 생성
  cards.value = cardData.map((data, index) => ({
    id: index,
    emoji: data.emoji,
    pairId: data.pairId,
    isFlipped: false,
    isMatched: false
  }));
}

// 카드 클릭 핸들러
function handleCardClick(card: Card) {
  if (gameCompleted || isChecking.value) return;
  if (card.isFlipped || card.isMatched) return;
  if (flippedCards.value.length >= 2) return;

  // 카드 뒤집기
  card.isFlipped = true;
  flippedCards.value.push(card);

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // 2장이 뒤집혔으면 매칭 체크
  if (flippedCards.value.length === 2) {
    checkMatch();
  }
}

// 매칭 체크
function checkMatch() {
  isChecking.value = true;

  const [card1, card2] = flippedCards.value;

  if (card1.pairId === card2.pairId) {
    // 매칭 성공!
    setTimeout(() => {
      card1.isMatched = true;
      card2.isMatched = true;
      matches.value++;
      score.value += 15;

      // 진동 피드백
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      flippedCards.value = [];
      isChecking.value = false;

      // 모든 카드 매칭 완료 확인
      if (matches.value === totalPairs.value) {
        completeGame();
      }
    }, 500);
  } else {
    // 매칭 실패
    setTimeout(() => {
      card1.isFlipped = false;
      card2.isFlipped = false;
      flippedCards.value = [];
      isChecking.value = false;

      // 진동 피드백
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 1000);
  }
}

// 게임 완료
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const elapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - elapsed, 0);

  // 시간 보너스
  const timeBonus = Math.floor(timeRemaining * 5);
  const totalScore = score.value + timeBonus;

  const result: MiniGameResult = {
    success: totalScore >= props.targetScore,
    score: totalScore,
    timeRemaining,
    count: matches.value
  };

  setTimeout(() => {
    emit('complete', result);
  }, 800);
}

onMounted(() => {
  initCards();
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
.find-pair {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  max-width: 600px;
  width: 100%;
  padding: 20px;
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-front {
  background: white;
  transform: rotateY(180deg);
  font-size: 48px;
}

.card-back {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  font-size: 48px;
}

.card:hover:not(.flipped):not(.matched) .card-back {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.card.matched .card-front {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  animation: matchPulse 0.5s ease-out;
}

@keyframes matchPulse {
  0% {
    transform: rotateY(180deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.2);
  }
  100% {
    transform: rotateY(180deg) scale(1);
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

/* 반응형 그리드 */
@media (max-width: 600px) {
  .game-board {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}
</style>
