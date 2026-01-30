# Mission 20: 장애물 피하기 (Dodge It)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 20 |
| **이름 (한글)** | 장애물 피하기 |
| **이름 (영문)** | Dodge It |
| **카테고리** | 액션/수집 |
| **조작 방식** | 드래그/스와이프 👉 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/DodgeIt.vue` |

---

## 게임 설명

레이싱 카를 좌우로 드래그하여 위에서 떨어지는 장애물(자동차, 바위, 드럼통)을 피하는 서바이벌 게임입니다. 살아남은 시간에 따라 점수가 증가하며, 장애물에 부딪히면 즉시 게임 오버됩니다.

---

## 시작 전 지시문

```
피해서 살아남아요! 🏎️
```

**지시문 이모지**: 🚗🪨🛢️ (장애물)

---

## 게임 규칙

1. 화면 하단에 플레이어 차량(🏎️)이 위치
2. 위에서 장애물이 떨어짐
   - 🚗 **자동차**
   - 🪨 **바위**
   - 🛢️ **드럼통**
3. 드래그하여 플레이어 차량을 좌우로 이동
4. 장애물과 충돌하면 **즉시 게임 오버**
5. **생존 시간**에 따라 점수 증가 (1초당 5점)
6. 제한시간까지 살아남으면 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 생존 시간 기반
- **점수 증가**: 1초당 5점

### 점수 공식
```typescript
// 매 1초마다 5점 추가
scoreInterval = safeSetInterval(() => {
  if (!isGameOver.value) {
    score.value += 5;
  }
}, 1000);
```

### 생존 시간별 점수 예시
| 생존 시간 | 점수 |
|----------|------|
| 5초 | 25점 |
| 10초 | 50점 |
| 15초 | 75점 |
| 20초 | 100점 |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 생존 시간 |
|--------|----------|------|--------------|
| Lv.1 | 60점 | ×1.0 | 12초 |
| Lv.2 | 72점 | ×1.2 | 14.4초 |
| Lv.3 | 90점 | ×1.5 | 제한시간 내 불가 (15초) |
| Lv.4+ | - | - | 반드시 전체 생존 + 보너스 필요 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 장애물 속도 | 스폰 간격 | 장애물 크기 |
|--------|-----------|----------|-----------|
| Lv.1 | 3.0 | 1200ms | 30px |
| Lv.2 | 3.5 | 1000ms | 32px |
| Lv.3 | 4.0 | 900ms | 34px |
| Lv.4 | 4.5 | 800ms | 36px |
| Lv.5 | 5.0 | 700ms | 38px |
| Lv.6 | 5.5 | 600ms | 40px |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { obstacleSpeed: 3, spawnRate: 1200, obstacleSize: 30 },   // Lv.1
    { obstacleSpeed: 3.5, spawnRate: 1000, obstacleSize: 32 }, // Lv.2
    { obstacleSpeed: 4, spawnRate: 900, obstacleSize: 34 },    // Lv.3
    { obstacleSpeed: 4.5, spawnRate: 800, obstacleSize: 36 },  // Lv.4
    { obstacleSpeed: 5, spawnRate: 700, obstacleSize: 38 },    // Lv.5
    { obstacleSpeed: 5.5, spawnRate: 600, obstacleSize: 40 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});
```

---

## 하드 모드 🔥

- 장애물 속도 증가
- 스폰 간격 감소
- 복합 장애물 패턴
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 도로 테마 배경
> - 이모지 캐릭터
> - 차선 표시

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 점수: 45                            │
│ 생존: 9.2초                          │
├─────────────────────────────────────┤
│    |    🚗    |          |         │
│    |          |   🪨     |         │
│    |          |          |   🛢️   │
│    |   🪨     |          |         │
│    |          |          |         │
│    |          |   🚗     |         │
│    |          |          |         │
│    |          |          |         │
│    |          |    🏎️   |         │ ← 플레이어
│                                     │
│    드래그하여 장애물을 피하세요!      │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (도로) */
roadGradient: 'linear-gradient(#2C3E50, #1a252f)'

/* 차선 */
laneColor: 'rgba(255, 255, 255, 0.3)'
laneLineWidth: 4
laneDash: [30, 20]

/* 장애물 */
carColor: '#E74C3C'
rockColor: '#7F8C8D'
barrelColor: '#E67E22'

