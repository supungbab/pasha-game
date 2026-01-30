# Mission 21: 사다리 오르기 (Ladder Climb)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 21 |
| **이름 (한글)** | 사다리 오르기 |
| **이름 (영문)** | Ladder Climb |
| **카테고리** | 액션/수집 |
| **조작 방식** | 탭 (좌우 번갈아) 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 (높이 60m) |
| **구현 파일** | `src/components/minigames/LadderClimb.vue` |

---

## 게임 설명

좌우 버튼을 **번갈아** 탭하여 사다리를 오르는 게임입니다. 같은 버튼을 연속으로 누르면 올라가지 않고, 반드시 좌→우→좌→우 순서로 번갈아 눌러야 합니다. 빠르게 번갈아 누를수록 더 높이 올라가 더 많은 점수(높이)를 획득합니다.

---

## 시작 전 지시문

```
좌우 번갈아 올라가요! 🧗
```

**지시문 이모지**: ⬅️➡️ (좌우 방향)

---

## 게임 규칙

1. 화면 하단에 좌우 2개의 큰 버튼 표시
2. **번갈아** 탭해야 등반
   - 좌 → 우 → 좌 → 우 → ... (O)
   - 좌 → 좌 (X) - 실패 진동
3. 올바르게 번갈아 탭할 때마다 일정 높이 상승
   - 등반 속도: 5 + 난이도 (m/탭)
4. 올라간 높이가 점수
5. 제한시간 내에 목표 높이 도달 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 등반 높이 기반
- **점수**: 올라간 높이(m) = 최종 점수

### 등반 속도
```typescript
const climbSpeed = 5 + props.difficulty; // 난이도별 등반 속도

// 올바른 탭 시
climberHeight += climbSpeed;
climberY.value = climberHeight;
```

### 난이도별 등반 속도

| 난이도 | 등반 속도 | 15초 내 최대 높이* |
|--------|----------|------------------|
| Lv.1 | 6m/탭 | ~180m (30탭) |
| Lv.2 | 7m/탭 | ~210m (30탭) |
| Lv.3 | 8m/탭 | ~240m (30탭) |
| Lv.4 | 9m/탭 | ~270m (30탭) |
| Lv.5 | 10m/탭 | ~300m (30탭) |
| Lv.6 | 11m/탭 | ~330m (30탭) |

*30탭 = 15쌍(좌+우) × 2 기준, 실제는 개인 속도에 따라 다름

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 탭 수* |
|--------|----------|------|-----------|
| Lv.1 | 60m | ×1.0 | 10탭 |
| Lv.2 | 72m | ×1.2 | ~10탭 |
| Lv.3 | 90m | ×1.5 | ~11탭 |
| Lv.4 | 108m | ×1.8 | 12탭 |
| Lv.5 | 132m | ×2.2 | ~13탭 |
| Lv.6 | 150m | ×2.5 | ~14탭 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 등반 속도 | 특징 |
|--------|----------|------|
| Lv.1 | 6m | 기본 속도 |
| Lv.2 | 7m | 약간 빠름 |
| Lv.3 | 8m | 중간 |
| Lv.4 | 9m | 빠름 |
| Lv.5 | 10m | 매우 빠름 |
| Lv.6 | 11m | 최고 속도 |

---

## 하드 모드 🔥

- 시간 제한 감소
- 더 높은 목표 높이
- 실패 시 높이 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 하늘 배경 그라데이션
> - 이모지 캐릭터
> - 큰 원형 버튼

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│          높이: 45m                   │
│    좌우 버튼을 번갈아 탭하세요!       │
├─────────────────────────────────────┤
│         ☁️        ☁️                │
│                                     │
│    목표: 60m ─────────────────      │
│                                     │
│           │ ─ │                     │
│           │ ─ │                     │
│           │ ─ │                     │
│           │🧗│  ← 등반자            │
│           │ ─ │                     │
│           │ ─ │                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      [⬅️]           [➡️]           │
│                                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (하늘) */
skyGradient: 'linear-gradient(#87CEEB, #E0F6FF)'

