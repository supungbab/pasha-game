<template>
  <div class="slide-puzzle">
    <div class="game-area">
      <div class="puzzle-grid" :style="gridStyle">
        <div
          v-for="(tile, index) in tiles"
          :key="index"
          class="puzzle-tile"
          :class="{
            empty: tile === 0,
            correct: isCorrectPosition(index, tile),
            pressed: getTileTouchState(index).touchId !== null && tile !== 0,
            'pressed-outside': getTileTouchState(index).touchId !== null && !getTileTouchState(index).isInside && tile !== 0
          }"
          @touchstart="handleTileTouchStart($event, index)"
          @touchmove="handleTileTouchMove($event, index)"
          @touchend="handleTileTouchEnd($event, index)"
          @touchcancel="handleTileTouchCancel(index)"
        >
          <span v-if="tile !== 0">{{ tile }}</span>
        </div>
      </div>

      <div class="stats">
        <div class="stat">이동: {{ moves }}</div>
        <Button variant="secondary" size="small" @click="shufflePuzzle">
          🔄 섞기
        </Button>
      </div>
    </div>

    <div class="ui-overlay">
      <div class="score-display">
        점수: {{ score }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import Button from '@/components/base/Button.vue';
import { useCleanupTimers } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Timer utilities
const { safeSetTimeout } = useCleanupTimers();

// 게임 상태
const tiles = ref<number[]>([]);
const moves = ref(0);
const score = ref(0);
let isSolved = false;

let gameCompleted = false;
let startTime = 0;

// Touch state for tiles
interface TouchState {
  touchId: number | null;
  isInside: boolean;
}

const tileTouchStates = reactive<Map<number, TouchState>>(new Map());

// 난이도별 그리드 크기 (3x3 또는 4x4)
const gridSize = computed(() => {
  return props.difficulty <= 3 ? 3 : 4;
});

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${gridSize.value}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize.value}, 1fr)`
  };
});

// 빈 타일의 인덱스 찾기
function getEmptyIndex(): number {
  return tiles.value.indexOf(0);
}

// 이동 가능한지 확인
function canMove(index: number): boolean {
  const emptyIndex = getEmptyIndex();
  const size = gridSize.value;

  const row = Math.floor(index / size);
  const col = index % size;
  const emptyRow = Math.floor(emptyIndex / size);
  const emptyCol = emptyIndex % size;

  // 같은 행에서 인접하거나, 같은 열에서 인접해야 함
  return (
    (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
    (col === emptyCol && Math.abs(row - emptyRow) === 1)
  );
}

// 타일 이동
function moveTile(index: number) {
  if (gameCompleted || isSolved || !canMove(index)) return;

  const emptyIndex = getEmptyIndex();

  // 타일 교환
  const temp = tiles.value[index]!;
  tiles.value[index] = tiles.value[emptyIndex]!;
  tiles.value[emptyIndex] = temp;

  moves.value++;

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }

  // 완성 체크
  if (checkSolved()) {
    handleSolved();
  }
}

// 올바른 위치인지 확인
function isCorrectPosition(index: number, tile: number): boolean {
  if (tile === 0) return true;
  return index === tile - 1;
}

// 퍼즐 완성 확인
function checkSolved(): boolean {
  for (let i = 0; i < tiles.value.length - 1; i++) {
    if (tiles.value[i] !== i + 1) return false;
  }
  return tiles.value[tiles.value.length - 1] === 0;
}

// 퍼즐 완성 처리
function handleSolved() {
  isSolved = true;

  // 점수 계산: 기본 점수 - 이동 횟수 페널티
  const baseScore = 100;
  const movePenalty = moves.value * 2;
  score.value = Math.max(baseScore - movePenalty, 20);

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate([50, 50, 50, 50, 50]);
  }

  // 게임 완료
  safeSetTimeout(() => {
    completeGame();
  }, 1000);
}

// 퍼즐 섞기
function shufflePuzzle() {
  if (gameCompleted) return;

  const size = gridSize.value;
  const totalTiles = size * size;

  // 초기화
  tiles.value = Array.from({ length: totalTiles }, (_, i) => i);

  // 랜덤 이동으로 섞기 (해결 가능한 상태 보장)
  const shuffleMoves = 100 + props.difficulty * 20;

  for (let i = 0; i < shuffleMoves; i++) {
    const emptyIndex = getEmptyIndex();
    const validMoves: number[] = [];

    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    // 상하좌우 이동 가능한 타일 찾기
    if (row > 0) validMoves.push(emptyIndex - size); // 위
    if (row < size - 1) validMoves.push(emptyIndex + size); // 아래
    if (col > 0) validMoves.push(emptyIndex - 1); // 왼쪽
    if (col < size - 1) validMoves.push(emptyIndex + 1); // 오른쪽

    if (validMoves.length > 0) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]!;
      const temp = tiles.value[emptyIndex]!;
      tiles.value[emptyIndex] = tiles.value[randomMove]!;
      tiles.value[randomMove] = temp;
    }
  }

  moves.value = 0;
  isSolved = false;
}

// Touch handling for tiles and shuffle button
function getTileTouchState(index: number): TouchState {
  if (!tileTouchStates.has(index)) {
    tileTouchStates.set(index, { touchId: null, isInside: false });
  }
  return tileTouchStates.get(index)!;
}

function isTouchInsideElement(touch: Touch, element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    touch.clientX >= rect.left &&
    touch.clientX <= rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY <= rect.bottom
  );
}

function handleTileTouchStart(event: TouchEvent, index: number) {
  const touch = event.touches[0];
  if (!touch) return;

  event.preventDefault();
  const state = getTileTouchState(index);
  state.touchId = touch.identifier;
  state.isInside = true;
}

function handleTileTouchMove(event: TouchEvent, index: number) {
  const state = getTileTouchState(index);
  if (state.touchId === null) return;

  const touch = Array.from(event.touches).find(t => t.identifier === state.touchId);
  if (!touch) return;

  const element = event.currentTarget as HTMLElement;
  state.isInside = isTouchInsideElement(touch, element);
}

function handleTileTouchEnd(event: TouchEvent, index: number) {
  const state = getTileTouchState(index);
  if (state.touchId === null) return;

  event.preventDefault();

  const touch = Array.from(event.changedTouches).find(t => t.identifier === state.touchId);
  const element = event.currentTarget as HTMLElement;

  if (touch && isTouchInsideElement(touch, element) && state.isInside) {
    moveTile(index);
  }

  state.touchId = null;
  state.isInside = false;
}

function handleTileTouchCancel(index: number) {
  const state = getTileTouchState(index);
  state.touchId = null;
  state.isInside = false;
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
    count: moves.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();
  shufflePuzzle();

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
.slide-puzzle {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-game);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.puzzle-grid {
  display: grid;
  gap: 8px;
  padding: clamp(10px, 3vw, 20px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: min(400px, 90vw);
  height: min(400px, 90vw);
  aspect-ratio: 1;
}

.puzzle-tile {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 800;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.puzzle-tile:not(.empty):hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.puzzle-tile:not(.empty):active,
.puzzle-tile:not(.empty).pressed {
  transform: scale(0.95);
}

.puzzle-tile:not(.empty).pressed-outside {
  opacity: 0.7;
  transform: scale(0.97);
}

.puzzle-tile.empty {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: default;
}

.puzzle-tile.correct {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.stats {
  display: flex;
  align-items: center;
  gap: 30px;
}

.stat {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ui-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.score-display {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-shadow: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