/* UI */
scoreColor: '#FFF'
textColor: '#AAA'
```

---

## 구현 로직

### 장애물 타입 정의
```typescript
const OBSTACLE_TYPES = [
  { type: 'car', emoji: '🚗', color: '#E74C3C' },
  { type: 'rock', emoji: '🪨', color: '#7F8C8D' },
  { type: 'barrel', emoji: '🛢️', color: '#E67E22' },
];
```

### 장애물 인터페이스
```typescript
interface Obstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  type: 'car' | 'rock' | 'barrel';
  rotation: number;
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const player = ref({ x: width / 2, y: height - 100, radius: 25 });
const obstacles = ref<Obstacle[]>([]);
const particles = ref<Particle[]>([]);
const survivalTime = ref(0);
const isDragging = ref(false);
```

### 장애물 스폰
```typescript
function spawnObstacle() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const typeIndex = Math.floor(Math.random() * OBSTACLE_TYPES.length);
  const obstacleType = OBSTACLE_TYPES[typeIndex];

  const obstacle: Obstacle = {
    id: obstacleIdCounter++,
    x: Math.random() * (width - 60) + 30,
    y: -40,
    radius: settings.obstacleSize,
    speed: settings.obstacleSpeed * (0.8 + Math.random() * 0.4), // 속도 변동
    type: obstacleType.type,
    rotation: 0
  };

  obstacles.value.push(obstacle);
}
```

### 충돌 감지
```typescript
function update() {
  if (isGameOver.value) return;

  const playerPos = player.value;

  obstacles.value = obstacles.value.filter(obs => {
    obs.y += obs.speed;
    obs.rotation += 0.05;

    // 충돌 체크 (원형 히트박스, 80% 적용으로 약간의 여유)
    if (circlesIntersect(
      playerPos.x, playerPos.y, playerPos.radius * 0.8,
      obs.x, obs.y, obs.radius * 0.8
    )) {
      // 충돌! 파티클 생성 후 게임 오버
      if (helper.value) {
        const hitParticles = helper.value.createParticles(
          playerPos.x, playerPos.y, '#FF4444', 20
        );
        particles.value.push(...hitParticles);
      }
      endGame();
      return false;
    }

    return obs.y < height + 50; // 화면 밖 장애물 제거
  });
}
```

### 플레이어 이동
```typescript
// 마우스/터치 핸들러
function handlePointerMove(event: MouseEvent) {
  if (!isDragging.value) return;
  const coords = getCanvasCoordinates(event);
  movePlayer(coords.x);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  movePlayer(coords.x);
}

function movePlayer(x: number) {
  const minX = player.value.radius + 10;
  const maxX = width - player.value.radius - 10;
  player.value.x = Math.max(minX, Math.min(maxX, x)); // 경계 제한
}
```

---

## 렌더링

### 도로 배경
```typescript
function render() {
  // 도로 그라데이션
  const roadGradient = ctx.value.createLinearGradient(0, 0, 0, height);
  roadGradient.addColorStop(0, '#2C3E50');
  roadGradient.addColorStop(1, '#1a252f');
  ctx.value.fillStyle = roadGradient;
  ctx.value.fillRect(0, 0, width, height);

  // 차선 표시
  ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.value.lineWidth = 4;
  ctx.value.setLineDash([30, 20]);

  for (let i = 1; i < 4; i++) {
    const x = (width / 4) * i;
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, height);
    ctx.value.stroke();
  }
  ctx.value.setLineDash([]);
}
```

### 장애물 렌더링
```typescript
obstacles.value.forEach(obs => {
  const obsType = OBSTACLE_TYPES.find(t => t.type === obs.type);

  ctx.value.save();
  ctx.value.translate(obs.x, obs.y);

  // 그림자
  ctx.value.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.value.beginPath();
  ctx.value.ellipse(3, 5, obs.radius, obs.radius * 0.5, 0, 0, Math.PI * 2);
  ctx.value.fill();

  // 이모지
  ctx.value.font = `${obs.radius * 1.8}px Arial`;
  ctx.value.textAlign = 'center';
  ctx.value.textBaseline = 'middle';
  ctx.value.fillText(obsType.emoji, 0, 0);

  ctx.value.restore();
});
```

### 플레이어 렌더링
```typescript
const px = player.value.x;
const py = player.value.y;
const pr = player.value.radius;

// 그림자
ctx.value.fillStyle = 'rgba(0, 0, 0, 0.3)';
ctx.value.beginPath();
ctx.value.ellipse(px + 2, py + 4, pr, pr * 0.5, 0, 0, Math.PI * 2);
ctx.value.fill();

// 플레이어 차량
ctx.value.font = `${pr * 2.2}px Arial`;
ctx.value.textAlign = 'center';
ctx.value.textBaseline = 'middle';
ctx.value.fillText('🏎️', px, py);
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 게임 시작 | "엔진" | 차량 출발음 |
| 장애물 통과 | "휙" | 가까스로 피함 |
| 충돌 | "쾅!" | 폭발/충돌음 |
| 시간 경고 | "틱틱" | 남은 시간 3초 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 충돌 | `[100, 50, 100]ms` | 강한 충돌 피드백 |

---

## 테스트 체크리스트

- [ ] 장애물이 일정 간격으로 스폰되는가?
- [ ] 장애물 종류가 랜덤하게 선택되는가?
- [ ] 드래그로 플레이어가 좌우 이동하는가?
- [ ] 플레이어가 화면 밖으로 나가지 않는가?
- [ ] 충돌 시 즉시 게임 오버되는가?
- [ ] 생존 시간에 따라 점수가 증가하는가?
- [ ] 파티클 효과가 충돌 시 표시되는가?
- [ ] 터치/마우스 모두 지원되는가?
- [ ] 제한시간 종료 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 느린 속도, 적은 장애물로 적응
- **Lv.3-4**: 빠른 속도, 많은 장애물
- **Lv.5-6**: 매우 빠름, 거의 틈 없는 장애물

---

## 플레이 전략

- **중앙 위치**: 좌우 어느 쪽으로든 피할 수 있도록 중앙 유지
- **작은 움직임**: 큰 동작보다 작은 회피 동작이 효과적
- **패턴 예측**: 장애물 위치를 미리 확인하고 경로 계획
- **여유 공간 확보**: 벽 쪽으로 너무 가지 않기

---

## 개선 아이디어 (TODO)

- [ ] 파워업 아이템 (무적, 슬로우 모션)
- [ ] 부스터 아이템 (점수 2배)
- [ ] 장애물 패턴 다양화
- [ ] 다중 차선 표시
- [ ] 배경 스크롤 효과

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `DodgeIt.vue`
