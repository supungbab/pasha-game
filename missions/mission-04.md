# Mission 04: 타이밍 점프 (Perfect Jump)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 4 |
| **이름 (한글)** | 타이밍 점프 |
| **이름 (영문)** | Perfect Jump |
| **카테고리** | 타이밍 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 10초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/PerfectJump.vue` |

---

## 게임 설명

움직이는 플랫폼에 캐릭터를 정확히 착지시키는 타이밍 게임입니다. 플랫폼이 왼쪽에서 오른쪽으로 이동하며, 플레이어는 적절한 타이밍에 탭하여 캐릭터를 점프시켜야 합니다. 플랫폼 중앙의 황금색 Perfect 영역에 착지하면 더 높은 점수를 획득합니다.

---

## 시작 전 지시문

```
탭! 👆
```

**지시문 이모지**: 🧍 (캐릭터), ⬜ (플랫폼)

---

## 게임 규칙

1. 캐릭터가 화면 왼쪽 하단에 위치
2. 플랫폼이 오른쪽에서 왼쪽으로 이동
3. 화면을 탭하면 캐릭터가 점프
4. 플랫폼에 착지하면 점수 획득
   - **Perfect 영역** (황금색): 20점
   - **일반 영역** (갈색): 10점
5. 바닥에 떨어지면 점수 없음 (Miss)
6. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 타이밍 정확도 기반
- **Perfect 착지**: 20점
- **Good 착지**: 10점
- **Miss (바닥 착지)**: 0점

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 착지 횟수 (예상) |
|--------|----------|------|---------------------|
| Lv.1 | 60점 | ×1.0 | Perfect 3회 또는 Good 6회 |
| Lv.2 | 72점 | ×1.2 | Perfect 3-4회 |
| Lv.3 | 90점 | ×1.5 | Perfect 4-5회 |
| Lv.4 | 108점 | ×1.8 | Perfect 5-6회 |
| Lv.5 | 132점 | ×2.2 | Perfect 6-7회 |
| Lv.6 | 150점 | ×2.5 | Perfect 7-8회 |

---

## 제한 시간

- **기본**: 10초
- **난이도별 조정**: 동일 (10초)

---

## 난이도별 변화

| 난이도 | 플랫폼 속도 | 플랫폼 너비 | Perfect 영역 비율 |
|--------|-----------|------------|------------------|
| Lv.1 | 2.5 px/frame | 140px | 30% (42px) |
| Lv.2 | 3.0 px/frame | 130px | 30% (39px) |
| Lv.3 | 3.5 px/frame | 120px | 30% (36px) |
| Lv.4 | 4.0 px/frame | 110px | 30% (33px) |
| Lv.5 | 4.5 px/frame | 100px | 30% (30px) |
| Lv.6 | 5.0 px/frame | 90px | 30% (27px) |

### 플랫폼 속도 계산
```typescript
const platformSpeed = 2 + props.difficulty * 0.5;
```

### 플랫폼 너비 계산
```typescript
const width = 150 - props.difficulty * 10;
```

---

## 하드 모드 🔥

- 플랫폼이 불규칙하게 흔들림
- 플랫폼 속도 20% 증가
- Perfect 영역 20% 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (Perfect 영역, 강조)
> - **Secondary Orange**: `#FF9800` (보조 강조)
> - **Neutral Cream**: `#FFF8DC` (배경 보조)
> - 둥근 모서리 (border-radius: 12-20px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│  점수: 40 / 60                      │
├─────────────────────────────────────┤
│                                     │
│         🧍 (점프 중)                 │
│           ↓                         │
│    ┌─────┬─────┬─────┐              │
│    │  갈 │ 금색 │  갈 │ ← 이동       │
│    │  색 │     │  색 │              │
│    └─────┴─────┴─────┘              │
│                                     │
│  ════════════════════════ (바닥)    │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경
backgroundColor: '#87CEEB'  // 하늘색 그라데이션

// 바닥
floorColor: '#8B4513'  // 갈색

// 플랫폼
platformColor: '#D2691E'  // 갈색 (일반 영역)
perfectZoneColor: '#FFD700'  // 황금색 (Perfect 영역)
platformBorder: '#8B4513'  // 진한 갈색 (테두리)

// 캐릭터
character: '🧍'  // 이모지
```

### 캐릭터 표현
```javascript
// 캐릭터 이모지
ctx.font = `${character.size}px Arial`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🧍', character.x + character.size / 2, character.y + character.size / 2);
```

### 점프 궤적 표시 (점프 중)
```javascript
// 점선으로 포물선 예측 궤적 표시
ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
ctx.lineWidth = 2;
ctx.setLineDash([5, 5]);
```

### 피드백 표시
| 판정 | 텍스트 | 색상 | 배경 |
|------|--------|------|------|
| Perfect | "PERFECT! 🔥" | `#FFD700` | `rgba(255, 215, 0, 0.2)` |
| Good | "Good! 👍" | `#4CAF50` | `rgba(76, 175, 80, 0.2)` |
| Miss | "Miss! 😢" | `#f44336` | `rgba(244, 67, 54, 0.2)` |

---

## 구현 로직

### 주요 인터페이스

```typescript
// 캐릭터 인터페이스
interface Character {
  x: number;          // X 위치
  y: number;          // Y 위치
  velocityY: number;  // Y 속도 (중력 적용)
  isJumping: boolean; // 점프 중 여부
  size: number;       // 캐릭터 크기
}

// 플랫폼 인터페이스
interface Platform {
  x: number;              // X 위치
  y: number;              // Y 위치
  width: number;          // 너비
  height: number;         // 높이 (20px 고정)
  speed: number;          // 이동 속도
  perfectZoneStart: number;   // Perfect 영역 시작 위치
  perfectZoneWidth: number;   // Perfect 영역 너비
}
```

### 물리 상수
```typescript
const GRAVITY = 0.8;      // 중력 가속도
const JUMP_FORCE = -15;   // 점프력 (음수: 위로)
```

### 캐릭터 초기값
```typescript
const character: Character = {
  x: 100,           // 화면 왼쪽
  y: 400,           // 바닥 근처
  velocityY: 0,
  isJumping: false,
  size: 40
};
```

### 점프 로직
```typescript
function handleJump() {
  if (gameCompleted || character.isJumping) return;

  character.isJumping = true;
  character.velocityY = JUMP_FORCE;

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}
```

### 착지 판정 로직
```typescript
function checkLanding() {
  if (!character.isJumping || character.velocityY < 0) return;

  for (const platform of platforms.value) {
    // 플랫폼 위에 있는지 확인
    if (
      character.y + character.size >= platform.y &&
      character.y + character.size <= platform.y + platform.height + 10 &&
      character.x + character.size > platform.x &&
      character.x < platform.x + platform.width
    ) {
      // 착지 위치에 따른 점수 계산
      const landingX = character.x + character.size / 2 - platform.x;
      const perfectZoneStart = platform.perfectZoneStart;
      const perfectZoneEnd = perfectZoneStart + platform.perfectZoneWidth;

      if (landingX >= perfectZoneStart && landingX <= perfectZoneEnd) {
        // Perfect!
        score.value += 20;
        showFeedback('PERFECT! 🔥', 'perfect');
      } else {
        // Good
        score.value += 10;
        showFeedback('Good! 👍', 'good');
      }

      return;
    }
  }

  // 바닥에 떨어짐
  if (character.y + character.size >= height - 50) {
    showFeedback('Miss! 😢', 'miss');
  }
}
```

### 플랫폼 생성
```typescript
function createPlatform(): Platform {
  const width = 150 - props.difficulty * 10;
  const perfectZoneWidth = width * 0.3;

  return {
    x: width,
    y: 350 + Math.random() * 100,
    width,
    height: 20,
    speed: 2 + props.difficulty * 0.5,
    perfectZoneStart: (width - perfectZoneWidth) / 2,
    perfectZoneWidth
  };
}
```

### 게임 루프
```typescript
function gameLoop() {
  if (gameCompleted) return;

  update();
  render();

  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= props.timeLimit) {
    completeGame();
    return;
  }

  safeRequestAnimationFrame(gameLoop);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 점프 | "뿅" | 짧고 경쾌한 소리 |
| Perfect 착지 | "딩!" | 높은 음의 성공음 |
| Good 착지 | "뚝" | 착지 소리 |
| Miss | "슈웅" | 낙하 소리 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 점프 | `30ms` | 짧은 터치 피드백 |
| Perfect 착지 | `[50, 50, 50]ms` | 트리플 진동 |
| Good 착지 | `50ms` | 단일 진동 |
| Miss | 없음 | - |

---

## UI 컴포넌트

### 점수 표시
```html
<div class="score-display">
  점수: {{ score }}
  <span class="target">/ {{ props.targetScore }}</span>
</div>
```

### 피드백 표시
```html
<div v-if="feedback" class="feedback" :class="feedback.type">
  {{ feedback.text }}
</div>
```

---

## 스타일 정의

```css
.perfect-jump {
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
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.feedback.perfect {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border: 3px solid #FFD700;
}

.feedback.good {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
  border: 3px solid #4CAF50;
}

.feedback.miss {
  color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  border: 3px solid #f44336;
}
```

---

## 테스트 체크리스트

- [ ] 캐릭터가 자연스럽게 점프하는가?
- [ ] 중력이 자연스럽게 적용되는가?
- [ ] 플랫폼이 일정한 속도로 이동하는가?
- [ ] Perfect/Good 착지 판정이 정확한가?
- [ ] 바닥 착지 시 Miss 처리가 되는가?
- [ ] 점프 궤적이 올바르게 표시되는가?
- [ ] 난이도별 플랫폼 속도/크기 차이가 체감되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 플랫폼이 크고 느려서 여유롭게 착지 가능
- **Lv.3-4**: 적당한 집중력과 타이밍 감각 필요
- **Lv.5-6**: 빠른 반응속도와 정확한 타이밍 필수

---

## 개선 아이디어 (TODO)

- [ ] 콤보 시스템 (연속 Perfect 시 보너스)
- [ ] 움직이는 플랫폼 (상하 이동)
- [ ] 특수 플랫폼 (2배 점수, 시간 추가)
- [ ] 함정 플랫폼 (착지 시 실패)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `PerfectJump.vue`
