# 빠샤! (PASHA!) - Claude AI 개발 가이드

> 이 문서는 Claude AI가 빠샤! 프로젝트를 이해하고 개발하는 데 필요한 모든 정보를 담고 있습니다.

---

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 개념](#핵심-개념)
3. [기술 스택](#기술-스택)
4. [프로젝트 구조](#프로젝트-구조)
5. [게임 시스템](#게임-시스템)
6. [미니게임 목록](#미니게임-목록)
7. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
8. [타입 시스템](#타입-시스템)
9. [유틸리티 함수](#유틸리티-함수)
10. [UI/UX 디자인](#uiux-디자인)
11. [개발 가이드](#개발-가이드)
12. [현재 상태](#현재-상태)

---

## 프로젝트 개요

### 이름
- **한국어**: 빠샤! ("빠르게" + "샤샥!" 의성어 합성)
- **영어**: PASHA! (글로벌 버전)

### 컨셉
더☆비시바시에서 영감을 받은 **30개의 독창적인 미니게임 모음집**입니다. 각 게임은 빠른 반응속도와 집중력을 요구하며, 점진적으로 증가하는 난이도로 플레이어에게 도전을 제공합니다.

### 핵심 특징
- 🎮 **30개의 다양한 미니게임** (각 1회씩 플레이)
- 🎲 **매번 다른 순서의 랜덤 플레이**
- 📈 **5판마다 상승하는 6단계 난이도 시스템**
- ❤️ **3개의 목숨과 광고 컨티뉴 시스템**
- 🏆 **글로벌/로컬 랭킹**
- 🎨 **이미지 없이 Canvas + CSS + 이모지 구현**

---

## 핵심 개념

### 플레이 흐름
```
게임 시작 → 미니게임 랜덤 선택 → 지시문 표시 (1-2초) →
미니게임 플레이 → 점수 평가 → 성공/실패 판정 →
다음 미니게임 or 게임 오버
```

### 목숨 시스템
- 시작 목숨: **3개** (❤️❤️❤️)
- 실패 시 목숨 1개 차감
- 목숨 0개 도달 시 게임 오버
- **컨티뉴 시스템**: 광고 시청으로 1회 복구 가능

### 난이도 구간 (5판마다 증가)
| 판 수 | 난이도 | 특징 |
|------|--------|------|
| 1-5 | ⭐ Lv.1 | 매우 쉬움 - 게임 적응 |
| 6-10 | ⭐⭐ Lv.2 | 쉬움 - 기본 실력 |
| 11-15 | ⭐⭐⭐ Lv.3 | 보통 - 집중력 요구 |
| 16-20 | ⭐⭐⭐⭐ Lv.4 | 어려움 - 높은 반응속도 |
| 21-25 | ⭐⭐⭐⭐⭐ Lv.5 | 매우 어려움 |
| 26-30 | 🔥 Lv.6 | 극한 - 최고난이도 |

### 하드 모드
- 출현 확률: **10-15%**
- 일반 난이도보다 1-2단계 높음
- 성공 시 보너스 점수 부여
- 시작 전 "🔥 HARD MODE!" 표시

---

## 기술 스택

### 프론트엔드
- **Vue.js 3** (Composition API)
- **TypeScript** (타입 안정성)
- **Vite** (빌드 도구)

### 렌더링
- **Canvas API** - 게임 오브젝트, 애니메이션
- **HTML5 + CSS3** - UI 요소, 레이아웃
- **이모지** - 캐릭터, 아이템 표현

### 기능
- **Web Audio API** - 사운드
- **Vibration API** - 햅틱 피드백
- **LocalStorage** - 데이터 저장

---

## 프로젝트 구조

```
pasha-game/
├── src/
│   ├── assets/                    # 에셋
│   │   └── styles/               # 스타일시트 ✅
│   │       ├── main.css          # 메인 스타일
│   │       └── variables.css     # CSS 변수
│   ├── config/                    # 설정 파일 ✅
│   │   ├── constants.ts          # 게임 상수
│   │   ├── colors.ts             # 색상 팔레트
│   │   ├── miniGames.ts          # 30개 미니게임 정의
│   │   └── index.ts              # Export 인덱스
│   ├── types/                     # TypeScript 타입 정의 ✅
│   │   ├── game.ts               # 게임 상태, 설정 타입
│   │   ├── minigame.ts           # 미니게임 타입
│   │   └── ranking.ts            # 랭킹 타입
│   ├── utils/                     # 유틸리티 함수 ✅
│   │   ├── difficulty.ts         # 난이도 계산
│   │   ├── random.ts             # 랜덤 함수
│   │   ├── canvas.ts             # Canvas 헬퍼
│   │   ├── storage.ts            # 로컬 스토리지
│   │   └── index.ts              # Export 인덱스
│   ├── composables/               # Vue Composables ✅
│   │   ├── useGameState.ts       # 게임 상태 관리
│   │   ├── useAudio.ts           # 오디오/진동 관리
│   │   ├── useCanvas.ts          # Canvas 관리
│   │   └── index.ts              # Export 인덱스
│   ├── components/                # Vue 컴포넌트
│   │   ├── common/               # 공통 컴포넌트 ✅
│   │   │   ├── GameCanvas.vue    # Canvas 컴포넌트
│   │   │   ├── Timer.vue         # 타이머
│   │   │   ├── LifeDisplay.vue   # 목숨 표시
│   │   │   ├── ScoreDisplay.vue  # 점수 표시
│   │   │   └── DifficultyBadge.vue # 난이도 배지
│   │   ├── base/                 # 기본 컴포넌트 ✅
│   │   │   ├── Button.vue        # 버튼
│   │   │   ├── Modal.vue         # 모달
│   │   │   ├── Card.vue          # 카드
│   │   │   ├── Badge.vue         # 배지
│   │   │   ├── Toggle.vue        # 토글
│   │   │   ├── Slider.vue        # 슬라이더
│   │   │   └── ProgressBar.vue   # 프로그레스 바
│   │   ├── ui/                   # UI 컴포넌트 (TODO)
│   │   └── minigames/            # 미니게임 컴포넌트 (TODO)
│   ├── views/                    # 페이지 뷰 (TODO)
│   ├── router/                   # 라우터 ✅
│   └── main.ts                   # 앱 진입점 ✅
├── missions/                      # 미니게임 기획서
│   ├── MISSIONS_SUMMARY.md       # 30개 게임 요약
│   ├── mission-list.md           # 전체 게임 목록
│   ├── mission-01.md             # 풍선 터트리기 (상세)
│   ├── mission-02.md             # 과일 자르기 (상세)
│   └── mission-03.md             # 두더지 잡기 (상세)
├── docs/                          # 문서
│   ├── GAME_DESIGN_DOCUMENT.md   # 게임 기획서
│   ├── COMPONENT_STRUCTURE.md    # 컴포넌트 구조
│   └── design_guide.md           # 디자인 가이드
├── README.md                      # 프로젝트 메인 문서
├── PROJECT_INDEX.md               # 프로젝트 인덱스
└── CLAUDE.md                      # 이 문서
```

---

## 게임 시스템

### 점수 시스템

각 미니게임은 다음 중 하나 이상의 방식으로 점수를 계산합니다:

#### A. 속도 기반 점수
```typescript
점수 = 기본점수 + (남은시간 × 시간보너스계수)
```

#### B. 정확도 기반 점수
```typescript
점수 = (성공횟수 / 전체시도횟수) × 100
```

#### C. 성공 횟수 기반 점수
```typescript
점수 = 성공횟수 × 점수당점수
```

#### D. 혼합형 점수
```typescript
점수 = (성공횟수 × 점수당점수) + (남은시간 × 시간보너스)
```

### 목표 점수 계산
```typescript
목표점수 = 기본목표점수 × 난이도계수

난이도계수:
Lv.1 (1-5판): 1.0
Lv.2 (6-10판): 1.2
Lv.3 (11-15판): 1.5
Lv.4 (16-20판): 1.8
Lv.5 (21-25판): 2.2
Lv.6 (26-30판): 2.5
```

### 최종 점수
```typescript
최종점수 = Σ(각 미니게임 점수) + 난이도보너스 + 하드모드보너스

난이도보너스 = 클리어한 최고 난이도 구간 × 500
하드모드보너스 = 성공한 하드모드 수 × 200
```

---

## 미니게임 목록

### 🎯 반사신경/타이밍 (10개)
1. 풍선 터트리기 (Balloon Pop) - 탭 👆
2. 과일 자르기 (Fruit Slice) - 스와이프 👉
3. 두더지 잡기 (Whack-a-Mole) - 탭 👆
4. 타이밍 점프 (Perfect Jump) - 탭 👆
5. 리듬 탭 (Rhythm Tap) - 탭 👆
6. 색깔 매칭 (Color Match) - 탭 👆
7. 빠른 클릭 (Speed Click) - 탭 연타 👆
8. 반응 테스트 (Reaction Test) - 탭 👆
9. 공 받기 (Catch the Ball) - 스와이프 👉
10. 슈팅 게임 (Quick Shoot) - 탭 👆

### 🧩 퍼즐/인지 (8개)
11. 숫자 맞추기 (Number Match) - 탭 👆
12. 같은 그림 찾기 (Find Pair) - 탭 👆
13. 순서 기억 (Memory Sequence) - 탭 👆
14. 색깔 이름 (Color Word) - 탭 👆
15. 빠른 계산 (Quick Math) - 탭 👆
16. 패턴 따라하기 (Pattern Copy) - 탭 👆
17. 숨은 그림 (Hidden Object) - 탭 👆
18. 퍼즐 슬라이드 (Slide Puzzle) - 스와이프 👉

### 🏃 액션/수집 (7개)
19. 동전 모으기 (Coin Collector) - 탭/드래그
20. 장애물 피하기 (Dodge It) - 스와이프 👉
21. 사다리 오르기 (Ladder Climb) - 탭 👆
22. 미로 탈출 (Maze Escape) - 스와이프 👉
23. 별 수집 (Star Gather) - 드래그
24. 점프 게임 (Jump Up) - 탭 👆
25. 스피드 런 (Speed Run) - 탭 👆

### 🎨 그리기/조작 (5개)
26. 선 긋기 (Draw Line) - 드래그 ✏️
27. 물체 회전 (Rotate Object) - 드래그 회전
28. 크기 맞추기 (Size Match) - 탭 👆
29. 균형 잡기 (Balance It) - 기울이기/드래그
30. 순서 나열 (Sort It) - 드래그

---

## 컴포넌트 아키텍처

### 컴포넌트 계층 구조
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

### 주요 공통 컴포넌트

#### GameCanvas.vue
모든 미니게임의 기본 Canvas 제공

**Props:**
```typescript
interface Props {
  width?: number;
  height?: number;
  backgroundColor?: string;
}
```

**Emits:**
```typescript
interface Emits {
  (e: 'tap', x: number, y: number): void;
  (e: 'swipe', direction: 'up' | 'down' | 'left' | 'right'): void;
  (e: 'drag', x: number, y: number): void;
  (e: 'dragEnd', x: number, y: number): void;
}
```

#### ScoreDisplay.vue
점수와 목표 점수 표시

**Props:**
```typescript
interface Props {
  currentScore: number;
  targetScore: number;
  showTarget?: boolean;
  animated?: boolean;
}
```

#### LifeDisplay.vue
남은 목숨 표시 (❤️❤️❤️)

**Props:**
```typescript
interface Props {
  lives: number;      // 0-3
  maxLives?: number;  // 기본값: 3
  animated?: boolean;
}
```

#### Timer.vue
제한시간 카운트다운

**Props:**
```typescript
interface Props {
  timeLimit: number;
  paused?: boolean;
  warningThreshold?: number; // 기본: 3초
}
```

**Emits:**
```typescript
interface Emits {
  (e: 'timeUp'): void;
  (e: 'warning'): void;
  (e: 'tick', remainingTime: number): void;
}
```

---

## 타입 시스템

### 핵심 타입 정의

#### GameState (src/types/game.ts)
```typescript
export interface GameState {
  currentStage: number;        // 현재 판 (1-30)
  lives: number;               // 남은 목숨 (0-3)
  score: number;               // 누적 점수
  difficulty: number;          // 현재 난이도 (1-6)
  isHardMode: boolean;         // 하드모드 여부
  hasUsedContinue: boolean;    // 컨티뉴 사용 여부
  completedGames: number[];    // 완료한 게임 ID 배열
  remainingGames: number[];    // 남은 게임 ID 배열
}
```

#### MiniGame (src/types/minigame.ts)
```typescript
export interface MiniGame {
  id: number;
  name: string;
  instruction: string;         // 시작 전 지시문
  instructionEmoji: string;    // 지시문 이모지
  scoreType: 'speed' | 'accuracy' | 'count' | 'hybrid';
  baseTimeLimit: number;       // 기본 제한시간 (초)
  baseTargetScore: number;     // 기본 목표점수
  component: Component;        // Vue 컴포넌트
}
```

#### MiniGameProps
```typescript
export interface MiniGameProps {
  difficulty: number;      // 1-6
  timeLimit: number;       // 제한시간 (초)
  targetScore: number;     // 목표 점수
  isHardMode: boolean;     // 하드모드 여부
}
```

#### MiniGameResult
```typescript
export interface MiniGameResult {
  success: boolean;        // 목표 달성 여부
  score: number;          // 획득 점수
  timeRemaining: number;  // 남은 시간
  accuracy?: number;      // 정확도 (옵션)
  count?: number;         // 성공 횟수 (옵션)
}
```

---

## 유틸리티 함수

### 난이도 계산 (src/utils/difficulty.ts)
```typescript
// 난이도 계산 (5판마다 1단계 증가)
export function calculateDifficulty(stage: number): number {
  return Math.ceil(stage / 5);
}

// 하드 모드 여부 (12% 확률)
export function shouldBeHardMode(): boolean {
  return Math.random() < 0.12;
}

// 난이도 배율 반환
export function getDifficultyMultiplier(difficulty: number): number {
  const multipliers = [1.0, 1.2, 1.5, 1.8, 2.2, 2.5];
  return multipliers[difficulty - 1] || 1.0;
}

// 제한시간 조정 (난이도별 감소)
export function adjustTimeLimit(baseTime: number, difficulty: number): number {
  const multiplier = 1 - (difficulty - 1) * 0.1;
  return Math.max(baseTime * multiplier, baseTime * 0.5);
}

// 목표 점수 조정
export function adjustTargetScore(baseScore: number, difficulty: number): number {
  return Math.floor(baseScore * getDifficultyMultiplier(difficulty));
}
```

### 랜덤 함수 (src/utils/random.ts)
```typescript
// 배열 셔플 (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 정수 랜덤
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 실수 랜덤
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// 배열에서 랜덤 선택
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
```

### Canvas 헬퍼 (src/utils/canvas.ts)
```typescript
export class CanvasHelper {
  constructor(private ctx: CanvasRenderingContext2D) {}

  // 이모지 그리기
  drawEmoji(emoji: string, x: number, y: number, size: number): void

  // 원 그리기
  drawCircle(x: number, y: number, radius: number, color: string): void

  // 사각형 그리기
  drawRect(x: number, y: number, width: number, height: number, color: string): void

  // 텍스트 그리기
  drawText(text: string, x: number, y: number, size: number, color: string): void

  // 화면 클리어
  clear(): void
}
```

---

## UI/UX 디자인

### 컬러 팔레트

#### 메인 컬러 (노랑 계열)
- **Primary Yellow**: `#FFD700` (밝은 노랑)
- **Secondary Yellow**: `#FFC107` (따뜻한 노랑)
- **Dark Yellow**: `#F9A825` (강조용 진한 노랑)

#### 보조 컬러
- **Secondary Orange**: `#FF9800` (Secondary 버튼, 강조)
- **Dark Orange**: `#F57C00` (Secondary 버튼 그라데이션)
- **Neutral Cream**: `#FFF8DC` (배경 보조)
- **Contrast Purple**: `#5E35B1` (중요 요소 대비색)

#### 중립 컬러
- **White**: `#FFFFFF` (주 배경)
- **Light Gray**: `#F5F5F5` (보조 배경)
- **Dark Gray**: `#424242` (텍스트)
- **Black**: `#212121` (강조 텍스트)

### 디자인 원칙

#### 형태 (Shape)
- **버튼**: 둥근 모서리 (border-radius: 12-20px)
- **카드/패널**: 부드러운 모서리 (border-radius: 16-24px)
- **전체 분위기**: 친근하고 부드러운 느낌

#### 그라데이션 사용 규칙
⚠️ **과도한 그라데이션 금지**

**허용:**
- 버튼: 미묘한 수직 그라데이션 (5-10% 명도 차이)
  ```css
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  ```

**금지:**
- ❌ 무지개 그라데이션
- ❌ 복잡한 다중 컬러 그라데이션
- ❌ 텍스트 그라데이션

#### 입체감 표현
그라데이션 대신:
- **그림자**: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`
- **테두리**: `border: 2px solid #F9A825;`
- **밝기 차이**: 배경-카드-버튼 순으로 선명도 증가

### 타이포그래피
- **제목**: 24-32px, Bold (700)
- **부제목**: 18-20px, SemiBold (600)
- **본문**: 14-16px, Regular (400)
- **버튼 텍스트**: 16-18px, Bold (700)

---

## 개발 가이드

### 새 미니게임 추가 방법

#### 1단계: 기획서 작성
`missions/mission-XX.md` 파일을 작성합니다:
- 게임 설명
- 조작 방법
- 점수 시스템
- 난이도별 변화
- 이모지 및 구현 방법

#### 2단계: 컴포넌트 작성
`src/components/minigames/MiniGameXX.vue` 파일을 생성합니다.

**템플릿:**
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
import type { MiniGameProps, MiniGameResult } from '@/types/minigame';
import { useCanvas } from '@/composables/useCanvas';
import { useAudio } from '@/composables/useAudio';

const props = defineProps<MiniGameProps>();
const emit = defineEmits<{
  complete: [result: MiniGameResult]
}>();

const canvasRef = ref<InstanceType<typeof GameCanvas>>();
const { clear, drawEmoji, drawCircle } = useCanvas(canvasRef);
const { playSound, vibrate } = useAudio();

// 게임 상태
const score = ref(0);

// 게임 초기화
onMounted(() => {
  initGame();
  startGameLoop();
});

// 게임 정리
onUnmounted(() => {
  stopGameLoop();
});

function initGame() {
  // 초기화 로직
}

function startGameLoop() {
  // 게임 루프 시작
}

function handleTap(x: number, y: number) {
  // 탭 처리
  playSound('success');
  vibrate([50, 50]);
}

function handleSwipe(direction: string) {
  // 스와이프 처리
}

function completeGame() {
  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: 0,
  };
  emit('complete', result);
}
</script>
```

#### 3단계: 게임 등록
`src/config/miniGames.ts`에 게임을 등록합니다:
```typescript
{
  id: 1,
  name: '풍선 터트리기',
  instruction: '탭하세요!',
  instructionEmoji: '👆',
  scoreType: 'count',
  baseTimeLimit: 10,
  baseTargetScore: 60,
  component: () => import('@/components/minigames/MiniGame01.vue')
}
```

#### 4단계: 테스트 및 밸런싱
- 각 난이도별 테스트 (Lv.1 ~ Lv.6)
- 하드 모드 테스트
- 목표 점수 조정

### 공통 패턴

#### 점수 기반 게임
```typescript
const score = ref(0);

function addPoints(points: number) {
  score.value += points;
  playSound('success');
  vibrate([50, 50]);

  if (score.value >= props.targetScore) {
    completeGame();
  }
}
```

#### Canvas 애니메이션 루프
```typescript
let animationId: number;

function gameLoop() {
  clear();
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
```

### 성능 최적화

#### Canvas 최적화
- 필요한 영역만 다시 그리기
- `requestAnimationFrame` 사용
- 오프스크린 Canvas 활용 (필요시)

#### 메모리 관리
- 이벤트 리스너 정리 (`onUnmounted`)
- 타이머/인터벌 정리
- 큰 객체 참조 해제

#### 컴포넌트 최적화
- `v-once` 디렉티브 활용
- `computed` vs `method` 적절히 사용
- 불필요한 재렌더링 방지

---

## 현재 상태

### ✅ 완료된 작업
- [x] 프로젝트 세팅 (Vite + Vue 3 + TypeScript)
- [x] 타입 시스템 완성 (GameState, MiniGame, MiniGameResult 등)
- [x] 유틸리티 함수 완성 (difficulty, random, canvas, storage)
- [x] Composables 구현 (useGameState, useAudio, useCanvas)
- [x] 공통 컴포넌트 구현 (GameCanvas, Timer, LifeDisplay, ScoreDisplay, DifficultyBadge)
- [x] 기본 컴포넌트 구현 (Button, Modal, Card, Badge, Toggle, Slider, ProgressBar)
- [x] CSS 스타일시트 (main.css, variables.css)
- [x] 게임 기획서 작성 (GAME_DESIGN_DOCUMENT.md, 63KB)
- [x] 컴포넌트 구조 설계 (COMPONENT_STRUCTURE.md, 44KB)
- [x] 30개 미니게임 컨셉 정의 (MISSIONS_SUMMARY.md)
- [x] 디자인 가이드 작성 (design_guide.md)

### 🔄 진행 중
- [ ] 미니게임 1-10 개발
- [ ] 미니게임 11-20 개발
- [ ] 미니게임 21-30 개발
- [ ] UI 컴포넌트 (MainMenu, GamePlay, GameOver, Ranking, Settings)
- [ ] 페이지 뷰 구현

### ⏳ 예정
- [ ] 사운드/진동 시스템 완성
- [ ] 랭킹 시스템 구현
- [ ] 광고 SDK 연동
- [ ] 밸런싱 및 테스트
- [ ] 성능 최적화

### 개발 우선순위

#### Phase 1: 핵심 미니게임 (5개)
Mission 1 (풍선 터트리기), 3 (두더지 잡기), 6 (색깔 매칭), 19 (동전 모으기), 26 (선 긋기)

#### Phase 2: UI 통합
- MainMenu, GamePlay, GameOver 화면
- 게임 플로우 연결
- 난이도 시스템 적용

#### Phase 3: 추가 미니게임 (10개)
Mission 2, 4, 5, 7, 9, 11, 20, 23, 27, 30

#### Phase 4: 완성 및 최적화
- 나머지 미니게임 (15개)
- 사운드/진동 시스템
- 랭킹 시스템
- 밸런싱 및 테스트

---

## 참고 문서

### 상세 문서
- [README.md](README.md) - 프로젝트 전체 개요
- [PROJECT_INDEX.md](PROJECT_INDEX.md) - 프로젝트 인덱스
- [docs/GAME_DESIGN_DOCUMENT.md](docs/GAME_DESIGN_DOCUMENT.md) - 게임 기획서 (상세)
- [docs/COMPONENT_STRUCTURE.md](docs/COMPONENT_STRUCTURE.md) - 컴포넌트 구조 (상세)
- [docs/design_guide.md](docs/design_guide.md) - UI/UX 디자인 가이드

### 미니게임 기획
- [missions/MISSIONS_SUMMARY.md](missions/MISSIONS_SUMMARY.md) - 30개 게임 요약
- [missions/mission-list.md](missions/mission-list.md) - 게임 목록
- [missions/mission-01.md](missions/mission-01.md) - 풍선 터트리기 (예시)
- [missions/mission-02.md](missions/mission-02.md) - 과일 자르기 (예시)
- [missions/mission-03.md](missions/mission-03.md) - 두더지 잡기 (예시)

---

## 빠른 참조

### 주요 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint
```

### 중요 파일 경로
```
src/types/game.ts          # 게임 상태 타입
src/types/minigame.ts      # 미니게임 타입
src/utils/difficulty.ts    # 난이도 계산
src/config/miniGames.ts    # 30개 게임 정의
src/composables/useGameState.ts  # 게임 상태 관리
```

### 주요 상수
```typescript
// 게임 설정
const TOTAL_GAMES = 30;
const STARTING_LIVES = 3;
const STAGES_PER_DIFFICULTY = 5;
const HARD_MODE_PROBABILITY = 0.12;

// 난이도 배율
const DIFFICULTY_MULTIPLIERS = [1.0, 1.2, 1.5, 1.8, 2.2, 2.5];
```

### 커밋 메시지 작성

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-26
**작성자**: Claude AI Helper

이 문서는 Claude AI가 빠샤! 프로젝트를 효율적으로 이해하고 개발하는 데 필요한 모든 정보를 담고 있습니다.
