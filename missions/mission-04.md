# Mission 04: 꼬치 만들기 (Skewer Master)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 4 |
| **이름 (한글)** | 꼬치 만들기 |
| **이름 (영문)** | Skewer Master |
| **카테고리** | 타이밍 |
| **조작 방식** | 탭 (4버튼) 👆 |
| **기본 제한시간** | 12초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/04_SkewerMaster.vue` |

---

## 게임 설명

3개의 재료(🥩 고기, 🥬 채소, 🧅 양파)가 화면 상/중/하에서 각각 1개씩 출발하여 좌우로 이동합니다. 재료들이 겹치는 위치를 예측하여, 해당 방향의 꼬치 버튼을 눌러 재료를 꽂으세요! 많은 재료를 한번에 꽂을수록 높은 점수를 획득합니다.

---

## 시작 전 지시문

```
꼬치를 만들어라! 🍢
```

**지시문 이모지**: 🥩 (고기), 🥬 (채소), 🧅 (양파)

---

## 게임 규칙

1. 3개 재료가 **상/중/하** 각각 1개씩 출발
2. 각 재료는 **좌→우** 또는 **우→좌**로 수평 이동 (랜덤)
3. 어떤 재료가 어디서 나올지 **랜덤** 배치
4. 플레이어가 재료들이 **겹치는 위치를 예측**
5. **3개 버튼 (↖️⬆️↗️)**: 꼬치가 가운데 아래에서 해당 방향으로 뻗음
6. **피니시 버튼 (🏁)**: 꼬치 성공 후 활성화, 누르면 보너스 +20점
7. 해당 위치에 재료가 없을 때 버튼 누르면 Miss

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 타이밍 기반

| 조건 | 점수 |
|------|------|
| 1개 재료 꼬치 | 10점 |
| 2개 재료 꼬치 | 25점 |
| 3개 재료 꼬치 (PERFECT) | 50점 |
| 피니시 보너스 | +20점 |
| Miss | 0점 |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 웨이브 (예상) |
|--------|----------|------|-------------------|
| Lv.1 | 60점 | ×1.0 | Perfect 1회 + 피니시 |
| Lv.2 | 72점 | ×1.2 | Perfect 1회 + 피니시 + α |
| Lv.3 | 90점 | ×1.5 | Perfect 2회 |
| Lv.4 | 108점 | ×1.8 | Perfect 2회 + α |
| Lv.5 | 132점 | ×2.2 | Perfect 2-3회 |
| Lv.6 | 150점 | ×2.5 | Perfect 3회 |

---

## 제한 시간

- **기본**: 12초
- **난이도별 조정**: 동일 (12초)

---

## 난이도별 변화

| 난이도 | 재료 속도 | 겹침 판정 범위 |
|--------|----------|---------------|
| Lv.1 | 2.5 px/frame | 40px |
| Lv.2 | 3.0 px/frame | 40px |
| Lv.3 | 3.5 px/frame | 40px |
| Lv.4 | 4.0 px/frame | 40px |
| Lv.5 | 4.5 px/frame | 40px |
| Lv.6 | 5.0 px/frame | 40px |

### 속도 계산
```typescript
const baseSpeed = 2.0 + props.difficulty * 0.5;
```

---

## 하드 모드 🔥

- 재료 이동 속도 20% 증가
- 재료 이동 경로가 불규칙 (상하 흔들림 증가)
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (피니시 버튼 활성화, 강조)
> - **Secondary Orange**: `#FF9800` (꼬치 버튼)
> - **Neutral Cream**: `#FFF8E7` → `#FFE4B5` (배경 그라데이션)
> - 둥근 모서리 (border-radius: 12-20px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│  점수: 40 / 60         Wave 1       │
├─────────────────────────────────────┤
│                                     │
│  🥩 ──→                             │  ← 상단 (1개)
│                                     │
│                         ←── 🥬      │  ← 중단 (1개)
│                                     │
│  🧅 ──→                             │  ← 하단 (1개)
│                                     │
│      [↖️]      [⬆️]      [↗️]      │
│              [🏁]                   │
└─────────────────────────────────────┘
```

### 꼬치 동작
```
          ↖️ 버튼        ⬆️ 버튼       ↗️ 버튼

            ↖             ↑             ↗
             ↖            ↑            ↗
              ↖           ↑           ↗
               ↖          ↑          ↗
                ↖         ↑         ↗
                 ↖        ↑        ↗
                  ↖       ↑       ↗
                   ↖      ↑      ↗
                    ↖     ↑     ↗
                     ↖    ↑    ↗
                      ↖   ↑   ↗
                        ● ● ●
                          │
                          ●  ← 시작점 (가운데 아래)
```

모든 꼬치가 **동일한 시작점**(가운데 아래)에서 출발해서 각 방향으로 뻗어나감.

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundColor: '#FFF8E7' → '#FFE4B5'

// 꼬치 버튼
skewerBtnColor: '#FF9800' → '#F57C00'  // 그라데이션
skewerBtnBorder: '#E65100'

// 피니시 버튼 (비활성)
finishBtnInactive: '#9C27B0' → '#7B1FA2'

// 피니시 버튼 (활성)
finishBtnActive: '#FFD700' → '#FFC107'
```

### 재료 표현
```javascript
// 재료 이모지
const INGREDIENTS = [
  { type: 'meat', emoji: '🥩' },
  { type: 'vegetable', emoji: '🥬' },
  { type: 'onion', emoji: '🧅' }
];

ctx.font = '40px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(ingredient.emoji, ingredient.x, ingredient.y);
```

### 피드백 표시
| 판정 | 텍스트 | 색상 | 배경 |
|------|--------|------|------|
| Perfect (3개) | "PERFECT! 🍢 +50" | `#FFD700` | `rgba(255, 215, 0, 0.2)` |
| Good (2개) | "Good! 🍢 +25" | `#4CAF50` | `rgba(76, 175, 80, 0.2)` |
| 1개 | "꼬치! +10" | `#4CAF50` | `rgba(76, 175, 80, 0.2)` |
| Miss | "Miss! 😢" | `#f44336` | `rgba(244, 67, 54, 0.2)` |
| 피니시 | "피니시! 🏁 +20" | `#FFD700` | `rgba(255, 215, 0, 0.2)` |

---

## 구현 로직

### 주요 인터페이스

```typescript
// 재료 타입
type IngredientType = 'meat' | 'vegetable' | 'onion';

// Y 위치 (상/중/하)
type VerticalPosition = 'top' | 'middle' | 'bottom';

// 재료 인터페이스
interface Ingredient {
  type: IngredientType;
  emoji: string;        // '🥩', '🥬', '🧅'
  x: number;            // X 위치
  y: number;            // Y 위치
  verticalPos: VerticalPosition;  // 상/중/하 위치
  speed: number;        // 이동 속도
  direction: 'left-to-right' | 'right-to-left';
  skewered: boolean;    // 꼬치에 꽂혔는지
}

// 웨이브 인터페이스
interface Wave {
  ingredients: Ingredient[];
  completed: boolean;   // 웨이브 완료 여부
  skeweredCount: number;// 꽂힌 재료 수
}

// 꼬치 애니메이션
interface SkewerAnimation {
  active: boolean;
  direction: 'left' | 'center' | 'right';  // ↖️ | ⬆️ | ↗️
  progress: number;
  startX: number;       // 가운데 아래 X
  startY: number;       // 가운데 아래 Y
  ingredients: Ingredient[];
}
```

### 상수 정의
```typescript
const OVERLAP_THRESHOLD = 40;    // 겹침 판정 범위 (픽셀)

// 재료 Y 위치 (상/중/하)
const Y_POSITIONS = {
  top: height * 0.25,
  middle: height * 0.4,
  bottom: height * 0.55
};

// 꼬치 시작점 (가운데 아래)
const SKEWER_START_X = width / 2;
const SKEWER_START_Y = height * 0.8;

// 꼬치 방향별 목표 X
const SKEWER_TARGET_X = {
  left: width * 0.25,    // 왼쪽 대각선
  center: width * 0.5,   // 가운데
  right: width * 0.75    // 오른쪽 대각선
};
```

### 웨이브 생성 로직
```typescript
function createWave(): Wave {
  const speed = 2.0 + props.difficulty * 0.5;

  // 재료 순서 셔플
  const shuffledIngredients = shuffle([...INGREDIENTS]);

  // Y 위치 배열
  const positions: VerticalPosition[] = ['top', 'middle', 'bottom'];

  const ingredients: Ingredient[] = shuffledIngredients.map((ing, index) => {
    // 이동 방향 랜덤
    const direction = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
    const startX = direction === 'left-to-right' ? -30 : width + 30;
    const verticalPos = positions[index];

    return {
      type: ing.type,
      emoji: ing.emoji,
      x: startX,
      y: Y_POSITIONS[verticalPos],
      verticalPos,
      speed,
      direction,
      skewered: false
    };
  });

  return { ingredients, completed: false, skeweredCount: 0 };
}
```

### 겹침 판정 로직
```typescript
function checkIngredientsAtPosition(targetX: number): Ingredient[] {
  if (!currentWave.value) return [];

  return currentWave.value.ingredients.filter(ing => {
    if (ing.skewered) return false;
    return Math.abs(ing.x - targetX) <= OVERLAP_THRESHOLD;
  });
}
```

### 꼬치 핸들러
```typescript
function handleSkewer(direction: 'left' | 'center' | 'right') {
  const targetX = SKEWER_TARGET_X[direction];
  const ingredientsAtPosition = checkIngredientsAtPosition(targetX);

  if (ingredientsAtPosition.length === 0) {
    showFeedback('Miss! 😢', 'miss');
    return;
  }

  // 점수 계산
  const count = ingredientsAtPosition.length;
  let points = count === 3 ? 50 : count === 2 ? 25 : 10;
  score.value += points;

  // 꼬치 애니메이션 시작 (가운데 아래에서 해당 방향으로)
  startSkewerAnimation(direction, ingredientsAtPosition);

  // 피니시 버튼 활성화
  canFinish.value = true;
}
```

### 피니시 핸들러
```typescript
function handleFinish() {
  if (!canFinish.value) return;

  score.value += 20;  // 피니시 보너스
  showFeedback('피니시! 🏁 +20', 'perfect');
  canFinish.value = false;

  // 다음 웨이브 시작
  currentWave.value = createWave();
}
```

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| Perfect (3개) | `[50, 50, 50]ms` | 트리플 진동 |
| Good (2개) | `50ms` | 단일 진동 |
| 1개 | `30ms` | 짧은 진동 |
| Miss | `100ms` | 강한 진동 |
| 피니시 | `[30, 30, 30, 30]ms` | 쿼드러플 진동 |

---

## UI 컴포넌트

### 점수 표시
```html
<div class="score-display">
  점수: {{ score }}
  <span class="target">/ {{ props.targetScore }}</span>
</div>
```

### 피니시 버튼
```html
<button
  class="finish-btn"
  :class="{ active: canFinish, disabled: !canFinish }"
  :disabled="!canFinish"
  @touchstart.prevent="handleFinish"
>
  🏁
</button>
```

### 꼬치 버튼
```html
<div class="controls">
  <button class="skewer-btn" @touchstart.prevent="handleSkewer('left')">↖️</button>
  <button class="skewer-btn center" @touchstart.prevent="handleSkewer('center')">⬆️</button>
  <button class="skewer-btn" @touchstart.prevent="handleSkewer('right')">↗️</button>
</div>
```

---

## 테스트 체크리스트

- [ ] 3개 재료가 상/중/하에서 각각 1개씩 출발하는가?
- [ ] 재료 배치가 매 웨이브마다 랜덤인가?
- [ ] 재료 이동 방향(좌→우, 우→좌)이 랜덤인가?
- [ ] 3개 버튼(↖️⬆️↗️) 모두 정상 작동하는가?
- [ ] 꼬치가 가운데 아래에서 시작하여 해당 방향으로 뻗는가?
- [ ] 1/2/3개 재료 차등 점수가 정확한가?
- [ ] 피니시 버튼이 꼬치 성공 후에만 활성화되는가?
- [ ] 피니시 보너스 +20점이 적용되는가?
- [ ] Miss 판정이 올바르게 동작하는가?
- [ ] 난이도별 재료 속도 차이가 체감되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 재료가 느리게 이동, 타이밍 여유 있음
- **Lv.3-4**: 적당한 속도, 집중력 필요
- **Lv.5-6**: 빠른 재료, 정확한 타이밍 필수

---

## 개선 아이디어 (TODO)

- [ ] 특수 재료 (황금 재료 - 2배 점수)
- [ ] 콤보 시스템 (연속 Perfect 보너스)
- [ ] 다양한 꼬치 조합 보너스
- [ ] 장애물 (피해야 하는 재료)

---

**문서 버전**: 3.0
**최종 수정**: 2026-02-02
**참고 자료**: `MISSIONS_SUMMARY.md`, `04_SkewerMaster.vue`
