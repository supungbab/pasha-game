# Mission 07: 빠른 클릭 (Speed Click)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 7 |
| **이름 (한글)** | 빠른 클릭 |
| **이름 (영문)** | Speed Click |
| **카테고리** | 반사신경 |
| **조작 방식** | 탭 👆 (연타) |
| **기본 제한시간** | 5초 |
| **기본 목표점수** | 60점 (30회 탭) |
| **구현 파일** | `src/components/minigames/SpeedClick.vue` |

---

## 게임 설명

제한시간 내에 버튼을 최대한 많이 탭하는 순수 반사신경/연타 게임입니다. 큰 원형 버튼을 빠르게 연타하여 목표 클릭 수에 도달해야 합니다.

---

## 시작 전 지시문

```
연타! 👆👆👆
```

**지시문 이모지**: 👆 (손가락), ⚡ (스파크)

---

## 게임 규칙

1. 화면 중앙에 큰 원형 버튼이 표시됨
2. 버튼을 최대한 빠르게 연타
3. 탭할 때마다 클릭 카운트 증가 및 ⚡ 이펙트 발생
4. 프로그레스 바로 목표 진행도 확인
5. 목표 클릭 수 달성 또는 시간 종료 시 게임 완료

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 성공 횟수 기반 + 속도 보너스
- **기본 점수**: `클릭 수 × 2점`
- **속도 보너스**: `남은 시간 × 10점`
- **총 점수**: `기본 점수 + 속도 보너스`

```typescript
const baseScore = clicks.value * 2;
const speedBonus = Math.floor(timeRemaining * 10);
const totalScore = baseScore + speedBonus;
```

### 목표 클릭 수 계산
```typescript
const targetClicks = computed(() => {
  const base = 30;
  const multiplier = 1 + (props.difficulty - 1) * 0.3;
  return Math.floor(base * multiplier);
});
```

### 난이도별 목표

| 난이도 | 목표 클릭 수 | 배율 | 예상 클릭 속도 |
|--------|-------------|------|---------------|
| Lv.1 | 30회 | ×1.0 | 6 CPS |
| Lv.2 | 39회 | ×1.3 | 7.8 CPS |
| Lv.3 | 48회 | ×1.6 | 9.6 CPS |
| Lv.4 | 57회 | ×1.9 | 11.4 CPS |
| Lv.5 | 66회 | ×2.2 | 13.2 CPS |
| Lv.6 | 75회 | ×2.5 | 15 CPS |

> CPS = Clicks Per Second (초당 클릭 수)

---

## 제한 시간

- **기본**: 5초
- **난이도별 조정**: 동일 (5초)

---

## 난이도별 변화

| 난이도 | 목표 클릭 수 | 버튼 크기 | 특수 효과 |
|--------|-------------|----------|----------|
| Lv.1 | 30회 | 큼 | 없음 |
| Lv.2 | 39회 | 큼 | 없음 |
| Lv.3 | 48회 | 보통 | 없음 |
| Lv.4 | 57회 | 보통 | 없음 |
| Lv.5 | 66회 | 작음 | 흔들림 |
| Lv.6 | 75회 | 작음 | 강한 흔들림 |

---

## 하드 모드 🔥

