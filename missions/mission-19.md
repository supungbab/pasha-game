# Mission 19: 동전 모으기 (Coin Collector)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 19 |
| **이름 (한글)** | 동전 모으기 |
| **이름 (영문)** | Coin Collector |
| **카테고리** | 액션/수집 |
| **조작 방식** | 탭 👆 |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/CoinCollector.vue` |

---

## 게임 설명

하늘에서 떨어지는 **동전**과 **보석**을 탭하여 수집하는 게임입니다. 동전은 기본 점수를, 보석은 더 높은 점수를 제공합니다. 하지만 **폭탄**을 탭하면 점수가 감점되고 콤보가 초기화됩니다. 빠르게 연속으로 수집하면 콤보 보너스를 받을 수 있습니다.

---

## 시작 전 지시문

```
동전을 모아요! 🪙
```

**지시문 이모지**: 💰🪙💎 (동전/보석)

---

## 게임 규칙

1. 화면 상단에서 아이템들이 떨어짐
   - 🪙 **동전**: 5점
   - 💎 **보석**: 15점 (희귀)
   - 💣 **폭탄**: -20점 (감점)
2. 아이템을 탭하여 수집
3. **콤보 시스템**: 500ms 내 연속 수집 시 콤보 적용
   - 콤보 보너스: (콤보 - 1) × 2점 추가
4. 폭탄 수집 시 콤보 초기화
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 수집 + 콤보 보너스

### 아이템별 점수

| 아이템 | 이모지 | 기본 점수 | 색상 |
|--------|--------|----------|------|
| 동전 | 🪙 | 5점 | #FFD700 |
| 보석 | 💎 | 15점 | #00BFFF |
| 폭탄 | 💣 | -20점 | #FF4444 |

### 콤보 보너스
```typescript
const comboBonus = combo > 1 ? (combo - 1) * 2 : 0;
const points = basePoints + comboBonus;
```

### 콤보 예시
| 콤보 | 동전 수집 시 점수 | 보석 수집 시 점수 |
|------|-----------------|-----------------|
| 1 | 5점 | 15점 |
| 2 | 5 + 2 = 7점 | 15 + 2 = 17점 |
| 3 | 5 + 4 = 9점 | 15 + 4 = 19점 |
| 5 | 5 + 8 = 13점 | 15 + 8 = 23점 |

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 |
|--------|----------|------|
| Lv.1 | 60점 | ×1.0 |
| Lv.2 | 72점 | ×1.2 |
| Lv.3 | 90점 | ×1.5 |
| Lv.4 | 108점 | ×1.8 |
| Lv.5 | 132점 | ×2.2 |
| Lv.6 | 150점 | ×2.5 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 낙하 속도 | 스폰 간격 | 폭탄 확률 | 아이템 크기 |
|--------|----------|----------|----------|-----------|
| Lv.1 | 2.0 | 800ms | 15% | 45px |
| Lv.2 | 2.5 | 700ms | 18% | 42px |
| Lv.3 | 3.0 | 600ms | 20% | 40px |
| Lv.4 | 3.5 | 500ms | 22% | 38px |
| Lv.5 | 4.0 | 450ms | 25% | 35px |
| Lv.6 | 4.5 | 400ms | 28% | 32px |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { fallSpeed: 2, spawnRate: 800, bombChance: 0.15, itemSize: 45 },   // Lv.1
    { fallSpeed: 2.5, spawnRate: 700, bombChance: 0.18, itemSize: 42 }, // Lv.2
    { fallSpeed: 3, spawnRate: 600, bombChance: 0.20, itemSize: 40 },   // Lv.3
    { fallSpeed: 3.5, spawnRate: 500, bombChance: 0.22, itemSize: 38 }, // Lv.4
    { fallSpeed: 4, spawnRate: 450, bombChance: 0.25, itemSize: 35 },   // Lv.5
    { fallSpeed: 4.5, spawnRate: 400, bombChance: 0.28, itemSize: 32 }, // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});
```

---

## 하드 모드 🔥

- 폭탄 확률 증가
- 낙하 속도 증가
- 아이템 크기 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 밤하늘 테마 배경
> - 이모지 아이템
> - 파티클 효과

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ 🪙 75                               │
│ 수집: 12개                           │
├─────────────────────────────────────┤
│    ✨  🪙         💎    ★          │
│         ★                    ★     │
│  💣           🪙                   │
│        🪙                    💎    │
│              ★                     │
│    🪙              💣       🪙     │
│         💎                         │
│                   🪙               │
│                                     │
│    동전을 탭하세요! 💣폭탄 주의!     │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (밤하늘 그라데이션) */
backgroundGradient: 'linear-gradient(#0f0c29, #302b63, #24243e)'

