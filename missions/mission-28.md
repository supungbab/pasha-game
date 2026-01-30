# Mission 28: 크기 맞추기 (Size Match)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 28 |
| **이름 (한글)** | 크기 맞추기 |
| **이름 (영문)** | Size Match |
| **카테고리** | 그리기/조작 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/SizeMatch.vue` |

---

## 게임 설명

화면 중앙에서 **커졌다 작아졌다를 반복하는 원**을 **목표 크기**에 맞춰 정지시키는 타이밍 게임입니다. 노란색 점선으로 표시된 목표 원 크기와 현재 원 크기의 차이가 적을수록 높은 점수를 획득합니다. Perfect/Good/Miss 3단계 판정 시스템으로 정확도를 평가합니다.

---

## 시작 전 지시문

```
원을 맞춰요! 🔵
```

**지시문 이모지**: 🔵⭕ (원/크기)

---

## 게임 규칙

1. 화면 중앙에 원이 커졌다 작아졌다 반복
   - 최소 크기: 50px
   - 최대 크기: 250px
2. 목표 크기가 점선 원으로 표시됨
   - 노란색 점선 (🟡)
   - Perfect 구역: 녹색 표시
   - Good 구역: 노란색 표시
3. 화면 탭 시 원 정지 및 판정
   - **Perfect**: 목표 크기와 차이 ≤ perfectThreshold → 20점
   - **Good**: 목표 크기와 차이 ≤ goodThreshold → 10점
   - **Miss**: 그 외 → 0점
4. 판정 후 새로운 라운드 진행 (새 목표 크기)
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반 (Perfect/Good/Miss)

### 판정별 점수

| 판정 | 조건 | 점수 | 피드백 |
|------|------|------|--------|
| Perfect | diff ≤ perfectThreshold | 20점 | PERFECT! 🔥 |
| Good | diff ≤ goodThreshold | 10점 | Good! 👍 |
| Miss | diff > goodThreshold | 0점 | Miss! 😢 |

### 점수 공식
```typescript
const diff = Math.abs(currentRadius - targetRadius);

if (diff <= perfectThreshold) {
  points = 20;
  feedbackText = 'PERFECT! 🔥';
} else if (diff <= goodThreshold) {
  points = 10;
  feedbackText = 'Good! 👍';
} else {
  points = 0;
  feedbackText = 'Miss! 😢';
}

score.value += points;
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 라운드 |
|--------|----------|------|-------------|
| Lv.1 | 60점 | ×1.0 | 3회 Perfect 또는 6회 Good |
| Lv.2 | 72점 | ×1.2 | 4회 Perfect 또는 7~8회 Good |
| Lv.3 | 90점 | ×1.5 | 5회 Perfect 또는 9회 Good |
| Lv.4 | 108점 | ×1.8 | 6회 Perfect 또는 11회 Good |
| Lv.5 | 132점 | ×2.2 | 7회 Perfect 또는 13~14회 Good |
| Lv.6 | 150점 | ×2.5 | 8회 Perfect 또는 15회 Good |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 원 속도 | Perfect 범위 | Good 범위 |
|--------|--------|-------------|----------|
| Lv.1 | 2.5 | ≤18px | ≤37px |
| Lv.2 | 3.0 | ≤16px | ≤34px |
| Lv.3 | 3.5 | ≤14px | ≤31px |
| Lv.4 | 4.0 | ≤12px | ≤28px |
| Lv.5 | 4.5 | ≤10px | ≤25px |
| Lv.6 | 5.0 | ≤10px (최소) | ≤20px (최소) |

### 난이도 설정 로직
```typescript
// 원 성장/축소 속도
const growSpeed = 2 + props.difficulty * 0.5;

// Perfect/Good 판정 범위 (난이도가 높을수록 좁아짐)
const perfectThreshold = Math.max(20 - props.difficulty * 2, 10);
const goodThreshold = Math.max(40 - props.difficulty * 3, 20);
```

---

## 원 크기 상수

```typescript
const minRadius = 50;   // 최소 크기
const maxRadius = 250;  // 최대 크기

// 목표 크기 (랜덤)
// 범위: minRadius + 50 ~ maxRadius - 50
targetRadius = minRadius + 50 + Math.random() * (maxRadius - minRadius - 100);
// 결과: 100 ~ 200 사이의 랜덤 값
```

---

## 하드 모드 🔥

