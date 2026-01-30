# Mission 15: 빠른 계산 (Quick Math)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 15 |
| **이름 (한글)** | 빠른 계산 |
| **이름 (영문)** | Quick Math |
| **카테고리** | 퍼즐/인지 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/QuickMath.vue` |

---

## 게임 설명

간단한 수학 문제(덧셈, 뺄셈, 곱셈)를 빠르게 풀어 정답을 선택하는 암산 게임입니다. 4개의 보기 중 정답을 선택해야 하며, 난이도가 올라갈수록 숫자 범위가 커지고 곱셈이 추가됩니다.

---

## 시작 전 지시문

```
빠르게 암산해요! 🔢
```

**지시문 이모지**: ➕➖✖️ (수학 연산자)

---

## 게임 규칙

1. 화면 중앙에 수학 문제가 표시됨
   - 형식: `숫자 연산자 숫자 = ?`
   - 예: `15 + 27 = ?` 또는 `8 × 6 = ?`
2. 하단에 4개의 답안 버튼이 표시됨
   - 1개의 정답 + 3개의 오답 (유사한 숫자)
3. 정답 선택 시:
   - 15점 획득
   - "정답! 🎉" 피드백 표시
   - 다음 문제로 진행
4. 오답 선택 시:
   - 점수 없음
   - 정답 표시 후 다음 문제로 진행
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반
- **정답**: 15점
- **오답**: 0점

### 결과 데이터
- `score`: 총 점수
- `count`: 정답 횟수
- `accuracy`: 정확도

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 정답 횟수 |
|--------|----------|------|---------------|
| Lv.1 | 60점 | ×1.0 | 4회 |
| Lv.2 | 72점 | ×1.2 | 5회 |
| Lv.3 | 90점 | ×1.5 | 6회 |
| Lv.4 | 108점 | ×1.8 | 7-8회 |
| Lv.5 | 132점 | ×2.2 | 9회 |
| Lv.6 | 150점 | ×2.5 | 10회 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 숫자 범위 | 연산자 | 특징 |
|--------|----------|--------|------|
| Lv.1 | 1~10 | +, - | 매우 쉬운 계산 |
| Lv.2 | 1~20 | +, - | 쉬운 계산 |
| Lv.3 | 5~30 | +, - | 중간 난이도 |
| Lv.4 | 10~50 | +, -, × | 곱셈 추가 |
| Lv.5 | 20~70 | +, -, × | 큰 숫자 |
| Lv.6 | 30~99 | +, -, × | 두 자리 수 계산 |

### 난이도별 숫자 범위 설정
```typescript
function getNumberRange() {
  switch (props.difficulty) {
    case 1:
      return { min: 1, max: 10 };
    case 2:
      return { min: 1, max: 20 };
    case 3:
      return { min: 5, max: 30 };
    case 4:
      return { min: 10, max: 50 };
    case 5:
      return { min: 20, max: 70 };
    default:
      return { min: 30, max: 99 };
  }
}
```

### 연산자 선택 로직
```typescript
const operators = ['+', '-'];

// 난이도 4 이상이면 곱셈도 추가
if (props.difficulty >= 4) {
  operators.push('×');
}