/* 별 */
starColor: 'rgba(255, 255, 255, 0.5)'

/* 아이템 글로우 */
coinGlow: '#FFD700'
gemGlow: '#00BFFF'
bombColor: '#FF4444'

/* UI */
scoreColor: '#FFD700'
textColor: '#AAA'
```

---

## 구현 로직

### 아이템 타입 정의
```typescript
const ITEM_TYPES = {
  coin: { emoji: '🪙', points: 5, color: '#FFD700' },
  gem: { emoji: '💎', points: 15, color: '#00BFFF' },
  bomb: { emoji: '💣', points: -20, color: '#FF4444' }
};
```

### 아이템 인터페이스
```typescript
interface FallingItem {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  collected: boolean;
  type: 'coin' | 'gem' | 'bomb';
  points: number;
}
```

### 게임 상태
```typescript
const score = ref(0);
const combo = ref(0);
const lastCollectTime = ref(0);
const timeRemainingMs = ref(props.timeLimit * 1000);
const isGameOver = ref(false);
const coins = ref<FallingItem[]>([]);
const bombs = ref<FallingItem[]>([]);
const particles = ref<Particle[]>([]);
const coinCount = ref(0);
const bombHits = ref(0);

const COMBO_TIMEOUT = 500; // 500ms 콤보 유지 시간
```

### 아이템 스폰
```typescript
function spawnItem() {
  if (isGameOver.value) return;

  const settings = difficultySettings.value;
  const isBomb = Math.random() < settings.bombChance;
  const isGem = !isBomb && Math.random() < 0.15; // 15% 보석 확률

  const type = isBomb ? 'bomb' : (isGem ? 'gem' : 'coin');
  const itemInfo = ITEM_TYPES[type];

  const item: FallingItem = {
    id: itemIdCounter++,
    x: Math.random() * (width - 80) + 40,
    y: -40,
    size: settings.itemSize,
    speed: settings.fallSpeed * (0.8 + Math.random() * 0.4), // 속도 변동
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    collected: false,
    type,
    points: itemInfo.points
  };

  if (type === 'bomb') {
    bombs.value.push(item);
  } else {
    coins.value.push(item);
  }
}
```

### 터치 핸들러
```typescript
function handleTouch(event: TouchEvent) {
  if (isGameOver.value) return;
  event.preventDefault();

  // 멀티 터치 지원
  for (let i = 0; i < event.touches.length; i++) {
    const touch = event.touches[i];
    if (!touch) continue;
    const coords = getCanvasCoordinates(touch);
    checkItemHit(coords.x, coords.y, touch.clientX, touch.clientY);
  }
}
```

### 아이템 히트 체크
```typescript
function checkItemHit(x: number, y: number, screenX: number, screenY: number) {
  // 동전/보석 체크
  const coinIndex = coins.value.findIndex(coin => {
    if (coin.collected) return false;
    return pointInCircle(x, y, coin.x, coin.y, coin.size / 2 + 10);
  });

  if (coinIndex !== -1) {
    const coin = coins.value[coinIndex];
    const now = Date.now();

    // 콤보 체크
    if (now - lastCollectTime.value < COMBO_TIMEOUT) {
      combo.value++;
    } else {
      combo.value = 1;
    }
    lastCollectTime.value = now;

    // 콤보 보너스 적용
    const comboBonus = combo.value > 1 ? (combo.value - 1) * 2 : 0;
    const points = coin.points + comboBonus;

    coin.collected = true;
    score.value += points;
    coinCount.value++;

    // 파티클 & 피드백 효과
    createParticles(...);
    createScorePopup(screenX, screenY - 20, `+${points}`, 'score');

    // 진동 피드백
    if (navigator.vibrate) {
      if (coin.type === 'gem') {
        navigator.vibrate([30, 20, 30]);
      } else {
        navigator.vibrate(20);
      }
    }
    return;
  }

  // 폭탄 체크
  const bombIndex = bombs.value.findIndex(bomb => {
    if (bomb.collected) return false;
    return pointInCircle(x, y, bomb.x, bomb.y, bomb.size / 2 + 10);
  });

  if (bombIndex !== -1) {
    const bomb = bombs.value[bombIndex];

    bomb.collected = true;
    score.value = Math.max(0, score.value + bomb.points); // 최소 0점
    bombHits.value++;
    combo.value = 0; // 콤보 초기화

    // 폭발 파티클 & 피드백
    createParticles(...);
    createScorePopup(screenX, screenY - 20, `${bomb.points}`, 'miss');
    shake(containerRef.value, 'strong');

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }
}
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 동전 수집 | "찰칵" | 가벼운 수집음 |
| 보석 수집 | "반짝" | 반짝이는 소리 |
| 폭탄 터치 | "쿵!" | 폭발음 |
| 콤보 | "딩딩!" | 콤보 알림 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 동전 수집 | `20ms` | 짧은 터치 |
| 보석 수집 | `[30, 20, 30]ms` | 특별 수집 |
| 폭탄 터치 | `[100, 50, 100]ms` | 강한 경고 |

