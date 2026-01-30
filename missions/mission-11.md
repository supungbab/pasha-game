# Mission 11: 숫자 맞추기 (Number Match)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 11 |
| **이름 (한글)** | 숫자 맞추기 |
| **이름 (영문)** | Number Match |
| **카테고리** | 퍼즐/인지 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 10초 |
| **기본 목표점수** | 90점 |
| **구현 파일** | `src/components/minigames/NumberMatch.vue` |

---

## 게임 설명

화면에 흩어진 숫자 타일들 중에서 제시된 순서대로 숫자를 찾아 탭하는 퍼즐 게임입니다. 1부터 시작하여 순서대로 숫자를 찾아야 하며, 올바른 숫자를 탭하면 점수를 획득하고 다음 숫자로 넘어갑니다.

---

## 시작 전 지시문

```
순서대로! 1️⃣2️⃣3️⃣
```

**지시문 이모지**: 1️⃣2️⃣3️⃣ (숫자)

---

## 게임 규칙

1. 화면에 숫자 타일들이 그리드 형태로 배치됨 (셔플됨)
2. 화면 상단에 찾아야 할 숫자가 표시됨 (1부터 시작)
3. 해당 숫자를 찾아 탭
   - **정답**: 10점 획득, 타일이 사라지고 다음 숫자로 진행
   - **오답**: 타일이 흔들리는 애니메이션 (감점 없음)
4. 모든 숫자를 순서대로 찾으면 완료
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 × 속도 혼합
- **정답 시**: 10점
- **오답 시**: 0점 (감점 없음)

### 결과 데이터
- `score`: 총 점수
- `count`: 성공 횟수
- `accuracy`: 정확도 (성공 / 총 숫자 × 100)
- `perfect`: 모든 숫자 찾음 여부

### 난이도별 목표 점수

| 난이도 | 그리드 크기 | 총 숫자 | 목표 점수 | 필요 정답 |
|--------|-----------|--------|----------|----------|
| Lv.1 | 3×3 | 9개 | 90점 | 9개 (전체) |
| Lv.2 | 3×3 | 9개 | 90점 | 9개 |
| Lv.3 | 4×4 | 16개 | 120점 | 12개 |
| Lv.4 | 4×4 | 16개 | 144점 | 14개 |
| Lv.5 | 5×5 | 25개 | 176점 | 17개 |
| Lv.6 | 5×5 | 25개 | 200점 | 20개 |

---

## 제한 시간

- **기본**: 10초
- **난이도별 조정**: 동일 (10초)

---

## 난이도별 변화

| 난이도 | 그리드 크기 | 타일 크기 | 총 숫자 수 |
|--------|-----------|----------|-----------|
| Lv.1 | 3×3 | 100px | 9개 |
| Lv.2 | 3×3 | 95px | 9개 |
| Lv.3 | 4×4 | 80px | 16개 |
| Lv.4 | 4×4 | 75px | 16개 |
| Lv.5 | 5×5 | 65px | 25개 |
| Lv.6 | 5×5 | 60px | 25개 |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { gridSize: 3, tileSize: 100 },  // Lv.1: 3x3 = 9 numbers
    { gridSize: 3, tileSize: 95 },   // Lv.2
    { gridSize: 4, tileSize: 80 },   // Lv.3: 4x4 = 16 numbers
    { gridSize: 4, tileSize: 75 },   // Lv.4
    { gridSize: 5, tileSize: 65 },   // Lv.5: 5x5 = 25 numbers
    { gridSize: 5, tileSize: 60 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});
