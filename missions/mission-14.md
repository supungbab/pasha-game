# Mission 14: 색깔 이름 (Color Word)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 14 |
| **이름 (한글)** | 색깔 이름 |
| **이름 (영문)** | Color Word |
| **카테고리** | 인지/스트룹 효과 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/ColorWord.vue` |

---

## 게임 설명

글자가 아닌 글자의 **색깔**에 맞는 버튼을 선택하는 인지 게임입니다 (스트룹 효과 기반). 예를 들어 "빨강"이라는 글자가 **파란색**으로 쓰여있으면 **파란색** 버튼을 선택해야 합니다. 글자의 의미와 색상이 불일치하여 인지적 혼란을 일으키는 것이 핵심입니다.

---

## 시작 전 지시문

```
글자 말고 색깔을 선택! 🎨
```

**지시문 이모지**: 🔴🟢🔵 (색깔 버튼)

---

## 게임 규칙

1. 화면 중앙에 색깔 이름 텍스트가 표시됨
2. 텍스트의 **색상**과 **글자 내용**이 다름 (스트룹 효과)
   - 예: "빨강" (파란색으로 표시) → 파란색 선택
3. 하단의 4개 버튼 중 텍스트의 **색상**에 해당하는 버튼 선택
   - **정답**: 10점 획득, 다음 문제로 진행
   - **오답**: 점수 없음, 다음 문제로 진행
4. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반
- **정답**: 10점
- **오답**: 0점

### 결과 데이터
- `score`: 총 점수
- `count`: 정답 횟수
- `accuracy`: 정확도

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

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 일치 확률 | 색상 유사도 | 특수 효과 |
|--------|----------|-----------|----------|
| Lv.1 | 30% | 뚜렷함 | 없음 |
| Lv.2 | 20% | 뚜렷함 | 없음 |
| Lv.3 | 0% | 뚜렷함 | 없음 |
| Lv.4 | 0% | 약간 유사 | 없음 |
| Lv.5 | 0% | 유사 | 텍스트 흔들림 |
| Lv.6 | 0% | 매우 유사 | 텍스트 회전 |

### 일치 확률 (낮은 난이도에서 쉽게)
```typescript
// 난이도 1-2는 가끔 일치하게 (30% 확률)
if (props.difficulty <= 2 && Math.random() < 0.3) {
  colorIndex = textIndex;
} else {
  // 텍스트와 색상이 다르도록
  while (colorIndex === textIndex) {
    colorIndex = Math.floor(Math.random() * colorOptions.length);
  }
}
```

---

## 하드 모드 🔥

- 글자가 회전하면서 표시됨
- 색상 버튼도 잘못된 레이블 표시
- 시간 제한 20% 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 명확한 4가지 기본 색상
> - 큰 텍스트 표시
> - 직관적인 버튼 배치
> - 둥근 모서리 (border-radius: 20px)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│     정답: 4  |  점수: 40            │
├─────────────────────────────────────┤
│                                     │
│  글자가 아닌 "색깔"을 선택하세요!    │
│                                     │
│     ┌───────────────────────┐       │
│     │                       │       │
│     │      빨 강            │  ← 파란색으로 표시
│     │    (파란색 텍스트)     │       │
│     │                       │       │
│     └───────────────────────┘       │
│                                     │
│   ┌────────┐    ┌────────┐         │
│   │  빨강   │    │  파랑   │ ← 정답  │
│   └────────┘    └────────┘         │
│   ┌────────┐    ┌────────┐         │
│   │  초록   │    │  노랑   │         │
│   └────────┘    └────────┘         │
│                                     │
│         정답! 🎉 (피드백)           │
└─────────────────────────────────────┘
```

### 색상 정의
```typescript
const colorOptions: ColorOption[] = [
  { name: '빨강', value: '#f44336' },
  { name: '파랑', value: '#2196F3' },
  { name: '초록', value: '#4CAF50' },
  { name: '노랑', value: '#FFC107' }
];
```

### 색상 팔레트
```javascript
// 배경
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// 지시문 박스
instructionBackground: 'rgba(0, 0, 0, 0.3)'
instructionBorder: 'rgba(255, 255, 255, 0.3)'

// 단어 표시 박스
wordBoxBackground: 'white'
wordBoxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)'

// 버튼 레이블
labelBackground: 'rgba(0, 0, 0, 0.2)'

// 피드백
correctGradient: 'linear-gradient(135deg, #4CAF50, #45a049)'
wrongGradient: 'linear-gradient(135deg, #f44336, #d32f2f)'
```

### 스트룹 효과 표현
```typescript
interface WordDisplay {
  text: string;   // 글자 내용 (예: "빨강")
  color: string;  // 글자 색상 (예: "#2196F3" 파랑)
}

// 텍스트와 색상이 불일치
currentWord.value = {
  text: textOption.name,   // "빨강"
  color: colorOption.value // 파란색
};
```

---

## 구현 로직

