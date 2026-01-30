<template>
  <div class="rhythm-tap">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleTap"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        {{ score }} / {{ props.targetScore }}
      </div>
      <div v-if="combo > 1" class="combo">
        {{ combo }} COMBO! 🔥
      </div>
      <div v-if="judgment" class="judgment" :class="judgment.type">
        {{ judgment.text }}
      </div>
    </div>

    <div class="tap-zone">
      <div class="target-circle">⭕</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas, useCleanupTimers } from '@/composables';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult];
}>();

// Canvas setup
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { ctx, width, height, clear } = useCanvas(canvasRef, {
  width: 800,
  height: 600,
  backgroundColor: '#4a0e4e'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

// 게임 상태
const score = ref(0);
const combo = ref(0);
const judgment = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

let gameCompleted = false;
let startTime = 0;

// 판정 구역
const TARGET_Y = height - 150;
const TARGET_RADIUS = 60;
const PERFECT_THRESHOLD = 20;
const GOOD_THRESHOLD = 40;

// 노트
interface Note {
  id: number;
  x: number;
  y: number;
  speed: number;
  hit: boolean;
}

const notes = ref<Note[]>([]);
let noteIdCounter = 0;
let lastNoteTime = 0;

// 난이도별 노트 속도 및 간격
const noteSpeed = 3 + props.difficulty * 0.5;
const noteInterval = Math.max(800 - props.difficulty * 100, 400);

// 노트 생성
function createNote() {
  const x = width / 2;
  const y = -50;

  notes.value.push({
    id: noteIdCounter++,
    x,
    y,
    speed: noteSpeed,
    hit: false
  });
}

// 탭 핸들러
function handleTap() {
  if (gameCompleted) return;

  // 가장 가까운 노트 찾기
  let closestNote: Note | null = null;
  let closestDistance = Infinity;

  for (const note of notes.value) {
    if (note.hit) continue;

    const distance = Math.abs(note.y - TARGET_Y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestNote = note;
    }
  }

  if (!closestNote) return;

  // 판정
  if (closestDistance <= PERFECT_THRESHOLD) {
    // Perfect!
    score.value += 10;
    combo.value++;
    showJudgment('PERFECT! 💯', 'perfect');
    closestNote.hit = true;

    if (navigator.vibrate) {
      navigator.vibrate([30, 30, 30]);
    }
  } else if (closestDistance <= GOOD_THRESHOLD) {
    // Good
    score.value += 5;
    combo.value++;
    showJudgment('Good! 👍', 'good');
    closestNote.hit = true;

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  } else if (closestDistance <= TARGET_RADIUS + 30) {
    // Miss
    combo.value = 0;
    showJudgment('Miss! 😢', 'miss');

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    completeGame();
  }
}

// 판정 표시
function showJudgment(text: string, type: 'perfect' | 'good' | 'miss') {
  judgment.value = { text, type };
  safeSetTimeout(() => {
    judgment.value = null;
  }, 500);
}

// 업데이트
function update() {
  const now = Date.now();

  // 노트 생성
  if (now - lastNoteTime > noteInterval) {
    createNote();
    lastNoteTime = now;
  }

  // 노트 이동
  for (let i = notes.value.length - 1; i >= 0; i--) {
    const note = notes.value[i];
    if (!note) continue;
    note.y += note.speed;

    // 화면 밖으로 나가면 Miss 처리
    if (note.y > height && !note.hit) {
      notes.value.splice(i, 1);
      combo.value = 0;
      showJudgment('Miss! 😢', 'miss');
    } else if (note.hit && note.y > TARGET_Y + 100) {
      // 히트된 노트는 조금 더 내려간 후 제거
      notes.value.splice(i, 1);
    }
  }
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경 클리어
  clear();

  // 배경
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#4a0e4e');
  gradient.addColorStop(1, '#81689d');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 판정선 (가이드)
  c.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  c.lineWidth = 2;
  c.setLineDash([10, 10]);
  c.beginPath();
  c.moveTo(0, TARGET_Y);
  c.lineTo(width, TARGET_Y);
  c.stroke();
  c.setLineDash([]);

  // Perfect 구역
  c.fillStyle = 'rgba(255, 215, 0, 0.2)';
  c.fillRect(0, TARGET_Y - PERFECT_THRESHOLD, width, PERFECT_THRESHOLD * 2);

  // Good 구역
  c.fillStyle = 'rgba(76, 175, 80, 0.1)';
  c.fillRect(0, TARGET_Y - GOOD_THRESHOLD, width, GOOD_THRESHOLD * 2);

  // 노트
  for (const note of notes.value) {
    if (note.hit) {
      // 히트 이펙트
      c.globalAlpha = Math.max(0, 1 - (note.y - TARGET_Y) / 100);
      c.fillStyle = '#FFD700';
    } else {
      c.globalAlpha = 1;
      c.fillStyle = '#FF1744';
    }

    c.beginPath();
    c.arc(note.x, note.y, 30, 0, Math.PI * 2);
    c.fill();

    // 노트 내부 아이콘
    if (!note.hit) {
      c.fillStyle = 'white';
      c.font = '24px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🎵', note.x, note.y);
    }

    c.globalAlpha = 1;
  }

  // 판정 원
  c.strokeStyle = '#00BCD4';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(width / 2, TARGET_Y, TARGET_RADIUS, 0, Math.PI * 2);
  c.stroke();

  // Perfect 원
  c.strokeStyle = '#FFD700';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(width / 2, TARGET_Y, PERFECT_THRESHOLD, 0, Math.PI * 2);
  c.stroke();
}

// 게임 루프
function gameLoop() {
  if (gameCompleted) return;

  update();
  render();

  // 시간 체크
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  safeRequestAnimationFrame(gameLoop);
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
    timeRemaining
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}

onMounted(() => {
  startTime = Date.now();
  lastNoteTime = Date.now();

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.rhythm-tap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.ui-overlay {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  pointer-events: none;
}

.score-display {
  font-size: 32px;
  font-weight: 800;
  color: white;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.combo {
  font-size: 28px;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  animation: comboPulse 0.5s ease-in-out;
}

@keyframes comboPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.judgment {
  font-size: 42px;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: 16px;
  animation: judgmentPop 0.5s ease-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.judgment.perfect {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border: 3px solid #FFD700;
}

.judgment.good {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
  border: 3px solid #4CAF50;
}

.judgment.miss {
  color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  border: 3px solid #f44336;
}

@keyframes judgmentPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.tap-zone {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.target-circle {
  font-size: 100px;
  opacity: 0.5;
  animation: targetPulse 1.5s ease-in-out infinite;
}

@keyframes targetPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}
</style>