```

---

## 하드 모드 🔥

- 숫자가 주기적으로 위치 변경 (셔플)
- 일부 숫자가 깜빡임
- 타일 크기 10% 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 다채로운 타일 색상
> - 어두운 배경 그라데이션
> - 둥근 모서리 (border-radius: 10px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│       "5 를 찾으세요!"              │
│           5️⃣                       │
├─────────────────────────────────────┤
│                                     │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │ 7 │ │ 2 │ │ 9 │ │ 5 │ ← 타겟   │
│   └───┘ └───┘ └───┘ └───┘         │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │ 1 │ │ 8 │ │ 3 │ │ 6 │         │
│   └───┘ └───┘ └───┘ └───┘         │
│         (숫자 1-4는 찾아서 사라짐)   │
│                                     │
│  진행: 4/9              점수: 40    │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundGradient: [
  { stop: 0, color: '#2C3E50' },
  { stop: 1, color: '#1a252f' }
]

// 타일 색상 (숫자별 순환)
const TILE_COLORS = [
  '#3498DB',  // 파랑
  '#E74C3C',  // 빨강
  '#2ECC71',  // 초록
  '#F39C12',  // 주황
  '#9B59B6',  // 보라
  '#1ABC9C',  // 청록
  '#E67E22',  // 오렌지
  '#34495E'   // 회색
];

// 타일 색상 결정
tile.color = TILE_COLORS[tile.value % TILE_COLORS.length];

// UI
instructionColor: '#FFF'
progressColor: '#AAA'
feedbackCorrect: '#2ECC71'
feedbackWrong: '#E74C3C'
```

### 숫자 이모지 힌트
```typescript
const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

// 1-9 범위일 때만 이모지 표시
if (currentTarget.value <= 9) {
  ctx.value.fillText(numberEmojis[currentTarget.value] ?? '', width / 2, 130);
}
```

### 타일 디자인
```javascript
// 그림자
helper.drawRoundRect(x + 3, y + 3, scaledSize, scaledSize, 10, 'rgba(0, 0, 0, 0.3)');

// 타일 배경
helper.drawRoundRect(x, y, scaledSize, scaledSize, 10, tile.color);

// 하이라이트 (상단 반만)
const highlightGradient = ctx.createLinearGradient(x, y, x, y + scaledSize);
highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
ctx.fillStyle = highlightGradient;
ctx.roundRect(x, y, scaledSize, scaledSize / 2, [10, 10, 0, 0]);

// 숫자 텍스트
ctx.font = `bold ${scaledSize * 0.5}px Arial`;
ctx.fillStyle = '#FFF';
ctx.fillText(tile.value.toString(), tile.x, tile.y);
```

---

## 구현 로직

### 주요 인터페이스
```typescript
interface NumberTile {
  value: number;       // 숫자 값 (1 ~ totalNumbers)
  x: number;           // X 좌표
  y: number;           // Y 좌표
  size: number;        // 타일 크기
  active: boolean;     // 아직 찾지 않음
  scale: number;       // 현재 스케일 (애니메이션)
  targetScale: number; // 목표 스케일
  color: string;       // 타일 색상
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const numbers = ref<NumberTile[]>([]);
const currentTarget = ref(1);            // 찾아야 할 숫자
const maxNumber = ref(9);                // 총 숫자 개수
const feedback = ref<{ text: string; color: string; life: number; x: number; y: number } | null>(null);
const successCount = ref(0);
```

### 숫자 그리드 생성
```typescript
function generateNumbers() {
  const settings = difficultySettings.value;
  const gridSize = settings.gridSize;
  const tileSize = settings.tileSize;
  const totalNumbers = gridSize * gridSize;

  maxNumber.value = totalNumbers;
  currentTarget.value = 1;

  // 1부터 totalNumbers까지 배열 생성 후 셔플
  const numberArray = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  shuffleArray(numberArray);

  // 그리드 위치 계산
  const gridWidth = gridSize * tileSize + (gridSize - 1) * 10;
  const startX = (width - gridWidth) / 2 + tileSize / 2;
  const startY = (height - gridWidth) / 2 + tileSize / 2 + 50;

  const tiles: NumberTile[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const value = numberArray[index] ?? 1;
      tiles.push({
        value,
        x: startX + col * (tileSize + 10),
        y: startY + row * (tileSize + 10),
        size: tileSize,
        active: true,
        scale: 0,
        targetScale: 1,
        color: TILE_COLORS[value % TILE_COLORS.length] ?? TILE_COLORS[0]!
      });
    }
  }

  numbers.value = tiles;

  // 등장 애니메이션 (순차적)
  tiles.forEach((tile, i) => {
    safeSetTimeout(() => {
      tile.targetScale = 1;
    }, i * 30);
  });
}
```

