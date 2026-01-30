# Mission 06: 색깔 매칭 (Color Match)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 6 |
| **이름 (한글)** | 색깔 매칭 |
| **이름 (영문)** | Color Match |
| **카테고리** | 인지/반사신경 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 10초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/ColorMatch.vue` |

---

## 게임 설명

제시된 색깔과 같은 색깔의 원을 빠르게 찾아서 탭하는 인지 게임입니다. 화면 상단에 목표 색상이 표시되고, 하단에 여러 색상의 원이 배치됩니다. 플레이어는 목표 색상과 동일한 원을 빠르게 선택해야 합니다.

---

## 시작 전 지시문

```
탭! 👆
```

**지시문 이모지**: 🔴🟡🟢🔵🟣 (색깔 원)

---

## 게임 규칙

1. 화면 상단에 찾아야 할 목표 색상이 이모지와 함께 표시됨
2. 화면 하단에 원형 배치로 여러 색상의 원이 나타남
3. 목표 색상과 같은 원을 탭하면 정답
   - **정답**: 10점 획득, 다음 라운드로 진행
   - **오답**: 점수 없음, 다음 라운드로 진행
4. 일정 시간 내에 선택하지 않으면 자동으로 다음 라운드로 진행 (Miss)
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 성공 횟수 기반
- **정답**: 10점
- **오답**: 0점
- **타임아웃**: 0점

### 결과 데이터
- `score`: 총 점수
- `successCount`: 정답 횟수
- `attempts`: 총 시도 횟수
- `accuracy`: 정확도 (successCount / attempts × 100)

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 정답 횟수 |
|--------|----------|------|---------------|
| Lv.1 | 60점 | ×1.0 | 6회 |
| Lv.2 | 72점 | ×1.2 | 7-8회 |
| Lv.3 | 90점 | ×1.5 | 9회 |
| Lv.4 | 108점 | ×1.8 | 10-11회 |
| Lv.5 | 132점 | ×2.2 | 13-14회 |
| Lv.6 | 150점 | ×2.5 | 15회 |

---

## 제한 시간

- **기본**: 10초
- **난이도별 조정**: 동일 (10초)

---

## 난이도별 변화

| 난이도 | 선택지 개수 | 원 크기 | 라운드 제한시간 |
|--------|-----------|--------|----------------|
| Lv.1 | 4개 | 60px | 2000ms |
| Lv.2 | 4개 | 55px | 1800ms |
| Lv.3 | 5개 | 50px | 1500ms |
| Lv.4 | 5개 | 45px | 1200ms |
| Lv.5 | 5개 | 40px | 1000ms |
| Lv.6 | 5개 | 35px | 800ms |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { circleCount: 4, circleSize: 60, showTime: 2000 },   // Lv.1
    { circleCount: 4, circleSize: 55, showTime: 1800 },   // Lv.2
    { circleCount: 5, circleSize: 50, showTime: 1500 },   // Lv.3
    { circleCount: 5, circleSize: 45, showTime: 1200 },   // Lv.4
    { circleCount: 5, circleSize: 40, showTime: 1000 },   // Lv.5
    { circleCount: 5, circleSize: 35, showTime: 800 },    // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)] ?? settings[0]!;
});
```

---

## 하드 모드 🔥

