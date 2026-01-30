# Mission 29: 균형 잡기 (Balance It)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 29 |
| **이름 (한글)** | 균형 잡기 |
| **이름 (영문)** | Balance It |
| **카테고리** | 그리기/조작 |
| **조작 방식** | 기울이기/드래그 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/BalanceIt.vue` |

---

## 게임 설명

화면의 **시소** 위에 올려진 상자들의 **균형을 유지**하는 게임입니다. 터치/드래그로 시소의 기울기를 조절하여 균형 상태(±5° 이내)를 유지합니다. 균형을 유지한 시간에 따라 점수가 누적되며, 시소가 너무 기울어지면(±25° 초과) 게임 오버됩니다.

---

## 시작 전 지시문

```
균형을 잡아요! ⚖️
```

**지시문 이모지**: ⚖️🎯 (저울/균형)

---

## 게임 규칙

1. 시소 위에 여러 개의 상자가 배치됨
   - 상자 개수: 2 + difficulty (난이도에 따라 증가)
   - 상자 위치/무게: 랜덤
2. 터치/마우스 이동으로 시소 각도 조절
3. 균형 상태 (±5° 이내) 유지 시 시간 누적
4. 균형 시간 × 10 = 점수
5. 시소 각도 > ±25° → 게임 오버
6. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 시간 기반 (균형 유지 시간)

### 점수 공식
```typescript
// 균형 상태일 때만 시간 누적
if (Math.abs(seesawAngle) < balanceThreshold) {
  const now = Date.now();
  const deltaTime = (now - lastBalanceTime) / 1000;
  if (lastBalanceTime > 0) {
    balanceTime.value += deltaTime;
  }
  lastBalanceTime = now;
} else {
  lastBalanceTime = 0;
}

// 최종 점수 = 균형 시간 × 10
const finalScore = Math.floor(balanceTime.value * 10);
```

### 목표 달성 조건
```typescript
// 목표 시간 = 목표 점수 / 10
if (balanceTime.value >= props.targetScore / 10) {
  completeGame();
}
```

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 필요 균형 시간 | 상자 개수 |
|--------|----------|--------------|----------|
| Lv.1 | 60점 | 6초 | 3개 |
| Lv.2 | 72점 | 7.2초 | 4개 |
| Lv.3 | 90점 | 9초 | 5개 |
| Lv.4 | 108점 | 10.8초 | 6개 |
| Lv.5 | 132점 | 13.2초 | 7개 |
| Lv.6 | 150점 | 15초 | 8개 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 상자 개수 | 토크 복잡도 | 설명 |
|--------|----------|------------|------|
| Lv.1 | 3개 | 낮음 | 적은 상자, 쉬운 균형 |
| Lv.2 | 4개 | 낮음 | 약간 증가 |
| Lv.3 | 5개 | 중간 | 중간 난이도 |
| Lv.4 | 6개 | 중간 | 더 많은 상자 |
| Lv.5 | 7개 | 높음 | 복잡한 균형 |
| Lv.6 | 8개 | 높음 | 최고 난이도 |

### 난이도 설정 로직
```typescript
// 상자 개수
const count = 2 + props.difficulty;
```

---

## 물리 상수

```typescript
const maxAngle = 25;           // 최대 기울기 (게임 오버 조건)
const balanceThreshold = 5;    // 균형 범위 (±5°)

// 시소 상태
let seesawAngle = 0;           // 현재 각도 (-30 ~ 30)
let targetAngle = 0;           // 목표 각도
let mouseX = 400;              // 마우스/터치 X 좌표
```

---

## 상자 시스템

### 상자 인터페이스
```typescript
interface Box {
  x: number;       // 시소 위 상대 위치 (-300 ~ 300)
  size: number;    // 상자 크기 (30~50)
  weight: number;  // 무게 (size / 50)
}
```

### 상자 생성
```typescript
function generateBoxes() {
  boxes.value = [];
  const count = 2 + props.difficulty;

  for (let i = 0; i < count; i++) {
    const size = 30 + Math.random() * 20;  // 30~50px
    const weight = size / 50;              // 0.6~1.0
    const side = Math.random() < 0.5 ? -1 : 1;  // 왼쪽 또는 오른쪽
    const x = side * (100 + Math.random() * 200);  // ±100~300

    boxes.value.push({
      x,
      size,
      weight
    });
  }
}
```

### 토크 계산
```typescript
// 상자들의 총 토크
let totalTorque = 0;
for (const box of boxes.value) {
  totalTorque += box.x * box.weight;
}

