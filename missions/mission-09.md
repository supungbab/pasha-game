# Mission 09: 공 받기 (Catch the Ball)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 9 |
| **이름 (한글)** | 공 받기 |
| **이름 (영문)** | Catch the Ball |
| **카테고리** | 조작/타이밍 |
| **조작 방식** | 스와이프 👉 또는 드래그 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 50점 |
| **구현 파일** | `src/components/minigames/CatchBall.vue` |

---

## 게임 설명

하늘에서 떨어지는 다양한 공들을 바구니로 받는 게임입니다. 화면 하단의 바구니를 좌우로 드래그하여 이동시키고, 떨어지는 공을 받으면 점수를 획득합니다. 보너스 별(⭐)은 더 높은 점수를 줍니다.

---

## 시작 전 지시문

```
드래그! 👉
```

**지시문 이모지**: ⚽🏀⚾ (공), 🧺 (바구니)

---

## 게임 규칙

1. 화면 상단에서 다양한 공이 떨어짐
2. 화면 하단의 바구니(🧺)를 드래그하여 좌우 이동
3. 공을 바구니로 받으면 점수 획득
   - **일반 공** (⚽🏀⚾🎾): 5점
   - **보너스 별** (⭐): 10점 (15% 확률로 등장)
4. 공을 놓치면 점수 없음
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 성공 횟수 기반
- **일반 공**: 5점
- **보너스 별**: 10점

```typescript
const BALL_TYPES = [
  { emoji: '⚽', color: '#FFFFFF', points: 5 },
  { emoji: '🏀', color: '#FF8C00', points: 5 },
  { emoji: '⚾', color: '#FFFFFF', points: 5 },
  { emoji: '🎾', color: '#CCFF00', points: 5 },
  { emoji: '⭐', color: '#FFD700', points: 10 }, // Bonus (15% 확률)
];
```

### 결과 데이터
- `score`: 총 점수
- `count`: 잡은 공 개수
- `missCount`: 놓친 공 개수 (내부 추적용)

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 공 개수 (예상) |
|--------|----------|------|-------------------|
| Lv.1 | 50점 | ×1.0 | 10개 |
| Lv.2 | 60점 | ×1.2 | 12개 |
| Lv.3 | 75점 | ×1.5 | 15개 |
| Lv.4 | 90점 | ×1.8 | 18개 |
| Lv.5 | 110점 | ×2.2 | 22개 |
| Lv.6 | 125점 | ×2.5 | 25개 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 공 낙하 속도 | 생성 간격 | 바구니 너비 |
|--------|-------------|----------|-----------|
| Lv.1 | 3.0 px/frame | 1200ms | 90px |
| Lv.2 | 3.5 px/frame | 1000ms | 85px |
| Lv.3 | 4.0 px/frame | 900ms | 80px |
| Lv.4 | 4.5 px/frame | 800ms | 75px |
| Lv.5 | 5.0 px/frame | 700ms | 70px |
| Lv.6 | 5.5 px/frame | 600ms | 65px |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { ballSpeed: 3, spawnRate: 1200, basketWidth: 90 },   // Lv.1
    { ballSpeed: 3.5, spawnRate: 1000, basketWidth: 85 }, // Lv.2
    { ballSpeed: 4, spawnRate: 900, basketWidth: 80 },    // Lv.3
    { ballSpeed: 4.5, spawnRate: 800, basketWidth: 75 },  // Lv.4
    { ballSpeed: 5, spawnRate: 700, basketWidth: 70 },    // Lv.5
    { ballSpeed: 5.5, spawnRate: 600, basketWidth: 65 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});
```

---

## 하드 모드 🔥

- 폭탄(💣)이 등장 - 받으면 점수 차감 또는 실패
- 공이 좌우로 더 크게 흔들리며 낙하
- 바구니 너비 15% 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (보너스 별)
> - 어두운 배경 그라데이션 (우주/밤하늘 테마)
> - 둥근 모서리 (border-radius: 12px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│  점수: 45                           │
│  잡은 공: 9                         │
├─────────────────────────────────────┤
│         ⚽                          │
│              🏀                     │
│    ⭐                    ⚾         │
│                                     │
│         🎾                          │
│                                     │
│                                     │
│           ┌─────────┐               │
│           │  🧺    │  ← 바구니      │
│           └─────────┘               │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션 (우주 테마)
backgroundGradient: [
  { stop: 0, color: '#0f0c29' },    // 진한 남색
  { stop: 0.5, color: '#302b63' },  // 보라색
  { stop: 1, color: '#24243e' }     // 어두운 보라
]

// 바구니
basketGradient: ['#8B4513', '#A0522D', '#8B4513']  // 나무 색상
basketRim: '#5D3A1A'

// 공 그림자
ballShadow: 'rgba(0, 0, 0, 0.3)'

// 파티클
particleColor: (공 색상에 따라 동적)
```

