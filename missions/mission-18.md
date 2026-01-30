# Mission 18: 퍼즐 슬라이드 (Slide Puzzle)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 18 |
| **이름 (한글)** | 퍼즐 슬라이드 |
| **이름 (영문)** | Slide Puzzle |
| **카테고리** | 퍼즐/인지 |
| **조작 방식** | 탭/스와이프 👉 |
| **기본 제한시간** | 30초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/SlidePuzzle.vue` |

---

## 게임 설명

클래식 슬라이드 퍼즐 게임입니다. 숫자 타일을 빈 칸으로 이동시켜 1부터 순서대로 정렬해야 합니다. 빈 칸과 인접한 타일만 이동할 수 있으며, 최소 이동으로 완성하면 높은 점수를 획득합니다.

---

## 시작 전 지시문

```
순서대로 정렬하세요! 🧩
```

**지시문 이모지**: 🔢1️⃣2️⃣ (숫자 타일)

---

## 게임 규칙

1. 그리드에 숫자 타일이 섞여서 표시됨 (빈 칸 1개 포함)
2. 빈 칸과 인접한 타일을 탭하여 이동
   - 상하좌우 인접한 타일만 이동 가능
   - 대각선 이동 불가
3. 1부터 순서대로 정렬하면 퍼즐 완성
   ```
   완성 상태:
   1  2  3
   4  5  6
   7  8  [빈]
   ```
4. 이동 횟수가 적을수록 높은 점수
5. 제한시간 내에 완성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 효율성 기반
- **기본 점수**: 100점
- **이동당 감점**: 2점
- **최소 점수**: 20점

### 점수 공식
```typescript
score = Math.max(100 - (moves × 2), 20)
```

### 예시
| 이동 횟수 | 점수 계산 | 최종 점수 |
|----------|----------|----------|
| 10회 | 100 - 20 | 80점 |
| 20회 | 100 - 40 | 60점 |
| 30회 | 100 - 60 | 40점 |
| 40회+ | 최소 보장 | 20점 |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 허용 이동 횟수 |
|--------|----------|------|---------------|
| Lv.1 | 60점 | ×1.0 | ~20회 |
| Lv.2 | 72점 | ×1.2 | ~14회 |
| Lv.3 | 90점 | ×1.5 | ~5회 (어려움) |
| Lv.4+ | 높음 | - | 거의 완벽 필요 |

---

## 제한 시간

- **기본**: 30초
- **난이도별 조정**: 동일 (30초)

---

## 난이도별 변화

| 난이도 | 그리드 크기 | 타일 수 | 셔플 횟수 |
|--------|-----------|--------|----------|
| Lv.1-3 | 3×3 | 8 + 빈칸 | 100~160회 |
| Lv.4-6 | 4×4 | 15 + 빈칸 | 180~220회 |

### 난이도별 설정 로직
```typescript
// 그리드 크기 (3x3 또는 4x4)
const gridSize = computed(() => {
  return props.difficulty <= 3 ? 3 : 4;
});

// 셔플 횟수 (난이도가 높을수록 많이 섞음)
const shuffleMoves = 100 + props.difficulty * 20;
```

---

## 하드 모드 🔥

- 4×4 그리드 고정
- 더 많이 섞음
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 명확한 숫자 타일
> - 빈 칸 시각적 구분
> - 올바른 위치의 타일 하이라이트
> - 둥근 모서리 (border-radius: 12-20px)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│            점수: 80                  │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────┐         │
│     │  1  │  2  │  3  │   │ ← 정렬된 상태 (녹색)
│     ├─────┼─────┼─────┤   │         │
│     │  4  │  5  │  7  │   │ ← 잘못된 위치 (노란색)
│     ├─────┼─────┼─────┤   │         │
│     │  8  │ [  ]│  6  │   │ ← 빈 칸
│     └─────────────────────┘         │
│                                     │
│    이동: 15    [ 🔄 섞기 ]           │
│                                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

/* 그리드 */
gridBackground: 'rgba(255, 255, 255, 0.1)'
gridBorderRadius: '20px'
gridShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'

/* 타일 (기본) */
tileGradient: 'linear-gradient(135deg, #FFD700, #FFC107)'
tileBorderRadius: '12px'
tileShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
tileTextColor: '#2c3e50'

/* 타일 (정답 위치) */
correctGradient: 'linear-gradient(135deg, #4CAF50, #45a049)'
correctTextColor: 'white'

/* 빈 칸 */
emptyBackground: 'rgba(255, 255, 255, 0.1)'
emptyShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
```

---

## 구현 로직

### 터치 상태 인터페이스
```typescript
interface TouchState {
  touchId: number | null;
  isInside: boolean;
}

const tileTouchStates = reactive<Map<number, TouchState>>(new Map());
```

### 게임 상태
```typescript
const tiles = ref<number[]>([]);
const moves = ref(0);
const score = ref(0);
let isSolved = false;

let gameCompleted = false;
let startTime = 0;
```

### 빈 칸 인덱스 찾기
```typescript
function getEmptyIndex(): number {
  return tiles.value.indexOf(0);
}
```

### 이동 가능 확인
```typescript
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
```

### 타일 이동
```typescript
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
```

