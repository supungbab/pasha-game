# Mission 05: 리듬 탭 (Rhythm Tap)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 5 |
| **이름 (한글)** | 리듬 탭 |
| **이름 (영문)** | Rhythm Tap |
| **카테고리** | 리듬/타이밍 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 12초 |
| **기본 목표점수** | 70점 |
| **구현 파일** | `src/components/minigames/RhythmTap.vue` |

---

## 게임 설명

화면에 위에서 아래로 내려오는 리듬 노트를 판정 구역에서 정확한 타이밍에 탭하는 리듬 게임입니다. 노트가 판정 원에 가까울수록 높은 점수를 획득합니다.

---

## 시작 전 지시문

```
탭! 👆
```

**지시문 이모지**: 🎵🎶 (음표), ⭕ (판정 구역)

---

## 게임 규칙

1. 음표 노트(🎵)가 화면 위에서 아래로 내려옴
2. 판정 원(⭕)에 노트가 도달했을 때 화면을 탭
3. 타이밍에 따라 판정
   - **Perfect**: 노트가 판정 원 중심에 매우 가까울 때
   - **Good**: 노트가 판정 원 범위 내에 있을 때
   - **Miss**: 노트를 놓치거나 타이밍이 너무 어긋났을 때
4. 노트가 화면 밖으로 나가면 자동 Miss 처리
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 정확도 기반
- **Perfect 판정**: 10점
- **Good 판정**: 5점
- **Miss 판정**: 0점 + 콤보 초기화

### 콤보 시스템
- 연속 성공 시 콤보 카운트 증가
- Miss 발생 시 콤보 초기화
- 콤보는 UI에 표시되지만 점수에 직접 영향 없음 (추후 보너스 적용 가능)

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 필요 Perfect 횟수 (예상) |
|--------|----------|------|------------------------|
| Lv.1 | 70점 | ×1.0 | 7회 (또는 Good 14회) |
| Lv.2 | 84점 | ×1.2 | 8-9회 |
| Lv.3 | 105점 | ×1.5 | 10-11회 |
| Lv.4 | 126점 | ×1.8 | 12-13회 |
| Lv.5 | 154점 | ×2.2 | 15-16회 |
| Lv.6 | 175점 | ×2.5 | 17-18회 |

---

## 제한 시간

- **기본**: 12초
- **난이도별 조정**: 동일 (12초)

---

## 난이도별 변화

| 난이도 | 노트 속도 | 노트 생성 간격 | Perfect 판정 범위 |
|--------|----------|---------------|------------------|
| Lv.1 | 3.5 px/frame | 800ms | 20px |
| Lv.2 | 4.0 px/frame | 700ms | 20px |
| Lv.3 | 4.5 px/frame | 600ms | 20px |
| Lv.4 | 5.0 px/frame | 500ms | 20px |
| Lv.5 | 5.5 px/frame | 400ms | 20px |
| Lv.6 | 6.0 px/frame | 400ms | 20px |

### 노트 속도 계산
```typescript
const noteSpeed = 3 + props.difficulty * 0.5;
```

### 노트 생성 간격 계산
```typescript
const noteInterval = Math.max(800 - props.difficulty * 100, 400);
```

---

## 하드 모드 🔥

- 노트가 좌우로 흔들리며 내려옴
- 더미 노트 추가 (탭하면 감점)
- 노트 속도 15% 증가
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - **Primary Yellow**: `#FFD700` (Perfect 영역, 히트 이펙트)
> - **Contrast Purple**: `#5E35B1` (배경 테마)
> - 둥근 모서리 (border-radius: 12-20px)
> - 부드러운 그림자 (box-shadow)

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│       점수: 50 / 70                 │
│         3 COMBO! 🔥                 │
├─────────────────────────────────────┤
│              🎵 (노트)              │
│               ↓                     │
│              🎵                     │
│               ↓                     │
│         ═══════════ (판정선)        │
│            ⭕ (판정 원)              │
│         ═══════════                 │
│                                     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```javascript
// 배경 그라데이션
backgroundTop: '#4a0e4e'      // 진한 보라
backgroundBottom: '#81689d'   // 연한 보라

// 노트
noteColor: '#FF1744'          // 빨간색 (일반)
noteHitColor: '#FFD700'       // 황금색 (히트 시)
noteIcon: '🎵'                // 음표 이모지

// 판정 영역
perfectZone: 'rgba(255, 215, 0, 0.2)'   // 황금색 투명
goodZone: 'rgba(76, 175, 80, 0.1)'      // 초록색 투명
judgmentLine: 'rgba(255, 255, 255, 0.3)' // 흰색 점선

// 판정 원
targetCircle: '#00BCD4'       // 시안색
perfectCircle: '#FFD700'      // 황금색
```

