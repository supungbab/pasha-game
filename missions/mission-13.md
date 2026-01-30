# Mission 13: 순서 기억 (Memory Sequence)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 13 |
| **이름 (한글)** | 순서 기억 |
| **이름 (영문)** | Memory Sequence |
| **카테고리** | 기억력 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 20초 (관찰 + 입력) |
| **기본 목표점수** | 40점 |
| **구현 파일** | `src/components/minigames/MemorySequence.vue` |

---

## 게임 설명

깜빡이는 타일의 순서를 기억하고 똑같이 재현하는 기억력 게임입니다 (사이먼 게임 스타일). 컴퓨터가 타일을 순서대로 깜빡이면, 플레이어는 그 순서를 기억하여 동일하게 탭해야 합니다. 라운드가 진행될수록 시퀀스 길이가 늘어납니다.

---

## 시작 전 지시문

```
순서를 기억하세요! 👀
```

**지시문 이모지**: ⬜🟨 (타일)

---

## 게임 규칙

1. 3×3 그리드의 다채로운 타일이 표시됨
2. **관찰 단계**: 타일들이 순서대로 깜빡임 (노란 발광 효과)
3. **입력 단계**: 플레이어가 같은 순서로 타일을 탭
4. 라운드 성공:
   - 20점 획득
   - 다음 라운드로 진행 (시퀀스 길이 +1)
5. 실패 (잘못된 타일 탭):
   - 즉시 게임 종료
6. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반 (라운드 클리어)
- **라운드 클리어**: 20점
- **실패 시**: 게임 종료

### 결과 데이터
- `score`: 총 점수
- `count`: 클리어한 라운드 수

### 난이도별 설정

| 난이도 | 초기 시퀀스 길이 | 타일 깜빡임 속도 | 목표 점수 |
|--------|----------------|----------------|----------|
| Lv.1 | 3개 | 800ms | 40점 (2라운드) |
| Lv.2 | 3개 | 700ms | 48점 |
| Lv.3 | 4개 | 600ms | 60점 (3라운드) |
| Lv.4 | 4개 | 500ms | 72점 |
| Lv.5 | 5개 | 400ms | 88점 (4라운드) |
| Lv.6 | 6개 | 400ms | 100점 (5라운드) |

### 초기 시퀀스 길이 계산
```typescript
const initialSequenceLength = Math.min(3 + Math.floor(props.difficulty / 2), 6);
```

### 깜빡임 속도 계산
```typescript
const delay = Math.max(800 - props.difficulty * 100, 400);
```

---

## 제한 시간

- **기본**: 20초 (관찰 + 입력 포함)
- **난이도별 조정**: 동일 (20초)

---

## 난이도별 변화

| 난이도 | 시퀀스 길이 | 깜빡임 간격 | 타일 간 대기 |
|--------|-----------|-----------|------------|
| Lv.1 | 3 → 4 → 5... | 800ms | 200ms |
| Lv.2 | 3 → 4 → 5... | 700ms | 200ms |
| Lv.3 | 4 → 5 → 6... | 600ms | 200ms |
| Lv.4 | 4 → 5 → 6... | 500ms | 200ms |
| Lv.5 | 5 → 6 → 7... | 400ms | 200ms |
| Lv.6 | 6 → 7 → 8... | 400ms | 200ms |

---

## 하드 모드 🔥

