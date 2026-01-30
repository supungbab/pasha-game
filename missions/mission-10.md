# Mission 10: 슈팅 게임 (Quick Shoot)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 10 |
| **이름 (한글)** | 슈팅 게임 |
| **이름 (영문)** | Quick Shoot |
| **카테고리** | 액션/타겟 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 12초 |
| **기본 목표점수** | 80점 |
| **구현 파일** | `src/components/minigames/QuickShoot.vue` |

---

## 게임 설명

화면에 나타나는 다양한 표적(🎯)을 빠르게 탭하여 사격하는 슈팅 게임입니다. 표적은 화면 안에서 움직이며 벽에 튕기고, 종류에 따라 속도와 점수가 다릅니다.

---

## 시작 전 지시문

```
사격! 👆
```

**지시문 이모지**: 🎯 (표적), 💥 (명중)

---

## 게임 규칙

1. 화면에 다양한 표적(🎯)이 나타나 움직임
2. 표적을 탭하면 명중하여 점수 획득
3. 표적 종류별 점수:
   - **일반 타겟** (청록색): 10점
   - **빠른 타겟** (빨간색): 15점 - 작고 빠름
   - **보너스 타겟** (금색): 20점 - 크고 느림
4. 표적은 벽에 튕기며 계속 움직임
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 명중 횟수 기반
- **일반 타겟**: 10점
- **빠른 타겟**: 15점
- **보너스 타겟**: 20점

```typescript
switch (type) {
  case 'fast':
    points = 15;
    break;
  case 'bonus':
    points = 20;
    break;
  default: // normal
    points = 10;
}
```

### 타겟 등장 확률
```typescript
const types: Array<'normal' | 'fast' | 'bonus'> = ['normal', 'normal', 'fast', 'bonus'];
// normal: 50%, fast: 25%, bonus: 25%
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 명중 횟수 (예상) |
|--------|----------|------|---------------------|
| Lv.1 | 80점 | ×1.0 | 8회 (일반) |
| Lv.2 | 96점 | ×1.2 | 9-10회 |
| Lv.3 | 120점 | ×1.5 | 12회 |
| Lv.4 | 144점 | ×1.8 | 14-15회 |
| Lv.5 | 176점 | ×2.2 | 17-18회 |
| Lv.6 | 200점 | ×2.5 | 20회 |

---

## 제한 시간

- **기본**: 12초
- **난이도별 조정**: 동일 (12초)

---

## 난이도별 변화

| 난이도 | 타겟 생성 간격 | 최대 동시 타겟 | 특수 효과 |
|--------|--------------|--------------|----------|
| Lv.1 | 1200ms | 3개 | 없음 |
| Lv.2 | 1050ms | 3개 | 없음 |
| Lv.3 | 900ms | 4개 | 없음 |
| Lv.4 | 750ms | 4개 | 타겟 가속 |
| Lv.5 | 600ms | 5개 | 타겟 가속 |
| Lv.6 | 500ms | 5개 | 강한 가속 |

### 타겟 생성 간격 계산
```typescript
const targetInterval = Math.max(1200 - props.difficulty * 150, 500);
```

### 최대 동시 타겟 수 계산
```typescript
const maxTargets = 3 + Math.floor(props.difficulty / 2);
```

---

## 하드 모드 🔥

- 가짜 타겟(회색) 등장 - 맞추면 감점
- 타겟이 더 빠르게 움직임
- 타겟이 갑자기 방향 전환
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (보너스 타겟, HIT 이펙트)
> - 어두운 배경 그라데이션
> - 둥근 모서리 (border-radius: 12px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│      명중: 5 | 점수: 60             │
│           💥 HIT!                  │
├─────────────────────────────────────┤
│                                     │
│       🎯 (일반)        🎯 (빠름)    │
│                                     │
│              🎯 (보너스)            │
│                                     │
│    🎯                   🎯          │
│                                     │
│                                     │
│           ✛ (십자선 - PC만)         │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundGradient: [
  { stop: 0, color: '#2c3e50' },
  { stop: 1, color: '#34495e' }
]

// 배경 그리드
gridColor: 'rgba(255, 255, 255, 0.05)'

// 타겟 색상
normalTarget: '#00BCD4'   // 청록색 (일반)
fastTarget: '#FF1744'     // 빨간색 (빠른)
bonusTarget: '#FFD700'    // 금색 (보너스)

// UI
hitEffectColor: '#FFD700'
scoreBackground: 'rgba(0, 0, 0, 0.5)'
```

