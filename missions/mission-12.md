# Mission 12: 같은 그림 찾기 (Find Pair)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 12 |
| **이름 (한글)** | 같은 그림 찾기 |
| **이름 (영문)** | Find Pair |
| **카테고리** | 기억력/인지 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/FindPair.vue` |

---

## 게임 설명

뒤집힌 카드 중에서 같은 그림을 가진 카드 쌍을 찾는 기억력 게임입니다. 카드를 탭하면 뒤집히며 그림이 보이고, 두 장을 뒤집어 같은 그림이면 매칭 성공합니다.

---

## 시작 전 지시문

```
같은 그림을 찾아요! 🎴
```

**지시문 이모지**: 🎴 (카드), 🍎🍊🍋 등 (그림)

---

## 게임 규칙

1. 화면에 뒤집힌 카드들이 그리드 형태로 배치됨
2. 카드를 탭하면 뒤집혀서 과일 이모지가 보임
3. 두 장의 카드를 뒤집어 같은 그림인지 확인
   - **매칭 성공**: 15점 획득, 카드가 초록색으로 변경되고 유지
   - **매칭 실패**: 잠시 후 두 카드 모두 다시 뒤집힘
4. 모든 카드 쌍을 매칭하면 완료
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 매칭 성공 × 15점 + 시간 보너스
- **매칭 성공**: 15점
- **시간 보너스**: `남은 시간 × 5점`

```typescript
// 시간 보너스 계산
const timeBonus = Math.floor(timeRemaining * 5);
const totalScore = score.value + timeBonus;
```

### 난이도별 설정

| 난이도 | 카드 쌍 수 | 총 카드 수 | 기본 점수 (전체 매칭) |
|--------|-----------|----------|---------------------|
| Lv.1 | 5쌍 | 10장 | 75점 |
| Lv.2 | 6쌍 | 12장 | 90점 |
| Lv.3 | 6쌍 | 12장 | 90점 |
| Lv.4 | 7쌍 | 14장 | 105점 |
| Lv.5 | 8쌍 | 16장 | 120점 |
| Lv.6 | 8쌍 | 16장 | 120점 |

### 카드 쌍 수 계산
```typescript
const totalPairs = computed(() => {
  return Math.min(4 + props.difficulty, 8);
});
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 매칭 수 |
|--------|----------|------|-------------|
| Lv.1 | 60점 | ×1.0 | 4쌍 |
| Lv.2 | 72점 | ×1.2 | 5쌍 |
| Lv.3 | 90점 | ×1.5 | 6쌍 |
| Lv.4 | 108점 | ×1.8 | 7쌍 |
| Lv.5 | 132점 | ×2.2 | 8쌍 + 시간 보너스 |
| Lv.6 | 150점 | ×2.5 | 8쌍 + 시간 보너스 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 카드 쌍 | 그리드 배치 | 뒤집힘 유지 시간 |
|--------|--------|-----------|----------------|
| Lv.1 | 5쌍 | 4열 | 1.0초 |
| Lv.2 | 6쌍 | 4열 | 0.9초 |
| Lv.3 | 6쌍 | 4열 | 0.8초 |
| Lv.4 | 7쌍 | 4열 | 0.7초 |
| Lv.5 | 8쌍 | 4열 | 0.6초 |
| Lv.6 | 8쌍 | 4열 | 0.5초 |

---

## 하드 모드 🔥

- 처음 잠깐 모든 카드가 보였다가 뒤집힘 (암기 시간)
- 매칭 실패 시 감점
- 카드 위치가 한 번 섞임
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` → `#FFC107` (카드 뒷면 그라데이션)
> - **Success Green**: `#4CAF50` (매칭 성공)
> - 둥근 모서리 (border-radius: 16px)
> - 3D 플립 효과 (perspective, transform)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│   매칭: 3 / 6  |  점수: 45          │
├─────────────────────────────────────┤
│                                     │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │🎴│ │🍎│ │🎴│ │🍊│ ← 뒤집힌 카드 │
│   └───┘ └───┘ └───┘ └───┘         │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │🎴│ │🎴│ │🍎│ │🎴│ ← 매칭 중    │
│   └───┘ └───┘ └───┘ └───┘         │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │✓ │ │✓ │ │🎴│ │🎴│ ← 매칭 완료 │
│   └───┘ └───┘ └───┘ └───┘         │
│                                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 카드 뒷면 (셔플된 상태)
cardBackGradient: 'linear-gradient(135deg, #FFD700, #FFC107)'
cardBackEmoji: '🎴'

// 카드 앞면 (그림 보임)
cardFrontBackground: 'white'

// 매칭 성공
matchedBackground: 'linear-gradient(135deg, #4CAF50, #45a049)'

// UI
scoreBackground: 'rgba(0, 0, 0, 0.3)'
scoreColor: 'white'
```

### 이모지 세트
```typescript
const emojiSet = [
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇',
  '🍓', '🍒', '🥝', '🍑', '🥭', '🍍'
];
```

### 카드 플립 애니메이션 (CSS 3D)
```css
.card {
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}
```

---

## 구현 로직

### 주요 인터페이스
```typescript
interface Card {
  id: number;          // 고유 ID
  emoji: string;       // 그림 이모지
  pairId: number;      // 쌍 ID (같은 쌍은 같은 ID)
  isFlipped: boolean;  // 뒤집힌 상태
  isMatched: boolean;  // 매칭 완료 상태
}
```

### 게임 상태
```typescript
const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]);
const matches = ref(0);
const score = ref(0);
const isChecking = ref(false);  // 매칭 체크 중 (클릭 방지)

