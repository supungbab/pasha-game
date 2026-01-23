# 빠샤! (PASHA!) - 게임 기획서

## 1. 게임 개요

### 1.1 컨셉
**빠샤! (PASHA!)**는 모바일 환경에서 즐길 수 있는 미니게임 모음집입니다. 더☆비시바시에서 영감을 받았지만 독창적으로 재해석된 30개의 다양한 미니게임을 통해 빠른 판단력과 반사신경을 테스트합니다.

**이름의 의미**:
- 빠샤! (한국): "빠르게" + "샤샥!" 의성어의 합성
- PASHA! (글로벌): 발음이 쉽고 기억하기 좋은 영문 표기

### 1.2 핵심 특징
- 🎮 **30개의 독창적인 미니게임**
- 🎲 **매번 다른 순서로 진행되는 랜덤 시스템**
- 📈 **5판마다 상승하는 난이도 구간**
- ❤️ **3개의 목숨과 광고 컨티뉴 시스템**
- 🏆 **글로벌/로컬 랭킹 경쟁**
- 🎨 **이미지 없이 Canvas, HTML, CSS, 이모지만으로 구현**

### 1.3 기술 스택
- **프레임워크**: Vue.js 3 (Composition API)
- **빌드 도구**: Vite
- **언어**: TypeScript
- **그래픽**: Canvas API + HTML + CSS + 이모지

---

## 2. 게임 플레이 시스템

### 2.1 기본 플레이 흐름
```
게임 시작 → 미니게임 랜덤 선택 → 지시문 표시 (1-2초) → 
미니게임 플레이 → 점수 평가 → 성공/실패 판정 → 
다음 미니게임 or 게임 오버
```

### 2.2 목숨 시스템
- **시작 목숨**: 3개
- **목숨 차감 조건**: 미니게임에서 목표 점수 미달성
- **게임 오버**: 목숨 0개 도달 시
- **목숨 표시**: UI 상단에 하트(❤️) 이모지로 표시

### 2.3 컨티뉴 시스템
```
게임 오버 발생 → 10초 카운트다운 시작 → 
[광고 시청] 버튼 표시 → 광고 시청 완료 → 
목숨 3개 충전 + 현재 판부터 재개 (1회 한정)
```

**제한사항**:
- 1회 플레이당 1번만 사용 가능
- 광고 시청을 거부하거나 10초 경과 시 게임 종료

### 2.4 미니게임 진행 방식
- **총 30개 미니게임**을 각 1회씩 플레이
- **순서는 매번 랜덤**으로 셔플됨
- **중복 없음**: 한 번 플레이한 게임은 다시 나오지 않음
- 30개 모두 클리어 시 게임 완료

### 2.5 난이도 구간 시스템

| 판 수 | 난이도 | 설명 |
|------|--------|------|
| 1-5판 | ⭐ (Lv.1) | 매우 쉬움 - 게임 적응 단계 |
| 6-10판 | ⭐⭐ (Lv.2) | 쉬움 - 기본 실력 테스트 |
| 11-15판 | ⭐⭐⭐ (Lv.3) | 보통 - 집중력 요구 |
| 16-20판 | ⭐⭐⭐⭐ (Lv.4) | 어려움 - 높은 반응속도 필요 |
| 21-25판 | ⭐⭐⭐⭐⭐ (Lv.5) | 매우 어려움 - 전문가 수준 |
| 26-30판 | 🔥 (Lv.6) | 극한 - 최고난이도 |

**난이도 적용 요소**:
- 목표 점수 증가
- 제한 시간 감소
- 게임 속도 증가
- 오브젝트 수/복잡도 증가

### 2.6 하드 모드
- **출현 확률**: 약 10-15% (3-5판 중 1번)
- **특징**: 
  - 일반 난이도보다 1-2단계 높은 난이도
  - 시작 전 "🔥 HARD MODE!" 표시
  - 성공 시 보너스 점수 부여
  - 실패해도 목숨 차감은 동일

---

## 3. 점수 시스템

### 3.1 점수 유형
각 미니게임은 다음 중 하나 이상의 방식으로 점수를 계산합니다:

#### A. 속도 기반 점수
```typescript
점수 = 기본점수 + (남은시간 × 시간보너스계수)
예: 10초 제한에서 7초 남았다면
    점수 = 100 + (7 × 10) = 170점
```

#### B. 정확도 기반 점수
```typescript
점수 = (성공횟수 / 전체시도횟수) × 100
예: 10번 시도해서 9번 성공
    점수 = (9 / 10) × 100 = 90점
```

