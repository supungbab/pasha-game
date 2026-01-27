<template>
  <div class="memory-sequence">
    <div class="game-area">
      <div class="tiles-grid">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          class="tile"
          :class="{
            active: tile.isActive,
            success: tile.isSuccess,
            error: tile.isError
          }"
          :style="{ backgroundColor: tile.color }"
          @click="handleTileClick(tile)"
        >
          {{ tile.id + 1 }}
        </div>
      </div>

      <div class="status">
        <div v-if="gameState === 'watching'" class="message">
          👀 순서를 기억하세요!
        </div>
        <div v-else-if="gameState === 'playing'" class="message">
          🖐️ 순서대로 탭하세요! ({{ playerSequence.length }} / {{ sequence.length }})
        </div>
        <div v-else-if="gameState === 'waiting'" class="message">
          ⏳ 준비 중...
        </div>
      </div>
    </div>

    <div class="ui-overlay">
      <div class="score-display">
        라운드: {{ currentRound }}
        <span class="separator">|</span>
        점수: {{ score }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCleanupTimers } from '@/composables/useCleanupTimers';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// 타이머 유틸리티
const { safeSetTimeout } = useCleanupTimers();

type GameState = 'waiting' | 'watching' | 'playing';

// 타일 타입
interface Tile {
  id: number;
  color: string;
  isActive: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// 게임 상태
const gameState = ref<GameState>('waiting');
const tiles = ref<Tile[]>([]);
const sequence = ref<number[]>([]);
const playerSequence = ref<number[]>([]);
const currentRound = ref(1);
const score = ref(0);

let gameCompleted = false;
let startTime = 0;

// 난이도별 설정
const tileCount = 9; // 3x3 그리드
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B'];

// 난이도별 초기 시퀀스 길이
const initialSequenceLength = Math.min(3 + Math.floor(props.difficulty / 2), 6);

// 타일 초기화
function initTiles() {
  tiles.value = Array.from({ length: tileCount }, (_, i) => ({
    id: i,
    color: colors[i],
    isActive: false,
    isSuccess: false,
    isError: false
  }));
}

// 시퀀스 생성
function generateSequence() {
  const length = initialSequenceLength + currentRound.value - 1;
  sequence.value = [];

  for (let i = 0; i < length; i++) {
    const randomId = Math.floor(Math.random() * tileCount);
    sequence.value.push(randomId);
  }
}

// 시퀀스 표시
async function showSequence() {
  gameState.value = 'watching';

  const delay = Math.max(800 - props.difficulty * 100, 400);

  for (let i = 0; i < sequence.value.length; i++) {
    const tileId = sequence.value[i];

    // 타일 활성화
    tiles.value[tileId].isActive = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    await new Promise(resolve => setTimeout(resolve, delay));

    // 타일 비활성화
    tiles.value[tileId].isActive = false;

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 플레이어 턴 시작
  gameState.value = 'playing';
  playerSequence.value = [];
}

// 타일 클릭 핸들러
function handleTileClick(tile: Tile) {
  if (gameCompleted || gameState.value !== 'playing') return;

  const currentIndex = playerSequence.value.length;
  const expectedId = sequence.value[currentIndex];

  playerSequence.value.push(tile.id);

  if (tile.id === expectedId) {
    // 정답!
    tile.isSuccess = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    safeSetTimeout(() => {
      tile.isSuccess = false;
    }, 300);

    // 시퀀스 완성 확인
    if (playerSequence.value.length === sequence.value.length) {
      // 라운드 성공!
      score.value += 20;
      currentRound.value++;

      // 목표 점수 달성 확인
      if (score.value >= props.targetScore) {
        completeGame();
        return;
      }

      // 다음 라운드
      safeSetTimeout(() => {
        startRound();
      }, 1000);
    }
  } else {
    // 오답!
    tile.isError = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    safeSetTimeout(() => {
      tile.isError = false;
    }, 500);

    // 게임 실패
    safeSetTimeout(() => {
      completeGame();
    }, 1000);
  }
}

// 라운드 시작
async function startRound() {
  gameState.value = 'waiting';

  // 타일 초기화
  tiles.value.forEach(tile => {
    tile.isActive = false;
    tile.isSuccess = false;
    tile.isError = false;
  });

  await new Promise(resolve => setTimeout(resolve, 800));

  generateSequence();
  await showSequence();
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
    count: currentRound.value - 1
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  initTiles();
  startTime = Date.now();

  // 첫 라운드 시작
  safeSetTimeout(() => {
    startRound();
  }, 1000);

  // 제한시간 타이머
  safeSetTimeout(() => {
    if (!gameCompleted) {
      completeGame();
    }
  }, props.timeLimit * 1000);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
onUnmounted(() => {
  gameCompleted = true;
});
</script>

<style scoped>
.memory-sequence {
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
}

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.tile {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  user-select: none;
  opacity: 0.7;
}

.tile:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  opacity: 1;
}

.tile.active {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8),
              0 0 60px currentColor;
  animation: tilePulse 0.5s ease-out;
}

.tile.success {
  opacity: 1;
  transform: scale(1.15);
  box-shadow: 0 0 30px #4CAF50;
  animation: tileSuccess 0.3s ease-out;
}

.tile.error {
  opacity: 1;
  transform: scale(1.15);
  box-shadow: 0 0 30px #f44336;
  animation: tileError 0.5s ease-out;
}

@keyframes tilePulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes tileSuccess {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes tileError {
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

.status {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message {
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: messageBounce 1s ease-in-out infinite;
}

@keyframes messageBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
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
