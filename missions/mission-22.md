# Mission 22: 미로 탈출 (Maze Escape)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 22 |
| **이름 (한글)** | 미로 탈출 |
| **이름 (영문)** | Maze Escape |
| **카테고리** | 액션/수집 |
| **조작 방식** | 탭/스와이프/키보드 👉 |
| **기본 제한시간** | 30초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/MazeEscape.vue` |

---

## 게임 설명

랜덤하게 생성된 미로에서 플레이어(🔵)를 조작하여 출구(🚪)까지 도달하는 게임입니다. 방향 버튼이나 인접한 셀을 탭하여 이동할 수 있으며, 키보드(WASD/화살표)로도 조작 가능합니다. 탈출에 성공하면 기본 점수 + 시간 보너스를 획득합니다.

---

## 시작 전 지시문

```
출구를 찾아 탈출하세요! 🏃
```

**지시문 이모지**: 🔵🚪 (플레이어/출구)

---

## 게임 규칙

1. 미로 왼쪽 상단에서 시작 (1, 1)
2. 출구는 오른쪽 하단 근처에 위치
3. 이동 방법:
   - 방향 버튼 (⬆️⬇️⬅️➡️) 탭
   - 인접한 셀 직접 탭
   - 키보드 (WASD 또는 화살표)
4. 벽으로는 이동 불가 (진동 피드백)
5. 출구 도달 시 탈출 성공!
6. 점수 = 기본 100점 + 남은시간 × 10점

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 시간 보너스 기반
- **탈출 성공**: 100 + (남은시간 × 10)점
- **탈출 실패**: 10점

### 점수 공식
```typescript
let finalScore = 0;
if (isComplete.value) {
  finalScore = Math.floor(100 + timeRemaining * 10);
} else {
  finalScore = 10; // 실패
}
```

### 점수 예시
| 남은 시간 | 점수 계산 | 최종 점수 |
|----------|----------|----------|
| 20초 | 100 + 200 | 300점 |
| 15초 | 100 + 150 | 250점 |
| 10초 | 100 + 100 | 200점 |
| 0초 (성공) | 100 + 0 | 100점 |
| 실패 | - | 10점 |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 설명 |
|--------|----------|------|------|
| Lv.1 | 60점 | ×1.0 | 성공하면 달성 |
| Lv.2 | 72점 | ×1.2 | 성공하면 달성 |
| Lv.3 | 90점 | ×1.5 | 성공하면 달성 |
| Lv.4 | 108점 | ×1.8 | 빠른 탈출 필요 |
| Lv.5 | 132점 | ×2.2 | 매우 빠른 탈출 필요 |
| Lv.6 | 150점 | ×2.5 | 최단 경로로 빠르게 |

---

## 제한 시간

- **기본**: 30초
- **난이도별 조정**: 동일 (30초)

---

## 난이도별 변화

| 난이도 | 미로 너비 | 미로 높이 | 셀 크기 |
|--------|----------|----------|--------|
| Lv.1 | 13 | 10 | 40px |
| Lv.2 | 14 | 10 | 40px |
| Lv.3 | 15 | 11 | 40px |
| Lv.4 | 16 | 11 | 40px |
| Lv.5 | 17 | 12 | 40px |
| Lv.6 | 18 | 12 | 40px |

### 난이도 설정 로직
```typescript
mazeWidth = Math.min(12 + props.difficulty, 18);
mazeHeight = Math.min(10 + Math.floor(props.difficulty / 2), 14);
```

---

## 하드 모드 🔥

- 더 큰 미로
- 시간 제한 감소
- 복잡한 미로 구조
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 그리드 형태의 미로
> - 명확한 벽/길 구분
> - 이모지 캐릭터

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│  출구까지 클릭하여 길을 만드세요!     │
├─────────────────────────────────────┤
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■        │
│  ■ 🔵□ □ ■ □ □ □ ■ □ □ □ ■        │
│  ■ □ ■ □ ■ □ ■ □ □ □ ■ □ ■        │
│  ■ □ ■ □ □ □ ■ ■ ■ □ ■ □ ■        │
│  ■ □ ■ ■ ■ □ □ □ □ □ □ □ ■        │
│  ■ □ □ □ ■ □ ■ ■ ■ ■ ■ □ ■        │
│  ■ ■ ■ □ ■ □ □ □ □ □ ■ □ ■        │
│  ■ □ □ □ □ □ ■ ■ ■ □ □ 🚪■        │
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■        │
├─────────────────────────────────────┤
│       [⬆️]                          │
│    [⬅️][⬇️][➡️]                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 */
backgroundGradient: 'linear-gradient(#2c3e50, #34495e)'

/* 벽 */
wallColor: '#34495e'
wallBorder: '#2c3e50'

/* 길 */
pathColor: '#ecf0f1'
pathBorder: '#bdc3c7'

/* 출구 */
exitColor: '#4CAF50'

/* 플레이어 */
playerColor: '#3498db'

/* 방향 버튼 */
buttonGradient: 'linear-gradient(135deg, #FFD700, #FFC107)'
buttonActive: 'linear-gradient(135deg, #4CAF50, #45a049)'
```