#### C. 성공 횟수 기반 점수
```typescript
점수 = 성공횟수 × 점수당점수
예: 15개 수집, 개당 5점
    점수 = 15 × 5 = 75점
```

#### D. 혼합형 점수
```typescript
점수 = (성공횟수 × 점수당점수) + (남은시간 × 시간보너스)
```

### 3.2 목표 점수 시스템
각 미니게임은 난이도 구간별로 다른 목표 점수를 가집니다:

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

**예시**: "풍선 터트리기" 기본 목표점수가 60점이라면
- Lv.1: 60점
- Lv.3: 90점
- Lv.6: 150점

### 3.3 최종 점수 계산
```typescript
최종점수 = Σ(각 미니게임 점수) + 난이도보너스 + 하드모드보너스

난이도보너스 = 클리어한 최고 난이도 구간 × 500
하드모드보너스 = 성공한 하드모드 수 × 200
```

---

## 4. UI/UX 설계

### 4.1 화면 구성

#### 메인 화면
```
┌─────────────────────────────┐
│      PASHA! 🎮           │
│                             │
│   [  🎮 START GAME  ]       │
│   [  🏆 RANKING     ]       │
│   [  ⚙️ SETTINGS    ]       │
│                             │
│   최고 기록: 2,450점         │
│   클리어: 23/30             │
└─────────────────────────────┘
```

#### 게임 플레이 화면
```
┌─────────────────────────────┐
│ ❤️❤️❤️        판: 5/30      │
│ 점수: 450              ⭐⭐  │
├─────────────────────────────┤
│                             │
│    [ 미니게임 영역 ]         │
│                             │
│                             │
├─────────────────────────────┤
│  목표: 60점  |  시간: 8.5초  │
└─────────────────────────────┘
```

#### 미니게임 시작 전
```
┌─────────────────────────────┐
│                             │
│                             │
│       탭하세요! 👆           │
│                             │
│     (1-2초 후 시작)          │
│                             │
└─────────────────────────────┘
```

#### 게임 오버 화면
```
┌─────────────────────────────┐
│       GAME OVER             │
│                             │
│   최종 점수: 1,250점         │
│   클리어: 15/30판            │
│                             │
│  [  📺 광고보고 계속하기  ]  │
│      (⏱️ 10초 남음)          │
│                             │
│  [     처음부터 시작     ]   │
└─────────────────────────────┘
```

### 4.2 지시문 시스템
각 미니게임 시작 전 1-2초간 간단한 지시문을 표시합니다:

| 지시문 | 의미 | 사용 게임 예시 |
|--------|------|----------------|
| 탭! 👆 | 화면을 탭하세요 | 풍선 터트리기, 두더지 잡기 |
| 스와이프! 👉 | 스와이프하세요 | 과일 자르기, 카드 넘기기 |
| 피해! 🏃 | 장애물을 피하세요 | 달리기, 미로 탈출 |
| 맞춰! 🎯 | 타이밍을 맞추세요 | 리듬 게임, 점프 |
| 찾아! 🔍 | 목표물을 찾으세요 | 숨은그림찾기, 색깔 맞추기 |
| 모아! 🧲 | 아이템을 수집하세요 | 동전 모으기, 별 수집 |

### 4.3 사운드/진동 시스템

#### 사운드 종류
1. **BGM**
   - 메인 화면: 경쾌한 배경음악
   - 게임 플레이: 긴장감 있는 배경음악
   - 난이도별 음악 변화 (속도/강도 증가)

2. **효과음**
   - UI 클릭: 짧은 "틱" 소리
   - 미니게임 시작: "3, 2, 1, GO!" 카운트다운
   - 성공: 밝은 "띠링!" 소리
   - 실패: 낮은 "덩" 소리
   - 목숨 차감: "따르릉" 경고음
   - 게임 오버: 하강하는 음계

#### 진동 피드백
- 미니게임 시작: 짧은 진동 (100ms)
- 성공: 2회 짧은 진동 (50ms × 2)
- 실패: 1회 긴 진동 (200ms)
- 목숨 차감: 3회 짧은 진동 (100ms × 3)
- 하드 모드 시작: 강한 진동 (150ms)

#### 설정
```typescript
interface AudioSettings {
  bgmEnabled: boolean;
  bgmVolume: number; // 0-100
  sfxEnabled: boolean;
  sfxVolume: number; // 0-100
  vibrationEnabled: boolean;
}
```

---

## 5. 랭킹 시스템

### 5.1 랭킹 유형