- 같은 타일이 연속으로 등장 가능
- 깜빡임 속도 20% 증가
- 타일 색상이 유사하게 변경
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - 다채로운 타일 색상
> - 깜빡임 시 발광 효과
> - 둥근 모서리 (border-radius: 16px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│   라운드: 2  |  점수: 20            │
├─────────────────────────────────────┤
│                                     │
│        ┌───┐ ┌───┐ ┌───┐           │
│        │ 1 │ │ 2 │ │ 3 │           │
│        └───┘ └───┘ └───┘           │
│        ┌───┐ ┌───┐ ┌───┐           │
│        │ 4 │ │ 5 │ │ 6 │           │
│        └───┘ └───┘ └───┘           │
│        ┌───┐ ┌───┐ ┌───┐           │
│        │ 7 │ │ 8 │ │ 9 │           │
│        └───┘ └───┘ └───┘           │
│                                     │
│    👀 순서를 기억하세요! (관찰 중)   │
│    또는                             │
│    🖐️ 순서대로 탭하세요! (2/4)       │
└─────────────────────────────────────┘
```

### 색상 팔레트
```typescript
// 타일 색상 (9개)
const colors = [
  '#FF6B6B',  // 빨강
  '#4ECDC4',  // 청록
  '#45B7D1',  // 하늘
  '#FFA07A',  // 살몬
  '#98D8C8',  // 민트
  '#F7DC6F',  // 노랑
  '#BB8FCE',  // 보라
  '#85C1E2',  // 연하늘
  '#F8B88B'   // 주황
];

// 배경
backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
gridBackground: 'rgba(255, 255, 255, 0.1)'

// 상태별 효과
activeGlow: 'rgba(255, 255, 255, 0.8)'     // 깜빡임
successGlow: '#4CAF50'                      // 정답
errorGlow: '#f44336'                        // 오답
```

### 타일 상태별 스타일
| 상태 | 투명도 | 스케일 | 효과 |
|------|--------|--------|------|
| 기본 | 0.7 | 1.0 | 그림자 |
| 활성 (active) | 1.0 | 1.1 | 흰색 발광 |
| 성공 (success) | 1.0 | 1.15 | 초록 발광 |
| 오류 (error) | 1.0 | 1.15 | 빨강 발광 + 흔들림 |

---

## 구현 로직

### 게임 상태 타입
```typescript
type GameState = 'waiting' | 'watching' | 'playing';
```

### 타일 인터페이스
```typescript
interface Tile {
  id: number;        // 0-8 (3x3)
  color: string;     // 타일 색상
  isActive: boolean; // 깜빡임 중
  isSuccess: boolean;// 정답 피드백
  isError: boolean;  // 오답 피드백
}
```

### 게임 상태
```typescript
const gameState = ref<GameState>('waiting');
const tiles = ref<Tile[]>([]);
const sequence = ref<number[]>([]);      // 컴퓨터가 보여주는 시퀀스
const playerSequence = ref<number[]>([]); // 플레이어 입력
const currentRound = ref(1);
const score = ref(0);

const tileCount = 9;  // 3x3 그리드
```

### 타일 초기화
```typescript
function initTiles() {
  tiles.value = Array.from({ length: tileCount }, (_, i) => ({
    id: i,
    color: colors[i] ?? colors[0]!,
    isActive: false,
    isSuccess: false,
    isError: false
  }));
}
```

### 시퀀스 생성
```typescript
function generateSequence() {
  const length = initialSequenceLength + currentRound.value - 1;
  sequence.value = [];

  for (let i = 0; i < length; i++) {
    const randomId = Math.floor(Math.random() * tileCount);
    sequence.value.push(randomId);
  }
}
```

### 시퀀스 표시 (관찰 단계)
```typescript
async function showSequence() {
  gameState.value = 'watching';
  const delay = Math.max(800 - props.difficulty * 100, 400);

  for (let i = 0; i < sequence.value.length; i++) {
    const tileId = sequence.value[i]!;
    const tile = tiles.value[tileId];
    if (!tile) continue;

    // 타일 활성화 (깜빡임)
    tile.isActive = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    await new Promise(resolve => setTimeout(resolve, delay));

    // 타일 비활성화
    tile.isActive = false;

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 플레이어 턴 시작
  gameState.value = 'playing';
  playerSequence.value = [];
}
```

### 타일 클릭 핸들러
```typescript
function handleTileClick(tile: Tile) {
  if (gameCompleted || gameState.value !== 'playing') return;

  const currentIndex = playerSequence.value.length;
  const expectedId = sequence.value[currentIndex];

  playerSequence.value.push(tile.id);

  if (tile.id === expectedId) {
    // 정답!
    tile.isSuccess = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    safeSetTimeout(() => {
      tile.isSuccess = false;
    }, 300);

    // 시퀀스 완성 확인
    if (playerSequence.value.length === sequence.value.length) {
      // 라운드 성공!
      score.value += 20;
      currentRound.value++;

      // 목표 점수 달성 확인
      if (score.value >= props.targetScore) {
        completeGame();
        return;
      }

      // 다음 라운드
      safeSetTimeout(() => {
        startRound();
      }, 1000);
    }
  } else {
    // 오답!
    tile.isError = true;

    // 진동 피드백
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    safeSetTimeout(() => {
      tile.isError = false;
    }, 500);

    // 게임 실패
    safeSetTimeout(() => {
      completeGame();
    }, 1000);
  }
}
```

### 라운드 시작
```typescript
async function startRound() {
  gameState.value = 'waiting';

  // 타일 초기화
  tiles.value.forEach(tile => {
    tile.isActive = false;
    tile.isSuccess = false;
    tile.isError = false;
  });

  await new Promise(resolve => setTimeout(resolve, 800));

  generateSequence();
  await showSequence();
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 타일 깜빡임 | "도레미~" | 각 타일별 다른 음 |
| 정답 터치 | "딩" | 짧은 확인음 |
| 라운드 성공 | "빠밤!" | 성공 팡파레 |
| 오답 | "삐익~" | 실패 경고음 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 타일 깜빡임 | `50ms` | 관찰 시 피드백 |
| 정답 터치 | `30ms` | 짧은 확인 |
| 라운드 성공 | `[50, 30, 50]ms` | 성공 패턴 |
| 오답 | `[100, 50, 100]ms` | 실패 패턴 |

---

## UI 컴포넌트

### 타일 그리드 (HTML 기반)
```html
<div class="tiles-grid">
  <div
    v-for="tile in tiles"
    :key="tile.id"
    class="tile"
    :class="{
      active: tile.isActive,
      success: tile.isSuccess,
      error: tile.isError
    }"
    :style="{ backgroundColor: tile.color }"
    @touchstart.prevent="handleTileClick(tile)"
  >
    {{ tile.id + 1 }}
  </div>
</div>
```

### 상태 메시지
```html
<div class="status">
  <div v-if="gameState === 'watching'" class="message">
    👀 순서를 기억하세요!
  </div>
  <div v-else-if="gameState === 'playing'" class="message">
    🖐️ 순서대로 탭하세요! ({{ playerSequence.length }} / {{ sequence.length }})
  </div>
  <div v-else-if="gameState === 'waiting'" class="message">
    ⏳ 준비 중...
  </div>
</div>
```

### 점수 표시
```html
<div class="score-display">
  라운드: {{ currentRound }}
  <span class="separator">|</span>
  점수: {{ score }}
</div>
```

---

## 스타일 정의

```css
.memory-sequence {
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

.tiles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(8px, 2vw, 15px);
  padding: clamp(10px, 3vw, 20px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

.tile {
  width: clamp(60px, 20vw, 100px);
  height: clamp(60px, 20vw, 100px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(20px, 6vw, 32px);
  font-weight: 800;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tile.active {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8),
              0 0 60px currentColor;
}

.tile.success {
  opacity: 1;
  transform: scale(1.15);
  box-shadow: 0 0 30px #4CAF50;
}

.tile.error {
  opacity: 1;
  transform: scale(1.15);
  box-shadow: 0 0 30px #f44336;
  animation: tileError 0.5s ease-out;
}

@keyframes tileError {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## 테스트 체크리스트

- [ ] 타일이 순서대로 깜빡이는가?
- [ ] 깜빡임 시간이 난이도에 따라 변하는가?
- [ ] 관찰 단계에서 터치가 무시되는가?
- [ ] 입력 순서가 올바르게 체크되는가?
- [ ] 정답 시 타일 성공 효과가 표시되는가?
- [ ] 오답 시 타일 오류 효과 + 게임 종료되는가?
- [ ] 라운드가 진행될수록 시퀀스가 길어지는가?
- [ ] 진행 상황(X/Y)이 정확하게 표시되는가?
- [ ] 목표 점수 달성 시 게임이 완료되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 짧은 시퀀스, 느린 속도로 기억 부담 낮음
- **Lv.3-4**: 중간 길이, 중간 속도로 집중력 필요
- **Lv.5-6**: 긴 시퀀스, 빠른 속도로 높은 기억력 필요

---

## 개선 아이디어 (TODO)

- [ ] 타일별 고유 음계 (사이먼 게임 스타일)
- [ ] 역순 모드 (기억한 순서 거꾸로)
- [ ] 힌트 기능 (한 번 다시 보기)
- [ ] 콤보 보너스 (연속 라운드 클리어)
- [ ] 타일 수 증가 (4x4 그리드)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `MemorySequence.vue`