- 색상 이름이 다른 색으로 표시됨 (스트룹 효과)
- 원이 천천히 회전하거나 위치가 변경됨
- 라운드 제한시간 20% 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (강조)
> - **Neutral Cream**: `#FFF8DC` (배경 보조)
> - 둥근 모서리 (border-radius: 12-20px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│  점수: 40                           │
├─────────────────────────────────────┤
│  ┌────────────────────────────┐     │
│  │    이 색을 찾으세요!       │     │
│  │         🔴                 │     │
│  └────────────────────────────┘     │
│                                     │
│         🟡       🔴                 │
│                                     │
│    🟢               🔵              │
│                                     │
│              🟣                     │
│                                     │
│        [ 정답! ] (피드백)           │
└─────────────────────────────────────┘
```

### 색상 팔레트

#### 게임 색상 정의
```typescript
const COLORS: ColorOption[] = [
  { name: 'red', color: '#FF6B6B', emoji: '🔴' },
  { name: 'yellow', color: '#FFE66D', emoji: '🟡' },
  { name: 'green', color: '#4ECDC4', emoji: '🟢' },
  { name: 'blue', color: '#4A90D9', emoji: '🔵' },
  { name: 'purple', color: '#9B59B6', emoji: '🟣' },
];
```

#### UI 색상
```javascript
// 배경
backgroundColor: '#F0F8FF'  // 연한 하늘색

// 목표 색상 박스
boxBackground: '#FFFFFF'    // 흰색
boxBorder: '#E0E0E0'       // 회색 테두리

// 원 그림자
circleShadow: 'rgba(0, 0, 0, 0.2)'

// 원 하이라이트
circleHighlight: 'rgba(255, 255, 255, 0.4)'
```

### 원형 배치 레이아웃
```typescript
// 원형 배치 계산
const centerX = width / 2;
const centerY = height / 2 + 80;
const layoutRadius = 120;

for (let i = 0; i < circleCount; i++) {
  const angle = (i / circleCount) * Math.PI * 2 - Math.PI / 2;
  const x = centerX + Math.cos(angle) * layoutRadius;
  const y = centerY + Math.sin(angle) * layoutRadius;
}
```

### 피드백 표시
| 결과 | 텍스트 | 색상 |
|------|--------|------|
| 정답 | "정답!" | `#4ECDC4` (청록) |
| 오답 | "오답!" | `#FF6B6B` (빨강) |

---

## 구현 로직

### 주요 인터페이스

```typescript
// 색상 옵션 인터페이스
interface ColorOption {
  name: string;    // 색상 이름 ('red', 'yellow', etc.)
  color: string;   // 색상 코드 ('#FF6B6B')
  emoji: string;   // 이모지 ('🔴')
}

// 색상 원 인터페이스
interface ColorCircle {
  x: number;           // X 위치
  y: number;           // Y 위치
  radius: number;      // 반지름
  color: ColorOption;  // 색상 정보
  scale: number;       // 현재 스케일 (애니메이션용)
  targetScale: number; // 목표 스케일
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const targetColor = ref<ColorOption | null>(null);
const colorOptions = ref<ColorCircle[]>([]);
const feedback = ref<{ text: string; color: string; life: number } | null>(null);
const successCount = ref(0);
const attempts = ref(0);
```

### 라운드 생성
```typescript
function generateRound() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;

  // 목표 색상 선택
  const newTargetColor = COLORS[Math.floor(Math.random() * COLORS.length)]!;
  targetColor.value = newTargetColor;

  // 선택지 생성 (하나는 반드시 정답)
  const circleCount = settings.circleCount;
  const correctIndex = Math.floor(Math.random() * circleCount);

  const circles: ColorCircle[] = [];
  const usedColors = new Set<string>();

  // 원형 배치로 색상 원 생성
  for (let i = 0; i < circleCount; i++) {
    let color: ColorOption;

    if (i === correctIndex) {
      color = newTargetColor;
    } else {
      // 다른 색상 선택 (중복 방지)
      do {
        color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      } while (color.name === newTargetColor.name || usedColors.has(color.name));
    }

    usedColors.add(color.name);

    const angle = (i / circleCount) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * layoutRadius;
    const y = centerY + Math.sin(angle) * layoutRadius;

    circles.push({
      x,
      y,
      radius: settings.circleSize,
      color,
      scale: 0,
      targetScale: 1
    });
  }

  colorOptions.value = circles;

  // 라운드 타임아웃 설정
  roundTimeout = safeSetTimeout(() => {
    if (!isGameOver.value && targetColor.value) {
      attempts.value++;
      generateRound();
    }
  }, settings.showTime);
}
```

### 색상 선택 처리
```typescript
function checkColorHit(x: number, y: number) {
  if (!targetColor.value) return;

  // 터치된 원 찾기
  const hitCircle = colorOptions.value.find(circle => {
    return pointInCircle(x, y, circle.x, circle.y, circle.radius * circle.scale);
  });

  if (hitCircle) {
    attempts.value++;
    clearTimeout(roundTimeout);

    if (hitCircle.color.name === targetColor.value.name) {
      // 정답!
      score.value += 10;
      successCount.value++;
      feedback.value = { text: '정답!', color: '#4ECDC4', life: 1 };

      // 확대 애니메이션
      hitCircle.targetScale = 1.3;
      safeSetTimeout(() => {
        hitCircle.targetScale = 0;
      }, 200);
    } else {
      // 오답!
      feedback.value = { text: '오답!', color: '#FF6B6B', life: 1 };

      // 축소 애니메이션
      hitCircle.targetScale = 0.8;
      safeSetTimeout(() => {
        hitCircle.targetScale = 0;
      }, 150);
    }

    // 다음 라운드
    safeSetTimeout(() => {
      if (!isGameOver.value) {
        generateRound();
      }
    }, 400);
  }
}
```

### 업데이트 (애니메이션)
```typescript
function update() {
  if (isGameOver.value) return;

  // 원 스케일 애니메이션
  colorOptions.value.forEach(circle => {
    circle.scale += (circle.targetScale - circle.scale) * 0.15;
  });

  // 피드백 페이드아웃
  if (feedback.value) {
    feedback.value.life -= 0.05;
    if (feedback.value.life <= 0) {
      feedback.value = null;
    }
  }
}
```

### 렌더링
```typescript
function render() {
  if (!helper.value || !ctx.value) return;

  // 배경
  helper.value.fillBackground('#F0F8FF');

  // 목표 색상 표시 박스
  if (targetColor.value) {
    helper.value.drawRoundRect(width / 2 - 100, 80, 200, 120, 20, '#FFFFFF');
    helper.value.drawRoundRect(width / 2 - 100, 80, 200, 120, 20, '#E0E0E0', false);

    ctx.value.font = 'bold 18px Arial';
    ctx.value.fillStyle = '#333';
    ctx.value.textAlign = 'center';
    ctx.value.fillText('이 색을 찾으세요!', width / 2, 110);

    helper.value.drawCircle(width / 2, 160, 35, targetColor.value.color);

    ctx.value.font = '40px Arial';
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText(targetColor.value.emoji, width / 2, 160);
  }

  // 선택지 원 렌더링
  colorOptions.value.forEach(circle => {
    if (circle.scale <= 0) return;

    const scaledRadius = circle.radius * circle.scale;

    // 그림자
    helper.value!.drawCircle(circle.x + 3, circle.y + 3, scaledRadius, 'rgba(0, 0, 0, 0.2)');

    // 원
    helper.value!.drawCircle(circle.x, circle.y, scaledRadius, circle.color.color);

    // 하이라이트
    helper.value!.drawCircle(
      circle.x - scaledRadius * 0.25,
      circle.y - scaledRadius * 0.25,
      scaledRadius * 0.3,
      'rgba(255, 255, 255, 0.4)'
    );
  });

  // 피드백 텍스트
  if (feedback.value && feedback.value.life > 0) {
    ctx.value.globalAlpha = feedback.value.life;
    ctx.value.font = 'bold 48px Arial';
    ctx.value.fillStyle = feedback.value.color;
    ctx.value.textAlign = 'center';
    ctx.value.fillText(feedback.value.text, width / 2, height / 2 + 80);
    ctx.value.globalAlpha = 1;
  }

  // 점수 표시
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#333';
  ctx.value.textAlign = 'left';
  ctx.value.fillText(`점수: ${score.value}`, 20, 40);
}
```

### 게임 종료
```typescript
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(animationId);
  clearInterval(timerInterval);
  clearTimeout(roundTimeout);

  const result: MiniGameResult = {
    success: score.value >= props.targetScore,
    score: score.value,
    timeRemaining: timeRemaining.value,
    count: successCount.value,
    attempts: attempts.value,
    accuracy: attempts.value > 0 ? Math.round((successCount.value / attempts.value) * 100) : 0
  };

  emit('complete', result);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 정답 | "딩!" | 밝은 성공음 |
| 오답 | "뿅" | 낮은 실패음 |
| 라운드 시작 | "뚜둥" | 새 라운드 알림 |
| 타임아웃 | "틱틱" | 시간 경고 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 정답 | `50ms` | 짧은 성공 피드백 |
| 오답 | `[30, 30, 30]ms` | 경고 패턴 |

---

## UI 컴포넌트

### 캔버스 기반 렌더링
이 게임은 모든 UI 요소를 Canvas에 직접 렌더링합니다:
- 목표 색상 박스
- 선택지 원들
- 피드백 텍스트
- 점수 표시

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

- [ ] 목표 색상이 명확하게 표시되는가?
- [ ] 선택지 중 반드시 하나는 정답인가?
- [ ] 색상 원이 원형 배치로 균일하게 분포하는가?
- [ ] 탭 인식이 정확한가?
- [ ] 정답/오답 판정이 올바른가?
- [ ] 피드백 애니메이션이 자연스러운가?
- [ ] 라운드 타임아웃이 정확히 동작하는가?
- [ ] 난이도별 원 크기/개수/시간 차이가 체감되는가?
- [ ] 정확도 계산이 올바른가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 4개의 큰 원, 충분한 선택 시간
- **Lv.3-4**: 5개의 중간 원, 적당한 선택 시간
- **Lv.5-6**: 5개의 작은 원, 짧은 선택 시간으로 순간 판단력 필요

---

## 개선 아이디어 (TODO)

- [ ] 연속 정답 콤보 보너스
- [ ] 시간 보너스 (빠른 선택 시 추가 점수)
- [ ] 색맹 모드 (패턴 또는 숫자로 구분)
- [ ] 애니메이션 강화 (원 등장 효과)
- [ ] 배경 음악 추가

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `ColorMatch.vue`
