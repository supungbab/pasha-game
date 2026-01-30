# Mission 16: 패턴 따라하기 (Pattern Copy)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 16 |
| **이름 (한글)** | 패턴 따라하기 |
| **이름 (영문)** | Pattern Copy |
| **카테고리** | 퍼즐/인지 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 30초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/PatternCopy.vue` |

---

## 게임 설명

화면에 표시되는 패턴(활성화된 타일들)을 기억한 후 동일하게 재현하는 기억력 게임입니다. 시각적으로 하이라이트되는 타일을 순차적으로 보여준 후, 플레이어가 해당 패턴을 똑같이 선택해야 합니다. 여러 라운드를 진행하며 난이도가 올라갈수록 그리드 크기와 활성화 타일 수가 증가합니다.

---

## 시작 전 지시문

```
패턴을 외워요! 🧩
```

**지시문 이모지**: 🟦🟧🟩 (색상 타일)

---

## 게임 규칙

1. **표시 단계** (Showing Phase)
   - 화면에 그리드가 표시됨
   - 활성화된 타일들이 순차적으로 하이라이트됨
   - "패턴을 기억하세요!" 안내 표시

2. **입력 단계** (Input Phase)
   - "패턴을 재현하세요!" 안내 표시
   - 기억한 타일을 탭하여 선택
   - 선택한 타일에 이모지가 표시됨
   - "확인" 버튼으로 제출

3. **결과 단계** (Result Phase)
   - 정답/오답 결과 표시
   - 정답: 라운드당 점수 획득
   - 다음 라운드로 진행

4. 모든 라운드 완료 또는 제한시간 종료 시 게임 종료

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 라운드 기반 (정확도)
- **라운드당 점수**: 100 / 총 라운드 수
- **예시**: 5라운드 게임 → 라운드당 20점

### 결과 데이터
- `score`: 총 점수 (0~100)
- `accuracy`: 정확도 (score / 100)
- `timeRemaining`: 남은 시간

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 정답 비율 |
|--------|----------|------|---------------|
| Lv.1 | 60점 | ×1.0 | 60% |
| Lv.2 | 72점 | ×1.2 | 72% |
| Lv.3 | 90점 | ×1.5 | 90% |
| Lv.4 | 108점 | ×1.8 | (목표 점수 제한) |
| Lv.5 | 132점 | ×2.2 | (목표 점수 제한) |
| Lv.6 | 150점 | ×2.5 | (목표 점수 제한) |

> 주의: 최대 점수는 100점이므로 높은 난이도에서는 거의 완벽해야 함

---

## 제한 시간

- **기본**: 30초
- **난이도별 조정**: 동일 (30초)

---

## 난이도별 변화

| 난이도 | 그리드 크기 | 라운드 수 | 활성화 타일 |
|--------|-----------|----------|-----------|
| Lv.1 | 3×3 | 4 | 4개 |
| Lv.2 | 3×3 | 5 | 5개 |
| Lv.3 | 4×4 | 6 | 6개 |
| Lv.4 | 4×4 | 7 | 7개 |
| Lv.5 | 4×4 | 7 | 8개 |
| Lv.6 | 4×4 | 7 | 8개 |

### 난이도별 설정 로직
```typescript
// 그리드 크기 (3x3 ~ 4x4)
const gridSize = computed(() => {
  return Math.min(3 + Math.floor((props.difficulty - 1) / 2), 4);
});

// 총 라운드 수 (4~7 라운드)
const totalRounds = computed(() => {
  return Math.min(3 + props.difficulty, 7);
});

// 활성화 타일 수 (4~8개)
const patternLength = computed(() => {
  return Math.min(3 + props.difficulty, 8);
});
```

---

## 하드 모드 🔥

- 하이라이트 표시 시간 단축
- 더 많은 활성화 타일
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 색상이 풍부한 타일 그리드
> - 명확한 하이라이트 효과
> - 단계별 진행 표시
> - 둥근 모서리 (border-radius: 12-24px)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│           2/5 (라운드 표시)          │
├─────────────────────────────────────┤
│                                     │
│       패턴을 기억하세요!             │
│                                     │
│     ┌───────────────────────┐       │
│     │ 🟦 │ 🟧 │ 🟩 │       │       │
│     ├─────┼─────┼─────┤     │       │
│     │ 🟪 │ 🟨 │ ★  │ ← 하이라이트   │
│     ├─────┼─────┼─────┤     │       │
│     │ 🟥 │ ⬛ │ ⬜ │       │       │
│     └───────────────────────┘       │
│                                     │
│         [ 확인 버튼 ]               │
│                                     │
│       점수: 40 / 60                 │
└─────────────────────────────────────┘
```