/* 구름 */
cloudColor: 'rgba(255, 255, 255, 0.6)'

/* 사다리 */
ladderRail: '#8B4513'
ladderStep: '#A0522D'

/* 버튼 (기본) */
buttonGradient: 'linear-gradient(135deg, #FFD700, #FFC107)'
buttonBorder: '#F9A825'

/* 버튼 (활성화) */
activeGradient: 'linear-gradient(135deg, #4CAF50, #45a049)'
activeBorder: '#2e7d32'

/* 목표선 */
targetLineColor: 'rgba(76, 175, 80, 0.3)'
targetTextColor: '#4CAF50'
```

---

## 구현 로직

### 게임 상태
```typescript
const climberY = ref(0);
const isLeftPressed = ref(false);
const isRightPressed = ref(false);

let animationId: number = 0;
let gameCompleted = false;
let startTime = 0;

// 등반자 상태
let climberX = 200; // width / 2
let climberHeight = 0; // 실제 높이 (점수 계산용)
let lastPressedSide: 'left' | 'right' | null = null;
let canClimb = true;

// 난이도별 등반 속도
const climbSpeed = 5 + props.difficulty;
```

### 버튼 누르기 핸들러
```typescript
function handlePress(side: 'left' | 'right') {
  if (gameCompleted || !canClimb) return;

  // 같은 버튼 연속 누르기 방지
  if (lastPressedSide === side) {
    // 실패 - 진동만
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    return;
  }

  // 버튼 상태 업데이트
  if (side === 'left') {
    isLeftPressed.value = true;
  } else {
    isRightPressed.value = true;
  }

  // 등반!
  climberHeight += climbSpeed;
  climberY.value = climberHeight;
  lastPressedSide = side;

  // 성공 진동
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // 목표 높이 달성 확인
  if (climberHeight >= props.targetScore) {
    completeGame();
  }
}
```

### 버튼 떼기 핸들러
```typescript
function handleRelease() {
  isLeftPressed.value = false;
  isRightPressed.value = false;
}
```

---

## 렌더링

### 배경 (하늘)
```typescript
function render() {
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 구름 (장식) - 높이에 따라 이동
  c.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const cloudY1 = (height - climberHeight * 2) % height;
  const cloudY2 = (height - climberHeight * 2 + 200) % height;
  // ... 구름 그리기
}
```

### 사다리
```typescript
const ladderX = width / 2;
const ladderWidth = 60;

// 사다리 기둥
c.fillStyle = '#8B4513';
c.fillRect(ladderX - ladderWidth / 2, 0, 8, height);
c.fillRect(ladderX + ladderWidth / 2 - 8, 0, 8, height);

// 사다리 가로대 (스크롤 효과)
c.fillStyle = '#A0522D';
const stepHeight = 40;
const offset = climberHeight % stepHeight;
for (let y = -offset; y < height; y += stepHeight) {
  c.fillRect(ladderX - ladderWidth / 2, y, ladderWidth, 6);
}
```

### 등반자
```typescript
const charY = height - 150; // 고정 위치 (배경이 스크롤)
c.font = '48px Arial';
c.textAlign = 'center';
c.textBaseline = 'middle';
c.fillText('🧗', climberX, charY);