const operator = operators[Math.floor(Math.random() * operators.length)];
```

---

## 하드 모드 🔥

- 제한 시간 감소 (20%)
- 더 큰 숫자 범위
- 나눗셈 추가 가능
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 깔끔한 문제 표시 박스
> - 2×2 그리드 답안 버튼
> - 모노스페이스 폰트로 숫자 표시
> - 둥근 모서리 (border-radius: 20-24px)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│     정답: 3  |  점수: 45            │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────────┐       │
│     │                       │       │
│     │     15 + 27 = ?       │       │
│     │                       │       │
│     └───────────────────────┘       │
│                                     │
│     ┌─────────┐  ┌─────────┐       │
│     │   42    │  │   39    │       │
│     └─────────┘  └─────────┘       │
│     ┌─────────┐  ┌─────────┐       │
│     │   45    │  │   38    │       │
│     └─────────┘  └─────────┘       │
│                                     │
│         정답! 🎉 (피드백)           │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 문제 박스
questionBoxBackground: 'white'
questionBoxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
questionTextColor: '#2c3e50'

// 답안 버튼
answerBtnBackground: 'white'
answerBtnBorder: '4px solid transparent'
answerBtnShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'

// 호버 상태
hoverGradient: 'linear-gradient(135deg, #FFD700, #FFC107)'
hoverBorderColor: '#F9A825'

// 정답 버튼
correctGradient: 'linear-gradient(135deg, #4CAF50, #45a049)'
correctBorderColor: '#2e7d32'

// 오답 버튼
wrongGradient: 'linear-gradient(135deg, #f44336, #d32f2f)'
wrongBorderColor: '#c62828'
```

---

## 구현 로직

### 인터페이스
```typescript
interface Question {
  text: string;      // 문제 텍스트 (예: "15 + 27 = ?")
  correct: number;   // 정답 숫자
  answers: number[]; // 4개의 보기 (정답 포함)
}
```

### 게임 상태
```typescript
const currentQuestion = ref<Question>({ text: '', correct: 0, answers: [] });
const score = ref(0);
const correctCount = ref(0);
const selectedAnswer = ref<number | null>(null);
const feedback = ref<{ text: string; type: 'correct' | 'wrong' } | null>(null);

let gameCompleted = false;
let startTime = 0;
```

### 문제 생성 로직
```typescript
function generateQuestion() {
  const range = getNumberRange();
  const operators = ['+', '-'];

  // 난이도 4 이상이면 곱셈 추가
  if (props.difficulty >= 4) {
    operators.push('×');
  }

  const operator = operators[Math.floor(Math.random() * operators.length)];
  let num1: number;
  let num2: number;
  let correct: number;

  if (operator === '×') {
    // 곱셈은 작은 수로 (2~11)
    num1 = Math.floor(Math.random() * 10) + 2;
    num2 = Math.floor(Math.random() * 10) + 2;
    correct = num1 * num2;
  } else if (operator === '-') {
    // 뺄셈은 음수가 안 나오도록
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * num1) + 1;
    correct = num1 - num2;
  } else {
    // 덧셈
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    correct = num1 + num2;
  }

  const text = `${num1} ${operator} ${num2} = ?`;

  // 오답 생성 (정답과 유사한 숫자)
  const wrongAnswers: number[] = [];
  const maxDiff = Math.max(10, Math.floor(correct * 0.3));

  while (wrongAnswers.length < 3) {
    const offset = Math.floor(Math.random() * maxDiff * 2) - maxDiff;
    const wrong = correct + offset;

    if (wrong !== correct && wrong > 0 && !wrongAnswers.includes(wrong)) {
      wrongAnswers.push(wrong);
    }
  }

  // 답안 랜덤 셔플
  const answers = [correct, ...wrongAnswers].sort(() => Math.random() - 0.5);

  currentQuestion.value = {
    text,
    correct,
    answers
  };
}
```

### 답안 선택 핸들러
```typescript
function handleAnswer(answer: number) {
  if (gameCompleted || feedback.value) return;

  selectedAnswer.value = answer;

  if (answer === currentQuestion.value.correct) {
    // 정답!
    correctCount.value++;
    score.value += 15;
    feedback.value = { text: '정답! 🎉', type: 'correct' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  } else {
    // 오답 - 정답 표시
    feedback.value = { text: `틀렸어요! 정답: ${currentQuestion.value.correct}`, type: 'wrong' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    safeSetTimeout(() => {
      completeGame();
    }, 1000);
    return;
  }

  // 다음 문제
  safeSetTimeout(() => {
    feedback.value = null;
    selectedAnswer.value = null;
    generateQuestion();
  }, 1200);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 문제 전환 | "슝" | 새 문제 등장 |
| 정답 | "딩!" | 밝은 성공음 |
| 오답 | "삐" | 실패 경고음 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 정답 | `[50, 30, 50]ms` | 성공 패턴 |
| 오답 | `[100, 50, 100]ms` | 실패 패턴 |

---

## UI 컴포넌트

### 문제 박스
```html
<div class="question-box">
  <div class="question">
    {{ currentQuestion.text }}
  </div>
