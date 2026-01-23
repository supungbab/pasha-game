# 빠샤! (PASHA!)Pasha - 컴포넌트 구조 설계

## 1. 컴포넌트 아키텍처 개요

```
App.vue
├── MainMenu.vue (메인 메뉴)
├── GamePlay.vue (게임 플레이 화면)
│   ├── GameHeader.vue (상단 UI)
│   │   ├── LifeDisplay.vue
│   │   ├── StageDisplay.vue
│   │   └── ScoreDisplay.vue
│   ├── InstructionOverlay.vue (시작 전 지시문)
│   └── MiniGameContainer.vue (미니게임 컨테이너)
│       └── [동적 미니게임 컴포넌트]
├── GameOver.vue (게임 오버 화면)
│   └── ContinueCountdown.vue (컨티뉴 카운트다운)
├── Ranking.vue (랭킹 화면)
└── Settings.vue (설정 화면)
```

---

## 2. 공통 컴포넌트 (Common Components)

### 2.1 GameCanvas.vue
**목적**: 모든 미니게임의 기본 Canvas 제공

**Props**:
```typescript
interface Props {
  width?: number;          // 기본값: 부모 컨테이너 너비
  height?: number;         // 기본값: 부모 컨테이너 높이
  backgroundColor?: string; // 기본값: '#F7FFF7'
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'tap', x: number, y: number): void;
  (e: 'swipe', direction: 'up' | 'down' | 'left' | 'right', startX: number, startY: number, endX: number, endY: number): void;
  (e: 'drag', x: number, y: number): void;
  (e: 'dragEnd', x: number, y: number): void;
}
```

**주요 기능**:
- Touch/Mouse 이벤트 통합 처리
- Swipe 제스처 감지 (최소 50px 이동)
- Canvas Context 제공
- 디바이스 픽셀 비율 대응 (Retina)

**사용 예시**:
```vue
<template>
  <GameCanvas
    :width="400"
    :height="600"
    @tap="handleTap"
    @swipe="handleSwipe"
  />
</template>
```

---

### 2.2 ScoreDisplay.vue
**목적**: 점수와 목표 점수 표시

**Props**:
```typescript
interface Props {
  currentScore: number;
  targetScore: number;
  showTarget?: boolean;    // 목표 점수 표시 여부
  animated?: boolean;      // 애니메이션 여부
}
```

**UI 구조**:
```
┌─────────────────┐
│  점수: 45 / 60  │
│  ████████░░     │ (진행 바)
└─────────────────┘
```

**주요 기능**:
- 점수 증가 시 카운트업 애니메이션
- 목표 달성률 진행 바
- 목표 달성 시 색상 변경 (초록색)

---

### 2.3 LifeDisplay.vue
**목적**: 남은 목숨 표시

**Props**:
```typescript
interface Props {
  lives: number;           // 0-3
  maxLives?: number;       // 기본값: 3
  animated?: boolean;      // 애니메이션 여부
}
```

**UI**:
```
❤️❤️❤️  (lives = 3)
❤️❤️🖤  (lives = 2)
❤️🖤🖤  (lives = 1)
🖤🖤🖤  (lives = 0)
```

**주요 기능**:
- 하트 이모지로 목숨 표시
- 목숨 차감 시 흔들림 애니메이션
- 마지막 하트는 빨간색 깜빡임

---

### 2.4 Timer.vue
**목적**: 제한시간 카운트다운

**Props**:
```typescript
interface Props {
  timeLimit: number;       // 총 시간 (초)
  paused?: boolean;        // 일시정지
  warningThreshold?: number; // 경고 표시 시간 (기본: 3초)
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'timeUp'): void;
  (e: 'warning'): void;    // 남은 시간이 경고 임계값 이하일 때
  (e: 'tick', remainingTime: number): void;
}
```

**UI**:
```
⏱️ 8.5초  (일반)
⏱️ 2.1초  (경고 - 빨간색 깜빡임)
```

**주요 기능**:
- 0.1초 단위 카운트다운
- 남은 시간 3초 이하일 때 경고 효과
- 원형 진행 바 옵션

---

### 2.5 Button.vue
**목적**: 재사용 가능한 버튼 컴포넌트

