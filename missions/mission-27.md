# Mission 27: 물체 회전 (Rotate Object)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 27 |
| **이름 (한글)** | 물체 회전 |
| **이름 (영문)** | Rotate Object |
| **카테고리** | 그리기/조작 |
| **조작 방식** | 드래그 회전 🔄 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/RotateObject.vue` |

---

## 게임 설명

화면 중앙의 **다이아몬드 물체**를 드래그하여 **목표 각도**에 맞추는 게임입니다. 점선 화살표가 목표 각도를 나타내며, 물체를 회전시켜 최대한 정확하게 목표 각도에 맞춰야 합니다. 손을 떼면 각도 차이에 따라 점수가 부여됩니다.

---

## 시작 전 지시문

```
목표 각도로 회전! 🔄
```

**지시문 이모지**: 🔄💎 (회전/다이아몬드)

---

## 게임 규칙

1. 화면 중앙에 다이아몬드 물체가 표시됨
2. 점선 화살표가 목표 각도(0~360°)를 나타냄
3. 물체를 드래그하여 회전
4. 손을 떼면 각도 차이 평가
   - **Perfect (≤ 판정범위)**: 20점
   - **Good (≤ 판정범위×3)**: 10점
   - **Miss**: 0점
5. 평가 후 새로운 목표 각도로 진행
6. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반

### 판정 기준

| 난이도 | Perfect 범위 | Good 범위 |
|--------|-------------|-----------|
| Lv.1 | ≤4.5° | ≤14° |
| Lv.2 | ≤4.0° | ≤13° |
| Lv.3 | ≤3.5° | ≤12° |
| Lv.4 | ≤3.0° | ≤11° |
| Lv.5 | ≤2.5° | ≤10° |
| Lv.6 | ≤2.0° | ≤8° |

### 점수 공식
```typescript
const perfectThreshold = Math.max(5 - props.difficulty * 0.5, 2);
const goodThreshold = Math.max(15 - props.difficulty, 8);

if (diff <= perfectThreshold) {
  points = 20; // Perfect
} else if (diff <= goodThreshold) {
  points = 10; // Good
} else {
  points = 0;  // Miss
}
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 Perfect 수 |
|--------|----------|------|----------------|
| Lv.1 | 60점 | ×1.0 | 3회 |
| Lv.2 | 72점 | ×1.2 | 3~4회 |
| Lv.3 | 90점 | ×1.5 | 4~5회 |
| Lv.4 | 108점 | ×1.8 | 5~6회 |
| Lv.5 | 132점 | ×2.2 | 6~7회 |
| Lv.6 | 150점 | ×2.5 | 7~8회 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | Perfect 범위 | Good 범위 | 설명 |
|--------|-------------|-----------|------|
| Lv.1 | 4.5° | 14° | 넓은 허용 범위 |
| Lv.2 | 4.0° | 13° | 약간 좁음 |
| Lv.3 | 3.5° | 12° | 중간 |
| Lv.4 | 3.0° | 11° | 좁음 |
| Lv.5 | 2.5° | 10° | 매우 좁음 |
| Lv.6 | 2.0° | 8° | 극한 정밀도 |

---

## 하드 모드 🔥