#### 글로벌 랭킹
- 전세계 모든 플레이어 대상
- 상위 100위까지 표시
- 매일 자정 갱신

#### 로컬 랭킹
- 기기 내 최고 기록 10개 저장
- 날짜별 기록 표시

### 5.2 랭킹 데이터 구조
```typescript
interface RankingEntry {
  rank: number;
  playerName: string;
  score: number;
  clearedStages: number; // 클리어한 판 수
  maxDifficulty: number; // 도달한 최고 난이도
  playDate: Date;
  isHardModeCleared: boolean; // 하드모드 1개 이상 클리어 여부
}
```

### 5.3 랭킹 화면
```
┌─────────────────────────────┐
│  🏆 RANKING                  │
│  [글로벌] [로컬]             │
├─────────────────────────────┤
│  1위  Player1     3,450점   │
│       30/30 🔥               │
│                             │
│  2위  Player2     3,200점   │
│       28/30                 │
│                             │
│  3위  Player3     3,100점   │
│       30/30                 │
│  ...                        │
│                             │
│  나의 순위: 15위             │
│  나의 점수: 2,450점          │
└─────────────────────────────┘
```

---

## 6. 기술 구현 설계

### 6.1 프로젝트 구조
```
pasha-game/
├── src/
│   ├── components/          # Vue 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   │   ├── GameCanvas.vue
│   │   │   ├── ScoreDisplay.vue
│   │   │   ├── LifeDisplay.vue
│   │   │   └── Timer.vue
│   │   ├── ui/             # UI 컴포넌트
│   │   │   ├── MainMenu.vue
│   │   │   ├── GameOver.vue
│   │   │   ├── Ranking.vue
│   │   │   └── Settings.vue
│   │   └── minigames/      # 미니게임 컴포넌트
│   │       ├── MiniGame01.vue
│   │       ├── MiniGame02.vue
│   │       └── ...
│   ├── composables/        # Vue Composition 함수
│   │   ├── useGameState.ts
│   │   ├── useScore.ts
│   │   ├── useAudio.ts
│   │   └── useVibration.ts
│   ├── utils/              # 유틸리티 함수
│   │   ├── canvas.ts       # Canvas 헬퍼
│   │   ├── random.ts       # 랜덤 함수
│   │   ├── difficulty.ts   # 난이도 계산
│   │   └── storage.ts      # 로컬 스토리지
│   ├── types/              # TypeScript 타입
│   │   ├── game.ts
│   │   ├── minigame.ts
│   │   └── ranking.ts
│   ├── config/             # 설정 파일
│   │   ├── difficulty.ts
│   │   └── audio.ts
│   └── App.vue
├── missions/               # 미니게임 기획서 (MD)
│   ├── mission-01.md
│   ├── mission-02.md
│   └── ...
├── docs/                   # 문서
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── COMPONENT_STRUCTURE.md
│   └── TECHNICAL_SPEC.md
└── package.json
```

### 6.2 핵심 타입 정의

```typescript
// types/game.ts
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

// types/minigame.ts
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

export interface MiniGameResult {
  success: boolean;            // 목표 달성 여부
  score: number;               // 획득 점수
  timeRemaining: number;       // 남은 시간
  accuracy?: number;           // 정확도 (해당시)
  count?: number;              // 성공 횟수 (해당시)
}

// types/ranking.ts
export interface RankingEntry {
  rank: number;
  playerName: string;
  score: number;
  clearedStages: number;
  maxDifficulty: number;
  playDate: Date;
  isHardModeCleared: boolean;
}
```

### 6.3 공통 컴포넌트

#### GameCanvas.vue
- Canvas 기반 렌더링 담당
- 모든 미니게임의 기본 Canvas 제공
- 터치/마우스 이벤트 처리

```vue
<script setup lang="ts">
interface Props {
  width: number;
  height: number;
}

interface Emits {
  (e: 'tap', x: number, y: number): void;
  (e: 'swipe', direction: 'up' | 'down' | 'left' | 'right'): void;
}
</script>
```

#### ScoreDisplay.vue
- 현재 점수 표시
- 목표 점수와 비교 표시
- 애니메이션 효과

#### LifeDisplay.vue
- 하트 이모지로 목숨 표시
- 목숨 차감 애니메이션

#### Timer.vue
- 제한시간 카운트다운
- 시간 부족 시 경고 효과 (빨간색 깜빡임)

### 6.4 상태 관리 (Composables)

