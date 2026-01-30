# Mission 23: 별 수집 (Star Gather)

> 이 문서는 미니게임의 기획 및 구현 명세입니다. 모든 미니게임은 동일한 디자인 시스템을 따릅니다.

---

## 게임 정보

| 항목 | 내용 |
|------|------|
| **ID** | 23 |
| **이름 (한글)** | 별 수집 |
| **이름 (영문)** | Star Gather |
| **카테고리** | 액션/수집 |
| **조작 방식** | 드래그 ✏️ |
| **기본 제한시간** | 15초 |
| **기본 목표점수** | 60점 |
| **구현 파일** | `src/components/minigames/StarGather.vue` |

---

## 게임 설명

우주선(🚀)을 드래그하여 화면에 나타나는 별(⭐)과 황금별(🌟)을 수집하는 게임입니다. 드래그한 방향으로 우주선이 부드럽게 이동하며, 별에 닿으면 자동으로 수집됩니다. 모든 별을 수집하면 새로운 별이 생성됩니다.

---

## 시작 전 지시문

```
별을 모아요! ⭐
```

**지시문 이모지**: ⭐🌟🚀 (별/우주선)

---

## 게임 규칙

1. 화면에 별들이 랜덤하게 배치됨
   - ⭐ **일반 별**: 10점
   - 🌟 **황금별**: 20점 (15% 확률)
2. 터치/드래그하여 우주선(🚀)을 이동
3. 우주선이 별에 닿으면 자동 수집
4. 모든 별 수집 시 새로운 별 그룹 생성
5. 제한시간 내에 목표 점수 달성 시 성공

---

## 점수 시스템

### 점수 계산 방식
- **타입**: 수집 기반

### 별별 점수

| 아이템 | 이모지 | 점수 | 출현 확률 |
|--------|--------|------|----------|
| 일반 별 | ⭐ | 10점 | 85% |
| 황금별 | 🌟 | 20점 | 15% |

### 결과 데이터
- `score`: 총 점수
- `count`: 수집한 별 개수
- `timeRemaining`: 남은 시간

### 난이도별 목표 점수

| 난이도 | 목표 점수 | 배율 | 설명 |
|--------|----------|------|------|
| Lv.1 | 60점 | ×1.0 | 6개 수집 |
| Lv.2 | 72점 | ×1.2 | 7~8개 수집 |
| Lv.3 | 90점 | ×1.5 | 9개 수집 |
| Lv.4 | 108점 | ×1.8 | 10~11개 수집 |
| Lv.5 | 132점 | ×2.2 | 13~14개 수집 |
| Lv.6 | 150점 | ×2.5 | 15개+ 수집 |

---

## 제한 시간

- **기본**: 15초
- **난이도별 조정**: 동일 (15초)

---

## 난이도별 변화

| 난이도 | 별 개수 | 이동 속도 | 플레이어 크기 |
|--------|--------|----------|-------------|
| Lv.1 | 5개 | 8 | 25px |
| Lv.2 | 6개 | 9 | 24px |
| Lv.3 | 7개 | 10 | 23px |
| Lv.4 | 8개 | 11 | 22px |
| Lv.5 | 9개 | 12 | 21px |
| Lv.6 | 10개 | 13 | 20px |

### 난이도 설정 로직
```typescript
const difficultySettings = computed(() => {
  const settings = [
    { starCount: 5, moveSpeed: 8, playerSize: 25 },    // Lv.1
    { starCount: 6, moveSpeed: 9, playerSize: 24 },    // Lv.2
    { starCount: 7, moveSpeed: 10, playerSize: 23 },   // Lv.3
    { starCount: 8, moveSpeed: 11, playerSize: 22 },   // Lv.4
    { starCount: 9, moveSpeed: 12, playerSize: 21 },   // Lv.5
    { starCount: 10, moveSpeed: 13, playerSize: 20 },  // Lv.6
  ];
  return settings[Math.min(props.difficulty - 1, 5)];
});
```

---

## 하드 모드 🔥

- 더 많은 별
- 빠른 이동 요구
- 시간 제한 감소
- 성공 시 보너스 점수 부여

---

## 비주얼 구현

### 디자인 시스템 준수 사항
> 모든 미니게임은 동일한 디자인 시스템을 따릅니다.
> - Canvas 기반 렌더링
> - 우주 테마 배경
> - 이모지 캐릭터
> - 파티클 효과