### 게임 단계별 화면

#### 표시 단계 (Showing)
- 타일들이 순차적으로 하이라이트
- 하이라이트된 타일: scale(1.2) + 밝은 그림자

#### 입력 단계 (Input)
- 모든 타일 클릭 가능
- 선택된 타일: 테두리 + 이모지 표시

#### 결과 단계 (Result)
- 정답: ✅ + "정답!"
- 오답: ❌ + "틀렸습니다!"

### 색상 팔레트
```typescript
// 타일 색상 풀
const colors = [
  '#FF6B6B',  // 빨강
  '#4ECDC4',  // 청록
  '#45B7D1',  // 하늘
  '#FFA07A',  // 연주황
  '#98D8C8',  // 민트
  '#F7DC6F',  // 노랑
  '#BB8FCE',  // 보라
  '#85C1E2'   // 연파랑
];

// 이모지 풀
const emojis = ['⬜', '🟦', '🟧', '🟩', '🟪', '🟨', '🟥', '⬛'];
```

```css
/* 배경 */
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

/* 그리드 */
gridBackground: 'rgba(255, 255, 255, 0.1)'
gridBorderRadius: '16px'
gridShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'

/* 타일 */
tileBorderRadius: '12px'
tileShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'

/* 하이라이트 */
highlightShadow: '0 0 30px rgba(255, 255, 255, 0.8)'
```

---

## 구현 로직

### 게임 상태
```typescript
const gamePhase = ref<'showing' | 'input' | 'result'>('showing');
const currentRound = ref(0);
const score = ref(0);
const pattern = ref<Array<{ color: string; emoji: string; isActive: boolean }>>([]);
const userPattern = ref<boolean[]>([]);
const highlightIndex = ref(-1);
const isCorrect = ref(false);

let startTime = 0;
let gameCompleted = false;
```

### 패턴 생성
```typescript
function generatePattern() {
  const size = gridSize.value * gridSize.value;
  pattern.value = [];

  // 타일 초기화
  for (let i = 0; i < size; i++) {
    pattern.value.push({
      color: colors[i % colors.length],
      emoji: emojis[i % emojis.length],
      isActive: false
    });
  }

  // 랜덤하게 타일 활성화
  const activeCount = patternLength.value;
  const activeIndices = new Set<number>();

  while (activeIndices.size < activeCount) {
    const randomIndex = Math.floor(Math.random() * size);
    activeIndices.add(randomIndex);
  }

  activeIndices.forEach(index => {
    const tile = pattern.value[index];
    if (tile) tile.isActive = true;
  });
}
```

### 패턴 표시 (순차 하이라이트)
```typescript
function showPattern() {
  gamePhase.value = 'showing';
  generatePattern();

  // 활성 타일을 순차적으로 하이라이트
  const activeTiles = pattern.value
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => tile.isActive);

  let currentIndex = 0;
  const highlightInterval = safeSetInterval(() => {
    if (currentIndex < activeTiles.length) {
      highlightIndex.value = activeTiles[currentIndex]?.index ?? -1;
      currentIndex++;
    } else {
      safeClearInterval(highlightInterval);
      highlightIndex.value = -1;

      // 표시 시간 후 입력 단계로
      safeSetTimeout(() => {
        gamePhase.value = 'input';
        userPattern.value = new Array(pattern.value.length).fill(false);
      }, 500);
    }
  }, 600); // 600ms 간격으로 하이라이트
}
```

### 타일 클릭 핸들러
```typescript
function handleTileClick(index: number) {
  if (gamePhase.value !== 'input') return;

  userPattern.value[index] = !userPattern.value[index]; // 토글

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}
```