- 더 좁은 판정 범위
- 빠른 라운드 진행
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 보라 그라데이션 배경
> - 시각적인 각도 표시
> - 피드백 애니메이션

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│    성공: 4  |  점수: 70              │
│          PERFECT! 2°                │  ← 피드백
├─────────────────────────────────────┤
│                                     │
│           목표: 135°                │
│                                     │
│              ╲                      │  ← 목표 화살표 (점선, 노란색)
│            ◆   ╲                    │
│          ◆   ◆   ╲                  │  ← 다이아몬드 (회전)
│            ◆                        │
│                                     │
│           현재: 133°                │
│                                     │
│   드래그하여 목표 각도로 회전하세요!  │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(#667eea, #764ba2)'

/* 목표 화살표 */
targetArrowColor: '#FFD700'
targetArrowWidth: 4
targetArrowDash: [10, 10]

/* 중앙 원 */
centerCircleColor: 'white'
centerCircleBorder: '#333'

/* 다이아몬드 */
diamondFill: '#f44336'
diamondBorder: '#c62828'
diamondIndicator: '#FFD700'

/* 피드백 */
perfectColor: '#4CAF50'
goodColor: '#FFC107'
missColor: '#f44336'
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

// 회전 상태
let currentAngle = 0;
let targetAngle = 90;
let isDragging = false;
let lastMouseAngle = 0;
let isLocked = false;

// 난이도별 판정 범위
const perfectThreshold = Math.max(5 - props.difficulty * 0.5, 2);
const goodThreshold = Math.max(15 - props.difficulty, 8);
```

### 각도 계산
```typescript
function calculateAngle(x: number, y: number): number {
  const centerX = width / 2;
  const centerY = height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}
```

### 드래그 핸들러
```typescript
function handleStart(event: MouseEvent) {
  if (gameCompleted || isLocked) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  isDragging = true;
  lastMouseAngle = calculateAngle(event.clientX - rect.left, event.clientY - rect.top);
}

function handleMove(event: MouseEvent) {
  if (!isDragging || isLocked) return;

  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;

  const currentMouseAngle = calculateAngle(event.clientX - rect.left, event.clientY - rect.top);
  const angleDiff = currentMouseAngle - lastMouseAngle;

  currentAngle += angleDiff;
  currentAngle = currentAngle % 360;
  if (currentAngle < 0) currentAngle += 360;

  lastMouseAngle = currentMouseAngle;
}

function handleEnd() {
  if (!isDragging || isLocked) return;

  isDragging = false;
  checkAngle();
}
```

### 각도 평가
```typescript
function checkAngle() {
  isLocked = true;

  // 각도 차이 계산 (최소 각도)
  let diff = Math.abs(currentAngle - targetAngle);
  if (diff > 180) diff = 360 - diff;

  let points = 0;
  let feedbackText = '';
  let feedbackType: 'perfect' | 'good' | 'miss' = 'miss';

  if (diff <= perfectThreshold) {
    // Perfect!
    points = 20;
    feedbackText = `PERFECT! ${Math.round(diff)}°`;
    feedbackType = 'perfect';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  } else if (diff <= goodThreshold) {
    // Good
    points = 10;
    feedbackText = `Good! ${Math.round(diff)}°`;
    feedbackType = 'good';

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // Miss
    points = 0;
    feedbackText = `Miss! ${Math.round(diff)}°`;
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
    safeSetTimeout(() => completeGame(), 1000);
    return;
  }

  // 다음 라운드
  safeSetTimeout(() => resetRound(), 1500);
}
```

### 라운드 리셋
```typescript
function resetRound() {
  currentAngle = 0;
  targetAngle = Math.floor(Math.random() * 360);
  isLocked = false;
}
```

---

## 렌더링

### 목표 각도 화살표
```typescript
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate((targetAngle * Math.PI) / 180);

// 점선 화살표
ctx.strokeStyle = '#FFD700';
ctx.lineWidth = 4;
ctx.setLineDash([10, 10]);
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(150, 0);
ctx.stroke();
ctx.setLineDash([]);

// 화살표 끝
ctx.fillStyle = '#FFD700';
ctx.beginPath();
ctx.moveTo(150, 0);
ctx.lineTo(135, -10);
ctx.lineTo(135, 10);
ctx.closePath();
ctx.fill();

ctx.restore();
```

### 다이아몬드 물체
```typescript
ctx.save();
ctx.translate(centerX, centerY);
ctx.rotate((currentAngle * Math.PI) / 180);

// 다이아몬드 모양
ctx.fillStyle = '#f44336';
ctx.beginPath();
ctx.moveTo(0, -40);
ctx.lineTo(40, 0);
ctx.lineTo(0, 40);
ctx.lineTo(-40, 0);
ctx.closePath();
ctx.fill();

ctx.strokeStyle = '#c62828';
ctx.lineWidth = 3;
ctx.stroke();

// 방향 표시 (작은 원)
ctx.fillStyle = '#FFD700';
ctx.beginPath();
ctx.arc(0, -40, 8, 0, Math.PI * 2);
ctx.fill();

ctx.restore();
```

### 각도 텍스트
```typescript
ctx.fillStyle = 'white';
ctx.font = 'bold 32px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(`목표: ${targetAngle}°`, centerX, 80);
ctx.fillText(`현재: ${Math.round(currentAngle)}°`, centerX, centerY);

// 각도 차이 (잠금 상태에서만)
if (isLocked) {
  let diff = Math.abs(currentAngle - targetAngle);
  if (diff > 180) diff = 360 - diff;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`차이: ${Math.round(diff)}°`, centerX, centerY + 50);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 회전 | "휙" | 물체 회전 |
| Perfect | "딩딩!" | 완벽한 정렬 |
| Good | "딩!" | 좋은 정렬 |
| Miss | "삐" | 실패 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| Perfect | `[50, 30, 50, 30, 50]ms` | 축하 패턴 |
| Good | `[50, 30, 50]ms` | 성공 패턴 |
| Miss | `[100, 50, 100]ms` | 실패 패턴 |

---

## UI 컴포넌트

### 점수 표시
```html
<div class="score-display">
  성공: {{ successCount }}
  <span class="separator">|</span>
  점수: {{ score }}
</div>
```

### 피드백
```html
<div v-if="feedback" class="feedback" :class="feedback.type">
  {{ feedback.text }}
</div>
```

### 지시문
```html
<div class="instruction">
  드래그하여 목표 각도로 회전하세요!
</div>
```

---

## 스타일 정의

```css
.rotate-object {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.feedback {
  font-size: 32px;
  font-weight: 800;
  padding: 15px 30px;
  border-radius: 20px;
  animation: feedbackPop 1s ease-out;
}

.feedback.perfect {
  color: white;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: 3px solid #2e7d32;
}

.feedback.good {
  color: white;
  background: linear-gradient(135deg, #FFC107, #FFB300);
  border: 3px solid #F9A825;
}

.feedback.miss {
  color: white;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: 3px solid #c62828;
}

@keyframes feedbackPop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
```

---

## 테스트 체크리스트

- [ ] 목표 각도가 랜덤하게 생성되는가?
- [ ] 드래그로 물체가 회전하는가?
- [ ] 현재 각도가 실시간으로 표시되는가?
- [ ] 손을 떼면 평가가 수행되는가?
- [ ] Perfect/Good/Miss 판정이 정확한가?
- [ ] 점수가 올바르게 계산되는가?
- [ ] 피드백이 올바르게 표시되는가?
- [ ] 평가 후 새로운 목표 각도가 생성되는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?
- [ ] 터치/마우스 모두 지원되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 넓은 허용 범위로 쉬운 시작
- **Lv.3-4**: 적당한 정밀도 요구
- **Lv.5-6**: 높은 정밀도 필요

---

## 플레이 전략

- **천천히**: 빠르게 회전하면 정확도 낮아짐
- **숫자 확인**: 현재 각도 숫자를 보며 조절
- **미세 조정**: 목표 근처에서 천천히 조절
- **방향 확인**: 물체 상단의 노란 점이 방향 표시

---

## 개선 아이디어 (TODO)

- [ ] 다양한 물체 모양
- [ ] 크기 조절과 함께 회전
- [ ] 회전 속도 보너스
- [ ] 연속 Perfect 콤보
- [ ] 3D 회전 효과

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `RotateObject.vue`