```typescript
// composables/useGameState.ts
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
    // 게임 초기화
    state.remainingGames = shuffle([...Array(30)].map((_, i) => i + 1));
  };

  const nextStage = () => {
    // 다음 판으로 이동
    state.currentStage++;
    state.difficulty = calculateDifficulty(state.currentStage);
    state.isHardMode = Math.random() < 0.12; // 12% 확률
  };

  const loseLife = () => {
    state.lives--;
    if (state.lives === 0) {
      // 게임 오버 처리
    }
  };

  return {
    state: readonly(state),
    initGame,
    nextStage,
    loseLife,
    // ...
  };
}
```

### 6.5 Canvas 렌더링 유틸리티

```typescript
// utils/canvas.ts
export class CanvasHelper {
  constructor(private ctx: CanvasRenderingContext2D) {}

  // 이모지 그리기
  drawEmoji(emoji: string, x: number, y: number, size: number) {
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x, y);
  }

  // 원 그리기
  drawCircle(x: number, y: number, radius: number, color: string) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  // 사각형 그리기
  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  // 텍스트 그리기
  drawText(text: string, x: number, y: number, size: number, color: string) {
    this.ctx.font = `${size}px Arial`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
  }

  // 그라데이션 생성
  createGradient(x1: number, y1: number, x2: number, y2: number, colors: string[]) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    return gradient;
  }

  // 화면 클리어
  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
```

---

## 7. 개발 로드맵

### Phase 1: 핵심 시스템 구축 (1-2주)
- [x] 프로젝트 세팅
- [ ] 게임 상태 관리 시스템
- [ ] 난이도 시스템
- [ ] 점수 계산 시스템
- [ ] UI 공통 컴포넌트
- [ ] Canvas 유틸리티

### Phase 2: 미니게임 개발 (4-6주)
- [ ] 미니게임 1-10 개발
- [ ] 미니게임 11-20 개발
- [ ] 미니게임 21-30 개발
- [ ] 각 게임별 난이도 밸런싱

### Phase 3: 부가 기능 (1-2주)
- [ ] 사운드/진동 시스템
- [ ] 랭킹 시스템
- [ ] 광고 SDK 연동
- [ ] 로컬 저장 시스템

### Phase 4: 테스트 및 최적화 (1-2주)
- [ ] 난이도 밸런싱 테스트
- [ ] 성능 최적화
- [ ] 버그 수정
- [ ] 다양한 기기 테스트

### Phase 5: 출시 준비 (1주)
- [ ] 최종 QA
- [ ] 앱 스토어 준비
- [ ] 마케팅 자료 준비

---

## 8. 참고사항

### 8.1 디자인 가이드라인
- **컬러 팔레트**: 밝고 경쾌한 색상 사용
  - 주 색상: `#FF6B6B` (빨강), `#4ECDC4` (청록), `#FFE66D` (노랑)
  - 배경: `#F7FFF7` (밝은 회색)
  - 텍스트: `#2C3E50` (어두운 회색)

- **타이포그래피**: 
  - 제목: 굵고 큰 폰트 (32-48px)
  - 본문: 읽기 편한 크기 (16-20px)
  - 모든 텍스트는 CSS로 구현

- **애니메이션**: 
  - 부드러운 전환 효과 사용
  - 과도한 애니메이션 지양 (성능 고려)
  - CSS transition 활용

### 8.2 성능 최적화
- Canvas는 필요한 영역만 다시 그리기
- 이벤트 리스너 적절히 제거
- 메모리 누수 방지
- 60fps 유지 목표

### 8.3 접근성
- 색맹 사용자를 위한 색상 조합
- 충분한 대비 비율
- 명확한 시각적 피드백

---

## 9. TODO (향후 추가 기능)

### 업적 시스템
- [ ] 30개 미니게임 전체 클리어
- [ ] 하드 모드 10개 클리어
- [ ] 목숨 잃지 않고 10판 클리어
- [ ] 3000점 이상 달성

### 일일 미션
- [ ] 매일 1회 플레이
- [ ] 특정 미니게임 5회 클리어
- [ ] 하드 모드 3회 성공

### 스킨/테마
- [ ] 다크 모드
- [ ] 시즌별 테마 (봄, 여름, 가을, 겨울)
- [ ] 캐릭터 커스터마이징

### 재화 시스템
- [ ] 코인 시스템
- [ ] 젬 시스템
- [ ] 코인으로 스킨 구매
- [ ] 광고 시청으로 코인 획득

---

**문서 버전**: 1.0  
**최종 수정일**: 2026-01-22  
**작성자**: Game Designer
