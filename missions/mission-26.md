# Mission 26: 선 긋기 (Draw Line)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 26 |
| **이름 (한글)** | 선 긋기 |
| **이름 (영문)** | Draw Line |
| **카테고리** | 그리기/조작 |
| **조작 방식** | 드래그 ✏️ |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/DrawLine.vue` |

---

## 게임 설명

화면에 표시된 **점선 경로**를 따라 손가락으로 그리는 게임입니다. 시작점에서 끝점까지 점선을 최대한 정확하게 따라 그려야 합니다. 그린 경로와 목표 경로의 유사도에 따라 점수가 부여됩니다.

---

## 시작 전 지시문

```
점선을 따라 그려요! ✏️
```

**지시문 이모지**: ✏️📝 (연필/그림)

---

## 게임 규칙

1. 화면에 점선으로 목표 경로가 표시됨
   - 시작점: 녹색 원 (🟢 "시작")
   - 끝점: 빨간색 원 (🔴 "끝")
2. 드래그하여 점선을 따라 그리기
3. 손을 떼면 정확도 평가
   - **70% 이상**: 점수 획득 (정확도 × 0.8)
   - **70% 미만**: 다시 시도
4. 평가 후 새로운 도형으로 진행
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반
- **70% 이상**: 정확도 × 0.8 점
- **70% 미만**: 0점 (다시 시도)

### 점수 공식
```typescript
if (accuracy >= 70) {
  const points = Math.round(accuracy * 0.8);
  score.value += points;
}
```

### 정확도별 점수 예시
| 정확도 | 점수 | 결과 |
|--------|------|------|
| 100% | 80점 | PERFECT! ⭐ |
| 90% | 72점 | 정확해요! |
| 80% | 64점 | 정확해요! |
| 70% | 56점 | 정확해요! |
| 60% | 0점 | 다시 시도! |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 라운드 |
|--------|----------|------|-----------|
| Lv.1 | 60점 | ×1.0 | ~1회 |
| Lv.2 | 72점 | ×1.2 | ~1회 |
| Lv.3 | 90점 | ×1.5 | 1~2회 |
| Lv.4 | 108점 | ×1.8 | 2회 |
| Lv.5 | 132점 | ×2.2 | 2회 |
| Lv.6 | 150점 | ×2.5 | 2~3회 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 도형 복잡도 | 허용 오차 | 설명 |
|--------|-----------|----------|------|
| Lv.1 | simple | 40px | 직선 |
| Lv.2 | simple | 35px | 직선 |
| Lv.3 | medium | 30px | L, V, Z 모양 |
| Lv.4 | medium | 25px | L, V, Z 모양 |
| Lv.5 | complex | 20px | 삼각형, 별, 사각형 |
| Lv.6 | complex | 15px | 삼각형, 별, 사각형 |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { complexity: 'simple', tolerance: 40 },    // Lv.1
    { complexity: 'simple', tolerance: 35 },    // Lv.2
    { complexity: 'medium', tolerance: 30 },    // Lv.3
    { complexity: 'medium', tolerance: 25 },    // Lv.4
    { complexity: 'complex', tolerance: 20 },   // Lv.5
    { complexity: 'complex', tolerance: 15 },   // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});
```

---

## 도형 종류

### Simple (단순)
```typescript
// 수평선
[{ x: 80, y: height / 2 }, { x: width - 80, y: height / 2 }]

// 수직선
[{ x: width / 2, y: 150 }, { x: width / 2, y: height - 150 }]

// 대각선
[{ x: 80, y: 150 }, { x: width - 80, y: height - 150 }]
```

### Medium (중간)
```typescript
// L 모양
[{ x: 100, y: 150 }, { x: 100, y: height - 200 }, { x: width - 100, y: height - 200 }]

// V 모양
[{ x: 80, y: 150 }, { x: width / 2, y: height - 200 }, { x: width - 80, y: 150 }]

// Z 모양
[{ x: 80, y: 150 }, { x: width - 80, y: 150 }, { x: 80, y: height - 200 }, { x: width - 80, y: height - 200 }]
```

### Complex (복잡)
```typescript
// 삼각형
[{ x: width / 2, y: 150 }, { x: width - 80, y: height - 200 }, { x: 80, y: height - 200 }, { x: width / 2, y: 150 }]

// 별
// 5개의 꼭지점과 5개의 안쪽 점을 번갈아 연결

// 사각형
[{ x: 100, y: 180 }, { x: width - 100, y: 180 }, { x: width - 100, y: height - 200 }, { x: 100, y: height - 200 }, { x: 100, y: 180 }]
```

---

## 하드 모드 🔥

- 더 복잡한 도형
- 더 낮은 허용 오차
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 그리드 배경
> - 점선 목표 경로
> - 실선 사용자 경로

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 점수: 64                            │
├─────────────────────────────────────┤
│            90%                      │  ← 정확도 (완료 시)
│          정확해요!                   │
│                                     │
│     🟢시작                           │
│        ╲                            │  ← 점선 (파란색)
│         ╲ ╲                         │
│          ╲  ╲                       │  ← 사용자 경로 (빨간색)
│           ╲   ╲                     │
│            ╲    ╲                   │
│              ╲   🔴끝               │
│                                     │
│       점선을 따라 그리세요           │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundColor: '#F5F5F5'
gridColor: 'rgba(200, 200, 200, 0.5)'