### 화면 레이아웃
```
┌─────────────────────────────────────┐
│ ⭐ 75        남은 별: 3             │
│ 수집: 8개                           │
├─────────────────────────────────────┤
│     ★         ★              ★     │
│            ⭐                       │
│  ★              🌟     ★           │
│                          ⭐         │
│         🚀                    ★     │ ← 플레이어 드래그
│    ★                                │
│              ⭐       ★             │
│                                     │
│    터치하여 별을 모으세요!           │
└─────────────────────────────────────┘
```

### 색상 팔레트
```css
/* 배경 (우주) */
backgroundGradient: 'radialGradient(#1a1a3e, #0f0c29)'

/* 배경 별 */
bgStarColor: 'rgba(255, 255, 255, 0.3)'

/* 일반 별 */
normalStarGlow: '#FFFFFF'
normalStarShadow: 15

/* 황금별 */
goldenStarGlow: '#FFD700'
goldenStarShadow: 20

/* 플레이어 */
playerTrailColor: 'rgba(100, 149, 237, 0.3)'

/* UI */
scoreColor: '#FFD700'
textColor: '#AAA'
```

---

## 구현 로직

### 별 인터페이스
```typescript
interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  scale: number;
  pulsePhase: number;
  type: 'normal' | 'golden';
  points: number;
}
```

### 게임 상태
```typescript
const score = ref(0);
const timeRemaining = ref(props.timeLimit);
const isGameOver = ref(false);
const player = ref({
  x: width / 2,
  y: height / 2,
  radius: 20,
  targetX: width / 2,
  targetY: height / 2
});
const stars = ref<Star[]>([]);
const particles = ref<Particle[]>([]);
const starCount = ref(0);
const isDragging = ref(false);
```

### 별 스폰
```typescript
function spawnStars() {
  const settings = difficultySettings.value;
  const newStars: Star[] = [];

  for (let i = 0; i < settings.starCount; i++) {
    const isGolden = Math.random() < 0.15; // 15% 황금별

    newStars.push({
      id: starIdCounter++,
      x: Math.random() * (width - 80) + 40,
      y: Math.random() * (height - 150) + 50,
      radius: isGolden ? 25 : 20,
      collected: false,
      scale: 0,
      pulsePhase: Math.random() * Math.PI * 2,
      type: isGolden ? 'golden' : 'normal',
      points: isGolden ? 20 : 10
    });
  }

  stars.value = newStars;

  // 별 등장 애니메이션
  newStars.forEach((star, i) => {
    safeSetTimeout(() => {
      star.scale = 1;
    }, i * 50);
  });
}
```

### 플레이어 이동 (부드러운 추적)
```typescript
function update() {
  if (isGameOver.value) return;

  const p = player.value;
  const settings = difficultySettings.value;

  // 목표 위치로 부드럽게 이동
  const dx = p.targetX - p.x;
  const dy = p.targetY - p.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 1) {
    const speed = Math.min(settings.moveSpeed, distance);
    p.x += (dx / distance) * speed;
    p.y += (dy / distance) * speed;
  }

  // 별 충돌 체크
  stars.value.forEach(star => {
    if (star.collected) return;

    // 펄스 애니메이션
    star.pulsePhase += 0.1;

    // 충돌 체크
    if (circlesIntersect(p.x, p.y, p.radius, star.x, star.y, star.radius * star.scale)) {
      star.collected = true;
      score.value += star.points;
      starCount.value++;

      // 파티클 생성
      if (helper.value) {
        const color = star.type === 'golden' ? '#FFD700' : '#FFF';
        const collectParticles = helper.value.createParticles(star.x, star.y, color, 10);
        particles.value.push(...collectParticles);
      }
    }
  });

  // 모든 별 수집 시 새로운 별 생성
  const remainingStars = stars.value.filter(s => !s.collected).length;
  if (remainingStars === 0) {
    safeSetTimeout(spawnStars, 300);
  }
}
```

### 터치/드래그 핸들러
```typescript
function handleTouchStart(event: TouchEvent) {
  event.preventDefault();
  isDragging.value = true;
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  setPlayerTarget(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const touch = event.touches[0];
  if (!touch) return;
  const coords = getCanvasCoordinates(touch);
  setPlayerTarget(coords.x, coords.y);
}

function setPlayerTarget(x: number, y: number) {
  // 화면 경계 제한
  player.value.targetX = Math.max(player.value.radius, Math.min(width - player.value.radius, x));
  player.value.targetY = Math.max(player.value.radius, Math.min(height - player.value.radius, y));
}
```

