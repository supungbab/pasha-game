# Mission 25: 스피드 런 (Speed Run)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 25 |
| **이름 (한글)** | 스피드 런 |
| **이름 (영문)** | Speed Run |
| **카테고리** | 액션/수집 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 (거리 60m) |
| **구현 파일** | `src/components/minigames/SpeedRun.vue` |

---

## 게임 설명

자동으로 달리는 러너(🏃)를 조작하여 장애물을 점프로 피하는 런 게임입니다. 캐릭터는 자동으로 앞으로 달리며, 화면을 탭하면 점프합니다. 장애물에 부딪히면 즉시 게임 오버! 최대한 멀리 달려 목표 거리를 달성해야 합니다.

---

## 시작 전 지시문

```
장애물을 피해 달려요! 🏃
```

**지시문 이모지**: 🏃💨 (러너)

---

## 게임 규칙

1. 캐릭터가 자동으로 달림 (거리 자동 증가)
2. 화면 탭 시 점프 (땅에 있을 때만)
3. 장애물이 오른쪽에서 왼쪽으로 이동
4. 장애물에 충돌하면 **즉시 게임 오버**
5. 목표 거리 달성 시 성공
6. 최종 점수 = 달린 거리 × 10

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 거리 기반
- **거리 증가**: gameSpeed × 0.1 (프레임당)
- **최종 점수**: 거리 × 10

### 점수 공식
```typescript
// 매 프레임 거리 증가
distance.value += gameSpeed * 0.1;

// 최종 점수
const finalScore = Math.floor(distance.value) * 10;
```

### 난이도별 목표 점수

| 난이도 | 목표 거리 | 게임 속도 | 장애물 간격 |
|--------|----------|----------|-----------|
| Lv.1 | 60m | 4.5 | 95프레임 |
| Lv.2 | 72m | 5.0 | 90프레임 |
| Lv.3 | 90m | 5.5 | 85프레임 |
| Lv.4 | 108m | 6.0 | 80프레임 |
| Lv.5 | 132m | 6.5 | 75프레임 |
| Lv.6 | 150m | 7.0 | 60프레임 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 게임 속도 | 장애물 스폰 간격 | 특징 |
|--------|----------|----------------|------|
| Lv.1 | 4.5 | 95프레임 | 느리고 여유로움 |
| Lv.2 | 5.0 | 90프레임 | 약간 빠름 |
| Lv.3 | 5.5 | 85프레임 | 중간 |
| Lv.4 | 6.0 | 80프레임 | 빠름 |
| Lv.5 | 6.5 | 75프레임 | 매우 빠름 |
| Lv.6 | 7.0 | 60프레임 | 최고 속도 |

### 난이도 설정 로직
```typescript
// 게임 속도
const gameSpeed = 4 + props.difficulty * 0.5;

// 장애물 스폰 간격
const obstacleSpawnInterval = Math.max(100 - props.difficulty * 10, 60);
```

---

## 하드 모드 🔥

- 더 빠른 게임 속도
- 더 짧은 장애물 간격
- 높은 장애물 등장
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 횡스크롤 배경
> - 이모지 캐릭터
> - 스크롤 효과

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 목표: 60m                거리: 45m  │
├─────────────────────────────────────┤
│         ☁️       ☁️                │
│                      ☁️            │
│                                     │
│                                     │
│                              ■      │ ← 장애물
│  🏃                          ■      │ ← 러너/장애물
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← 땅
│                                     │
│    장애물을 점프로 피하세요!         │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (하늘) */
skyGradient: 'linear-gradient(#87CEEB, #E0F6FF)'

/* 구름 */
cloudColor: 'rgba(255, 255, 255, 0.7)'

/* 땅 */
groundColor: '#8B4513'
grassColor: '#90EE90'
groundPattern: '#654321'

/* 장애물 */
obstacleColor: '#DC143C'
obstacleBorder: '#8B0000'
obstacleTop: '#FFD700'

/* 러너 */
runnerEmoji: '🏃'
```

---

## 구현 로직

### 물리 상수
```typescript
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const GROUND_Y = 450;
```

### 플레이어 인터페이스
```typescript
interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
}

