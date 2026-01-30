# Mission 30: 순서 나열 (Sort It)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 30 |
| **이름 (한글)** | 순서 나열 |
| **이름 (영문)** | Sort It |
| **카테고리** | 그리기/조작 |
| **조작 방식** | 드래그 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 100점 |
| **구현 파일** | `src/components/minigames/SortIt.vue` |

---

## 게임 설명

화면에 **뒤섞인 숫자 카드**들을 **오름차순으로 정렬**하는 게임입니다. 드래그 앤 드롭으로 카드 위치를 교환하여 1부터 N까지 순서대로 나열합니다. 정렬 완료 시 100점을 획득하고 다음 라운드로 진행합니다.

---

## 시작 전 지시문

```
숫자를 순서대로! 🔢
```

**지시문 이모지**: 🔢📊 (숫자/정렬)

---

## 게임 규칙

1. 화면에 뒤섞인 숫자 카드 표시
   - 카드 개수: 4~7개 (난이도에 따라)
2. 드래그하여 카드 위치 교환
3. 1, 2, 3, ... 순서로 정렬하면 라운드 성공
4. 라운드당 **100점** 획득
5. 정렬 완료 후 새로운 라운드 자동 시작
6. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 라운드 기반 (정렬 성공 횟수)

### 점수 공식
```typescript
// 정렬 완료 시
if (checkSorted()) {
  roundComplete.value = true;
  score.value += 100;
  roundCount.value++;

  // 파티클 효과
  items.value.forEach(item => {
    const celebrateParticles = helper.value!.createParticles(item.x, item.y, item.color, 5);
    particles.value.push(...celebrateParticles);
  });

  // 다음 라운드
  safeSetTimeout(() => {
    if (!isGameOver.value) {
      generateItems();
    }
  }, 1500);
}
```

### 결과 데이터
```typescript
const result: MiniGameResult = {
  success: score.value >= props.targetScore,
  score: score.value,
  timeRemaining: timeRemaining.value,
  count: roundCount.value  // 완료한 라운드 수
};
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 라운드 | 카드 개수 |
|--------|----------|------|-----------|----------|
| Lv.1 | 100점 | ×1.0 | 1회 | 4개 |
| Lv.2 | 120점 | ×1.2 | 2회 | 5개 |
| Lv.3 | 150점 | ×1.5 | 2회 | 5개 |
| Lv.4 | 180점 | ×1.8 | 2회 | 6개 |
| Lv.5 | 220점 | ×2.2 | 3회 | 6개 |
| Lv.6 | 250점 | ×2.5 | 3회 | 7개 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 카드 개수 | 카드 크기 | 정렬 복잡도 |
|--------|----------|----------|-----------|
| Lv.1 | 4개 | 70px | 낮음 |
| Lv.2 | 5개 | 65px | 낮음 |
| Lv.3 | 5개 | 60px | 중간 |
| Lv.4 | 6개 | 55px | 중간 |
| Lv.5 | 6개 | 50px | 높음 |
| Lv.6 | 7개 | 45px | 높음 |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { itemCount: 4, itemSize: 70 },   // Lv.1
    { itemCount: 5, itemSize: 65 },   // Lv.2
    { itemCount: 5, itemSize: 60 },   // Lv.3
    { itemCount: 6, itemSize: 55 },   // Lv.4
    { itemCount: 6, itemSize: 50 },   // Lv.5
    { itemCount: 7, itemSize: 45 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});
```

---

## 아이템 인터페이스

```typescript
interface SortItem {
  id: number;           // 고유 ID
  value: number;        // 숫자 값 (1~N)
  x: number;            // 현재 X 위치
  y: number;            // Y 위치 (고정)
  targetX: number;      // 목표 X 위치 (애니메이션용)
  size: number;         // 카드 크기
  color: string;        // 카드 색상
  originalIndex: number;  // 원래 인덱스
  currentIndex: number;   // 현재 슬롯 인덱스
}

const ITEM_COLORS = [
  '#E74C3C',  // 빨강
  '#E67E22',  // 주황
  '#F1C40F',  // 노랑
  '#2ECC71',  // 녹색
  '#3498DB',  // 파랑
  '#9B59B6',  // 보라
  '#1ABC9C'   // 청록
];
```

---

## 하드 모드 🔥