</div>
```

### 답안 그리드
```html
<div class="answers-grid">
  <button
    v-for="answer in currentQuestion.answers"
    :key="answer"
    class="answer-btn"
    :class="{
      correct: feedback && answer === currentQuestion.correct,
      wrong: feedback && answer === selectedAnswer && answer !== currentQuestion.correct
    }"
    @touchstart.prevent="handleAnswer(answer)"
    :disabled="!!feedback"
  >
    {{ answer }}
  </button>
</div>
```

### 피드백
```html
<div v-if="feedback" class="feedback" :class="feedback.type">
  {{ feedback.text }}
</div>
```

---

## 스타일 정의

```css
.quick-math {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.question-box {
  background: white;
  padding: clamp(20px, 5vw, 40px) clamp(30px, 6vw, 60px);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.question {
  font-size: clamp(28px, 8vw, 48px);
  font-weight: 800;
  color: #2c3e50;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.answer-btn {
  padding: clamp(15px, 4vw, 30px);
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 700;
  color: #2c3e50;
  background: white;
  border: 4px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-family: 'Courier New', monospace;
}

.answer-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border-color: #F9A825;
}

.answer-btn.correct {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-color: #2e7d32;
  animation: correctPulse 0.5s ease-out;
}

.answer-btn.wrong {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border-color: #c62828;
  animation: wrongShake 0.5s ease-out;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## 오답 생성 알고리즘

```typescript
// 정답과 유사한 오답 생성
const wrongAnswers: number[] = [];
const maxDiff = Math.max(10, Math.floor(correct * 0.3)); // 정답의 30% 또는 최소 10

while (wrongAnswers.length < 3) {
  // -maxDiff ~ +maxDiff 범위에서 랜덤 오프셋
  const offset = Math.floor(Math.random() * maxDiff * 2) - maxDiff;
  const wrong = correct + offset;

  // 조건: 정답과 다름, 양수, 중복 아님
  if (wrong !== correct && wrong > 0 && !wrongAnswers.includes(wrong)) {
    wrongAnswers.push(wrong);
  }
}
```

---

## 테스트 체크리스트

- [ ] 덧셈 문제가 올바르게 생성되는가?
- [ ] 뺄셈 문제가 음수 결과 없이 생성되는가?
- [ ] 난이도 4 이상에서 곱셈이 추가되는가?
- [ ] 곱셈은 작은 숫자(2~11)로 제한되는가?
- [ ] 오답이 정답과 유사한 범위인가?
- [ ] 4개의 보기가 모두 고유한가?
- [ ] 정답/오답 피드백이 올바르게 표시되는가?
- [ ] 오답 시 정답이 표시되는가?
- [ ] 피드백 표시 중 버튼이 비활성화되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 한 자리 수 덧셈/뺄셈으로 자신감 부여
- **Lv.3**: 두 자리 수 연산, 집중력 필요
- **Lv.4+**: 곱셈 추가로 연산 복잡도 증가
- **Lv.5-6**: 큰 두 자리 수로 암산 능력 테스트

---

## 교육적 가치

- **암산 능력**: 빠른 계산 능력 향상
- **집중력**: 시간 압박 속 정확한 판단
- **수 감각**: 유사한 숫자 중 정답 식별
- **인지 속도**: 문제 이해와 답 선택 속도

---

## 개선 아이디어 (TODO)

- [ ] 나눗셈 연산 추가
- [ ] 연속 정답 시 콤보 보너스
- [ ] 시간 보너스 (빠른 정답)
- [ ] 계산 힌트 (어려운 문제)
- [ ] 문제 난이도 동적 조절

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `QuickMath.vue`