---

## 시각적 피드백

### 파티클 효과
```typescript
// 아이템 수집 시 색상별 파티클 생성
if (helper.value) {
  const color = ITEM_TYPES[coin.type].color;
  const newParticles = helper.value.createParticles(coin.x, coin.y, color, 10);
  particles.value.push(...newParticles);
}
```

### 점수 팝업
```typescript
// 콤보에 따른 팝업 스타일
if (coin.type === 'gem') {
  createScorePopup(screenX, screenY - 20, `+${points} 💎`, 'bonus');
} else if (combo.value >= 5) {
  createScorePopup(screenX, screenY - 20, `+${points} x${combo.value}!`, 'combo');
} else if (combo.value >= 3) {
  createScorePopup(screenX, screenY - 20, `+${points} COMBO!`, 'score');
} else {
  createScorePopup(screenX, screenY - 20, `+${points}`, 'score');
}
```

### 화면 흔들림
```typescript
// 보석 수집 시 가벼운 흔들림
shake(containerRef.value, 'light');

// 폭탄 터치 시 강한 흔들림
shake(containerRef.value, 'strong');
```

---

## 배경 렌더링

```typescript
function render() {
  // 밤하늘 그라데이션
  const gradient = ctx.value.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // 배경 별
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let i = 0; i < 30; i++) {
    const starX = (i * 137 + 50) % width;
    const starY = (i * 89 + 30) % (height - 100);
    const starSize = 1 + (i % 3);
    ctx.value.beginPath();
    ctx.value.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.value.fill();
  }

  // 보석 글로우 효과
  if (coin.type === 'gem') {
    ctx.value.shadowColor = '#00BFFF';
    ctx.value.shadowBlur = 20;
  }
}
```

---

## 테스트 체크리스트

- [ ] 동전이 일정 간격으로 스폰되는가?
- [ ] 보석이 15% 확률로 스폰되는가?
- [ ] 폭탄이 난이도별 확률로 스폰되는가?
- [ ] 동전/보석 탭 시 점수가 정확히 추가되는가?
- [ ] 폭탄 탭 시 20점이 감점되는가?
- [ ] 점수가 음수가 되지 않는가? (최소 0점)
- [ ] 콤보가 500ms 내 연속 수집 시 적용되는가?
- [ ] 폭탄 터치 시 콤보가 초기화되는가?
- [ ] 파티클 효과가 표시되는가?
- [ ] 점수 팝업이 올바르게 표시되는가?
- [ ] 멀티 터치가 지원되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 느린 속도, 큰 아이템으로 적응
- **Lv.3-4**: 빠른 속도, 더 많은 아이템
- **Lv.5-6**: 작은 아이템, 많은 폭탄으로 고난이도

---

## 전략 팁

- **폭탄 피하기**: 폭탄을 먼저 확인하고 피하기
- **보석 우선**: 15점짜리 보석 우선 수집
- **콤보 유지**: 빠르게 연속 수집하여 콤보 보너스 획득
- **중앙 집중**: 화면 중앙 근처에서 수집하면 효율적

---

## 개선 아이디어 (TODO)

- [ ] 슈퍼 동전 (황금 동전) 추가
- [ ] 자석 아이템 (주변 동전 자동 수집)
- [ ] 폭탄 슬로우 아이템
- [ ] 콤보 유지 시간 연장 아이템
- [ ] 더블 포인트 아이템

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `CoinCollector.vue`