### 공 타입별 비주얼
| 공 타입 | 이모지 | 색상 | 점수 |
|--------|--------|------|------|
| 축구공 | ⚽ | #FFFFFF | 5점 |
| 농구공 | 🏀 | #FF8C00 | 5점 |
| 야구공 | ⚾ | #FFFFFF | 5점 |
| 테니스공 | 🎾 | #CCFF00 | 5점 |
| 보너스 별 | ⭐ | #FFD700 | 10점 |

### 바구니 디자인
```typescript
// 바구니 형태 (사다리꼴)
ctx.beginPath();
ctx.moveTo(bx - bw / 2, by - bh / 2);           // 상단 좌측
ctx.lineTo(bx + bw / 2, by - bh / 2);           // 상단 우측
ctx.lineTo(bx + bw / 2 - 10, by + bh / 2);      // 하단 우측
ctx.lineTo(bx - bw / 2 + 10, by + bh / 2);      // 하단 좌측
ctx.closePath();

// 바구니 무늬 (가로선)
for (let i = 1; i < 4; i++) {
  const yOffset = (i / 4) * bh;
  const xShrink = (i / 4) * 10;
  // 가로선 그리기
}
```

### 파티클 효과
공을 받을 때 해당 공 색상의 파티클이 8개 방사형으로 퍼짐

---

## 구현 로직

### 주요 인터페이스
```typescript
interface Ball {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  type: typeof BALL_TYPES[0];
  wobbleOffset: number;   // 흔들림 오프셋
  wobbleSpeed: number;    // 흔들림 속도
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const balls = ref<Ball[]>([]);
const basket = ref({ x: width / 2, y: height - 80, width: 80, height: 50 });
const particles = ref<Particle[]>([]);
const catchCount = ref(0);
const missCount = ref(0);

// 포인터 추적
const isDragging = ref(false);
const lastPointerX = ref(0);
```

### 공 생성
```typescript
function spawnBall() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const isBonus = Math.random() < 0.15; // 15% 확률로 보너스 별
  const type = isBonus ? BALL_TYPES[4]! : BALL_TYPES[Math.floor(Math.random() * 4)]!;

  const ball: Ball = {
    id: ballIdCounter++,
    x: Math.random() * (width - 80) + 40,
    y: -30,
    radius: 25,
    speed: settings.ballSpeed * (0.8 + Math.random() * 0.4),
    type,
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.03
  };

  balls.value.push(ball);
}
```

### 업데이트 로직
```typescript
function update() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  basket.value.width = settings.basketWidth;

  // 공 업데이트
  balls.value = balls.value.filter(ball => {
    ball.y += ball.speed;
    ball.wobbleOffset += ball.wobbleSpeed;
    ball.x += Math.sin(ball.wobbleOffset) * 0.5;  // 좌우 흔들림

    // 바구니와 충돌 체크
    const basketCenterX = basket.value.x;
    const basketTop = basket.value.y - basket.value.height / 2;

    if (
      ball.y + ball.radius >= basketTop &&
      ball.y - ball.radius <= basketTop + 20 &&
      Math.abs(ball.x - basketCenterX) <= basket.value.width / 2 + ball.radius / 2
    ) {
      // 잡기 성공!
      score.value += ball.type.points;
      catchCount.value++;

      // 파티클 효과 생성
      if (helper.value) {
        const catchParticles = helper.value.createParticles(ball.x, ball.y, ball.type.color, 8);
        particles.value.push(...catchParticles);
      }

      return false;  // 공 제거
    }

    // 화면 밖으로 나감 (놓침)
    if (ball.y > height + 30) {
      missCount.value++;
      return false;
    }

    return true;
  });

  // 파티클 업데이트
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }
}
```