let gameCompleted = false;
let startTime = 0;
```

### 카드 초기화
```typescript
function initCards() {
  const selectedEmojis = emojiSet.slice(0, totalPairs.value);
  const cardData: Array<{ emoji: string; pairId: number }> = [];

  // 카드 쌍 생성 (각 이모지 2장씩)
  selectedEmojis.forEach((emoji, index) => {
    cardData.push({ emoji, pairId: index });
    cardData.push({ emoji, pairId: index });
  });

  // Fisher-Yates 셔플
  for (let i = cardData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
  }

  // Card 객체 생성
  cards.value = cardData.map((data, index) => ({
    id: index,
    emoji: data.emoji,
    pairId: data.pairId,
    isFlipped: false,
    isMatched: false
  }));
}
```

### 카드 클릭 핸들러
```typescript
function handleCardClick(card: Card) {
  // 클릭 방지 조건
  if (gameCompleted || isChecking.value) return;
  if (card.isFlipped || card.isMatched) return;
  if (flippedCards.value.length >= 2) return;

  // 카드 뒤집기
  card.isFlipped = true;
  flippedCards.value.push(card);

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // 2장이 뒤집혔으면 매칭 체크
  if (flippedCards.value.length === 2) {
    checkMatch();
  }
}
```

### 매칭 체크
```typescript
function checkMatch() {
  isChecking.value = true;

  const card1 = flippedCards.value[0];
  const card2 = flippedCards.value[1];

  if (!card1 || !card2) return;

  if (card1.pairId === card2.pairId) {
    // 매칭 성공!
    safeSetTimeout(() => {
      card1.isMatched = true;
      card2.isMatched = true;
      matches.value++;
      score.value += 15;

      // 진동 피드백 (성공)
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      flippedCards.value = [];
      isChecking.value = false;

      // 모든 카드 매칭 완료 확인
      if (matches.value === totalPairs.value) {
        completeGame();
      }
    }, 500);
  } else {
    // 매칭 실패
    safeSetTimeout(() => {
      card1.isFlipped = false;
      card2.isFlipped = false;
      flippedCards.value = [];
      isChecking.value = false;

      // 진동 피드백 (실패)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 1000);
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
    count: matches.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 800);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 카드 뒤집기 | "딸깍" | 카드 플립 소리 |
| 매칭 성공 | "딩딩!" | 밝은 성공음 |
| 매칭 실패 | "뿅" | 낮은 실패음 |
| 게임 완료 | "빠밤!" | 완료 팡파레 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 카드 뒤집기 | `30ms` | 짧은 터치 피드백 |
| 매칭 성공 | `[50, 30, 50]ms` | 성공 패턴 |
| 매칭 실패 | `[100, 50, 100]ms` | 실패 패턴 |

---

## UI 컴포넌트

### HTML 기반 렌더링 (CSS 3D)
이 게임은 CSS 3D 변환을 활용하여 카드 플립 효과를 구현합니다.

### 카드 그리드
```html
<div class="game-board">
  <div
    v-for="card in cards"
    :key="card.id"
    class="card"
    :class="{ flipped: card.isFlipped, matched: card.isMatched }"
    @touchstart.prevent="handleCardClick(card)"
  >
    <div class="card-inner">
      <div class="card-front">
        {{ card.emoji }}
      </div>
      <div class="card-back">
        🎴
      </div>
    </div>
  </div>
</div>
```

### 점수 표시
```html
<div class="score-display">
  매칭: {{ matches }} / {{ totalPairs }}
  <span class="separator">|</span>
  점수: {{ score }}
</div>
```

---

## 스타일 정의

```css
.find-pair {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  max-width: 600px;
  width: 100%;
  padding: 20px;
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner,
.card.matched .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-front {
  background: white;
  transform: rotateY(180deg);
  font-size: 48px;
}

.card-back {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  font-size: 48px;
}

.card.matched .card-front {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  animation: matchPulse 0.5s ease-out;
}

@keyframes matchPulse {
  0% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.2); }
  100% { transform: rotateY(180deg) scale(1); }
}

/* 반응형 그리드 */
@media (max-width: 600px) {
  .game-board {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}
```

---

## 테스트 체크리스트

- [ ] 카드 쌍이 올바르게 생성되는가?
- [ ] 카드가 랜덤하게 셔플되는가?
- [ ] 카드 플립 애니메이션이 부드러운가?
- [ ] 같은 카드를 두 번 클릭해도 무시되는가?
- [ ] 매칭 체크 중에 다른 카드 클릭이 방지되는가?
- [ ] 매칭 성공 시 카드가 초록색으로 변하는가?
- [ ] 매칭 실패 시 카드가 다시 뒤집히는가?
- [ ] 모든 매칭 완료 시 게임이 끝나는가?
- [ ] 시간 보너스가 올바르게 계산되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 적은 카드 쌍으로 기억 부담 낮음
- **Lv.3-4**: 중간 카드 쌍, 짧아지는 뒤집힘 유지 시간
- **Lv.5-6**: 많은 카드 쌍으로 기억력과 빠른 판단 필요

---

## 개선 아이디어 (TODO)

- [ ] 처음 잠깐 모든 카드 공개 (암기 시간)
- [ ] 콤보 시스템 (연속 매칭 보너스)
- [ ] 다양한 테마 (동물, 아이템 등)
- [ ] 힌트 기능 (한 쌍 강조)
- [ ] 3개 매칭 모드 (트리오 찾기)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `FindPair.vue`