- 더 빠른 원 속도
- 더 좁은 판정 범위
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 그라데이션 배경
> - 판정 구역 시각화
> - 피드백 애니메이션

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 성공: 3 | 점수: 50                   │
├─────────────────────────────────────┤
│           PERFECT! 🔥                │  ← 피드백 (팝업)
│                                      │
│           목표: 150                  │
│                                      │
│         ┌ ─ ─ ─ ─ ─ ─ ┐            │  ← Good 구역 (노란색)
│        │ ┌ ─ ─ ─ ─ ┐  │            │  ← Perfect 구역 (녹색)
│        │ │   🔵    │  │            │  ← 현재 원 (변화 중)
│        │ └ ─ ─ ─ ─ ┘  │            │  ← 목표 원 (점선)
│         └ ─ ─ ─ ─ ─ ─ ┘            │
│                                      │
│            현재: 145                 │
│            차이: 5                   │  ← 정지 후 표시
│                                      │
│    원이 목표 크기에 가까울 때 탭!     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(#667eea, #764ba2)'

/* 목표 원 */
targetLineColor: '#FFD700'
targetLineWidth: 4
targetLineDash: [10, 10]

/* Perfect 구역 */
perfectZoneColor: 'rgba(76, 175, 80, 0.6)'

/* Good 구역 */
goodZoneColor: 'rgba(255, 193, 7, 0.3)'

/* 현재 원 색상 (상태별) */
perfectColor: '#4CAF50'   // 녹색 - Perfect 범위 내
goodColor: '#FFC107'      // 노란색 - Good 범위 내
missColor: '#f44336'      // 빨간색 - Miss 범위

/* 정지 상태 */
stoppedStrokeWidth: 8

/* 텍스트 */
textColor: 'white'
textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
```

---

## 구현 로직

### 게임 상태
```typescript
const score = ref(0);
const successCount = ref(0);
const feedback = ref<{ text: string; type: 'perfect' | 'good' | 'miss' } | null>(null);

let gameCompleted = false;
let startTime = 0;

// 원 상태
let currentRadius = 50;
let targetRadius = 150;
const minRadius = 50;
const maxRadius = 250;
let isGrowing = true;
let isStopped = false;

// 난이도별 속도
const growSpeed = 2 + props.difficulty * 0.5;

// Perfect/Good 판정 범위
const perfectThreshold = Math.max(20 - props.difficulty * 2, 10);
const goodThreshold = Math.max(40 - props.difficulty * 3, 20);
```

### 원 업데이트 (성장/축소)
```typescript
function update() {
  if (isStopped) return;

  if (isGrowing) {
    currentRadius += growSpeed;
    if (currentRadius >= maxRadius) {
      currentRadius = maxRadius;
      isGrowing = false;
    }
  } else {
    currentRadius -= growSpeed;
    if (currentRadius <= minRadius) {
      currentRadius = minRadius;
      isGrowing = true;
    }
  }
}
```

### 탭 핸들러 (정지 및 판정)
```typescript
function handleStop() {
  if (gameCompleted || isStopped) return;

  isStopped = true;

  // 차이 계산
  const diff = Math.abs(currentRadius - targetRadius);

  let points = 0;
  let feedbackText = '';
  let feedbackType: 'perfect' | 'good' | 'miss' = 'miss';

  if (diff <= perfectThreshold) {
    // Perfect!
    points = 20;
    feedbackText = 'PERFECT! 🔥';
    feedbackType = 'perfect';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  } else if (diff <= goodThreshold) {
    // Good
    points = 10;
    feedbackText = 'Good! 👍';
    feedbackType = 'good';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // Miss
    points = 0;
    feedbackText = 'Miss! 😢';
    feedbackType = 'miss';

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  if (points > 0) {
    successCount.value++;
  }

  score.value += points;
  showFeedback(feedbackText, feedbackType);

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    safeSetTimeout(() => {
      completeGame();
    }, 1000);
    return;
  }

  // 다음 라운드
  safeSetTimeout(() => {
    resetRound();
  }, 1200);
}
```

### 라운드 리셋
```typescript
function resetRound() {
  currentRadius = minRadius;
  isGrowing = true;
  isStopped = false;

  // 새로운 목표 크기 (랜덤)
  targetRadius = minRadius + 50 + Math.random() * (maxRadius - minRadius - 100);
}
```

---

## 렌더링

### 목표 원 (점선)
```typescript
// 목표 원 (외곽선)
c.strokeStyle = '#FFD700';
c.lineWidth = 4;
c.setLineDash([10, 10]);
c.beginPath();
c.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
c.stroke();
c.setLineDash([]);

// Perfect 구역
c.strokeStyle = 'rgba(76, 175, 80, 0.6)';
c.lineWidth = perfectThreshold * 2;
c.beginPath();
c.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
c.stroke();

// Good 구역
c.strokeStyle = 'rgba(255, 193, 7, 0.3)';
c.lineWidth = goodThreshold * 2;
c.beginPath();
c.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
c.stroke();
```

### 현재 원 (색상 변화)
```typescript
// 현재 원 색상 결정
let circleColor = '#f44336'; // 기본 빨간색 (Miss)
const diff = Math.abs(currentRadius - targetRadius);
if (diff <= perfectThreshold) {
  circleColor = '#4CAF50'; // 녹색 (Perfect)
} else if (diff <= goodThreshold) {
  circleColor = '#FFC107'; // 노란색 (Good)
}

if (isStopped) {
  // 정지 상태에서는 테두리만
  c.strokeStyle = circleColor;
  c.lineWidth = 8;
  c.beginPath();
  c.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
  c.stroke();
} else {
  // 이동 중에는 채움 (반투명)
  c.fillStyle = circleColor;
  c.globalAlpha = 0.7;
  c.beginPath();
  c.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;

  // 테두리
  c.strokeStyle = 'white';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
  c.stroke();
}
```

### 크기 정보 텍스트
```typescript
// 목표 크기
c.fillStyle = 'white';
c.font = 'bold 24px Arial';
c.textAlign = 'center';
c.textBaseline = 'middle';
c.fillText(`목표: ${Math.round(targetRadius)}`, centerX, 50);

// 현재 크기
c.fillText(`현재: ${Math.round(currentRadius)}`, centerX, centerY);

// 차이 표시 (정지 후)
if (isStopped) {
  const diff = Math.abs(currentRadius - targetRadius);
  c.fillText(`차이: ${Math.round(diff)}`, centerX, centerY + 40);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| Perfect | "딩딩딩!" | 연속 성공음 |
| Good | "딩딩!" | 성공음 |
| Miss | "삐" | 실패음 |
| 라운드 시작 | "슝" | 새 라운드 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| Perfect | `[50, 30, 50, 30, 50]ms` | 강한 연속 진동 |
| Good | `[50, 30, 50]ms` | 중간 연속 진동 |
| Miss | `[100, 50, 100]ms` | 실패 진동 |

---

## 테스트 체크리스트

- [ ] 원이 커졌다 작아졌다 반복하는가?
- [ ] 목표 원이 점선으로 표시되는가?
- [ ] Perfect/Good 구역이 시각적으로 표시되는가?
- [ ] 탭 시 원이 정지하는가?
- [ ] Perfect 판정 시 20점이 추가되는가?
- [ ] Good 판정 시 10점이 추가되는가?
- [ ] Miss 판정 시 0점인가?
- [ ] 피드백 팝업이 올바르게 표시되는가?
- [ ] 현재 원 색상이 범위에 따라 변하는가?
- [ ] 다음 라운드에서 새로운 목표 크기가 생성되는가?
- [ ] 난이도별 속도와 판정 범위가 적용되는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 느린 속도, 넓은 판정 범위로 적응
- **Lv.3-4**: 빠른 속도, 좁아지는 판정 범위
- **Lv.5-6**: 빠른 반응과 정확한 타이밍 필요

---

## 플레이 전략

- **색상 확인**: 원 색상이 녹색일 때 탭 (Perfect 범위)
- **예측 탭**: 원이 목표에 도달하기 직전 탭
- **성장/축소 파악**: 원이 커지는지 작아지는지 파악
- **연속 Perfect**: Perfect 연속 성공으로 빠른 목표 달성

---

## 개선 아이디어 (TODO)

- [ ] 목표 모양 변경 (원 → 사각형, 삼각형)
- [ ] 이동하는 목표 (위치도 맞추기)
- [ ] 콤보 시스템 (연속 Perfect 보너스)
- [ ] 속도 변화 (가속/감속)
- [ ] 멀티 원 (여러 원 동시 맞추기)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `SizeMatch.vue`