- 더 많은 카드
- 작은 카드 크기
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 드래그 앤 드롭 인터랙션
> - 파티클 효과
> - 부드러운 애니메이션

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 점수: 100              라운드: 2     │
├─────────────────────────────────────┤
│                                      │
│     숫자를 순서대로 정렬하세요!       │
│         1️⃣ ➡️ 🔢                    │
│                                      │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │  ← 슬롯 배경
│   │ 3 │ │ 1 │ │ 5 │ │ 2 │ │ 4 │    │  ← 숫자 카드 (드래그 가능)
│   └───┘ └───┘ └───┘ └───┘ └───┘    │
│                                      │
│           정렬 완료!                  │  ← 성공 메시지
│                                      │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(#2C3E50, #1a252f)'

/* 슬롯 */
slotColor: 'rgba(255, 255, 255, 0.1)'
slotRadius: 10

/* 카드 */
cardColors: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6', '#1ABC9C']
cardRadius: 10
cardShadow: 'rgba(0, 0, 0, 0.3)'

/* 드래그 상태 */
dragScale: 1.1
dragShadow: 'rgba(0, 0, 0, 0.4)'

/* 텍스트 */
numberColor: '#FFF'
successColor: '#2ECC71'

/* 하이라이트 */
highlightGradient: 'rgba(255, 255, 255, 0.4) → transparent'
```

---

## 구현 로직

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const items = ref<SortItem[]>([]);
const particles = ref<Particle[]>([]);
const isDragging = ref(false);
const draggedItem = ref<SortItem | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const roundComplete = ref(false);
const roundCount = ref(0);
```

### 아이템 생성 (셔플)
```typescript
function generateItems() {
  const settings = difficultySettings.value;
  const count = settings.itemCount;
  const size = settings.itemSize;

  // Create array of numbers 1 to count
  const values = Array.from({ length: count }, (_, i) => i + 1);

  // Shuffle values (Fisher-Yates)
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = values[i]!;
    values[i] = values[j]!;
    values[j] = temp;
  }

  // Calculate positions
  const totalWidth = count * size + (count - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;
  const y = height / 2;

  const newItems: SortItem[] = values.map((value, index) => ({
    id: index,
    value: value ?? 0,
    x: startX + index * (size + 10),
    y,
    targetX: startX + index * (size + 10),
    size,
    color: ITEM_COLORS[((value ?? 1) - 1) % ITEM_COLORS.length] ?? ITEM_COLORS[0]!,
    originalIndex: index,
    currentIndex: index
  }));

  items.value = newItems;
  roundComplete.value = false;
}
```

### 정렬 확인
```typescript
function checkSorted(): boolean {
  for (let i = 0; i < items.value.length - 1; i++) {
    const currentItem = items.value.find(item => item.currentIndex === i);
    const nextItem = items.value.find(item => item.currentIndex === i + 1);
    if (!currentItem || !nextItem || currentItem.value > nextItem.value) {
      return false;
    }
  }
  return true;
}
```

### 드래그 핸들러
```typescript
function startDrag(x: number, y: number) {
  const item = items.value.find(i =>
    pointInRect(x, y, i.x - i.size / 2, i.y - i.size / 2, i.size, i.size)
  );

  if (item) {
    isDragging.value = true;
    draggedItem.value = item;
    dragOffset.value = { x: x - item.x, y: y - item.y };
  }
}

function moveDrag(x: number, y: number) {
  if (!draggedItem.value) return;

  draggedItem.value.x = x - dragOffset.value.x;
  draggedItem.value.y = y - dragOffset.value.y;

  // Find which slot the item is over
  const settings = difficultySettings.value;
  const count = settings.itemCount;
  const size = settings.itemSize;
  const totalWidth = count * size + (count - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;

  const draggedIndex = Math.round((draggedItem.value.x - startX) / (size + 10));
  const clampedIndex = Math.max(0, Math.min(count - 1, draggedIndex));

  if (clampedIndex !== draggedItem.value.currentIndex) {
    // Swap with item at that position
    const otherItem = items.value.find(i => i !== draggedItem.value && i.currentIndex === clampedIndex);
    if (otherItem) {
      otherItem.currentIndex = draggedItem.value.currentIndex;
      otherItem.targetX = startX + otherItem.currentIndex * (size + 10);
    }
    draggedItem.value.currentIndex = clampedIndex;
  }
}

function endDrag() {
  if (!draggedItem.value) return;

  const settings = difficultySettings.value;
  const size = settings.itemSize;
  const totalWidth = settings.itemCount * size + (settings.itemCount - 1) * 10;
  const startX = (width - totalWidth) / 2 + size / 2;

  // Snap to position
  draggedItem.value.targetX = startX + draggedItem.value.currentIndex * (size + 10);
  draggedItem.value.y = height / 2;

  isDragging.value = false;
  draggedItem.value = null;

  // Check if sorted
  if (checkSorted()) {
    roundComplete.value = true;
    score.value += 100;
    roundCount.value++;

    // Create celebration particles
    if (helper.value) {
      items.value.forEach(item => {
        const celebrateParticles = helper.value!.createParticles(item.x, item.y, item.color, 5);
        particles.value.push(...celebrateParticles);
      });
    }

    // Generate new round after delay
    safeSetTimeout(() => {
      if (!isGameOver.value) {
        generateItems();
      }
    }, 1500);
  }
}
```

### 위치 애니메이션
```typescript
function update() {
  if (isGameOver.value) return;

  // Animate items to target positions
  items.value.forEach(item => {
    if (item !== draggedItem.value) {
      const dx = item.targetX - item.x;
      item.x += dx * 0.2;  // 부드러운 이동
    }
  });

  // Update particles
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }
}
```

---

## 렌더링

### 슬롯 배경
```typescript
// Draw slot indicators
const settings = difficultySettings.value;
const count = settings.itemCount;
const size = settings.itemSize;
const totalWidth = count * size + (count - 1) * 10;
const startX = (width - totalWidth) / 2 + size / 2;

for (let i = 0; i < count; i++) {
  const x = startX + i * (size + 10);
  const y = height / 2;

  // Slot background
  helper.value.drawRoundRect(x - size / 2, y - size / 2, size, size, 10, 'rgba(255, 255, 255, 0.1)');
}
```

### 카드 렌더링
```typescript
sortedItems.forEach(item => {
  const x = item.x;
  const y = item.y;
  const s = item.size;
  const isDragged = item === draggedItem.value;

  // Shadow
  if (isDragged) {
    helper.value!.drawRoundRect(x - s / 2 + 5, y - s / 2 + 8, s, s, 12, 'rgba(0, 0, 0, 0.4)');
  } else {
    helper.value!.drawRoundRect(x - s / 2 + 2, y - s / 2 + 3, s, s, 10, 'rgba(0, 0, 0, 0.3)');
  }

  // Item background
  const itemScale = isDragged ? 1.1 : 1;
  const scaledSize = s * itemScale;
  helper.value!.drawRoundRect(
    x - scaledSize / 2,
    y - scaledSize / 2,
    scaledSize,
    scaledSize,
    10,
    item.color
  );

  // Highlight gradient
  const highlightGradient = ctx.value!.createLinearGradient(
    x - scaledSize / 2,
    y - scaledSize / 2,
    x - scaledSize / 2,
    y
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.value!.fillStyle = highlightGradient;
  ctx.value!.beginPath();
  ctx.value!.roundRect(x - scaledSize / 2, y - scaledSize / 2, scaledSize, scaledSize / 2, [10, 10, 0, 0]);
  ctx.value!.fill();

  // Number
  ctx.value!.font = `bold ${scaledSize * 0.5}px Arial`;
  ctx.value!.fillStyle = '#FFF';
  ctx.value!.textAlign = 'center';
  ctx.value!.textBaseline = 'middle';
  ctx.value!.fillText(item.value.toString(), x, y);
});
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 카드 선택 | "톡" | 드래그 시작 |
| 위치 교환 | "슉" | 카드 스왑 |
| 정렬 완료 | "딩딩딩!" | 라운드 성공 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 카드 선택 | `20ms` | 드래그 피드백 |
| 위치 교환 | `15ms` | 스왑 피드백 |
| 정렬 완료 | `[30, 20, 30, 20, 30]ms` | 성공 피드백 |

---

## 테스트 체크리스트

- [ ] 숫자 카드가 셔플되어 표시되는가?
- [ ] 드래그로 카드를 선택할 수 있는가?
- [ ] 드래그 중 카드가 커지는가 (1.1배)?
- [ ] 다른 슬롯 위에서 카드 교환이 되는가?
- [ ] 놓았을 때 카드가 슬롯에 스냅되는가?
- [ ] 정렬 완료 시 100점이 추가되는가?
- [ ] 정렬 완료 시 파티클 효과가 나타나는가?
- [ ] 새 라운드에서 카드가 다시 셔플되는가?
- [ ] 난이도별 카드 개수가 적용되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 4~5개 카드, 빠른 정렬 가능
- **Lv.3-4**: 5~6개 카드, 전략적 교환 필요
- **Lv.5-6**: 6~7개 카드, 다수 교환 필요

---

## 플레이 전략

- **끝부터**: 가장 큰 숫자부터 오른쪽으로 배치
- **작은 숫자 우선**: 1, 2부터 왼쪽에 배치
- **효율적 교환**: 최소 교환으로 정렬
- **위치 확인**: 목표 위치 먼저 파악

---

## 개선 아이디어 (TODO)

- [ ] 교환 횟수 제한 (더 높은 점수 보너스)
- [ ] 특수 카드 (조커, 와일드)
- [ ] 내림차순 모드
- [ ] 색상 정렬 모드
- [ ] 멀티 행 정렬

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `SortIt.vue`