// 손 위치 표시 (버튼 누름 시)
if (isLeftPressed.value) {
  c.fillStyle = 'rgba(255, 215, 0, 0.5)';
  c.beginPath();
  c.arc(climberX - 30, charY - 15, 15, 0, Math.PI * 2);
  c.fill();
}
if (isRightPressed.value) {
  c.fillStyle = 'rgba(255, 215, 0, 0.5)';
  c.beginPath();
  c.arc(climberX + 30, charY - 15, 15, 0, Math.PI * 2);
  c.fill();
}
```

### 목표 높이 표시
```typescript
c.fillStyle = 'rgba(76, 175, 80, 0.3)';
const targetY = height - ((props.targetScore * 2) % height);
c.fillRect(0, targetY, width, 2);
c.fillStyle = '#4CAF50';
c.font = 'bold 16px Arial';
c.textAlign = 'right';
c.fillText(`목표: ${props.targetScore}m`, width - 15, targetY - 8);
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 올바른 탭 | "딸깍" | 등반 성공 |
| 잘못된 탭 | "삐" | 같은 버튼 연속 |
| 목표 달성 | "팡파레" | 게임 성공 |
| 시간 경고 | "틱틱" | 남은 시간 3초 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 올바른 탭 | `30ms` | 짧은 성공 피드백 |
| 잘못된 탭 | `100ms` | 긴 실패 피드백 |

---

## UI 컴포넌트

### 등반 버튼
```html
<div class="controls">
  <button
    class="climb-btn left"
    :class="{ active: isLeftPressed }"
    @mousedown="handlePress('left')"
    @mouseup="handleRelease"
    @mouseleave="handleRelease"
    @touchstart.prevent="handlePress('left')"
    @touchend.prevent="handleRelease"
  >
    ⬅️
  </button>
  <button
    class="climb-btn right"
    :class="{ active: isRightPressed }"
    @mousedown="handlePress('right')"
    @mouseup="handleRelease"
    @mouseleave="handleRelease"
    @touchstart.prevent="handlePress('right')"
    @touchend.prevent="handleRelease"
  >
    ➡️
  </button>
</div>
```

### 높이/점수 표시
```html
<div class="ui-overlay">
  <div class="score-display">
    높이: {{ Math.floor(climberY) }}m
  </div>
  <div class="instruction">
    좌우 버튼을 번갈아 탭하세요!
  </div>
</div>
```

---

## 스타일 정의

```css
.ladder-climb {
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

.controls {
  position: absolute;
  bottom: clamp(15px, 4vw, 30px);
  display: flex;
  gap: clamp(20px, 8vw, 40px);
  z-index: 10;
}

.climb-btn {
  width: clamp(80px, 25vw, 120px);
  height: clamp(80px, 25vw, 120px);
  font-size: clamp(32px, 10vw, 48px);
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border: 4px solid #F9A825;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.climb-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.climb-btn:active,
.climb-btn.active {
  transform: scale(0.95);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-color: #2e7d32;
}

.score-display {
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: clamp(10px, 3vw, 15px) clamp(15px, 5vw, 30px);
  background: rgba(0, 0, 0, 0.4);
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.4);
}
```

---

## 테스트 체크리스트

- [ ] 좌우 버튼이 화면에 올바르게 표시되는가?
- [ ] 번갈아 탭할 때만 등반하는가?
- [ ] 같은 버튼 연속 탭 시 등반하지 않는가?
- [ ] 같은 버튼 연속 탭 시 진동 피드백이 있는가?
- [ ] 높이(점수)가 올바르게 표시되는가?
- [ ] 사다리가 스크롤 효과로 움직이는가?
- [ ] 목표 높이 선이 표시되는가?
- [ ] 목표 높이 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?
- [ ] 터치/마우스 모두 지원되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 낮은 목표로 게임 익히기
- **Lv.3-4**: 적당한 속도로 리듬 유지
- **Lv.5-6**: 빠른 손놀림 필요

---

## 플레이 전략

- **리듬 유지**: 일정한 속도로 좌우 번갈아 탭
- **손 위치**: 양손 엄지를 버튼에 올려놓기
- **눈 고정**: 버튼보다 높이 표시에 집중
- **마무리 집중**: 목표 근처에서 실수 방지

---

## 개선 아이디어 (TODO)

- [ ] 장애물 추가 (피해야 하는 요소)
- [ ] 파워업 아이템 (점프 부스트)
- [ ] 콤보 시스템 (빠른 탭 보너스)
- [ ] 배경 변화 (높이에 따라 하늘색 변화)
- [ ] 날씨 효과 (비, 바람)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `LadderClimb.vue`