**Props**:
```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  emoji?: string;          // 버튼 앞에 표시할 이모지
}
```

**슬롯**:
```vue
<Button variant="primary" emoji="🎮">
  게임 시작
</Button>
```

**스타일**:
- primary: 밝은 파란색 배경
- secondary: 회색 배경
- danger: 빨간색 배경
- 호버 효과 및 클릭 애니메이션

---

## 3. UI 컴포넌트 (UI Components)

### 3.1 MainMenu.vue
**목적**: 메인 메뉴 화면

**컴포넌트 구성**:
```vue
<template>
  <div class="main-menu">
    <Logo />
    <Button variant="primary" @click="startGame">
      🎮 게임 시작
    </Button>
    <Button variant="secondary" @click="showRanking">
      🏆 랭킹
    </Button>
    <Button variant="secondary" @click="showSettings">
      ⚙️ 설정
    </Button>
    <HighScoreDisplay :score="highScore" />
  </div>
</template>
```

---

### 3.2 GamePlay.vue
**목적**: 게임 플레이 메인 화면

**상태 관리**:
```typescript
const gameState = useGameState();
const currentGame = ref<MiniGame | null>(null);
const showInstruction = ref(false);
const showResult = ref(false);
```

**생명주기**:
```
1. 게임 로드
2. 미니게임 선택 (랜덤)
3. 지시문 표시 (1-2초)
4. 미니게임 시작
5. 결과 평가
6. 다음 게임 or 게임 오버
```

---

### 3.3 GameHeader.vue
**목적**: 게임 플레이 중 상단 UI

**컴포넌트 구성**:
```vue
<template>
  <div class="game-header">
    <LifeDisplay :lives="lives" />
    <div class="center">
      <StageDisplay :current="currentStage" :total="30" />
      <DifficultyDisplay :level="difficulty" />
    </div>
    <ScoreDisplay :score="score" />
  </div>
</template>
```

**레이아웃**:
```
┌───────────────────────────────────┐
│ ❤️❤️❤️    판: 5/30 ⭐⭐    450점 │
└───────────────────────────────────┘
```

---

### 3.4 InstructionOverlay.vue
**목적**: 미니게임 시작 전 지시문 표시

**Props**:
```typescript
interface Props {
  instruction: string;     // "탭하세요!"
  emoji: string;          // "👆"
  duration?: number;      // 표시 시간 (ms, 기본: 2000)
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'complete'): void;  // 지시문 표시 완료
}
```

**UI**:
```
┌─────────────────┐
│                 │
│   탭하세요! 👆   │
│                 │
└─────────────────┘
```

**애니메이션**:
- Fade in (0.3초)
- 표시 (duration)
- Fade out (0.3초)

---

### 3.5 MiniGameContainer.vue
**목적**: 미니게임 동적 로딩 컨테이너

**Props**:
```typescript
interface Props {
  gameId: number;
  difficulty: number;
  timeLimit: number;
  targetScore: number;
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'complete', result: MiniGameResult): void;
  (e: 'timeUp'): void;
}
```

**주요 기능**:
- 미니게임 컴포넌트 동적 로딩
- 공통 타이머 관리
- 결과 수집 및 전달
- 난이도 파라미터 전달

---

### 3.6 GameOver.vue
**목적**: 게임 오버 화면

**Props**:
```typescript
interface Props {
  finalScore: number;
  clearedStages: number;
  canContinue: boolean;    // 컨티뉴 사용 가능 여부
}
```

**컴포넌트 구성**:
```vue
<template>
  <div class="game-over">
    <h1>GAME OVER</h1>
    <ScoreDisplay :score="finalScore" />
    <p>클리어: {{ clearedStages }}/30</p>
    
    <ContinueCountdown
      v-if="canContinue"
      @continue="handleContinue"
      @timeout="handleTimeout"
    />
    
    <Button @click="restart">처음부터 시작</Button>
    <Button @click="goToMenu">메인 메뉴</Button>
  </div>
</template>
```

---

### 3.7 ContinueCountdown.vue
**목적**: 컨티뉴 카운트다운 (10초)

**Emits**:
```typescript
interface Emits {
  (e: 'continue'): void;   // 광고 시청 선택
  (e: 'timeout'): void;    // 10초 경과
}
```

