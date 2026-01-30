<template>
  <div class="perfect-jump">
    <canvas
      ref="canvasRef"
      @touchstart.prevent="handleJump"
    ></canvas>

    <div class="ui-overlay">
      <div class="score-display">
        점수: {{ score }}
        <span class="target">/ {{ props.targetScore }}</span>
      </div>
      <div v-if="feedback" class="feedback" :class="feedback.type">
        {{ feedback.text }}
      </div>
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
  backgroundColor: '#87CEEB'
});

// Timer utilities
const { safeSetTimeout, safeRequestAnimationFrame } = useCleanupTimers();

// 게임 상태
const score = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

let gameCompleted = false;
let startTime = 0;

// 캐릭터
interface Character {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  size: number;
}

const character: Character = {
  x: 100,
  y: 400,
  velocityY: 0,
  isJumping: false,
  size: 40
};

// 플랫폼
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  perfectZoneStart: number;
  perfectZoneWidth: number;
}

const platforms = ref<Platform[]>([]);
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

// 난이도별 플랫폼 속도
const platformSpeed = 2 + props.difficulty * 0.5;

// 플랫폼 생성
function createPlatform(): Platform {
  const width = 150 - props.difficulty * 10;
  const perfectZoneWidth = width * 0.3;
  const x = width;
  const y = 350 + Math.random() * 100;

  return {
    x,
    y,
    width,
    height: 20,
    speed: platformSpeed,
    perfectZoneStart: (width - perfectZoneWidth) / 2,
    perfectZoneWidth
  };
}

// 점프
function handleJump() {
  if (gameCompleted || character.isJumping) return;

  character.isJumping = true;
  character.velocityY = JUMP_FORCE;

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

// 착지 판정
function checkLanding() {
  if (!character.isJumping || character.velocityY < 0) return;

  for (const platform of platforms.value) {
    // 플랫폼 위에 있는지 확인
    if (
      character.y + character.size >= platform.y &&
      character.y + character.size <= platform.y + platform.height + 10 &&
      character.x + character.size > platform.x &&
      character.x < platform.x + platform.width
    ) {
      // 착지!
      character.isJumping = false;
      character.velocityY = 0;
      character.y = platform.y - character.size;

      // 착지 위치 계산
      const landingX = character.x + character.size / 2 - platform.x;
      const perfectZoneStart = platform.perfectZoneStart;
      const perfectZoneEnd = perfectZoneStart + platform.perfectZoneWidth;

      // 점수 계산
      if (landingX >= perfectZoneStart && landingX <= perfectZoneEnd) {
        // Perfect!
        score.value += 20;
        showFeedback('PERFECT! 🔥', 'perfect');
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
      } else {
        // Good
        score.value += 10;
        showFeedback('Good! 👍', 'good');
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }

      // 플랫폼 제거
      const index = platforms.value.indexOf(platform);
      if (index !== -1) {
        platforms.value.splice(index, 1);
      }

      // 목표 점수 달성 확인
      if (score.value >= props.targetScore) {
        completeGame();
      }

      return;
    }
  }

  // 바닥에 떨어짐
  if (character.y + character.size >= height - 50) {
    character.isJumping = false;
    character.velocityY = 0;
    character.y = height - 50 - character.size;
    showFeedback('Miss! 😢', 'miss');
  }
}

// 피드백 표시
function showFeedback(text: string, type: 'perfect' | 'good' | 'miss') {
  feedback.value = { text, type };
  safeSetTimeout(() => {
    feedback.value = null;
  }, 800);
}

// 업데이트
function update() {
  // 캐릭터 물리
  if (character.isJumping) {
    character.velocityY += GRAVITY;
    character.y += character.velocityY;

    checkLanding();
  }

  // 플랫폼 이동
  for (let i = platforms.value.length - 1; i >= 0; i--) {
    const platform = platforms.value[i];
    if (!platform) continue;
    platform.x -= platform.speed;

    // 화면 밖으로 나간 플랫폼 제거
    if (platform.x + platform.width < 0) {
      platforms.value.splice(i, 1);
    }
  }

  // 새 플랫폼 생성
  const lastPlatform = platforms.value[platforms.value.length - 1];
  if (platforms.value.length === 0 || (lastPlatform && lastPlatform.x < width - 300)) {
    platforms.value.push(createPlatform());
  }
}

// 렌더링
function render() {
  if (!ctx.value) return;

  const c = ctx.value;

  // 배경 클리어
  clear();

  // 배경
  c.fillStyle = '#87CEEB';
  c.fillRect(0, 0, width, height);

  // 바닥
  c.fillStyle = '#8B4513';
  c.fillRect(0, height - 50, width, 50);

  // 플랫폼
  for (const platform of platforms.value) {
    // 일반 영역
    c.fillStyle = '#D2691E';
    c.fillRect(platform.x, platform.y, platform.width, platform.height);

    // Perfect 영역
    c.fillStyle = '#FFD700';
    c.fillRect(
      platform.x + platform.perfectZoneStart,
      platform.y,
      platform.perfectZoneWidth,
      platform.height
    );

    // 테두리
    c.strokeStyle = '#8B4513';
    c.lineWidth = 2;
    c.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  // 캐릭터 (이모지)
  c.font = `${character.size}px Arial`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('🧍', character.x + character.size / 2, character.y + character.size / 2);

  // 점프 궤적 표시 (점프 중일 때)
  if (character.isJumping && character.velocityY < 0) {
    c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    c.lineWidth = 2;
    c.setLineDash([5, 5]);
    c.beginPath();
    c.moveTo(character.x + character.size / 2, character.y + character.size);

    // 간단한 포물선 예측
    let testY = character.y;
    let testVY = character.velocityY;
    for (let i = 0; i < 30; i++) {
      testVY += GRAVITY;
      testY += testVY;
      if (testY > height - 50 - character.size) break;
      c.lineTo(character.x + character.size / 2, testY);
    }
    c.stroke();
    c.setLineDash([]);
  }
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

  // 초기 플랫폼 생성
  platforms.value.push(createPlatform());

  // 캔버스 초기화 후 게임 시작
  safeSetTimeout(() => {
    gameLoop();
  }, 100);
});

// useCleanupTimers가 자동으로 모든 타이머를 정리합니다
</script>

<style scoped>
.perfect-jump {
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
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.score-display {
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
}

.target {
  font-size: 20px;
  opacity: 0.8;
}

.feedback {
  font-size: 36px;
  font-weight: 800;
  padding: 15px 30px;
  border-radius: 20px;
  animation: feedbackPop 0.8s ease-out;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.feedback.perfect {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border: 3px solid #FFD700;
}

.feedback.good {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
  border: 3px solid #4CAF50;
}

.feedback.miss {
  color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  border: 3px solid #f44336;
}

@keyframes feedbackPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