### 타겟 종류별 스펙
| 타겟 타입 | 색상 | 크기 (반지름) | 속도 | 점수 |
|----------|------|-------------|------|------|
| normal | 청록 | 25-35px | 중간 (±4) | 10점 |
| fast | 빨강 | 20-30px | 빠름 (±6) | 15점 |
| bonus | 금색 | 35-45px | 느림 (±2) | 20점 |

### 타겟 디자인 (과녁 패턴)
```javascript
// 외곽 원 (타겟 색상)
c.fillStyle = color;
c.arc(target.x, target.y, target.radius, 0, Math.PI * 2);

// 내부 원 (흰색)
c.fillStyle = 'white';
c.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);

// 중심 원 (타겟 색상)
c.fillStyle = color;
c.arc(target.x, target.y, target.radius * 0.3, 0, Math.PI * 2);

// 이모지
c.fillText('🎯', target.x, target.y);

// 점수 표시
c.fillText(`+${target.points}`, target.x, target.y + target.radius + 15);
```

---

## 구현 로직

### 주요 인터페이스
```typescript
interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  type: 'normal' | 'fast' | 'bonus';
  points: number;
}
```

### 게임 상태
```typescript
const score = ref(0);
const hits = ref(0);
const hitEffect = ref(false);
const crosshairX = ref(0);
const crosshairY = ref(0);

const targets = ref<Target[]>([]);
let targetIdCounter = 0;
let lastTargetTime = 0;
let gameCompleted = false;
let startTime = 0;
```

### 타겟 생성
```typescript
function createTarget() {
  const types: Array<'normal' | 'fast' | 'bonus'> = ['normal', 'normal', 'fast', 'bonus'];
  const type = types[Math.floor(Math.random() * types.length)] ?? 'normal';

  let radius: number;
  let speedX: number;
  let speedY: number;
  let points: number;

  switch (type) {
    case 'fast':
      radius = 20 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 6;
      speedY = (Math.random() - 0.5) * 6;
      points = 15;
      break;
    case 'bonus':
      radius = 35 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 2;
      speedY = (Math.random() - 0.5) * 2;
      points = 20;
      break;
    default:
      radius = 25 + Math.random() * 10;
      speedX = (Math.random() - 0.5) * 4;
      speedY = (Math.random() - 0.5) * 4;
      points = 10;
  }

  const x = Math.random() * (width - radius * 2) + radius;
  const y = Math.random() * (height - radius * 2) + radius;

  targets.value.push({
    id: targetIdCounter++,
    x, y, radius, speedX, speedY, type, points
  });
}
```

### 사격 처리
```typescript
function processShoot(x: number, y: number) {
  // 타겟 히트 체크 (뒤에서부터 검사)
  for (let i = targets.value.length - 1; i >= 0; i--) {
    const target = targets.value[i];
    if (!target) continue;

    const dx = x - target.x;
    const dy = y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= target.radius) {
      // Hit!
      score.value += target.points;
      hits.value++;
      targets.value.splice(i, 1);

      showHitEffect();

      // 진동 피드백
      if (navigator.vibrate) {
        if (target.type === 'bonus') {
          navigator.vibrate([50, 30, 50, 30, 50]);
        } else {
          navigator.vibrate(50);
        }
      }

      // 목표 점수 달성 확인
      if (score.value >= props.targetScore) {
        completeGame();
      }

      return;
    }
  }

  // Miss - 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}
```

