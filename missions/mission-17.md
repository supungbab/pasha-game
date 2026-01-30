# Mission 17: 숨은 그림 (Hidden Object)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 17 |
| **이름 (한글)** | 숨은 그림 |
| **이름 (영문)** | Hidden Object |
| **카테고리** | 퍼즐/인지 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/HiddenObject.vue` |

---

## 게임 설명

다양한 이모지들이 가득한 그리드에서 **목표 이모지**를 찾아 탭하는 게임입니다. 상단에 표시된 목표 이모지와 동일한 이모지를 그리드에서 모두 찾아야 합니다. 오답을 선택하면 점수가 감점되며, 모든 목표를 찾거나 시간이 종료되면 게임이 끝납니다.

---

## 시작 전 지시문

```
숨은 그림을 찾아요! 🔍
```

**지시문 이모지**: 👀🔎 (눈/돋보기)

---

## 게임 규칙

1. 상단에 목표 이모지와 찾아야 할 개수가 표시됨
   - 예: "찾기: 🍎 (3/5)" → 5개 중 3개 찾음
2. 그리드에서 목표 이모지를 탭하여 선택
   - **정답**: 20점 획득, 찾은 이모지 표시 변경
   - **오답**: 5점 감점, 흔들림 효과
3. 모든 목표 이모지를 찾으면 즉시 완료
4. 제한시간 종료 시 현재 점수 + 시간 보너스로 평가

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 혼합형 (수집 + 시간 보너스)
- **정답**: 20점
- **오답**: -5점 (최소 0점)
- **시간 보너스**: 남은 시간 × 5점

### 점수 공식
```typescript
totalScore = (찾은 개수 × 20) - (오답 × 5) + (남은시간 × 5)
```

### 결과 데이터
- `score`: 총 점수
- `count`: 찾은 이모지 개수
- `timeRemaining`: 남은 시간

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 설명 |
|--------|----------|------|------|
| Lv.1 | 60점 | ×1.0 | 기본 목표 |
| Lv.2 | 72점 | ×1.2 | 약간 높음 |
| Lv.3 | 90점 | ×1.5 | 중간 |
| Lv.4 | 108점 | ×1.8 | 어려움 |
| Lv.5 | 132점 | ×2.2 | 매우 어려움 |
| Lv.6 | 150점 | ×2.5 | 극한 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 그리드 크기 | 목표 개수 | 총 이모지 수 |
|--------|-----------|----------|-------------|
| Lv.1 | 10×10 | 3개 | 100개 |
| Lv.2 | 12×12 | 3개 | 144개 |
| Lv.3 | 14×14 | 4개 | 196개 |
| Lv.4 | 16×16 | 4개 | 256개 |
| Lv.5 | 16×16 | 5개 | 256개 |
| Lv.6 | 16×16 | 5개 | 256개 |

### 난이도별 설정 로직
```typescript
// 그리드 크기 (10~16, 짝수)
const gridSize = computed(() => {
  const base = 8 + props.difficulty * 2;
  return Math.min(base, 16);
});

// 목표 이모지 개수 (3~5개)
const totalTargets = computed(() => {
  return 3 + Math.floor(props.difficulty / 2);
});
```

---

## 하드 모드 🔥

- 더 많은 유사 이모지 배치
- 목표 이모지 개수 증가
- 시간 제한 감소 (20%)
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 명확한 목표 이모지 표시
> - 반응적인 그리드 레이아웃
> - 찾은 이모지의 시각적 구분
> - 둥근 모서리 (border-radius: 12-24px)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│                        점수: 45      │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐     │
│  │ 찾기: 🍎 (2/4)             │     │
│  └────────────────────────────┘     │
│                                     │
│  ┌────────────────────────────┐     │
│  │ 🍊 🍋 🍌 🍎 🍇 🍓 🍒 │     │
│  │ 🥝 🍑 🍎 🥭 🍍 🥥 🥑 │     │
│  │ 🍆 🥕 🌽 🌶️ 🍎 🥒 🥬 │ ← 찾기   │
│  │ 🍕 🍔 🍟 🌭 🍿 🧀 🥓 │     │
│  │ 🥚 🍎 🍳 🥞 ⭐ ✨ 💫 │     │
│  └────────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

/* 목표 표시 */
targetDisplayBackground: 'white'
targetDisplayShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
targetCountColor: '#667eea'

/* 그리드 */
gridBackground: 'rgba(255, 255, 255, 0.1)'
gridBorderRadius: '20px'
gridShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'

/* 이모지 아이템 */
itemBackground: 'white'
itemBorderRadius: '12px'
itemShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'

/* 찾은 아이템 */
foundGradient: 'linear-gradient(135deg, #4CAF50, #45a049)'
foundOpacity: 0.5

/* 오답 */
wrongGradient: 'linear-gradient(135deg, #f44336, #d32f2f)'
```

---

## 구현 로직

### 이모지 풀
```typescript
const emojiPool = [
  // 과일
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑',
  '🥭', '🍍', '🥥', '🥑', '🍆', '🥕', '🌽', '🌶️', '🥒', '🥬',
  // 음식
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥓', '🥚', '🍳', '🥞',
  // 스포츠
  '🏀', '⚽', '🎾', '🏐', '🏈', '⚾', '🥎', '🎱', '🏓', '🏸',
  // 기타
  '⭐', '✨', '💫', '🌟', '🔥', '💧', '❄️', '⚡', '🌈', '☀️'
];
```

