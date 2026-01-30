# Mission 08: 반응 테스트 (Reaction Test)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 8 |
| **이름 (한글)** | 반응 테스트 |
| **이름 (영문)** | Reaction Test |
| **카테고리** | 반응속도 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 변동 (라운드 기반) |
| **기본 목표점수** | 평균 반응시간 500ms 미만 |
| **구현 파일** | `src/components/minigames/ReactionTest.vue` |

---

## 게임 설명

신호가 나타나면 최대한 빨리 탭하여 반응 속도를 측정하는 게임입니다. 빨간 대기 신호(🟥)가 초록 신호(🟢)로 바뀌면 즉시 탭해야 합니다. 여러 라운드를 진행하며 평균 반응 시간을 측정합니다.

---

## 시작 전 지시문

```
신호가 초록색으로 바뀌면 탭! 👆
```

**지시문 이모지**: 🟥 (대기), 🟢 (GO!), ⏱️ (타이머)

---

## 게임 규칙

1. "준비하세요..." 메시지와 함께 ⏱️ 표시
2. 빨간색 대기 상태(🟥)로 전환 - "대기..." 표시
3. 랜덤 시간(1~3초) 후 초록색 신호(🟢)로 전환 - "지금 탭!" 표시
4. 초록색이 되면 최대한 빨리 화면을 탭
5. 반응 시간이 측정되어 표시됨
6. 여러 라운드 진행 후 평균 반응 시간으로 성공/실패 판정

### 특수 상황
- **너무 빨리 탭**: 초록색 전에 탭하면 "너무 빨라요!" 표시, 해당 라운드 무효
- **너무 늦게 반응**: 3초 내에 반응 없으면 999ms로 기록

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 반응 속도 기반
- 각 라운드별 반응 시간에 따른 점수 부여:

| 반응 시간 | 점수 | 등급 |
|----------|------|------|
| < 150ms | 100점 | 🔥 엄청 빠름! |
| 150-249ms | 75점 | ⚡ 매우 빠름! |
| 250-349ms | 50점 | 👍 빠름! |
| 350-499ms | 25점 | 👌 보통 |
| 500ms+ | 10점 | 🙂 느림 |

```typescript
const scorePerTime = validTimes.map(t => {
  if (t < 150) return 100;
  if (t < 250) return 75;
  if (t < 350) return 50;
  if (t < 500) return 25;
  return 10;
});

const totalScore = scorePerTime.reduce((a, b) => a + b, 0);
```

### 성공 조건
- 평균 반응 시간 500ms 미만

### 난이도별 라운드 수

| 난이도 | 라운드 수 | 최대 가능 점수 |
|--------|----------|---------------|
| Lv.1 | 4 라운드 | 400점 |
| Lv.2 | 5 라운드 | 500점 |
| Lv.3 | 6 라운드 | 600점 |
| Lv.4 | 7 라운드 | 700점 |
| Lv.5 | 8 라운드 | 800점 |
| Lv.6 | 9 라운드 | 900점 |

```typescript
const totalRounds = computed(() => {
  return Math.min(3 + props.difficulty, 7);
});
```

---

## 제한 시간

- **라운드별**:
  - 대기 시간: 1~3초 (랜덤)
  - 반응 제한: 3초
  - 결과 표시: 1.5초
- **총 시간**: 라운드 수에 따라 변동

---

## 난이도별 변화

| 난이도 | 라운드 수 | 대기 시간 범위 | 특수 효과 |
|--------|----------|---------------|----------|
| Lv.1 | 4 | 1~3초 | 없음 |
| Lv.2 | 5 | 1~3초 | 없음 |
| Lv.3 | 6 | 0.8~3초 | 없음 |
| Lv.4 | 7 | 0.5~3.5초 | 페이크 신호 |
| Lv.5 | 8 | 0.5~4초 | 페이크 신호 |
| Lv.6 | 9 | 0.3~4.5초 | 페이크 신호, 화면 흔들림 |

---

## 하드 모드 🔥