const player: Player = {
  x: 150,
  y: 450,
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false
};
```

### 장애물 인터페이스
```typescript
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}
```

### 장애물 생성
```typescript
function createObstacle(): Obstacle {
  const obsWidth = 30 + Math.random() * 20;  // 30~50px
  const obsHeight = 40 + Math.random() * 30; // 40~70px

  return {
    x: width,
    y: GROUND_Y + player.height - obsHeight,
    width: obsWidth,
    height: obsHeight,
    passed: false
  };
}
```

### 점프 핸들러
```typescript
function handleJump() {
  if (gameCompleted) return;

  if (!player.isJumping) {
    player.velocityY = JUMP_FORCE;
    player.isJumping = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }
}
```

### 물리 업데이트
```typescript
function update() {
  // 플레이어 물리
  if (player.isJumping) {
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // 착지
    if (player.y >= GROUND_Y) {
      player.y = GROUND_Y;
      player.velocityY = 0;
      player.isJumping = false;
    }
  }

  // 거리 증가
  distance.value += gameSpeed * 0.1;

  // 장애물 스폰
  obstacleSpawnTimer++;
  if (obstacleSpawnTimer >= obstacleSpawnInterval) {
    obstacles.value.push(createObstacle());
    obstacleSpawnTimer = 0;
  }

  // 장애물 이동 및 충돌 체크
  for (const obs of obstacles.value) {
    obs.x -= gameSpeed;

    // 충돌 체크
    if (!obs.passed && checkCollision(obs)) {
      // 게임 오버!
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      completeGame();
      return;
    }

    // 통과 확인
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }
  }

  // 목표 달성 확인
  if (distance.value >= props.targetScore) {
    completeGame();
  }
}
```

### 충돌 감지
```typescript
function checkCollision(obs: Obstacle): boolean {
  return (
    player.x < obs.x + obs.width &&
    player.x + player.width > obs.x &&
    player.y < obs.y + obs.height &&
    player.y + player.height > obs.y
  );
}
```

---

## 렌더링

### 배경 (스크롤 효과)
```typescript
function render() {
  const c = ctx.value;

  // 하늘 그라데이션
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 구름 (스크롤)
  c.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const cloudOffset = (distance.value * 5) % 800;
  for (let i = -1; i <= 2; i++) {
    const cloudX = i * 400 - cloudOffset;
    if (cloudX > -100 && cloudX < width + 100) {
      c.beginPath();
      c.arc(cloudX, 100, 25, 0, Math.PI * 2);
      c.arc(cloudX + 30, 100, 35, 0, Math.PI * 2);
      c.arc(cloudX + 60, 100, 25, 0, Math.PI * 2);
      c.fill();
    }
  }
}
```

### 땅
```typescript
// 땅
c.fillStyle = '#8B4513';
c.fillRect(0, GROUND_Y + player.height, width, height - GROUND_Y - player.height);

// 잔디
c.fillStyle = '#90EE90';
c.fillRect(0, GROUND_Y + player.height, width, 5);

// 땅 패턴 (이동)
c.fillStyle = '#654321';
const groundOffset = (distance.value * 10) % 40;
for (let gx = -groundOffset; gx < width; gx += 40) {
  c.fillRect(gx, GROUND_Y + player.height + 10, 30, 10);
}
```

### 장애물
```typescript
for (const obs of obstacles.value) {
  c.fillStyle = '#DC143C';
  c.fillRect(obs.x, obs.y, obs.width, obs.height);

  // 테두리
  c.strokeStyle = '#8B0000';
  c.lineWidth = 2;
  c.strokeRect(obs.x, obs.y, obs.width, obs.height);

  // 위험 패턴 (노란색 상단)
  c.fillStyle = '#FFD700';
  c.fillRect(obs.x, obs.y, obs.width, 5);
}
```

### 플레이어
```typescript
c.font = `${player.height}px Arial`;
c.textAlign = 'center';
c.textBaseline = 'middle';
c.fillText('🏃', player.x + player.width / 2, player.y + player.height / 2);
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 점프 | "점프" | 점프 시작 |
| 장애물 통과 | "슝" | 장애물 피함 |
| 충돌 | "쾅!" | 게임 오버 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 점프 | `30ms` | 점프 피드백 |
| 장애물 통과 | `20ms` | 통과 피드백 |
| 충돌 | `[100, 50, 100, 50, 100]ms` | 게임 오버 |

---

## 테스트 체크리스트

- [ ] 탭 시 점프가 동작하는가?
- [ ] 땅에 있을 때만 점프 가능한가?
- [ ] 중력이 올바르게 적용되는가?
- [ ] 거리가 자동으로 증가하는가?
- [ ] 장애물이 일정 간격으로 생성되는가?
- [ ] 장애물이 왼쪽으로 이동하는가?
- [ ] 충돌 시 즉시 게임 오버되는가?
- [ ] 장애물 통과 시 피드백이 있는가?
- [ ] 목표 거리 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?
- [ ] 배경/땅 스크롤이 자연스러운가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 느린 속도, 넓은 간격으로 적응
- **Lv.3-4**: 빠른 반응 필요
- **Lv.5-6**: 거의 연속적인 점프 필요

---

## 플레이 전략

- **조기 점프**: 장애물이 가까워지기 전에 점프
- **타이밍**: 착지 직후 다음 장애물 확인
- **리듬**: 장애물 간격에 맞춰 점프 리듬 유지
- **집중**: 장애물에만 시선 집중

---

## 개선 아이디어 (TODO)

- [ ] 이중 점프
- [ ] 슬라이드 (낮은 장애물)
- [ ] 동전 수집 (보너스 점수)
- [ ] 파워업 (무적, 자석)
- [ ] 속도 점진적 증가

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `SpeedRun.vue`