### 판정 영역 상수
```typescript
const TARGET_Y = height - 150;     // 판정선 Y 위치
const TARGET_RADIUS = 60;          // 판정 원 반지름
const PERFECT_THRESHOLD = 20;      // Perfect 판정 범위
const GOOD_THRESHOLD = 40;         // Good 판정 범위
```

### 판정 피드백 표시
| 판정 | 텍스트 | 색상 | 배경 |
|------|--------|------|------|
| Perfect | "PERFECT! 💯" | `#FFD700` | `rgba(255, 215, 0, 0.2)` |
| Good | "Good! 👍" | `#4CAF50` | `rgba(76, 175, 80, 0.2)` |
| Miss | "Miss! 😢" | `#f44336` | `rgba(244, 67, 54, 0.2)` |

---

## 구현 로직

### 주요 인터페이스

```typescript
// 노트 인터페이스
interface Note {
  id: number;       // 고유 ID
  x: number;        // X 위치 (화면 중앙)
  y: number;        // Y 위치
  speed: number;    // 하강 속도
  hit: boolean;     // 히트 여부
}
```

### 노트 생성
```typescript
function createNote() {
  notes.value.push({
    id: noteIdCounter++,
    x: width / 2,
    y: -50,           // 화면 위에서 시작
    speed: noteSpeed,
    hit: false
  });
}
```

### 탭 핸들러 및 판정 로직
```typescript
function handleTap() {
  if (gameCompleted) return;

  // 가장 가까운 노트 찾기
  let closestNote: Note | null = null;
  let closestDistance = Infinity;

  for (const note of notes.value) {
    if (note.hit) continue;

    const distance = Math.abs(note.y - TARGET_Y);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestNote = note;
    }
  }

  if (!closestNote) return;

  // 판정
  if (closestDistance <= PERFECT_THRESHOLD) {
    // Perfect!
    score.value += 10;
    combo.value++;
    showJudgment('PERFECT! 💯', 'perfect');
    closestNote.hit = true;
  } else if (closestDistance <= GOOD_THRESHOLD) {
    // Good
    score.value += 5;
    combo.value++;
    showJudgment('Good! 👍', 'good');
    closestNote.hit = true;
  } else if (closestDistance <= TARGET_RADIUS + 30) {
    // Miss (범위 내 탭했지만 타이밍 어긋남)
    combo.value = 0;
    showJudgment('Miss! 😢', 'miss');
  }

  // 목표 점수 달성 확인
  if (score.value >= props.targetScore) {
    completeGame();
  }
}
```

### 노트 업데이트
```typescript
function update() {
  const now = Date.now();

  // 노트 생성
  if (now - lastNoteTime > noteInterval) {
    createNote();
    lastNoteTime = now;
  }

  // 노트 이동
  for (let i = notes.value.length - 1; i >= 0; i--) {
    const note = notes.value[i];
    if (!note) continue;
    note.y += note.speed;

    // 화면 밖으로 나가면 Miss 처리
    if (note.y > height && !note.hit) {
      notes.value.splice(i, 1);
      combo.value = 0;
      showJudgment('Miss! 😢', 'miss');
    } else if (note.hit && note.y > TARGET_Y + 100) {
      // 히트된 노트는 조금 더 내려간 후 제거
      notes.value.splice(i, 1);
    }
  }
}
```