/* 목표 경로 */
targetLineColor: '#3498DB'
targetLineWidth: 8
targetLineDash: [15, 10]

/* 시작/끝점 */
startPointColor: '#2ECC71'
endPointColor: '#E74C3C'

/* 사용자 경로 */
userLineColor: '#FF6B6B'
userLineWidth: 6

/* 결과 색상 */
successColor: '#2ECC71'
failColor: '#E74C3C'
```

---

## 구현 로직

### 점 인터페이스
```typescript
interface Point {
  x: number;
  y: number;
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
const isGameOver = ref(false);
const targetPath = ref<Point[]>([]);
const userPath = ref<Point[]>([]);
const isDrawing = ref(false);
const roundComplete = ref(false);
const accuracy = ref(0);
const roundCount = ref(0);
const totalAccuracy = ref(0);
```

### 목표 경로 생성
```typescript
function generateTargetPath() {
  const settings = difficultySettings.value;
  const shapeSet = SHAPES[settings.complexity];
  const shapeGenerator = shapeSet[Math.floor(Math.random() * shapeSet.length)];
  targetPath.value = shapeGenerator();
  userPath.value = [];
  roundComplete.value = false;
  accuracy.value = 0;
}
```

### 정확도 계산
```typescript
function calculateAccuracy(): number {
  if (userPath.value.length < 2) return 0;

  const targetPoints = getTargetPathPoints(Math.max(userPath.value.length, 50));
  const tolerance = difficultySettings.value.tolerance;

  let matchedPoints = 0;

  userPath.value.forEach(userPoint => {
    const minDist = Math.min(...targetPoints.map(tp =>
      distance(userPoint.x, userPoint.y, tp.x, tp.y)
    ));
    if (minDist <= tolerance) {
      matchedPoints++;
    }
  });

  return Math.round((matchedPoints / userPath.value.length) * 100);
}
```

### 그리기 핸들러
```typescript
function handlePointerDown(event: MouseEvent) {
  if (roundComplete.value) return;
  isDrawing.value = true;
  userPath.value = [];
  const coords = getCanvasCoordinates(event);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handlePointerMove(event: MouseEvent) {
  if (!isDrawing.value || roundComplete.value) return;
  const coords = getCanvasCoordinates(event);
  userPath.value.push({ x: coords.x, y: coords.y });
}

function handlePointerUp() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  evaluateDrawing();
}
```

### 그림 평가
```typescript
function evaluateDrawing() {
  if (userPath.value.length < 5) return;

  roundComplete.value = true;
  accuracy.value = calculateAccuracy();
  totalAccuracy.value += accuracy.value;
  roundCount.value++;

  if (accuracy.value >= 70) {
    const points = Math.round(accuracy.value * 0.8);
    score.value += points;

    if (accuracy.value >= 90) {
      createScorePopup(..., `+${points} 완벽해요! ⭐`, 'bonus');
    } else {
      createScorePopup(..., `+${points} 정확해요!`, 'score');
    }
  } else {
    createScorePopup(..., `${accuracy.value}% 다시 시도!`, 'miss');
  }

  // 다음 라운드
  safeSetTimeout(() => {
    if (!isGameOver.value) {
      generateTargetPath();
    }
  }, 1500);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 그리기 시작 | "슉" | 드래그 시작 |
| 성공 (90%+) | "딩딩!" | Perfect |
| 성공 (70%+) | "딩!" | Good |
| 실패 | "삐" | Miss |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 성공 | `[30, 20, 30]ms` | 성공 피드백 |
| 실패 | `[50, 30, 50]ms` | 실패 피드백 |

---

## 테스트 체크리스트

- [ ] 목표 경로가 점선으로 표시되는가?
- [ ] 시작/끝점이 명확하게 표시되는가?
- [ ] 드래그로 선을 그릴 수 있는가?
- [ ] 손을 떼면 정확도가 계산되는가?
- [ ] 정확도 70% 이상에서 점수가 추가되는가?
- [ ] 정확도 70% 미만에서 0점인가?
- [ ] 평가 후 새로운 도형이 생성되는가?
- [ ] 난이도별 도형 복잡도가 적용되는가?
- [ ] 피드백 팝업이 올바르게 표시되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 직선으로 쉬운 시작
- **Lv.3-4**: 꺾인 선 (L, V, Z)
- **Lv.5-6**: 닫힌 도형 (삼각형, 사각형, 별)

---

## 플레이 전략

- **시작점 확인**: 항상 시작점에서 시작
- **천천히**: 빠르게 그리면 정확도 낮아짐
- **미리 보기**: 전체 경로를 미리 확인
- **연습**: 손가락 컨트롤 연습

---

## 개선 아이디어 (TODO)

- [ ] 더 복잡한 도형 (나선, 하트)
- [ ] 그리기 속도 보너스
- [ ] 힌트 기능 (애니메이션 가이드)
- [ ] 멀티스트로크 (여러 선 긋기)
- [ ] 색상 그림 맞추기

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `DrawLine.vue`