### 정답 위치 확인
```typescript
function isCorrectPosition(index: number, tile: number): boolean {
  if (tile === 0) return true;
  return index === tile - 1;
}
```

### 퍼즐 완성 확인
```typescript
function checkSolved(): boolean {
  // 1부터 n-1까지 순서대로, 마지막은 0(빈 칸)
  for (let i = 0; i < tiles.value.length - 1; i++) {
    if (tiles.value[i] !== i + 1) return false;
  }
  return tiles.value[tiles.value.length - 1] === 0;
}
```

### 퍼즐 완성 처리
```typescript
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
```

### 퍼즐 섞기 (Solvable 보장)
```typescript
function shufflePuzzle() {
  if (gameCompleted) return;

  const size = gridSize.value;
  const totalTiles = size * size;

  // 초기화: [0, 1, 2, ..., n-1] (0은 빈 칸)
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
      // 빈 칸과 선택된 타일 교환
      const temp = tiles.value[emptyIndex]!;
      tiles.value[emptyIndex] = tiles.value[randomMove]!;
      tiles.value[randomMove] = temp;
    }
  }

  moves.value = 0;
  isSolved = false;
}
```

### 터치 핸들러
```typescript
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
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 타일 이동 | "딸깍" | 타일 슬라이드 |
| 섞기 | "철커덕" | 퍼즐 리셋 |
| 완성 | "팡파레" | 퍼즐 해결 |
| 시간 경고 | "틱틱" | 남은 시간 5초 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 타일 이동 | `20ms` | 짧은 터치 피드백 |
| 퍼즐 완성 | `[50, 50, 50, 50, 50]ms` | 성공 축하 패턴 |

---

## UI 컴포넌트

### 퍼즐 그리드
```html
<div class="puzzle-grid" :style="gridStyle">
  <div
    v-for="(tile, index) in tiles"
    :key="index"
    class="puzzle-tile"
    :class="{
      empty: tile === 0,
      correct: isCorrectPosition(index, tile),
      pressed: getTileTouchState(index).touchId !== null && tile !== 0
    }"
    @touchstart="handleTileTouchStart($event, index)"
    @touchmove="handleTileTouchMove($event, index)"
    @touchend="handleTileTouchEnd($event, index)"
    @touchcancel="handleTileTouchCancel(index)"
  >
    <span v-if="tile !== 0">{{ tile }}</span>
  </div>
</div>
```

### 통계 및 섞기 버튼
```html
<div class="stats">
  <div class="stat">이동: {{ moves }}</div>
  <Button variant="secondary" size="small" @click="shufflePuzzle">
    🔄 섞기
  </Button>
</div>
```

### 점수 표시
```html
<div class="ui-overlay">
  <div class="score-display">
    점수: {{ score }}
  </div>
</div>
```

---

## 스타일 정의

```css
.slide-puzzle {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.puzzle-grid {
  display: grid;
  gap: 8px;
  padding: clamp(10px, 3vw, 20px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
```

---

## 퍼즐 완성 상태

### 3×3 퍼즐 완성 상태
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [ ]
```

### 4×4 퍼즐 완성 상태
```
[1]  [2]  [3]  [4]
[5]  [6]  [7]  [8]
[9]  [10] [11] [12]
[13] [14] [15] [ ]
```

---

## 테스트 체크리스트

- [ ] 퍼즐이 해결 가능한 상태로 섞이는가?
- [ ] 빈 칸과 인접한 타일만 이동 가능한가?
- [ ] 타일 이동 시 이동 횟수가 증가하는가?
- [ ] 정답 위치의 타일이 녹색으로 표시되는가?
- [ ] 퍼즐 완성 시 점수가 올바르게 계산되는가?
- [ ] 섞기 버튼이 동작하는가?
- [ ] 4×4 그리드가 난이도 4 이상에서 적용되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-3**: 3×3 그리드로 8퍼즐 (쉬움)
- **Lv.4-6**: 4×4 그리드로 15퍼즐 (어려움)

### 해결 전략
- **코너 먼저**: 모서리부터 맞추기
- **행/열 단위**: 위에서 아래로 한 줄씩 완성
- **마지막 두 줄**: 동시에 해결 (3×3 트릭)

---

## Solvability (해결 가능성) 보장

랜덤 셔플 대신 **랜덤 이동**으로 섞어서 항상 해결 가능한 상태를 보장합니다:

```typescript
// ❌ 잘못된 방법 (해결 불가능한 상태 발생 가능)
tiles.sort(() => Math.random() - 0.5);

// ✅ 올바른 방법 (항상 해결 가능)
for (let i = 0; i < shuffleMoves; i++) {
  // 빈 칸과 인접한 타일 중 하나를 랜덤으로 이동
  const validMoves = getAdjacentTiles(emptyIndex);
  const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  swap(emptyIndex, randomMove);
}
```

---

## 개선 아이디어 (TODO)

- [ ] 이미지 퍼즐 (숫자 대신 그림)
- [ ] 힌트 기능 (다음 이동 제안)
- [ ] 최적 해법 표시
- [ ] 5×5 퍼즐 (더 높은 난이도)
- [ ] 시간 보너스 (빠른 해결)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `SlidePuzzle.vue`