**UI**:
```
┌────────────────────────┐
│  📺 광고 보고 계속하기  │
│     ⏱️ 10초 남음        │
└────────────────────────┘
```

---

### 3.8 Ranking.vue
**목적**: 랭킹 화면

**탭 구조**:
```vue
<template>
  <div class="ranking">
    <Tabs v-model="activeTab">
      <Tab name="global">🌍 글로벌</Tab>
      <Tab name="local">📱 로컬</Tab>
    </Tabs>
    
    <RankingList
      :entries="rankings"
      :highlight-rank="myRank"
    />
  </div>
</template>
```

---

### 3.9 Settings.vue
**목적**: 설정 화면

**설정 항목**:
```vue
<template>
  <div class="settings">
    <h2>⚙️ 설정</h2>
    
    <SettingItem title="🎵 배경음악">
      <Toggle v-model="settings.bgmEnabled" />
      <Slider v-model="settings.bgmVolume" :disabled="!settings.bgmEnabled" />
    </SettingItem>
    
    <SettingItem title="🔊 효과음">
      <Toggle v-model="settings.sfxEnabled" />
      <Slider v-model="settings.sfxVolume" :disabled="!settings.sfxEnabled" />
    </SettingItem>
    
    <SettingItem title="📳 진동">
      <Toggle v-model="settings.vibrationEnabled" />
    </SettingItem>
    
    <Button @click="resetProgress">진행상황 초기화</Button>
  </div>
</template>
```

---

## 4. 미니게임 컴포넌트 (MiniGame Components)

### 4.1 미니게임 기본 구조
모든 미니게임 컴포넌트는 다음 인터페이스를 따릅니다:

```typescript
// 미니게임 Props
interface MiniGameProps {
  difficulty: number;      // 1-6
  timeLimit: number;       // 제한시간 (초)
  targetScore: number;     // 목표 점수
  isHardMode: boolean;     // 하드모드 여부
}

// 미니게임 Emits
interface MiniGameEmits {
  (e: 'complete', result: MiniGameResult): void;
}

// 결과 데이터
interface MiniGameResult {
  success: boolean;        // 목표 달성 여부
  score: number;          // 획득 점수
  timeRemaining: number;  // 남은 시간
  accuracy?: number;      // 정확도 (옵션)
  count?: number;         // 성공 횟수 (옵션)
}
```

### 4.2 미니게임 템플릿

```vue
<template>
  <GameCanvas
    ref="canvasRef"
    @tap="handleTap"
    @swipe="handleSwipe"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameAudio } from '@/composables/useGameAudio';
import { useVibration } from '@/composables/useVibration';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<MiniGameEmits>();

const canvasRef = ref<InstanceType<typeof GameCanvas>>();
const { playSound } = useGameAudio();
const { vibrate } = useVibration();

// 게임 상태
const gameState = reactive({
  score: 0,
  // ...게임별 상태
});

// 게임 시작
onMounted(() => {
  initGame();
  startGameLoop();
});

// 게임 종료
onUnmounted(() => {
  stopGameLoop();
});

// 게임 로직
function initGame() {
  // 초기화
}

function startGameLoop() {
  // 게임 루프 시작
}

function handleTap(x: number, y: number) {
  // 탭 처리
}

function handleSwipe(direction: string) {
  // 스와이프 처리
}

function completeGame() {
  const result: MiniGameResult = {
    success: gameState.score >= props.targetScore,
    score: gameState.score,
    timeRemaining: 0, // Timer에서 전달받음
  };
  emit('complete', result);
}
</script>
```

---

## 5. Composables (재사용 로직)

### 5.1 useGameState.ts
**목적**: 게임 전역 상태 관리

