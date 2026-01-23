# Mission 01: 풍선 터트리기 (Balloon Pop)

## 게임 정보
- **ID**: 1
- **이름**: 풍선 터트리기
- **카테고리**: 액션/반사신경
- **난이도**: ⭐ (쉬움)

## 게임 설명
화면에 떠오르는 풍선들을 터트리는 게임입니다. 풍선을 탭하면 터지며 점수를 획득합니다.

## 조작 방법
- **입력**: 탭 👆
- **액션**: 풍선을 터트림

## 시작 전 지시문
```
탭! 👆
```

## 게임 규칙
1. 화면 하단에서 풍선들이 천천히 위로 떠오름
2. 풍선을 탭하면 터지며 점수 획득
3. 화면 상단을 벗어나면 풍선 사라짐 (점수 없음)
4. 제한시간 내에 목표 점수 달성

## 점수 시스템
- **타입**: 성공 횟수 기반
- **점수 계산**: `성공횟수 × 10점`
- **기본 목표 점수**: 60점 (6개 터트리기)

### 난이도별 목표 점수
| 난이도 | 목표 점수 | 필요 풍선 수 |
|--------|----------|-------------|
| Lv.1 | 60점 | 6개 |
| Lv.2 | 72점 | 7-8개 |
| Lv.3 | 90점 | 9개 |
| Lv.4 | 108점 | 10-11개 |
| Lv.5 | 132점 | 13-14개 |
| Lv.6 | 150점 | 15개 |

## 제한 시간
- **기본**: 10초
- **난이도 조정**:
  - Lv.1-2: 10초
  - Lv.3-4: 9초
  - Lv.5-6: 8초

## 난이도별 변화
| 난이도 | 풍선 속도 | 풍선 크기 | 생성 빈도 |
|--------|----------|----------|----------|
| Lv.1 | 느림 (50px/s) | 큼 (80px) | 1초당 1개 |
| Lv.2 | 느림 (60px/s) | 큼 (75px) | 0.8초당 1개 |
| Lv.3 | 보통 (70px/s) | 보통 (70px) | 0.7초당 1개 |
| Lv.4 | 빠름 (85px/s) | 보통 (65px) | 0.6초당 1개 |
| Lv.5 | 빠름 (100px/s) | 작음 (60px) | 0.5초당 1개 |
| Lv.6 | 매우 빠름 (120px/s) | 작음 (55px) | 0.4초당 1개 |

## 하드 모드
- 풍선이 좌우로 흔들림 (진자운동)
- 풍선 크기 10% 감소
- 속도 20% 증가

## 비주얼 구현 (Canvas + Emoji)

### 풍선 표현
```javascript
// Canvas로 원 그리기 + 이모지
풍선 색상: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
풍선 이모지: 🎈

// 터질 때 효과
파티클: 작은 원들이 사방으로 퍼짐
이모지 변화: 🎈 → 💥
```

### 화면 레이아웃
```
┌─────────────────────────────┐
│  점수: 40 / 60    ⏱️ 6.5초   │
├─────────────────────────────┤
│                             │
│         🎈                  │
│                   🎈        │
│                             │
│     🎈                      │
│                       🎈    │
│   🎈           🎈           │
│                             │
└─────────────────────────────┘
```

## 구현 로직

### 풍선 객체
```typescript
interface Balloon {
  id: number;
  x: number;          // X 위치
  y: number;          // Y 위치
  radius: number;     // 반지름
  color: string;      // 색상
  speed: number;      // 상승 속도
  swingOffset?: number; // 흔들림 오프셋 (하드모드)
  swingSpeed?: number;  // 흔들림 속도 (하드모드)
}
```

### 게임 로직
```typescript
// 풍선 생성
function spawnBalloon() {
  const balloon: Balloon = {
    id: Date.now(),
    x: randomInt(50, canvasWidth - 50),
    y: canvasHeight + 50,
    radius: getBalloonSize(difficulty),
    color: randomChoice(colors),
    speed: getBalloonSpeed(difficulty)
  };
  
  if (isHardMode) {
    balloon.swingOffset = 0;
    balloon.swingSpeed = randomFloat(0.05, 0.1);
  }
  
  balloons.push(balloon);
}

// 풍선 업데이트
function updateBalloons() {
  balloons.forEach(balloon => {
    balloon.y -= balloon.speed;
    
    if (isHardMode) {
      balloon.swingOffset! += balloon.swingSpeed!;
      balloon.x += Math.sin(balloon.swingOffset!) * 2;
    }
    
    // 화면 밖으로 나가면 제거
    if (balloon.y < -balloon.radius) {
      removeBalloon(balloon.id);
    }
  });
}

// 풍선 터트리기
function handleTap(x: number, y: number) {
  const tappedBalloon = balloons.find(b => {
    const distance = Math.sqrt((b.x - x) ** 2 + (b.y - y) ** 2);
    return distance <= b.radius;
  });
  
  if (tappedBalloon) {
    popBalloon(tappedBalloon);
    score += 10;
    playSound('pop');
    vibrateSuccess();
  }
}

// 풍선 터지는 효과
function popBalloon(balloon: Balloon) {
  // 파티클 효과 생성
  createParticles(balloon.x, balloon.y, balloon.color);
  
  // 풍선 제거
  removeBalloon(balloon.id);
}
```

### 렌더링
```typescript
function render() {
  clear();
  
  // 배경 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 풍선 그리기
  balloons.forEach(balloon => {
    // 풍선 원
    drawCircle(balloon.x, balloon.y, balloon.radius, balloon.color);
    
    // 풍선 하이라이트
    drawCircle(
      balloon.x - balloon.radius * 0.3,
      balloon.y - balloon.radius * 0.3,
      balloon.radius * 0.3,
      'rgba(255, 255, 255, 0.6)'
    );
    
    // 풍선 끈
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(balloon.x, balloon.y + balloon.radius);
    ctx.lineTo(balloon.x, balloon.y + balloon.radius + 20);
    ctx.stroke();
  });
  
  // 파티클 효과 렌더링
  renderParticles();
}
```

## 사운드 효과
- **풍선 터질 때**: 짧은 "팡!" 소리
- **목표 달성**: 경쾌한 "딩동!" 소리

## 진동 효과
- **풍선 터질 때**: 짧은 진동 (50ms)
- **3개 연속 터트릴 때**: 강한 진동 (100ms)

## 난이도 밸런싱 팁
- Lv.1-2: 여유롭게 터트릴 수 있도록
- Lv.3-4: 약간의 집중력 필요
- Lv.5-6: 빠른 반응속도 필요, 놓치는 풍선 발생 가능

## 테스트 체크리스트
- [ ] 풍선이 자연스럽게 떠오르는가?
- [ ] 탭 인식이 정확한가?
- [ ] 풍선 터지는 효과가 만족스러운가?
- [ ] 하드모드에서 흔들림이 적절한가?
- [ ] 난이도별 속도 차이가 체감되는가?
- [ ] 목표 점수가 적절한가?

## 개선 아이디어 (TODO)
- 콤보 시스템 (연속으로 터트리면 보너스)
- 특수 풍선 (2배 점수, 시간 추가 등)
- 터지면 안되는 폭탄 풍선