- 버튼이 천천히 좌우로 이동
- 목표 클릭 수 20% 증가
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (프로그레스 바)
> - **Contrast Purple**: `#667eea` → `#764ba2` (배경 그라데이션)
> - 둥근 모서리 (border-radius: 12-20px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│                                     │
│         ⚡     ⚡                    │
│      ┌─────────────┐                │
│      │     👆     │                │
│      │             │                │
│      │     42     │  ← 클릭 카운트  │
│      │             │                │
│      └─────────────┘                │
│            ⚡                       │
│                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  ← 프로그레스   │
│                                     │
│       "8번 더!"  ← 안내 텍스트       │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 클릭 버튼
buttonBackground: 'white'
buttonShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
clickCountColor: '#667eea'

// 클릭 이펙트
sparkEmoji: '⚡'

// 프로그레스 바
progressBackground: 'rgba(255, 255, 255, 0.3)'
progressFill: 'linear-gradient(90deg, #FFD700, #FFC107)'
progressShadow: '0 2px 8px rgba(255, 215, 0, 0.5)'

// 지시문
instructionColor: 'white'
```

### 클릭 이펙트
```typescript
// 클릭 시 ⚡ 이모지가 터치 위치에서 위로 올라가며 사라짐
const effect = {
  id: effectIdCounter++,
  x,  // 터치 X 좌표
  y   // 터치 Y 좌표
};

// CSS 애니메이션
@keyframes spark {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(1.5);
  }
}
```

---

## 구현 로직

### 게임 상태
```typescript
const clicks = ref(0);
const clickEffects = ref<Array<{ id: number; x: number; y: number }>>([]);
let effectIdCounter = 0;
let startTime = 0;
let gameCompleted = false;
```

### 진행도 계산
```typescript
const progressPercent = computed(() => {
  return Math.min((clicks.value / targetClicks.value) * 100, 100);
});
```

### 지시문 텍스트
```typescript
const instructionText = computed(() => {
  if (clicks.value === 0) {
    return '빠르게 탭하세요!';
  }
  return `${targetClicks.value - clicks.value}번 더!`;
});
```

### 터치 핸들러
```typescript
function handleTouchClick(event: TouchEvent) {
  if (gameCompleted) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;

  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  processClick(x, y);
}
```

### 클릭 처리
```typescript
function processClick(x: number, y: number) {
  clicks.value++;

  // 클릭 이펙트 생성
  const effect = {
    id: effectIdCounter++,
    x,
    y
  };

  clickEffects.value.push(effect);

  // 0.5초 후 이펙트 제거
  safeSetTimeout(() => {
    const index = clickEffects.value.findIndex(e => e.id === effect.id);
    if (index !== -1) {
      clickEffects.value.splice(index, 1);
    }
  }, 500);

  // 진동 피드백
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // 목표 달성 확인
  if (clicks.value >= targetClicks.value && !gameCompleted) {
    completeGame();
  }
}
```

### 게임 완료
```typescript
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  const timeElapsed = (Date.now() - startTime) / 1000;
  const timeRemaining = Math.max(props.timeLimit - timeElapsed, 0);

  const baseScore = clicks.value * 2;
  const speedBonus = Math.floor(timeRemaining * 10);
  const totalScore = baseScore + speedBonus;

  const result: MiniGameResult = {
    success: clicks.value >= targetClicks.value,
    score: totalScore,
    timeRemaining,
    count: clicks.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 300);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 탭 | "틱" | 매우 짧은 클릭음 |
| 10연타 달성 | "뿅" | 마일스톤 효과음 |
| 목표 달성 | "빠밤!" | 성공 팡파레 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 탭 | `10ms` | 매우 짧은 피드백 |
| 10연타 달성 | `[20, 10, 20]ms` | 마일스톤 피드백 |

---

## UI 컴포넌트

### 클릭 버튼
```html
<div class="click-target" @touchstart.prevent="handleTouchClick">
  <div class="emoji">👆</div>
  <div class="click-count">{{ clicks }}</div>
</div>
```

### 클릭 이펙트
```html
<div class="effect-container">
  <div
    v-for="effect in clickEffects"
    :key="effect.id"
    class="click-effect"
    :style="{
      left: effect.x + 'px',
      top: effect.y + 'px'
    }"
  >
    ⚡
  </div>
</div>
```

### 프로그레스 바
```html
<div class="progress-bar">
  <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
</div>
```

### 지시문
```html
<div class="instruction">
  {{ instructionText }}
</div>
```

---

## 스타일 정의

```css
.speed-click {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.click-target {
  width: min(280px, 70vw);
  height: min(280px, 70vw);
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.click-target:active {
  transform: scale(0.95);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.emoji {
  font-size: clamp(40px, 15vw, 80px);
  animation: pulse 1s ease-in-out infinite;
}

.click-count {
  font-size: clamp(36px, 12vw, 64px);
  font-weight: 800;
  color: #667eea;
}

.progress-bar {
  width: 90%;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 30px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFC107);
  border-radius: 10px;
  transition: width 0.2s ease;
}

.instruction {
  margin-top: 20px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  animation: bounce 1s ease-in-out infinite;
}
```

---

## 테스트 체크리스트

- [ ] 탭 인식이 빠르고 정확한가?
- [ ] 클릭 카운트가 실시간으로 업데이트되는가?
- [ ] ⚡ 이펙트가 터치 위치에서 정확히 발생하는가?
- [ ] 프로그레스 바가 올바르게 채워지는가?
- [ ] 진동 피드백이 너무 강하지 않은가?
- [ ] 목표 달성 시 즉시 완료되는가?
- [ ] 시간 초과 시 현재 점수로 완료되는가?
- [ ] 속도 보너스가 올바르게 계산되는가?
- [ ] 멀티터치 처리가 되는가? (선택사항)

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 일반적인 탭 속도로 달성 가능
- **Lv.3-4**: 빠른 연타 필요 (8-10 CPS)
- **Lv.5-6**: 매우 빠른 연타 필요 (12+ CPS), 두 손가락 사용 권장

---

## 개선 아이디어 (TODO)

- [ ] 콤보 시스템 (연속 탭 보너스)
- [ ] CPS 실시간 표시
- [ ] 멀티터치 지원 (두 손가락 동시 탭)
- [ ] 버튼 위치 랜덤 변경 (하드 모드)
- [ ] 피버 타임 (일정 연타 시 보너스 시간)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `SpeedClick.vue`