---

## 렌더링

### 우주 배경
```typescript
function render() {
  // 배경 그라데이션
  const gradient = ctx.value.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, height
  );
  gradient.addColorStop(0, '#1a1a3e');
  gradient.addColorStop(1, '#0f0c29');
  ctx.value.fillStyle = gradient;
  ctx.value.fillRect(0, 0, width, height);

  // 배경 별
  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 50; i++) {
    const starX = (i * 137 + 50) % width;
    const starY = (i * 89 + 30) % height;
    const starSize = 0.5 + (i % 3) * 0.5;
    ctx.value.beginPath();
    ctx.value.arc(starX, starY, starSize, 0, Math.PI * 2);
    ctx.value.fill();
  }
}
```

### 별 렌더링
```typescript
stars.value.forEach(star => {
  if (star.collected || star.scale <= 0) return;

  const pulseScale = 1 + Math.sin(star.pulsePhase) * 0.1; // 펄스 효과
  const actualSize = star.radius * star.scale * pulseScale;

  ctx.value.save();
  ctx.value.translate(star.x, star.y);

  // 글로우 효과
  if (star.type === 'golden') {
    ctx.value.shadowColor = '#FFD700';
    ctx.value.shadowBlur = 20;
  } else {
    ctx.value.shadowColor = '#FFFFFF';
    ctx.value.shadowBlur = 15;
  }

  // 이모지 그리기
  ctx.value.font = `${actualSize * 2}px Arial`;
  ctx.value.textAlign = 'center';
  ctx.value.textBaseline = 'middle';
  ctx.value.fillText(star.type === 'golden' ? '🌟' : '⭐', 0, 0);

  ctx.value.restore();
});
```

### 플레이어 렌더링
```typescript
const p = player.value;

// 트레일 효과
ctx.value.fillStyle = 'rgba(100, 149, 237, 0.3)';
ctx.value.beginPath();
ctx.value.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2);
ctx.value.fill();

// 플레이어 우주선
ctx.value.font = `${p.radius * 2.5}px Arial`;
ctx.value.textAlign = 'center';
ctx.value.textBaseline = 'middle';
ctx.value.fillText('🚀', p.x, p.y);
```

---

## 사운드 효과

| 이벤트 | 효과음 | 설명 |
|--------|--------|------|
| 일반 별 수집 | "반짝" | 가벼운 수집음 |
| 황금별 수집 | "팡" | 특별 수집음 |
| 새 별 생성 | "슝" | 별 등장 |

---

## 진동 효과

| 이벤트 | 패턴 | 설명 |
|--------|------|------|
| 별 수집 | `20ms` | 짧은 터치 |
| 황금별 수집 | `[30, 20, 30]ms` | 특별 수집 |

---

## 테스트 체크리스트

- [ ] 별이 랜덤 위치에 생성되는가?
- [ ] 황금별이 15% 확률로 생성되는가?
- [ ] 드래그로 우주선이 이동하는가?
- [ ] 우주선이 목표 위치로 부드럽게 이동하는가?
- [ ] 우주선이 화면 밖으로 나가지 않는가?
- [ ] 별 충돌 시 점수가 정확히 추가되는가?
- [ ] 파티클 효과가 표시되는가?
- [ ] 모든 별 수집 시 새로운 별이 생성되는가?
- [ ] 터치/마우스 모두 지원되는가?
- [ ] 시간 초과 시 게임이 완료되는가?

---

## 난이도 밸런싱 팁

- **Lv.1-2**: 적은 별, 느린 요구 속도
- **Lv.3-4**: 중간 별 개수
- **Lv.5-6**: 많은 별, 빠른 수집 필요

---

## 플레이 전략

- **효율적 경로**: 가까운 별부터 순서대로 수집
- **황금별 우선**: 20점짜리 황금별 먼저 수집
- **연속 이동**: 손을 떼지 않고 계속 드래그
- **패턴 파악**: 별 생성 후 빠르게 경로 계획

---

## 개선 아이디어 (TODO)

- [ ] 장애물 추가 (유성, 블랙홀)
- [ ] 스피드 부스트 아이템
- [ ] 자석 아이템 (주변 별 흡수)
- [ ] 콤보 시스템
- [ ] 별자리 보너스

---

**문서 버전**: 1.0
**최종 수정**: 2026-01-30
**참고 자료**: `MISSIONS_SUMMARY.md`, `StarGather.vue`