```typescript
export function useGameState() {
  const state = reactive<GameState>({
    currentStage: 1,
    lives: 3,
    score: 0,
    difficulty: 1,
    isHardMode: false,
    hasUsedContinue: false,
    completedGames: [],
    remainingGames: []
  });

  const initGame = () => {
    state.currentStage = 1;
    state.lives = 3;
    state.score = 0;
    state.difficulty = 1;
    state.isHardMode = false;
    state.hasUsedContinue = false;
    state.completedGames = [];
    state.remainingGames = shuffleArray([...Array(30)].map((_, i) => i + 1));
  };

  const nextStage = () => {
    state.currentStage++;
    state.difficulty = calculateDifficulty(state.currentStage);
    state.isHardMode = shouldBeHardMode();
  };

  const loseLife = () => {
    state.lives--;
  };

  const addScore = (points: number) => {
    state.score += points;
  };

  const useContinue = () => {
    if (!state.hasUsedContinue) {
      state.lives = 3;
      state.hasUsedContinue = true;
      return true;
    }
    return false;
  };

  return {
    state: readonly(state),
    initGame,
    nextStage,
    loseLife,
    addScore,
    useContinue
  };
}
```

---

### 5.2 useGameAudio.ts
**목적**: 사운드 관리

```typescript
export function useGameAudio() {
  const settings = useAudioSettings();
  
  // 사운드 파일 (Web Audio API 사용)
  const sounds = {
    bgm: new Audio(),
    click: new Audio(),
    success: new Audio(),
    fail: new Audio(),
    warning: new Audio(),
    gameOver: new Audio()
  };

  const playSound = (soundName: keyof typeof sounds) => {
    if (!settings.value.sfxEnabled) return;
    
    const sound = sounds[soundName];
    sound.volume = settings.value.sfxVolume / 100;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const playBGM = () => {
    if (!settings.value.bgmEnabled) return;
    
    sounds.bgm.loop = true;
    sounds.bgm.volume = settings.value.bgmVolume / 100;
    sounds.bgm.play().catch(() => {});
  };

  const stopBGM = () => {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
  };

  return {
    playSound,
    playBGM,
    stopBGM
  };
}
```

---

### 5.3 useVibration.ts
**목적**: 진동 피드백 관리

```typescript
export function useVibration() {
  const settings = useVibrationSettings();

  const vibrate = (pattern: number | number[]) => {
    if (!settings.value.vibrationEnabled) return;
    if (!navigator.vibrate) return;
    
    navigator.vibrate(pattern);
  };

  const vibrateSuccess = () => vibrate([50, 50, 50]);
  const vibrateFail = () => vibrate(200);
  const vibrateWarning = () => vibrate([100, 50, 100, 50, 100]);
  const vibrateStart = () => vibrate(100);

  return {
    vibrate,
    vibrateSuccess,
    vibrateFail,
    vibrateWarning,
    vibrateStart
  };
}
```

---

### 5.4 useCanvas.ts
**목적**: Canvas 렌더링 헬퍼

```typescript
export function useCanvas(canvasRef: Ref<HTMLCanvasElement | undefined>) {
  const ctx = computed(() => canvasRef.value?.getContext('2d'));

  const clear = () => {
    if (!ctx.value || !canvasRef.value) return;
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  };

  const drawEmoji = (emoji: string, x: number, y: number, size: number) => {
    if (!ctx.value) return;
    ctx.value.font = `${size}px Arial`;
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText(emoji, x, y);
  };

  const drawCircle = (x: number, y: number, radius: number, color: string) => {
    if (!ctx.value) return;
    ctx.value.beginPath();
    ctx.value.arc(x, y, radius, 0, Math.PI * 2);
    ctx.value.fillStyle = color;
    ctx.value.fill();
  };

  const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
    if (!ctx.value) return;
    ctx.value.fillStyle = color;
    ctx.value.fillRect(x, y, width, height);
  };

  const drawText = (text: string, x: number, y: number, size: number, color: string) => {
    if (!ctx.value) return;
    ctx.value.font = `${size}px Arial`;
    ctx.value.fillStyle = color;
    ctx.value.textAlign = 'center';
    ctx.value.fillText(text, x, y);
  };

  return {
    ctx,
    clear,
    drawEmoji,
    drawCircle,
    drawRect,
    drawText
  };
}
```

---

### 5.5 useTimer.ts
**목적**: 타이머 관리