### 인터페이스
```typescript
interface ColorOption {
  name: string;   // 색상 이름 (한글)
  value: string;  // 색상 코드 (HEX)
}

interface WordDisplay {
  text: string;   // 표시될 글자
  color: string;  // 글자 색상
}
```

### 게임 상태
```typescript
const currentWord = ref<WordDisplay>({ text: '', color: '' });
const score = ref(0);
const correctCount = ref(0);
const selectedColor = ref<string | null>(null);
const feedback = ref<{ text: string; type: 'correct' | 'wrong' } | null>(null);

let gameCompleted = false;
let startTime = 0;
```

### 문제 생성
```typescript
function generateWord() {
  // 텍스트 색상 이름 선택
  const textIndex = Math.floor(Math.random() * colorOptions.length);
  let colorIndex = Math.floor(Math.random() * colorOptions.length);

  // 난이도 1-2는 가끔 일치하게 (쉬움)
  if (props.difficulty <= 2 && Math.random() < 0.3) {
    colorIndex = textIndex;
  } else {
    // 텍스트와 색상이 다르도록 (스트룹 효과)
    while (colorIndex === textIndex) {
      colorIndex = Math.floor(Math.random() * colorOptions.length);
    }
  }

  const textOption = colorOptions[textIndex];
  const colorOption = colorOptions[colorIndex];

  if (!textOption || !colorOption) return;

  currentWord.value = {
    text: textOption.name,   // 글자 내용
    color: colorOption.value // 글자 색상 (플레이어가 선택해야 할 색)
  };
}
```

### 색상 선택 핸들러
```typescript
function handleColorSelect(option: ColorOption) {
  if (gameCompleted || feedback.value) return;

  selectedColor.value = option.value;

  if (option.value === currentWord.value.color) {
    // 정답! (글자 색상과 버튼 색상 일치)
    correctCount.value++;
    score.value += 10;
    feedback.value = { text: '정답! 🎉', type: 'correct' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // 목표 점수 달성 확인
    if (score.value >= props.targetScore) {
      safeSetTimeout(() => {
        completeGame();
      }, 800);
      return;
    }
  } else {
    // 오답
    feedback.value = { text: '틀렸어요! 😢', type: 'wrong' };

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // 다음 문제
  safeSetTimeout(() => {
    feedback.value = null;
    selectedColor.value = null;
    generateWord();
  }, 800);
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

### 지시문
```html
<div class="instruction">
  글자가 아닌 <strong>색깔</strong>을 선택하세요!
</div>
```

### 단어 표시
```html
<div class="word-display" :style="{ color: currentWord.color }">
  {{ currentWord.text }}
</div>
```

### 색상 버튼
```html
<div class="color-buttons">
  <button
    v-for="option in colorOptions"
    :key="option.name"
    class="color-btn"
    :class="{
      correct: feedback && option.value === currentWord.color,
      wrong: feedback && option.value === selectedColor && option.value !== currentWord.color
    }"
    :style="{ backgroundColor: option.value }"
    @touchstart.prevent="handleColorSelect(option)"
    :disabled="!!feedback"
  >
    <span class="color-label">{{ option.name }}</span>
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
.color-word {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.word-display {
  font-size: clamp(48px, 12vw, 96px);
  font-weight: 900;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  background: white;
  padding: clamp(20px, 5vw, 40px) clamp(30px, 8vw, 80px);
  border-radius: 24px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  animation: wordPop 0.5s ease-out;
}

.color-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.color-btn {
  padding: clamp(20px, 5vw, 40px);
  font-size: clamp(18px, 4vw, 28px);
  font-weight: 700;
  color: white;
  border: 4px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  border-color: white;
}

.color-btn.correct {
  border-color: #4CAF50;
  box-shadow: 0 0 30px #4CAF50;
}

.color-btn.wrong {
  border-color: #f44336;
  box-shadow: 0 0 30px #f44336;
  animation: wrongShake 0.5s ease-out;
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## 테스트 체크리스트

- [ ] 텍스트와 색상이 불일치하는가 (스트룹 효과)?
- [ ] 낮은 난이도에서 가끔 일치하는가?
- [ ] 정답은 글자 색상과 버튼 색상 일치 시 인가?
- [ ] 정답/오답 피드백이 올바르게 표시되는가?
- [ ] 피드백 표시 중 버튼이 비활성화되는가?
- [ ] 문제 전환 애니메이션이 자연스러운가?
- [ ] 진동 피드백이 올바르게 동작하는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 가끔 일치하여 쉽게 시작, 스트룹 효과 적응
- **Lv.3-4**: 항상 불일치, 집중력 필요
- **Lv.5-6**: 불일치 + 시각적 방해 요소로 높은 집중력 필수

---

## 개선 아이디어 (TODO)

- [ ] 더 많은 색상 추가 (6-8가지)
- [ ] 텍스트 애니메이션 (회전, 흔들림)
- [ ] 콤보 보너스 (연속 정답)
- [ ] 시간 보너스 (빠른 정답)
- [ ] 역스트룹 모드 (색상 말고 글자 선택)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `ColorWord.vue`