---

## 구현 로직

### 미로 생성 (재귀적 백트래킹)
```typescript
function generateMaze() {
  mazeWidth = Math.min(12 + props.difficulty, 18);
  mazeHeight = Math.min(10 + Math.floor(props.difficulty / 2), 14);

  // 초기화 (모두 벽)
  maze = Array.from({ length: mazeHeight }, () =>
    Array.from({ length: mazeWidth }, () => 1)
  );

  // 재귀적 백트래킹으로 미로 생성
  function carve(x: number, y: number) {
    maze[y]![x] = 0;

    const dirs: [number, number][] = [
      [0, -1],  // 위
      [1, 0],   // 오른쪽
      [0, 1],   // 아래
      [-1, 0]   // 왼쪽
    ];

    // 랜덤하게 방향 섞기
    dirs.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;

      if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && maze[ny]?.[nx] === 1) {
        maze[y + dy]![x + dx] = 0; // 중간 벽 제거
        carve(nx, ny);
      }
    }
  }

  // 시작점에서 미로 생성
  playerX = 1;
  playerY = 1;
  carve(playerX, playerY);

  // 출구 설정 (오른쪽 아래 근처)
  exitX = mazeWidth - 2;
  exitY = mazeHeight - 2;
  maze[exitY]![exitX] = 0;

  // 출구까지 경로 보장
  for (let i = 1; i < mazeWidth - 1; i++) {
    if (Math.random() < 0.7) maze[exitY]![i] = 0;
  }
  for (let i = 1; i < mazeHeight - 1; i++) {
    if (Math.random() < 0.7) maze[i]![exitX] = 0;
  }
}
```

### 이동 로직
```typescript
function move(dx: number, dy: number) {
  if (gameCompleted || isComplete.value) return;

  const newX = playerX + dx;
  const newY = playerY + dy;

  // 범위 체크
  if (newX < 0 || newX >= mazeWidth || newY < 0 || newY >= mazeHeight) {
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }

  // 벽 체크
  if (maze[newY]?.[newX] === 1) {
    if (navigator.vibrate) navigator.vibrate(100);
    return;
  }

  // 이동
  playerX = newX;
  playerY = newY;

  if (navigator.vibrate) navigator.vibrate(20);

  // 출구 도달 체크
  if (playerX === exitX && playerY === exitY) {
    handleEscape();
  }
}
```

### 터치 이동
```typescript
function handleTouch(event: TouchEvent) {
  if (gameCompleted || isComplete.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;
  const touchX = (touch.clientX - rect.left) * (width / rect.width);
  const touchY = (touch.clientY - rect.top) * (height / rect.height);

  const offsetX = (width - mazeWidth * cellSize) / 2;
  const offsetY = (height - mazeHeight * cellSize) / 2;

  const cellX = Math.floor((touchX - offsetX) / cellSize);
  const cellY = Math.floor((touchY - offsetY) / cellSize);

  // 인접한 셀인지 확인
  const dx = cellX - playerX;
  const dy = cellY - playerY;

  if (Math.abs(dx) + Math.abs(dy) === 1) {
    move(dx, dy);
  }
}
```

