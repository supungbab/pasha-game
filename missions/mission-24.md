# Mission 24: 점프 게임 (Jump Up)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 24 |
| **이름 (한글)** | 점프 게임 |
| **이름 (영문)** | Jump Up |
| **카테고리** | 액션/수집 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 (높이 60m) |
| **구현 파일** | `src/components/minigames/JumpUp.vue` |

---

## 게임 설명

Doodle Jump 스타일의 점프 게임입니다. 화면을 탭하면 캐릭터(🔴)가 점프하고, 플랫폼에 착지하면서 점점 높이 올라갑니다. 플랫폼을 밟을 때마다 높이가 증가하며, 올라간 높이가 점수입니다. 아래로 떨어지면 게임 오버!

---

## 시작 전 지시문

```
탭하여 높이 올라가요! 🚀
```

**지시문 이모지**: ⬆️🔴 (위 방향/캐릭터)

---

## 게임 규칙

1. 캐릭터가 자동으로 중력 영향을 받음
2. 화면 탭 시 점프 (플랫폼 위에 있을 때만)
3. 플랫폼에 착지하면:
   - 높이 +10m
   - 플랫폼이 녹색으로 변경 (밟음 표시)
4. 카메라가 플레이어를 따라 위로 이동
5. 아래로 떨어지면 즉시 게임 오버
6. 올라간 높이 = 최종 점수

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 높이 기반
- **플랫폼 착지**: 높이 +10m
- **최종 점수**: 최대 도달 높이

### 점수 공식
```typescript
// 플랫폼 착지 시
if (!platform.passed) {
  platform.passed = true;
  currentHeight += 10;
  if (currentHeight > maxHeight.value) {
    maxHeight.value = currentHeight;
  }
}

// 최종 점수
const finalScore = Math.floor(maxHeight.value);
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 플랫폼 수 |
|--------|----------|------|--------------|
| Lv.1 | 60m | ×1.0 | 6개 |
| Lv.2 | 72m | ×1.2 | 7~8개 |
| Lv.3 | 90m | ×1.5 | 9개 |
| Lv.4 | 108m | ×1.8 | 10~11개 |
| Lv.5 | 132m | ×2.2 | 13~14개 |
| Lv.6 | 150m | ×2.5 | 15개 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 플랫폼 간격 | 플랫폼 너비 | 특징 |
|--------|-----------|-----------|------|
| Lv.1 | 95px | 115px | 넓고 가까움 |
| Lv.2 | 90px | 110px | 약간 좁음 |
| Lv.3 | 85px | 105px | 중간 |
| Lv.4 | 80px | 100px | 좁아짐 |
| Lv.5 | 75px | 95px | 좁음 |
| Lv.6 | 70px | 80px | 매우 좁음 |

### 난이도 설정 로직
```typescript
// 플랫폼 간격 (난이도가 높을수록 넓음)
const platformGap = Math.max(100 - props.difficulty * 5, 70);

// 플랫폼 너비 (난이도가 높을수록 좁음)
const platformWidth = Math.max(120 - props.difficulty * 5, 80);
```

---

## 하드 모드 🔥

- 더 좁은 플랫폼
- 더 넓은 간격
- 이동하는 플랫폼
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 하늘 배경 (스크롤)
> - 이모지 캐릭터
> - 플랫폼 색상 구분

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│            높이: 45m                 │
├─────────────────────────────────────┤
│      ☁️           ☁️                │
│                                     │
│   목표: 60m ────────────────        │
│                                     │
│     ┌──────────┐                    │  ← 밟지 않은 플랫폼 (갈색)
│                    ┌──────────┐     │
│         🔴                          │  ← 플레이어
│  ┌──────────┐                       │  ← 밟은 플랫폼 (녹색)
│                ┌──────────┐         │
│                                     │
│       탭하여 점프하세요!             │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (하늘) */
skyGradient: 'linear-gradient(#87CEEB, #E0F6FF)'

/* 구름 */
cloudColor: 'rgba(255, 255, 255, 0.6)'

/* 플랫폼 (밟지 않음) */
platformColor: '#8B4513'
platformBorder: '#654321'

/* 플랫폼 (밟음) */
passedPlatformColor: '#90EE90'

/* 플레이어 */
playerEmoji: '🔴'

/* 목표선 */
targetLineColor: 'rgba(76, 175, 80, 0.3)'
targetTextColor: '#4CAF50'
```

---

## 구현 로직

### 물리 상수
```typescript
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
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
  x: 400,
  y: 500,
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false
};
```

### 플랫폼 인터페이스
```typescript
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}
```