### 타겟 업데이트 (이동 및 벽 충돌)
```typescript
function update() {
  const now = Date.now();

  // 타겟 생성
  if (now - lastTargetTime > targetInterval && targets.value.length < maxTargets) {
    createTarget();
    lastTargetTime = now;
  }

  // 타겟 이동
  for (let i = targets.value.length - 1; i >= 0; i--) {
    const target = targets.value[i];
    if (!target) continue;

    target.x += target.speedX;
    target.y += target.speedY;

    // 벽 충돌 (반사)
    if (target.x - target.radius <= 0 || target.x + target.radius >= width) {
      target.speedX *= -1;
      target.x = Math.max(target.radius, Math.min(width - target.radius, target.x));
    }
    if (target.y - target.radius <= 0 || target.y + target.radius >= height) {
      target.speedY *= -1;
      target.y = Math.max(target.radius, Math.min(height - target.radius, target.y));
    }
  }
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 일반 명중 | "퐁!" | 짧은 타격음 |
| 빠른 타겟 명중 | "퐁!" | 높은 음 |
| 보너스 명중 | "딩딩!" | 보너스 소리 |
| 빗나감 | "슉" | 공기 소리 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 일반/빠른 명중 | `50ms` | 짧은 피드백 |
| 보너스 명중 | `[50, 30, 50, 30, 50]ms` | 특별 피드백 |
| 빗나감 | `20ms` | 매우 짧은 피드백 |

---

## UI 컴포넌트

### 점수 표시
```html
<div class="score-display">
  명중: {{ hits }}
  <span class="separator">|</span>
  점수: {{ score }}
</div>
```

### 히트 이펙트
```html
<div v-if="hitEffect" class="hit-effect">
  💥 HIT!
</div>
```

### 십자선 (PC 전용)
```html
<div class="crosshair desktop-only" :style="{ left: crosshairX + 'px', top: crosshairY + 'px' }">
  ✛
</div>
```

---

## 스타일 정의

```css
.quick-shoot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  position: relative;
  overflow: hidden;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  touch-action: none;
}

/* Desktop only - cursor hidden */
@media (hover: hover) and (pointer: fine) {
  .quick-shoot {
    cursor: none;
  }
}

.hit-effect {
  font-size: 32px;
  font-weight: 800;
  color: #FFD700;
  text-shadow: 0 0 10px #FFD700;
  animation: hitPulse 0.3s ease-out;
}

.crosshair {
  position: fixed;
  font-size: 36px;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: crosshairPulse 1s ease-in-out infinite;
  z-index: 1000;
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .crosshair.desktop-only {
    display: block;
  }
}
```

---

## 테스트 체크리스트

- [ ] 타겟이 화면 내에서만 생성되는가?
- [ ] 타겟이 벽에 정확히 튕기는가?
- [ ] 타겟 명중 판정이 정확한가?
- [ ] 타겟 종류별 색상과 크기가 구분되는가?
- [ ] 타겟 종류별 점수가 올바르게 적용되는가?
- [ ] 최대 타겟 수가 제한되는가?
- [ ] 히트 이펙트가 올바르게 표시되는가?
- [ ] PC에서 십자선이 마우스를 따라가는가?
- [ ] 모바일에서 십자선이 숨겨지는가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 느린 타겟, 적은 수로 여유롭게 조준
- **Lv.3-4**: 중간 속도, 동시에 여러 타겟 관리 필요
- **Lv.5-6**: 빠른 타겟, 많은 수로 빠른 판단과 조준 필수

---

## 개선 아이디어 (TODO)

- [ ] 콤보 시스템 (연속 명중 보너스)
- [ ] 가짜 타겟 (회색 - 맞추면 감점)
- [ ] 파워업 타겟 (시간 추가, 멀티샷)
- [ ] 레이저 사이트 효과
- [ ] 폭발 파티클 효과

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `QuickShoot.vue`