### 키보드 지원
```typescript
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      move(0, -1);
      break;
    case 'ArrowDown':
    case 's':
      move(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
      move(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
      move(1, 0);
      break;
  }
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 이동 | "딸깍" | 한 칸 이동 |
| 벽 충돌 | "퉁" | 벽에 부딪힘 |
| 탈출 성공 | "팡파레" | 출구 도달 |
| 시간 경고 | "틱틱" | 남은 시간 5초 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 이동 | `20ms` | 짧은 이동 피드백 |
| 벽 충돌 | `100ms` | 긴 실패 피드백 |
| 탈출 성공 | `[50, 50, 50, 50, 50]ms` | 성공 축하 |

---

## UI 컴포넌트

### 방향 버튼
```html
<div class="controls">
  <button
    v-for="dir in directions"
    :key="dir.key"
    class="direction-btn"
    :class="{
      pressed: getDirTouchState(dir.key).touchId !== null,
      'pressed-outside': getDirTouchState(dir.key).touchId !== null && !getDirTouchState(dir.key).isInside
    }"
    @touchstart="handleDirTouchStart($event, dir.key)"
    @touchmove="handleDirTouchMove($event, dir.key)"
    @touchend="handleDirTouchEnd($event, dir.key, dir.dx, dir.dy)"
    @touchcancel="handleDirTouchCancel(dir.key)"
  >
    {{ dir.label }}
  </button>
</div>
```

### 성공 메시지
```html
<div v-if="isComplete" class="success-message">
  🎉 탈출 성공!
</div>
```

---

## 스타일 정의

```css
.maze-escape {
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: clamp(5px, 2vw, 10px);
  z-index: 10;
}

.direction-btn {
  width: clamp(50px, 15vw, 70px);
  height: clamp(50px, 15vw, 70px);
  font-size: clamp(22px, 6vw, 32px);
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border: 3px solid #F9A825;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 방향키 레이아웃 */
.direction-btn:nth-child(1) { grid-column: 2; grid-row: 1; } /* 위 */
.direction-btn:nth-child(2) { grid-column: 2; grid-row: 2; } /* 아래 */
.direction-btn:nth-child(3) { grid-column: 1; grid-row: 2; } /* 왼쪽 */
.direction-btn:nth-child(4) { grid-column: 3; grid-row: 2; } /* 오른쪽 */

.direction-btn:active,
.direction-btn.pressed {
  transform: scale(0.95);
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-color: #2e7d32;
}

.success-message {
  font-size: clamp(24px, 6vw, 36px);
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 24px;
  padding: clamp(12px, 3vw, 20px) clamp(20px, 5vw, 40px);
  animation: successPop 0.5s ease-out;
}
```

---

## 테스트 체크리스트

- [ ] 미로가 랜덤하게 생성되는가?
- [ ] 시작점에서 출구까지 경로가 존재하는가?
- [ ] 방향 버튼으로 이동이 가능한가?
- [ ] 인접 셀 탭으로 이동이 가능한가?
- [ ] 키보드 (WASD/화살표)로 이동이 가능한가?
- [ ] 벽으로 이동 시 차단되는가?
- [ ] 출구 도달 시 성공 처리되는가?
- [ ] 시간 보너스가 올바르게 계산되는가?
- [ ] 시간 초과 시 게임이 완료되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 작은 미로로 쉬운 시작
- **Lv.3-4**: 중간 크기 미로
- **Lv.5-6**: 큰 미로로 빠른 탐색 필요

---

## 미로 탐색 전략

- **벽 따라가기**: 한쪽 벽을 계속 따라가면 출구 도달
- **사전 탐색**: 잠시 미로 전체를 확인하고 경로 계획
- **되돌아가기**: 막다른 길이면 빠르게 돌아오기
- **대각선 이동**: 출구 방향으로 대각선 진행

---

## 개선 아이디어 (TODO)

- [ ] 아이템 수집 (열쇠, 동전)
- [ ] 적 회피 요소
- [ ] 안개 효과 (주변만 보임)
- [ ] 미니맵 표시
- [ ] 최단 경로 힌트

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `MazeEscape.vue`