### 플랫폼 생성
```typescript
function createPlatform(y: number): Platform {
  const platformWidth = Math.max(120 - props.difficulty * 5, 80);
  const x = Math.random() * (width - platformWidth);

  return {
    x,
    y,
    width: platformWidth,
    height: 15,
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
  // 중력 적용
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  // 플랫폼 충돌 체크 (떨어지는 중에만)
  if (player.velocityY > 0) {
    for (const platform of platforms.value) {
      if (
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height + 10
      ) {
        // 착지
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.isJumping = false;

        // 높이 계산
        if (!platform.passed) {
          platform.passed = true;
          currentHeight += 10;
          if (currentHeight > maxHeight.value) {
            maxHeight.value = currentHeight;
          }

          // 목표 달성 확인
          if (maxHeight.value >= props.targetScore) {
            completeGame();
          }

          // 진동 피드백
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }

        break;
      }
    }
  }
}
```

### 카메라 이동
```typescript
// 플레이어가 화면 상단 1/3 이상에 있으면 카메라 이동
if (player.y < height / 3) {
  const diff = height / 3 - player.y;
  cameraY += diff;
  player.y = height / 3;

  // 플랫폼도 같이 이동
  for (const platform of platforms.value) {
    platform.y += diff;
  }
}

// 화면 아래로 떨어진 플랫폼 제거
platforms.value = platforms.value.filter(p => p.y < height + 100);

// 새 플랫폼 생성 (위에)
const highestPlatform = platforms.value.reduce((min, p) => Math.min(min, p.y), height);
if (highestPlatform > -200) {
  platforms.value.push(createPlatform(highestPlatform - platformGap));
}
```

### 게임 오버 조건
```typescript
// 바닥에 떨어지면 게임 오버
if (player.y > height) {
  completeGame();
}
```

---

## 렌더링

### 배경
```typescript
function render() {
  const c = ctx.value;

  // 하늘 그라데이션
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 구름 (카메라 스크롤과 함께 이동)
  c.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const cloudOffset = cameraY % 300;
  for (let i = 0; i < 5; i++) {
    const y = i * 300 + cloudOffset;
    if (y > -100 && y < height + 100) {
      c.beginPath();
      c.arc(150 + i * 100, y, 25, 0, Math.PI * 2);
      c.arc(180 + i * 100, y, 35, 0, Math.PI * 2);
      c.arc(210 + i * 100, y, 25, 0, Math.PI * 2);
      c.fill();
    }
  }
}
```

### 플랫폼
```typescript
for (const platform of platforms.value) {
  c.fillStyle = platform.passed ? '#90EE90' : '#8B4513';
  c.fillRect(platform.x, platform.y, platform.width, platform.height);

  // 테두리
  c.strokeStyle = '#654321';
  c.lineWidth = 2;
  c.strokeRect(platform.x, platform.y, platform.width, platform.height);
}
```

### 플레이어
```typescript
c.font = `${player.height}px Arial`;
c.textAlign = 'center';
c.textBaseline = 'middle';
c.fillText('🔴', player.x + player.width / 2, player.y + player.height / 2);
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 점프 | "점프" | 점프 시작 |
| 착지 | "쿵" | 플랫폼 착지 |
| 높이 경신 | "띵" | 새 높이 도달 |
| 낙하 | "휘~" | 화면 아래로 떨어짐 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 점프 | `30ms` | 점프 피드백 |
| 착지 | `20ms` | 착지 피드백 |

---

## UI 컴포넌트

### 높이 표시
```html
<div class="ui-overlay">
  <div class="score-display">
    높이: {{ Math.floor(maxHeight) }}m
  </div>
</div>
```

### 지시 안내
```html
<div class="instruction">
  탭하여 점프하세요!
</div>
```

---

## 스타일 정의

```css
.jump-up {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.score-display {
  font-size: 32px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  min-width: 200px;
  text-align: center;
}

.instruction {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 24px;
  border-radius: 20px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}
```

---

## 테스트 체크리스트

- [ ] 탭 시 점프가 동작하는가?
- [ ] 플랫폼 위에 있을 때만 점프 가능한가?
- [ ] 중력이 올바르게 적용되는가?
- [ ] 플랫폼 충돌이 올바르게 감지되는가?
- [ ] 착지 시 높이가 +10m 되는가?
- [ ] 밟은 플랫폼이 녹색으로 변하는가?
- [ ] 카메라가 플레이어를 따라 이동하는가?
- [ ] 새 플랫폼이 위쪽에 생성되는가?
- [ ] 바닥으로 떨어지면 게임 오버되는가?
- [ ] 목표 높이 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 넓은 플랫폼, 가까운 간격으로 쉽게
- **Lv.3-4**: 중간 난이도
- **Lv.5-6**: 좁은 플랫폼, 정확한 점프 필요

---

## 플레이 전략

- **타이밍**: 플랫폼 중앙에서 점프
- **예측**: 다음 플랫폼 위치 미리 확인
- **연속 점프**: 착지 직후 바로 점프
- **중앙 유지**: 화면 중앙에서 플레이하면 유연하게 대응 가능

---

## 개선 아이디어 (TODO)

- [ ] 이동하는 플랫폼
- [ ] 부서지는 플랫폼 (한 번만 착지 가능)
- [ ] 스프링 플랫폼 (높이 점프)
- [ ] 아이템 수집 (제트팩, 점프 부스트)
- [ ] 적 회피 요소

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `JumpUp.vue`