```typescript
export function useTimer(duration: number) {
  const remainingTime = ref(duration);
  const isRunning = ref(false);
  let intervalId: number | null = null;

  const start = () => {
    if (isRunning.value) return;
    
    isRunning.value = true;
    intervalId = window.setInterval(() => {
      remainingTime.value -= 0.1;
      
      if (remainingTime.value <= 0) {
        stop();
        remainingTime.value = 0;
      }
    }, 100);
  };

  const stop = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning.value = false;
  };

  const reset = (newDuration?: number) => {
    stop();
    remainingTime.value = newDuration ?? duration;
  };

  onUnmounted(() => {
    stop();
  });

  return {
    remainingTime: readonly(remainingTime),
    isRunning: readonly(isRunning),
    start,
    stop,
    reset
  };
}
```

---

## 6. 유틸리티 함수

### 6.1 difficulty.ts
```typescript
export function calculateDifficulty(stage: number): number {
  return Math.ceil(stage / 5);
}

export function shouldBeHardMode(): boolean {
  return Math.random() < 0.12; // 12% 확률
}

export function getDifficultyMultiplier(difficulty: number): number {
  const multipliers = [1.0, 1.2, 1.5, 1.8, 2.2, 2.5];
  return multipliers[difficulty - 1] || 1.0;
}

export function adjustTimeLimit(baseTime: number, difficulty: number): number {
  const multiplier = 1 - (difficulty - 1) * 0.1; // 난이도당 10% 감소
  return Math.max(baseTime * multiplier, baseTime * 0.5); // 최소 50%
}

export function adjustTargetScore(baseScore: number, difficulty: number): number {
  return Math.floor(baseScore * getDifficultyMultiplier(difficulty));
}
```

---

### 6.2 random.ts
```typescript
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomColor(): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
  return randomChoice(colors);
}
```

---

### 6.3 storage.ts
```typescript
export function saveHighScore(score: number) {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem('highScore', score.toString());
  }
}

export function getHighScore(): number {
  return parseInt(localStorage.getItem('highScore') || '0');
}

export function saveSettings(settings: AudioSettings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

export function getSettings(): AudioSettings {
  const stored = localStorage.getItem('settings');
  return stored ? JSON.parse(stored) : getDefaultSettings();
}

export function saveLocalRanking(entry: RankingEntry) {
  const rankings = getLocalRankings();
  rankings.push(entry);
  rankings.sort((a, b) => b.score - a.score);
  rankings.splice(10); // 상위 10개만 보관
  localStorage.setItem('localRankings', JSON.stringify(rankings));
}

export function getLocalRankings(): RankingEntry[] {
  const stored = localStorage.getItem('localRankings');
  return stored ? JSON.parse(stored) : [];
}
```

---

## 7. 컴포넌트 재사용 가이드

### 7.1 공통 패턴

#### 점수 기반 게임
```vue
<script setup lang="ts">
const props = defineProps<MiniGameProps>();
const score = ref(0);

function addPoints(points: number) {
  score.value += points;
  playSound('success');
  vibrateSuccess();
}

function checkCompletion() {
  if (score.value >= props.targetScore) {
    completeGame();
  }
}
</script>
```

#### 타이머 기반 게임
```vue
<script setup lang="ts">
const { remainingTime, start, stop } = useTimer(props.timeLimit);

watch(remainingTime, (time) => {
  if (time <= 0) {
    completeGame();
  }
});

onMounted(() => {
  start();
});
</script>
```

#### Canvas 애니메이션
```vue
<script setup lang="ts">
const { ctx, clear, drawEmoji } = useCanvas(canvasRef);

let animationId: number;

function gameLoop() {
  clear();
  
  // 게임 로직
  updateGame();
  renderGame();
  
  animationId = requestAnimationFrame(gameLoop);
}

onMounted(() => {
  gameLoop();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});
</script>
```

---

## 8. 성능 최적화 가이드

### 8.1 Canvas 최적화
- 필요한 영역만 다시 그리기
- 오프스크린 Canvas 활용
- `requestAnimationFrame` 사용

### 8.2 메모리 관리
- 이벤트 리스너 정리
- 타이머/인터벌 정리
- 큰 객체 참조 해제

### 8.3 컴포넌트 최적화
- `v-once` 디렉티브 활용
- `computed` vs `method` 적절히 사용
- 불필요한 재렌더링 방지

---

**문서 버전**: 1.0  
**최종 수정일**: 2026-01-22