### 패턴 제출 및 검증
```typescript
function submitPattern() {
  if (!canSubmit.value || gamePhase.value !== 'input') return;

  // 정답 확인: 모든 타일의 활성화 상태가 일치해야 함
  let correct = true;
  for (let i = 0; i < pattern.value.length; i++) {
    const tile = pattern.value[i];
    if (tile && tile.isActive !== userPattern.value[i]) {
      correct = false;
      break;
    }
  }

  isCorrect.value = correct;
  gamePhase.value = 'result';

  // 점수 계산
  if (correct) {
    const roundScore = 100 / totalRounds.value;
    score.value += roundScore;
  }

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(correct ? [50, 50, 50] : [100]);
  }

  // 다음 라운드 또는 게임 종료
  safeSetTimeout(() => {
    if (currentRound.value >= totalRounds.value) {
      completeGame();
    } else {
      currentRound.value++;
      showPattern();
    }
  }, 1000);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 하이라이트 | "띵" | 타일 하이라이트 시 |
| 타일 선택 | "딸깍" | 입력 단계에서 타일 탭 |
| 정답 | "딩!" | 라운드 성공 |
| 오답 | "삐" | 라운드 실패 |
| 게임 완료 | "팡파레" | 모든 라운드 완료 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 타일 선택 | `20ms` | 짧은 터치 피드백 |
| 정답 | `[50, 50, 50]ms` | 성공 패턴 |
| 오답 | `100ms` | 실패 진동 |

---

## UI 컴포넌트

### 라운드 표시
```html
<div class="round-info">{{ currentRound }}/{{ totalRounds }}</div>
```

### 패턴 그리드
```html
<div class="pattern-grid">
  <div
    v-for="(tile, index) in pattern"
    :key="index"
    class="pattern-tile"
    :class="{
      active: tile.isActive,
      highlight: highlightIndex === index
    }"
    :style="{ backgroundColor: tile.color }"
  >
    {{ tile.emoji }}
  </div>
</div>
```

### 입력 그리드
```html
<div class="pattern-grid">
  <div
    v-for="(tile, index) in pattern"
    :key="index"
    class="pattern-tile clickable"
    :class="{
      selected: userPattern[index],
      correct: userPattern[index] && tile.isActive,
      wrong: userPattern[index] && !tile.isActive
    }"
    :style="{ backgroundColor: tile.color }"
    @touchstart.prevent="handleTileClick(index)"
  >
    {{ userPattern[index] ? tile.emoji : '' }}
  </div>
</div>
```

### 확인 버튼
```html
<Button variant="primary" size="medium" :disabled="!canSubmit" @click="submitPattern">
  확인
</Button>
```

### 결과 표시
```html
<div class="result-display">
  <div class="result-emoji">{{ isCorrect ? '✅' : '❌' }}</div>
  <div class="result-text">{{ isCorrect ? '정답!' : '틀렸습니다!' }}</div>
</div>
```

---

## 스타일 정의

```css
.pattern-copy {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.round-info {
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-size, 3), 1fr);
  gap: clamp(6px, 2vw, 10px);
  padding: clamp(12px, 3vw, 20px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.pattern-tile {
  width: clamp(50px, 18vw, 70px);
  height: clamp(50px, 18vw, 70px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(22px, 7vw, 32px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.pattern-tile.highlight {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
  animation: highlight-pulse 0.6s ease;
}

.pattern-tile.selected {
  border: 3px solid white;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.pattern-tile.correct {
  border-color: #4CAF50;
}

.pattern-tile.wrong {
  border-color: #f44336;
}

@keyframes highlight-pulse {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.2); }
}

@keyframes result-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

## 테스트 체크리스트

- [ ] 패턴이 랜덤하게 생성되는가?
- [ ] 활성화 타일이 순차적으로 하이라이트되는가?
- [ ] 입력 단계에서 타일 선택이 토글되는가?
- [ ] 선택한 타일에 이모지가 표시되는가?
- [ ] 정답 검증이 정확한가? (모든 타일 상태 일치)
- [ ] 라운드 점수가 올바르게 계산되는가?
- [ ] 라운드 진행 표시가 업데이트되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 모든 라운드 완료 시 게임이 종료되는가?
- [ ] 시간 초과 시 게임이 종료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 3×3 그리드, 4~5개 타일로 쉬운 시작
- **Lv.3-4**: 4×4 그리드, 6~7개 타일로 난이도 상승
- **Lv.5-6**: 4×4 그리드, 8개 타일로 고난이도

---

## 인지적 특징

- **시각적 기억**: 패턴의 공간적 배치 기억
- **작업 기억**: 순차적 하이라이트 순서 처리
- **주의력**: 빠르게 지나가는 하이라이트 추적
- **정확성**: 기억한 패턴의 정확한 재현

---

## 개선 아이디어 (TODO)

- [ ] 순서까지 기억하는 모드 (Simon Says)
- [ ] 패턴이 점점 추가되는 누적 모드
- [ ] 색상만으로 구분하는 색맹 모드
- [ ] 시간 보너스 (빠른 입력)
- [ ] 힌트 기능 (한 번 다시 보기)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `PatternCopy.vue`