// 마우스 위치에 따른 조정
const mouseOffset = (mouseX - width / 2) / 20;
targetAngle = totalTorque * 5 - mouseOffset;
targetAngle = Math.max(-maxAngle, Math.min(maxAngle, targetAngle));

// 시소 각도 부드럽게 변화
const diff = targetAngle - seesawAngle;
seesawAngle += diff * 0.1;
```

---

## 하드 모드 🔥

- 더 많은 상자
- 불균형한 초기 배치
- 움직이는 상자 (TODO)
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 하늘 그라데이션 배경
> - 물리 시뮬레이션
> - 실시간 상태 표시

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│                    균형 시간: 5초    │
├─────────────────────────────────────┤
│           각도: -3°                  │
│           균형! ⚖️                   │  ← 균형 상태 표시
│                                      │
│   📦                      📦         │  ← 상자들
│   ══════════●══════════              │  ← 시소 (회전)
│             ▲                        │  ← 받침대
│                                      │
│   ← 왼쪽으로!  또는  오른쪽으로! →   │  ← 조정 안내
│                                      │
│    터치하여 시소의 균형을 유지하세요!│
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (하늘) */
skyGradient: 'linear-gradient(#87CEEB, #E0F6FF)'

/* 균형 구역 */
balanceZoneColor: 'rgba(76, 175, 80, 0.1)'

/* 균형선 */
balancedLineColor: '#4CAF50'   // 균형 시
unbalancedLineColor: '#f44336' // 불균형 시
lineStyle: [10, 10]            // 점선

/* 시소 */
seesawColor: '#8B4513'         // 나무색
seesawBorder: '#654321'
seesawWidth: 400
seesawHeight: 20

/* 상자 */
boxColor: '#FFD700'
boxBorder: '#F9A825'
boxEmoji: '📦'

/* 받침대 */
pivotColor: '#2c3e50'
pivotBorder: '#1a1a1a'

/* 텍스트 */
textColor: 'white'
balancedTextColor: '#4CAF50'
unbalancedTextColor: '#f44336'
```

---

## 구현 로직

### 게임 상태
```typescript
const balanceTime = ref(0);

let gameCompleted = false;
let startTime = 0;

// 시소 상태
let seesawAngle = 0; // -30 ~ 30도
let targetAngle = 0;
let mouseX = 400; // width / 2 초기값

// 균형 체크용
const maxAngle = 25;
const balanceThreshold = 5; // 균형 범위
let lastBalanceTime = 0;

const boxes = ref<Box[]>([]);
```

### 마우스/터치 핸들러
```typescript
function handleMouseMove(event: MouseEvent) {
  if (gameCompleted) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  mouseX = (event.clientX - rect.left) * (width / rect.width);
}

function handleTouchMove(event: TouchEvent) {
  if (gameCompleted) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  if (!touch) return;
  mouseX = (touch.clientX - rect.left) * (width / rect.width);
}
```

### 물리 업데이트
```typescript
function update() {
  // 상자들의 토크 계산
  let totalTorque = 0;
  for (const box of boxes.value) {
    totalTorque += box.x * box.weight;
  }

  // 마우스 위치에 따른 조정
  const mouseOffset = (mouseX - width / 2) / 20;
  targetAngle = totalTorque * 5 - mouseOffset;
  targetAngle = Math.max(-maxAngle, Math.min(maxAngle, targetAngle));

  // 시소 각도 부드럽게 변화
  const diff = targetAngle - seesawAngle;
  seesawAngle += diff * 0.1;

  // 균형 체크
  if (Math.abs(seesawAngle) < balanceThreshold) {
    const now = Date.now();
    const deltaTime = (now - lastBalanceTime) / 1000;
    if (lastBalanceTime > 0) {
      balanceTime.value += deltaTime;

      // 목표 시간 달성
      if (balanceTime.value >= props.targetScore / 10) {
        completeGame();
      }
    }
    lastBalanceTime = now;

    // 진동 피드백 (가끔)
    if (Math.floor(balanceTime.value * 10) % 10 === 0 && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } else {
    lastBalanceTime = 0;
  }

  // 시소가 너무 기울면 게임 오버
  if (Math.abs(seesawAngle) > maxAngle) {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    completeGame();
  }
}
```

---

## 렌더링