### 게임 상태
```typescript
const emojis = ref<string[]>([]);
const targetEmoji = ref('');
const foundIndices = ref<number[]>([]);
const score = ref(0);
const gridRef = ref<HTMLElement>();

let gameCompleted = false;
let startTime = 0;
```

### 그리드 생성
```typescript
function generateGrid() {
  const totalCells = gridSize.value * gridSize.value;

  // 타겟 이모지 선택
  const selectedTarget = emojiPool[Math.floor(Math.random() * emojiPool.length)];
  targetEmoji.value = selectedTarget;

  // 나머지 이모지 (타겟 제외)
  const otherEmojis = emojiPool.filter(e => e !== targetEmoji.value);

  const grid: string[] = [];

  // 타겟 이모지 배치
  for (let i = 0; i < totalTargets.value; i++) {
    grid.push(targetEmoji.value);
  }

  // 나머지 칸 채우기
  while (grid.length < totalCells) {
    const randomEmoji = otherEmojis[Math.floor(Math.random() * otherEmojis.length)];
    grid.push(randomEmoji);
  }

  // Fisher-Yates 셔플
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }

  emojis.value = grid;
}
```

### 클릭 핸들러
```typescript
function handleClick(index: number, emoji: string) {
  if (gameCompleted || foundIndices.value.includes(index)) return;

  if (emoji === targetEmoji.value) {
    // 정답!
    foundIndices.value.push(index);
    score.value += 20;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // 모두 찾았는지 확인
    if (foundCount.value === totalTargets.value) {
      safeSetTimeout(() => {
        completeGame();
      }, 500);
    }
  } else {
    // 오답 - 감점
    score.value = Math.max(0, score.value - 5);

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // 틀린 이모지 흔들기 효과
    const element = gridRef.value?.children[index] as HTMLElement;
    if (element) {
      element.classList.add('wrong');
      safeSetTimeout(() => {
        element.classList.remove('wrong');
      }, 500);
    }
  }
}
```

### 게임 완료
```typescript
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
    count: foundCount.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 정답 | "딩!" | 목표 이모지 발견 |
| 오답 | "삐" | 잘못된 이모지 탭 |
| 모두 찾음 | "팡파레" | 모든 목표 발견 |
| 시간 경고 | "틱틱" | 남은 시간 3초 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 정답 | `[50, 30, 50]ms` | 성공 패턴 |
| 오답 | `[100, 50, 100]ms` | 실패 패턴 |

---

## UI 컴포넌트

### 목표 표시
```html
<div class="target-display">
  <div class="target-label">찾기:</div>
  <div class="target-emoji">{{ targetEmoji }}</div>
  <div class="count">{{ foundCount }} / {{ totalTargets }}</div>
</div>
```

### 이모지 그리드
```html
<div class="game-grid" ref="gridRef">
  <div
    v-for="(emoji, index) in emojis"
    :key="index"
    class="emoji-item"
    :class="{ found: foundIndices.includes(index) }"
    @touchstart.prevent="handleClick(index, emoji)"
  >
    {{ emoji }}
  </div>
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
.hidden-object {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.target-display {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 20px 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

.target-emoji {
  font-size: 64px;
  animation: targetBounce 1s ease-in-out infinite;
}

@keyframes targetBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-height: 600px;
  overflow-y: auto;
}

.emoji-item {
  aspect-ratio: 1;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.emoji-item:hover:not(.found) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.emoji-item.found {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  animation: foundPulse 0.5s ease-out;
  opacity: 0.5;
}

.emoji-item.wrong {
  animation: wrongShake 0.5s ease-out;
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

@keyframes foundPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

---

## 테스트 체크리스트

- [ ] 목표 이모지가 랜덤하게 선택되는가?
- [ ] 지정된 개수의 목표 이모지가 그리드에 배치되는가?
- [ ] 정답 탭 시 20점이 추가되는가?
- [ ] 오답 탭 시 5점이 감점되는가?
- [ ] 점수가 음수가 되지 않는가? (최소 0점)
- [ ] 찾은 이모지가 시각적으로 구분되는가?
- [ ] 찾은 이모지는 다시 탭할 수 없는가?
- [ ] 오답 탭 시 흔들림 효과가 표시되는가?
- [ ] 모든 목표 발견 시 게임이 완료되는가?
- [ ] 시간 보너스가 올바르게 계산되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 작은 그리드, 적은 목표로 쉬운 시작
- **Lv.3-4**: 그리드 확장, 눈이 바빠짐
- **Lv.5-6**: 최대 그리드, 빠른 탐색 필요

---

## 시각적 탐색 전략

- **체계적 스캔**: 왼쪽→오른쪽, 위→아래 순차 탐색
- **색상 구분**: 목표 이모지의 색상 특징 기억
- **패턴 인식**: 유사 이모지와 차이점 파악
- **집중**: 산만함 방지, 목표에 집중

---

## 개선 아이디어 (TODO)

- [ ] 여러 종류의 목표 이모지 (복합 탐색)
- [ ] 이모지가 움직이는 모드
- [ ] 힌트 기능 (남은 위치 표시)
- [ ] 콤보 시스템 (연속 정답)
- [ ] 그리드 확대/축소 기능

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `HiddenObject.vue`