### 드래그 핸들러
```typescript
// 마우스 이벤트
function handlePointerDown(event: MouseEvent) {
  isDragging.value = true;
  const coords = getCanvasCoordinates(event);
  lastPointerX.value = coords.x;
  basket.value.x = coords.x;
}

function handlePointerMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const coords = getCanvasCoordinates(event);
  basket.value.x = Math.max(
    basket.value.width / 2,
    Math.min(width - basket.value.width / 2, coords.x)
  );
}

function handlePointerUp() {
  isDragging.value = false;
}

// 터치 이벤트
function handleTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  lastPointerX.value = coords.x;
  basket.value.x = coords.x;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  basket.value.x = Math.max(
    basket.value.width / 2,
    Math.min(width - basket.value.width / 2, coords.x)
  );
}

function handleTouchEnd() {
  isDragging.value = false;
}
```

### 렌더링
```typescript
function render() {
  if (!helper.value || !ctx.value) return;

  // 배경 그라데이션
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // 공 렌더링
  balls.value.forEach(ball => {
    // 그림자
    helper.value!.drawCircle(ball.x + 2, ball.y + 2, ball.radius, 'rgba(0, 0, 0, 0.3)');

    // 공 (이모지)
    ctx.value!.font = `${ball.radius * 2}px Arial`;
    ctx.value!.textAlign = 'center';
    ctx.value!.textBaseline = 'middle';
    ctx.value!.fillText(ball.type.emoji, ball.x, ball.y);
  });

  // 바구니 렌더링
  // ... (바구니 그라데이션, 형태, 무늬)

  // 바구니 이모지
  ctx.value.font = '30px Arial';
  ctx.value.fillText('🧺', basket.value.x, basket.value.y);

  // 파티클 렌더링
  if (helper.value) {
    particles.value = helper.value.updateAndDrawParticles(particles.value);
  }

  // UI 표시
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#FFF';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);
  ctx.value.font = '18px Arial';
  ctx.value.fillText(`잡은 공: ${catchCount.value}`, 20, 70);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 공 잡기 | "퐁!" | 경쾌한 포획음 |
| 보너스 별 잡기 | "딩딩!" | 높은 음의 보너스음 |
| 공 놓침 | "슈웅" | 낙하음 |
| 게임 시작 | "고고!" | 시작 알림 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 공 잡기 | `30ms` | 짧은 성공 피드백 |
| 보너스 별 잡기 | `[30, 20, 30]ms` | 특별 피드백 |

---

## UI 컴포넌트

### Canvas 기반 렌더링
이 게임은 모든 요소를 Canvas에 직접 렌더링합니다:
- 배경 그라데이션
- 떨어지는 공들 (이모지)
- 바구니 (그래픽 + 이모지)
- 파티클 효과
- 점수/통계 표시

### 캔버스 이벤트 바인딩
```html
<canvas
  ref="canvasRef"
  @mousedown="handlePointerDown"
  @mousemove="handlePointerMove"
  @mouseup="handlePointerUp"
  @touchstart="handleTouchStart"
  @touchmove="handleTouchMove"
  @touchend="handleTouchEnd"
></canvas>
```

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

- [ ] 바구니 드래그가 부드럽게 동작하는가?
- [ ] 바구니가 화면 밖으로 나가지 않는가?
- [ ] 공 생성 간격이 일정한가?
- [ ] 공 낙하 속도가 난이도에 따라 변하는가?
- [ ] 충돌 판정이 정확한가?
- [ ] 파티클 효과가 올바르게 생성되는가?
- [ ] 보너스 별이 약 15% 확률로 등장하는가?
- [ ] 점수 계산이 올바른가?
- [ ] 공 흔들림 효과가 자연스러운가?
- [ ] 터치와 마우스 이벤트 모두 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 넓은 바구니, 느린 공으로 여유롭게 플레이
- **Lv.3-4**: 중간 속도와 바구니 크기로 집중력 필요
- **Lv.5-6**: 빠른 공과 좁은 바구니로 민첩한 조작 필수

---

## 개선 아이디어 (TODO)

- [ ] 폭탄(💣) 추가 - 받으면 감점
- [ ] 콤보 시스템 (연속 잡기 보너스)
- [ ] 특수 공 (시간 추가, 바구니 확대)
- [ ] 배경 음악 추가
- [ ] 가속도계(기울이기) 조작 지원

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `CatchBall.vue`