### 배경 및 균형선
```typescript
// 배경
const gradient = c.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, '#87CEEB');
gradient.addColorStop(1, '#E0F6FF');
c.fillStyle = gradient;
c.fillRect(0, 0, width, height);

// 균형 구역 표시
c.fillStyle = 'rgba(76, 175, 80, 0.1)';
c.fillRect(0, centerY - 50, width, 100);

// 균형선
c.strokeStyle = Math.abs(seesawAngle) < balanceThreshold ? '#4CAF50' : '#f44336';
c.lineWidth = 4;
c.setLineDash([10, 10]);
c.beginPath();
c.moveTo(0, centerY);
c.lineTo(width, centerY);
c.stroke();
c.setLineDash([]);
```

### 시소 렌더링
```typescript
c.save();
c.translate(centerX, centerY);
c.rotate((seesawAngle * Math.PI) / 180);

// 시소 판자
const seesawWidth = 400;
const seesawHeight = 20;

c.fillStyle = '#8B4513';
c.fillRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

c.strokeStyle = '#654321';
c.lineWidth = 3;
c.strokeRect(-seesawWidth / 2, -seesawHeight / 2, seesawWidth, seesawHeight);

// 상자들
for (const box of boxes.value) {
  const boxY = -seesawHeight / 2 - box.size;

  c.fillStyle = '#FFD700';
  c.fillRect(box.x - box.size / 2, boxY, box.size, box.size);

  c.strokeStyle = '#F9A825';
  c.lineWidth = 2;
  c.strokeRect(box.x - box.size / 2, boxY, box.size, box.size);

  // 무게 표시
  c.fillStyle = '#2c3e50';
  c.font = 'bold 16px Arial';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('📦', box.x, boxY + box.size / 2);
}

c.restore();
```

### 받침대
```typescript
// 받침대 (삼각형)
c.fillStyle = '#2c3e50';
c.beginPath();
c.moveTo(centerX, centerY);
c.lineTo(centerX - 30, centerY + 50);
c.lineTo(centerX + 30, centerY + 50);
c.closePath();
c.fill();

c.strokeStyle = '#1a1a1a';
c.lineWidth = 3;
c.stroke();
```

### 상태 텍스트
```typescript
// 각도 표시
c.fillStyle = 'white';
c.font = 'bold 24px Arial';
c.textAlign = 'center';
c.fillText(`각도: ${Math.round(seesawAngle)}°`, centerX, 80);

// 균형 상태 표시
if (Math.abs(seesawAngle) < balanceThreshold) {
  c.fillStyle = '#4CAF50';
  c.font = 'bold 32px Arial';
  c.fillText('균형! ⚖️', centerX, 130);
} else {
  c.fillStyle = '#f44336';
  c.font = 'bold 28px Arial';
  c.fillText(seesawAngle < 0 ? '← 왼쪽으로!' : '오른쪽으로! →', centerX, 130);
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 균형 유지 | "틱" | 1초마다 피드백 |
| 불균형 | "삐삐" | 경고음 |
| 게임 오버 | "쿵!" | 시소 넘어짐 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 균형 유지 | `10ms` | 매초 미세 피드백 |
| 게임 오버 | `[100, 50, 100]ms` | 실패 진동 |

---

## 테스트 체크리스트

- [ ] 시소가 화면에 표시되는가?
- [ ] 상자들이 시소 위에 배치되는가?
- [ ] 터치/마우스로 시소 각도가 조절되는가?
- [ ] 균형 상태(±5°)에서 시간이 누적되는가?
- [ ] 균형 시간 × 10이 점수로 반영되는가?
- [ ] ±25° 초과 시 게임이 오버되는가?
- [ ] 균형 상태 텍스트가 올바르게 표시되는가?
- [ ] 난이도별 상자 개수가 적용되는가?
- [ ] 목표 시간 달성 시 게임이 완료되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 적은 상자, 균형 잡기 쉬움
- **Lv.3-4**: 중간 상자 개수, 토크 복잡
- **Lv.5-6**: 많은 상자, 정밀한 조작 필요

---

## 플레이 전략

- **중심 유지**: 마우스/터치를 화면 중앙 근처에 유지
- **미세 조정**: 작은 움직임으로 정밀 조절
- **토크 예측**: 상자 위치와 크기로 토크 예측
- **안정화**: 균형 잡힌 후 움직임 최소화

---

## 개선 아이디어 (TODO)

- [ ] 기기 기울기 센서 지원
- [ ] 움직이는 상자
- [ ] 상자 떨어지기 (실패 조건 추가)
- [ ] 바람 효과 (외력)
- [ ] 보너스 아이템 (균형 보조)

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `BalanceIt.vue`