### 렌더링
```typescript
function render() {
  if (!ctx.value) return;
  const c = ctx.value;

  // 배경 그라데이션
  const gradient = c.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#4a0e4e');
  gradient.addColorStop(1, '#81689d');
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);

  // 판정선 (가이드)
  c.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  c.setLineDash([10, 10]);
  c.beginPath();
  c.moveTo(0, TARGET_Y);
  c.lineTo(width, TARGET_Y);
  c.stroke();
  c.setLineDash([]);

  // Perfect/Good 구역
  c.fillStyle = 'rgba(255, 215, 0, 0.2)';
  c.fillRect(0, TARGET_Y - PERFECT_THRESHOLD, width, PERFECT_THRESHOLD * 2);
  c.fillStyle = 'rgba(76, 175, 80, 0.1)';
  c.fillRect(0, TARGET_Y - GOOD_THRESHOLD, width, GOOD_THRESHOLD * 2);

  // 노트 렌더링
  for (const note of notes.value) {
    if (note.hit) {
      c.globalAlpha = Math.max(0, 1 - (note.y - TARGET_Y) / 100);
      c.fillStyle = '#FFD700';
    } else {
      c.globalAlpha = 1;
      c.fillStyle = '#FF1744';
    }

    c.beginPath();
    c.arc(note.x, note.y, 30, 0, Math.PI * 2);
    c.fill();

    // 노트 내부 아이콘
    if (!note.hit) {
      c.fillStyle = 'white';
      c.font = '24px Arial';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('🎵', note.x, note.y);
    }

    c.globalAlpha = 1;
  }

  // 판정 원
  c.strokeStyle = '#00BCD4';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(width / 2, TARGET_Y, TARGET_RADIUS, 0, Math.PI * 2);
  c.stroke();

  // Perfect 원
  c.strokeStyle = '#FFD700';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(width / 2, TARGET_Y, PERFECT_THRESHOLD, 0, Math.PI * 2);
  c.stroke();
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| Perfect | "딩!" | 높은 음의 맑은 소리 |
| Good | "뚝" | 중간 음의 터치 소리 |
| Miss | "삑" | 낮은 음의 실패 소리 |
| 콤보 3회 이상 | "띵동!" | 콤보 보너스 소리 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| Perfect | `[30, 30, 30]ms` | 트리플 진동 |
| Good | `30ms` | 단일 짧은 진동 |
| Miss | `[100, 50, 100]ms` | 경고 진동 패턴 |

---

## UI 컴포넌트

### 점수 표시
```html
<div class="score-display">
  {{ score }} / {{ props.targetScore }}
</div>
```

### 콤보 표시
```html
<div v-if="combo > 1" class="combo">
  {{ combo }} COMBO! 🔥
</div>
```

### 판정 표시
```html
<div v-if="judgment" class="judgment" :class="judgment.type">
  {{ judgment.text }}
</div>
```

### 판정 구역 (HTML 요소)
```html
<div class="tap-zone">
  <div class="target-circle">⭕</div>
</div>
```

---

## 스타일 정의

```css
.rhythm-tap {
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

.combo {
  font-size: 28px;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  animation: comboPulse 0.5s ease-in-out;
}

@keyframes comboPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.target-circle {
  font-size: 100px;
  opacity: 0.5;
  animation: targetPulse 1.5s ease-in-out infinite;
}

@keyframes targetPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.6; }
}
```

---

## 테스트 체크리스트

- [ ] 노트가 일정 간격으로 생성되는가?
- [ ] 노트가 부드럽게 하강하는가?
- [ ] Perfect/Good/Miss 판정이 정확한가?
- [ ] 탭 타이밍이 자연스럽게 느껴지는가?
- [ ] 콤보 카운트가 올바르게 동작하는가?
- [ ] Miss 시 콤보가 초기화되는가?
- [ ] 노트가 화면 밖으로 나가면 Miss 처리되는가?
- [ ] 히트된 노트의 페이드아웃 효과가 자연스러운가?
- [ ] 난이도별 속도/간격 차이가 체감되는가?
- [ ] 진동 피드백이 올바르게 동작하는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 노트가 느리게 내려와 여유롭게 타이밍 맞춤
- **Lv.3-4**: 적당한 속도로 집중력 필요
- **Lv.5-6**: 빠른 노트와 짧은 간격으로 빠른 반응속도 필수

---

## 개선 아이디어 (TODO)

- [ ] 콤보 보너스 점수 (10콤보마다 추가 점수)
- [ ] 롱 노트 (길게 누르기)
- [ ] 다중 레인 (좌/우 노트)
- [ ] 배경 음악과 노트 동기화
- [ ] 노트 스킨 커스터마이징

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `RhythmTap.vue`