- 페이크 초록 신호가 잠깐 깜빡임 (탭하면 실패)
- 대기 시간 범위 확대
- 신호 색상이 더 비슷함 (노랑 → 초록)
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (최고 기록 표시)
> - **Success Green**: `#28a745` (GO 신호)
> - **Danger Red**: `#dc3545` (대기/실패)
> - 둥근 모서리 (border-radius: 24px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│                                     │
│     ┌─────────────────────────┐     │
│     │                         │     │
│     │          🟢             │     │
│     │       지금 탭!          │     │
│     │                         │     │
│     └─────────────────────────┘     │
│                                     │
│        라운드: 3 / 5                │
│       최고 기록: 187ms              │
│                                     │
└─────────────────────────────────────┘
```

### 게임 상태별 색상
```typescript
type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

// 각 상태별 배경색
waiting:  'rgba(255, 255, 255, 0.1)'  // 회색
ready:    'rgba(220, 53, 69, 0.3)'    // 빨강 (대기)
go:       'rgba(40, 167, 69, 0.3)'    // 초록 (GO!)
result:   'rgba(255, 193, 7, 0.2)'    // 노랑 (결과)
tooEarly: 'rgba(220, 53, 69, 0.4)'    // 진한 빨강 (실패)
```

### 상태별 이모지 및 메시지
| 상태 | 이모지 | 메시지 |
|------|--------|--------|
| waiting | ⏱️ | "준비하세요..." |
| ready | 🟥 | "대기..." |
| go | 🟢 | "지금 탭!" |
| result | (점수별) | "{반응시간}ms" |
| tooEarly | ❌ | "너무 빨라요!" |

### 결과 이모지 (반응 시간별)
```typescript
const resultEmoji = computed(() => {
  if (reactionTime.value < 200) return '🔥';
  if (reactionTime.value < 300) return '⚡';
  if (reactionTime.value < 400) return '👍';
  if (reactionTime.value < 500) return '👌';
  return '🙂';
});
```

---

## 구현 로직

### 게임 상태 정의
```typescript
type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

const gameState = ref<GameState>('waiting');
const currentRound = ref(1);
const reactionTime = ref(0);
const reactionTimes = ref<number[]>([]);
const bestTime = ref<number | null>(null);

let goTimestamp = 0;
let timeoutId: number | null = null;
let gameCompleted = false;
```

### 라운드 시작
```typescript
function startRound() {
  gameState.value = 'ready';

  // 랜덤 대기 시간 (1~3초)
  const waitTime = 1000 + Math.random() * 2000;

  timeoutId = safeSetTimeout(() => {
    if (!gameCompleted) {
      gameState.value = 'go';
      goTimestamp = Date.now();

      // 3초 내에 반응 없으면 다음 라운드
      timeoutId = safeSetTimeout(() => {
        if (gameState.value === 'go' && !gameCompleted) {
          reactionTime.value = 999;
          reactionTimes.value.push(999);
          gameState.value = 'result';

          safeSetTimeout(() => {
            if (currentRound.value >= totalRounds.value) {
              completeGame();
            } else {
              nextRound();
            }
          }, 1500);
        }
      }, 3000);
    }
  }, waitTime);
}
```

### 클릭 핸들러
```typescript
function handleClick() {
  if (gameCompleted) return;

  if (gameState.value === 'ready') {
    // 너무 일찍 클릭
    gameState.value = 'tooEarly';
    if (timeoutId) {
      safeClearTimeout(timeoutId);
      timeoutId = null;
    }

    // 진동 피드백 (실패)
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    safeSetTimeout(() => {
      nextRound();
    }, 1500);

  } else if (gameState.value === 'go') {
    // 정상 반응
    const now = Date.now();
    const rt = now - goTimestamp;
    reactionTime.value = rt;
    reactionTimes.value.push(rt);

    // 최고 기록 업데이트
    if (!bestTime.value || rt < bestTime.value) {
      bestTime.value = rt;
    }

    // 진동 피드백 (성공)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    gameState.value = 'result';

    safeSetTimeout(() => {
      if (currentRound.value >= totalRounds.value) {
        completeGame();
      } else {
        nextRound();
      }
    }, 1500);
  }
}
```

### 게임 완료
```typescript
function completeGame() {
  if (gameCompleted) return;
  gameCompleted = true;

  // 평균 반응 시간 계산 (999ms 제외)
  const validTimes = reactionTimes.value.filter(t => t < 999);
  const avgTime = validTimes.length > 0
    ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
    : 999;

  // 점수 계산
  const scorePerTime = validTimes.map(t => {
    if (t < 150) return 100;
    if (t < 250) return 75;
    if (t < 350) return 50;
    if (t < 500) return 25;
    return 10;
  });

  const totalScore = scorePerTime.reduce((a, b) => a + b, 0);

  const result: MiniGameResult = {
    success: avgTime < 500,
    score: totalScore,
    timeRemaining: 0,
    accuracy: validTimes.length / totalRounds.value
  };

  safeSetTimeout(() => {
    emit('complete', result);
  }, 500);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 대기 시작 | "틱..." | 긴장감 조성 |
| GO 신호 | "빠악!" | 급한 시작 신호 |
| 성공 반응 | "딩!" | 측정 완료음 |
| 너무 빨리 탭 | "삐익!" | 경고음 |
| 게임 완료 | "빠밤~" | 결과 표시음 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| GO 신호 | 없음 | 시각적 신호만 |
| 성공 반응 | `50ms` | 짧은 성공 피드백 |
| 너무 빨리 탭 | `[100, 50, 100]ms` | 경고 진동 |
| 빠른 반응 (< 200ms) | `[30, 20, 30, 20, 30]ms` | 보너스 피드백 |

---

## UI 컴포넌트

### 신호 박스
```html
<div class="signal-box">
  <div v-if="gameState === 'waiting'" class="message">
    <div class="emoji">⏱️</div>
    <div class="text">준비하세요...</div>
  </div>

  <div v-else-if="gameState === 'ready'" class="message">
    <div class="emoji red">🟥</div>
    <div class="text">대기...</div>
  </div>

  <div v-else-if="gameState === 'go'" class="message">
    <div class="emoji green">🟢</div>
    <div class="text shake">지금 탭!</div>
  </div>

  <div v-else-if="gameState === 'result'" class="message">
    <div class="emoji">{{ resultEmoji }}</div>
    <div class="text">{{ reactionTime }}ms</div>
    <div class="subtext">{{ resultText }}</div>
  </div>

  <div v-else-if="gameState === 'tooEarly'" class="message">
    <div class="emoji">❌</div>
    <div class="text">너무 빨라요!</div>
  </div>
</div>
```

### 통계 표시
```html
<div class="stats">
  <div class="round-info">
    라운드: {{ currentRound }} / {{ totalRounds }}
  </div>
  <div v-if="bestTime" class="best-time">
    최고 기록: {{ bestTime }}ms
  </div>
</div>
```

---

## 스타일 정의

```css
.reaction-test {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
}

.game-area {
  width: 100%;
  height: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.game-area.go {
  background-color: rgba(40, 167, 69, 0.3);
  animation: flash 0.5s ease-in-out;
}

.signal-box {
  width: 90%;
  max-width: 400px;
  padding: 60px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.emoji.green {
  animation: pulse-green 0.5s ease-in-out infinite;
}

.text.shake {
  animation: shake 0.5s ease-in-out infinite;
}

.best-time {
  font-size: 18px;
  font-weight: 600;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

---

## 테스트 체크리스트

- [ ] 대기 시간이 랜덤하게 변하는가?
- [ ] GO 신호가 명확하게 구분되는가?
- [ ] 반응 시간이 정확하게 측정되는가?
- [ ] 너무 빨리 탭 시 올바르게 처리되는가?
- [ ] 3초 타임아웃이 정상 동작하는가?
- [ ] 최고 기록이 올바르게 업데이트되는가?
- [ ] 라운드 진행이 올바르게 카운트되는가?
- [ ] 평균 반응 시간 계산이 정확한가?
- [ ] 점수 계산이 올바른가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 적은 라운드로 부담 없이 진행
- **Lv.3-4**: 중간 라운드, 꾸준한 집중력 필요
- **Lv.5-6**: 많은 라운드와 불규칙한 대기 시간으로 긴장감 유지

---

## 개선 아이디어 (TODO)

- [ ] 페이크 신호 (노란색 깜빡임)
- [ ] 다양한 신호 형태 (도형, 소리)
- [ ] 반응 시간 그래프 표시
- [ ] 글로벌 랭킹 연동
- [ ] 연습 모드 (무한 반복)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `ReactionTest.vue`