### 타일 터치 처리
```typescript
function checkTileHit(x: number, y: number) {
  const hitTile = numbers.value.find(tile => {
    if (!tile.active) return false;
    const halfSize = (tile.size * tile.scale) / 2;
    return pointInRect(x, y, tile.x - halfSize, tile.y - halfSize, tile.size * tile.scale, tile.size * tile.scale);
  });

  if (hitTile) {
    if (hitTile.value === currentTarget.value) {
      // 정답!
      score.value += 10;
      successCount.value++;
      hitTile.active = false;
      hitTile.targetScale = 0;  // 사라지는 애니메이션

      feedback.value = {
        text: '정답!',
        color: '#2ECC71',
        life: 1,
        x: hitTile.x,
        y: hitTile.y - 30
      };

      currentTarget.value++;
    } else {
      // 오답!
      feedback.value = {
        text: '오답!',
        color: '#E74C3C',
        life: 1,
        x: hitTile.x,
        y: hitTile.y - 30
      };

      // 흔들림 애니메이션
      const originalX = hitTile.x;
      let shakeCount = 0;
      const shakeIntervalId = safeSetInterval(() => {
        hitTile.x = originalX + (shakeCount % 2 === 0 ? 5 : -5);
        shakeCount++;
        if (shakeCount >= 6) {
          hitTile.x = originalX;
          clearInterval(shakeIntervalId);
        }
      }, 50);
    }
  }
}
```

### 게임 완료 조건
```typescript
// 업데이트에서 체크
if (currentTarget.value > maxNumber.value) {
  endGame();  // 모든 숫자 찾음
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 정답 | "딩!" | 밝은 성공음 |
| 오답 | "뿅" | 낮은 실패음 |
| 타일 등장 | "뚝뚝뚝" | 순차 등장음 |
| 완료 | "빠밤!" | 완료 팡파레 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 정답 | `50ms` | 짧은 성공 피드백 |
| 오답 | `[30, 20, 30, 20, 30]ms` | 흔들림 패턴 |

---

## UI 컴포넌트

### Canvas 기반 렌더링
모든 UI 요소를 Canvas에 직접 렌더링:
- 지시문 ("X 를 찾으세요!")
- 숫자 이모지 힌트
- 숫자 타일 그리드
- 피드백 텍스트
- 진행도 및 점수

---

## 스타일 정의

```css
.minigame {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  touch-action: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #FFFFFF;
}
```

---

## 테스트 체크리스트

- [ ] 숫자가 1부터 순서대로 셔플되어 배치되는가?
- [ ] 현재 찾아야 할 숫자가 명확히 표시되는가?
- [ ] 정답 터치 시 타일이 사라지는가?
- [ ] 오답 터치 시 흔들림 애니메이션이 동작하는가?
- [ ] 다음 숫자로 올바르게 진행되는가?
- [ ] 모든 숫자를 찾으면 게임이 완료되는가?
- [ ] 난이도별 그리드 크기가 변경되는가?
- [ ] 타일 등장 애니메이션이 자연스러운가?
- [ ] 피드백 텍스트가 올바르게 표시되는가?
- [ ] 진행도와 점수가 올바르게 업데이트되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 3×3 그리드로 숫자가 적어 빠르게 찾음
- **Lv.3-4**: 4×4 그리드로 약간의 탐색 필요
- **Lv.5-6**: 5×5 그리드로 많은 숫자 속에서 빠른 탐색 필수

---

## 개선 아이디어 (TODO)

- [ ] 시간 보너스 (빠른 클리어 시 추가 점수)
- [ ] 힌트 기능 (찾아야 할 숫자 강조)
- [ ] 역순 모드 (큰 숫자부터)
- [ ] 짝수/홀수 모드
- [ ] 레벨 업 시 숫자 재배치

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `NumberMatch.vue`
