# 미니게임 디자인 점검 보고서

> 작성일: 2026-01-30
> 대상: `src/components/minigames/` (30개 파일)

---

## 점검 기준

| 항목 | 설명 |
|------|------|
| **컴포저블 사용** | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 등 공통 composable 활용 |
| **터치 접근성** | 터치 이벤트 처리, null 체크, 최소 터치 영역(44x44px) |
| **UI 일관성** | 공통 컴포넌트(`ScorePopup`, `Button` 등) 사용 |
| **타이머 정리** | `onUnmounted`에서 interval/animation 정리 |
| **타입 안전성** | TypeScript 타입 에러 없음, null 체크 |
| **진동/사운드** | 적절한 햅틱 피드백 |

---

## 점검 결과

### 1. BalanceIt.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | `useCanvas`, `useCleanupTimers` 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ⚠️ | `@touchmove.prevent` 있음, touch 객체 null 체크 없음 (line 93-94) |
| **UI 일관성** | ❌ | 점수 표시가 직접 스타일로 구현, 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` 호출 |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동 피드백** | ✅ | `navigator.vibrate` 사용 중 |

**개선 필요:**
- `useCanvas`, `useCleanupTimers` composable 사용 권장
- line 93: `event.touches[0]` null 체크 필요

---

### 2. BalloonPop.vue ✅ (9/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 사용 |
| **터치 접근성** | ✅ | `@touchstart.prevent`, touch null 체크 있음 (line 222-223) |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 자동 정리 |
| **난이도 설정** | ✅ | `difficultySettings` computed, nullish coalescing 사용 |
| **진동/사운드** | ✅ | 콤보에 따른 진동 패턴 |

**모범 사례** - 다른 미니게임의 참조 기준

---

### 3. CatchBall.vue ⚠️ (7/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ⚠️ | `useCanvas` 사용, 하지만 `useCleanupTimers` 미사용 |
| **터치 접근성** | ❌ | line 276, 285: `event.touches[0]` null 체크 없음 |
| **난이도 설정** | ❌ | line 68: `difficultySettings[undefined]` 가능 (타입 에러) |
| **타이머 정리** | ⚠️ | `window.setInterval` 직접 사용, `onUnmounted` 정리는 있음 |
| **공통 컴포넌트** | ❌ | 점수 표시를 Canvas 내부에 직접 렌더링 |
| **미사용 import** | ⚠️ | `circlesIntersect` import 되어 있지만 미사용 |

**개선 필요:**
- `useCleanupTimers` 사용으로 타이머 관리 개선
- line 276, 285: touch null 체크 추가
- line 68: 배열 접근 시 타입 안전성 확보
- 미사용 import 제거

---

### 4. CoinCollector.vue ✅ (8/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 모두 사용 |
| **터치 접근성** | ✅ | 멀티터치 지원, null 체크 있음 (line 266-267) |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 자동 정리 |
| **난이도 설정** | ⚠️ | line 70: 타입 안전성 이슈 (undefined 가능) |
| **진동/사운드** | ✅ | 콤보/폭탄에 따른 진동 패턴 분리 |

**잘 구현된 점:**
- 멀티터치 for loop 처리 (line 265-270)
- 폭탄/코인/젬 타입별 피드백 분리
- BalloonPop과 유사한 우수한 구조

**개선 필요:**
- line 70: `settings[index] ?? DEFAULT_SETTINGS` 패턴 적용 권장

---

### 5. ColorMatch.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ⚠️ | `useCanvas`만 사용, `useCleanupTimers`, `useJuicyFeedback` 미사용 |
| **터치 접근성** | ❌ | line 246: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용, Canvas 직접 렌더링 |
| **타이머 정리** | ⚠️ | `window.setInterval/setTimeout` 직접 사용 |
| **타입 안전성** | ❌ | line 84, 102, 106, 107: 타입 에러 다수 존재 |
| **진동/사운드** | ❌ | 진동 피드백 없음 |

**타입 에러 목록:**
```
line 84: COLORS[...] - undefined 가능
line 102: targetColor.value 할당 - null 타입 불일치
line 106: color 할당 - undefined 가능
line 107: targetColor.value.name - null 체크 필요
```

**개선 필요:**
- `useCleanupTimers` 사용
- touch null 체크 추가
- 타입 에러 수정
- 진동 피드백 추가

---

### 6. ColorWord.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음, 하지만 일반 `<button>` 태그 사용 |
| **UI 일관성** | ❌ | `Button` 컴포넌트 미사용, 일반 button 태그 |
| **타이머 정리** | ⚠️ | `window.setTimeout` 직접 사용, `onUnmounted` 정리는 있음 |
| **타입 안전성** | ⚠️ | line 99-100: `colorOptions[index]` undefined 가능 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 게임 (의도적) |

**특이사항:**
- Canvas 대신 HTML/CSS로 구현된 유일한 게임 중 하나
- 스트룹 효과(Stroop Effect) 게임이라 텍스트 기반이 적합

**개선 필요:**
- 일반 `<button>`을 `Button` 컴포넌트로 교체 (터치 피드백 통일)
- `useCleanupTimers` 사용
- 배열 접근 시 타입 안전성 확보

---

### 7. DodgeIt.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ⚠️ | `useCanvas`만 사용, `useCleanupTimers`, `useJuicyFeedback` 미사용 |
| **터치 접근성** | ❌ | line 253, 261: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용, Canvas 직접 렌더링 |
| **타이머 정리** | ⚠️ | `window.setInterval` 직접 사용, `onUnmounted` 정리는 있음 |
| **난이도 설정** | ⚠️ | line 55: 타입 안전성 이슈 |
| **진동/사운드** | ❌ | 진동 피드백 없음 |

**잘된 점:**
- `circlesIntersect` 유틸 함수 실제 사용 (충돌 감지)

**개선 필요:**
- `useCleanupTimers`, `useJuicyFeedback` 사용
- touch null 체크 추가
- 충돌/생존 시 진동 피드백 추가

---

### 8. DrawLine.vue ✅ (8/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 모두 사용 |
| **터치 접근성** | ⚠️ | line 359, 367: touch null 체크 없음 |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 자동 정리 |
| **타입 안전성** | ⚠️ | line 134: `path[i]` undefined 가능, line 172-173 동일 |
| **진동/사운드** | ✅ | 정확도에 따른 진동 패턴 분리 |

**잘 구현된 점:**
- 복잡한 도형 생성 시스템 (simple/medium/complex)
- 정확도 계산 알고리즘
- 라운드별 피드백 시스템

**개선 필요:**
- touch null 체크 추가
- 배열 접근 타입 안전성

---

### 9. FindPair.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음, 하지만 일반 div 사용 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ⚠️ | `window.setTimeout` 직접 사용, `onUnmounted` 정리는 있음 |
| **타입 안전성** | ⚠️ | line 121: destructure 시 undefined 가능 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 게임 (카드 뒤집기 애니메이션) |
| **진동/사운드** | ✅ | 매칭 성공/실패에 따른 진동 패턴 |

**특이사항:**
- 카드 매칭 게임이라 CSS 3D transform 활용 (적합한 선택)
- 뒤집기 애니메이션 잘 구현됨

**개선 필요:**
- `useCleanupTimers` 사용
- line 121: `flippedCards.value[0]`, `[1]` null 체크 추가
- `useJuicyFeedback`의 `shake` 활용 권장

---

### 10. FruitSlice.vue ✅ (9/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 모두 사용 |
| **터치 접근성** | ⚠️ | line 440, 449: touch null 체크 없음 |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 자동 정리 |
| **난이도 설정** | ⚠️ | line 94: 타입 안전성 이슈 |
| **진동/사운드** | ✅ | 콤보/폭탄에 따른 다양한 진동 패턴 |

**모범 사례에 가까움:**
- 스와이프 기반 과일 자르기 게임
- 폭탄 시스템 (BOMB) 구현
- 잘린 과일 조각 애니메이션 (SlicedFruit)
- 스와이프 궤적(sliceTrail) 시각 효과

**개선 필요:**
- touch null 체크 추가 (minor)

---

### 11. HiddenObject.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음, 일반 div 사용 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ⚠️ | `window.setTimeout` 직접 사용, `onUnmounted` 정리는 있음 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 그리드 게임 |
| **진동/사운드** | ✅ | 정답/오답에 따른 진동 패턴 |

**잘된 점:**
- 틀린 이모지 흔들기 CSS 애니메이션
- 동적 그리드 크기 계산

**개선 필요:**
- `useCleanupTimers` 사용
- `useJuicyFeedback`의 `shake` 활용 권장

---

### 12. JumpUp.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | 점프/착지 진동 피드백 |

**잘된 점:**
- 플랫폼 점프 물리 엔진 구현
- 카메라 스크롤 시스템
- 구름 장식 배경

**개선 필요:**
- `useCanvas`, `useCleanupTimers` composable 사용
- 하드코딩된 캔버스 크기 제거

---

### 13. LadderClimb.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ⚠️ | 일반 `<button>` 태그 사용 (Button 컴포넌트 미사용) |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | 등반 성공/실패 진동 피드백 |

**잘된 점:**
- 좌우 번갈아 탭하는 독특한 게임 메커니즘
- 같은 버튼 연속 누르기 방지 로직

**개선 필요:**
- `useCanvas`, `useCleanupTimers` composable 사용
- 일반 `<button>`을 `Button` 컴포넌트로 교체

---

### 14. MazeEscape.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ✅ | touch null 체크 있음 (line 261), 고급 터치 상태 관리 |
| **UI 일관성** | ❌ | 일반 `<button>` 태그 사용 |
| **타이머 정리** | ⚠️ | `onUnmounted`가 `onMounted` 내부에 있음 (비정상 패턴) |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | 이동/벽충돌/탈출에 따른 진동 패턴 |

**잘된 점:**
- 재귀적 백트래킹 미로 생성 알고리즘
- 키보드 지원 (WASD, 화살표)
- 고급 터치 상태 관리 (touchId, isInside 추적)

**개선 필요:**
- `useCanvas`, `useCleanupTimers` composable 사용
- `onUnmounted`를 `onMounted` 외부로 이동
- 일반 `<button>`을 `Button` 컴포넌트로 교체

---

### 15. MemorySequence.vue ✅ (8/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCleanupTimers`, `useJuicyFeedback` 사용 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음, 일반 div 사용 |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 자동 정리 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 게임 (타일 그리드) - 적합한 선택 |
| **진동/사운드** | ✅ | 정답/오답/라운드 클리어에 따른 진동 패턴 |

**잘 구현된 점:**
- 사이먼 게임 스타일 메모리 게임
- `async/await`로 시퀀스 표시 구현
- 라운드 진행 시스템
- 다양한 상태별 피드백 (watching, playing, waiting)

**개선 필요:**
- handleTileClick에서 event 타입이 MouseEvent이나 실제로는 TouchEvent가 전달될 수 있음 (line 155)

---

### 16. NumberMatch.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ⚠️ | `useCanvas`만 사용, `useCleanupTimers`, `useJuicyFeedback` 미사용 |
| **터치 접근성** | ❌ | line 241: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용, Canvas 직접 렌더링 |
| **타이머 정리** | ⚠️ | `window.setInterval` 직접 사용, `onUnmounted` 정리는 있음 |
| **난이도 설정** | ⚠️ | 타입 안전성 이슈 가능 |
| **진동/사운드** | ✅ | 정답/오답 진동 피드백 |

**잘된 점:**
- 숫자 매칭 게임 로직 구현
- 난이도별 숫자 범위 조정

**개선 필요:**
- `useCleanupTimers` 사용
- touch null 체크 추가

---

### 17. PatternCopy.vue ⚠️ (6/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ✅ | `@touchstart.prevent` 사용 |
| **UI 일관성** | ✅ | `Button` 컴포넌트 사용 (좋음!) |
| **타이머 정리** | ⚠️ | `window.setTimeout` 직접 사용, `onUnmounted` 정리는 있음 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 그리드 게임 (적합한 선택) |
| **진동/사운드** | ✅ | 정답/오답에 따른 진동 패턴 |

**잘된 점:**
- `Button` 컴포넌트 사용으로 터치 일관성 확보
- 패턴 기억 게임 라운드 시스템 잘 구현
- 타일 하이라이트 애니메이션

**개선 필요:**
- `useCleanupTimers` 사용으로 타이머 관리 개선

---

### 18. PerfectJump.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | 점프 성공/실패 진동 피드백 |

**잘된 점:**
- 타이밍 기반 점프 게임 메커니즘
- 타이밍 바 시각화

**개선 필요:**
- `useCanvas`, `useCleanupTimers` composable 사용
- 하드코딩된 캔버스 크기 제거

---

### 19. QuickMath.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ⚠️ | `@touchstart.prevent` 있음, 하지만 일반 `<button>` 태그 사용 |
| **UI 일관성** | ❌ | `Button` 컴포넌트 미사용, 일반 button 태그 |
| **타이머 정리** | ✅ | `onUnmounted`에서 timeout 정리 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 수학 퀴즈 (적합한 선택) |
| **진동/사운드** | ✅ | 정답/오답 진동 패턴 분리 |

**잘된 점:**
- 수학 문제 생성 로직 (덧셈, 뺄셈, 곱셈)
- 난이도별 숫자 범위 조정
- 오답 생성 알고리즘

**개선 필요:**
- `useCleanupTimers` 사용
- 일반 `<button>`을 `Button` 컴포넌트로 교체

---

### 20. QuickShoot.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ❌ | line 146: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame`, `removeEventListener` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | hit/miss 진동 피드백, 보너스 타겟 다른 패턴 |

**잘된 점:**
- 타겟 유형 분류 (normal, fast, bonus)
- 마우스/터치 양쪽 지원
- 데스크탑용 조준선(crosshair) 구현
- 벽 충돌 반사 물리

**개선 필요:**
- `useCanvas`, `useCleanupTimers` 사용
- touch null 체크 추가
- 하드코딩된 캔버스 크기 제거

---

### 21. ReactionTest.vue ✅ (7/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ❌ | composable 미사용 |
| **터치 접근성** | ✅ | `@touchstart.prevent`, 전체 영역 터치 가능 |
| **UI 일관성** | ⚠️ | 공통 컴포넌트 미사용, 하지만 디자인 일관성 양호 |
| **타이머 정리** | ✅ | `onUnmounted`에서 timeout 정리 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 (반응속도 테스트에 적합) |
| **진동/사운드** | ✅ | 정상 반응/너무 빠름 진동 패턴 분리 |

**잘 구현된 점:**
- 상태 머신 패턴 (waiting → ready → go → result / tooEarly)
- 반응 속도 점수 계산 알고리즘
- 결과 이모지/텍스트 computed 활용
- 최고 기록 추적

**개선 필요:**
- `useCleanupTimers` 사용

---

### 22. RhythmTap.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ✅ | `@touchstart.prevent` 사용 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | perfect/good/miss 진동 패턴 분리 |

**잘된 점:**
- 리듬 게임 판정 시스템 (Perfect/Good/Miss)
- 콤보 시스템 구현
- 노트 히트 애니메이션
- 판정 구역 시각화 (Canvas)

**개선 필요:**
- `useCanvas`, `useCleanupTimers` 사용
- 하드코딩된 캔버스 크기 제거

---

### 23. RotateObject.vue ⚠️ (5/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ❌ | line 89, 112: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | perfect/good/miss 진동 패턴 분리 |

**잘된 점:**
- 드래그 회전 로직 (마우스 + 터치 양쪽 지원)
- 각도 차이 계산 (최소 각도, 180° 처리)
- 판정 시스템 (Perfect/Good/Miss)

**개선 필요:**
- `useCanvas`, `useCleanupTimers` 사용
- touch null 체크 추가
- 하드코딩된 캔버스 크기 제거

---

### 24. SizeMatch.vue ⚠️ (6/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ✅ | `@touchstart.prevent` 사용 (단순 탭 게임) |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | perfect/good/miss 진동 패턴 분리 |

**잘된 점:**
- 원 크기 변화 애니메이션 (grow/shrink)
- 판정 구역 시각화 (동심원)
- 실시간 색상 변화 피드백

**개선 필요:**
- `useCanvas`, `useCleanupTimers` 사용
- 하드코딩된 캔버스 크기 제거

---

### 25. SlidePuzzle.vue ✅ (8/10)

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ⚠️ | composable 미사용, 하지만 `Button` 컴포넌트 사용 |
| **터치 접근성** | ✅ | 고급 터치 상태 관리 (touchId, isInside), null 체크 있음 (line 213-214) |
| **UI 일관성** | ✅ | `Button` 컴포넌트 사용 (섞기 버튼) |
| **타이머 정리** | ✅ | `onUnmounted`에서 timeout 정리 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 슬라이드 퍼즐 (적합한 선택) |
| **진동/사운드** | ✅ | 이동/완성 진동 패턴 분리 |

**잘 구현된 점:**
- 고급 터치 상태 관리 (`TouchState` 인터페이스, `isTouchInsideElement`)
- 해결 가능한 퍼즐 생성 (랜덤 이동으로 섞기)
- `Button` 컴포넌트 사용
- 타일 위치 정확성 표시 (correct 클래스)

**개선 필요:**
- `useCleanupTimers` 사용

---

### 26. SortIt.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ✅ | `useCanvas` 사용 |
| **터치 접근성** | ❌ | line 289, 297: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용, Canvas 내부 렌더링 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame`, `clearInterval` |
| **난이도 설정** | ⚠️ | line 57: 타입 안전성 이슈 가능 |
| **진동/사운드** | ❌ | 진동 피드백 없음 |

**잘된 점:**
- `useCanvas` composable 사용
- 드래그앤드롭 정렬 게임 로직
- 파티클 시스템 사용 (정렬 완료 시)
- 라운드 시스템 구현

**개선 필요:**
- touch null 체크 추가
- `useCleanupTimers` 사용
- 진동 피드백 추가

---

### 27. SpeedClick.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용 |
| **터치 접근성** | ⚠️ | line 86: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 timeout 정리 |
| **Canvas 미사용** | ℹ️ | HTML/CSS 기반 (단순 탭 게임에 적합) |
| **진동/사운드** | ✅ | 클릭 시 진동 피드백 |

**잘된 점:**
- 클릭 이펙트 애니메이션 (⚡ 스파크)
- 프로그레스 바 시각화
- 심플한 HTML/CSS 구조

**개선 필요:**
- `useCleanupTimers` 사용
- touch null 체크 추가

---

### 28. SpeedRun.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ❌ | composable 전혀 미사용, 직접 Canvas 조작 |
| **터치 접근성** | ✅ | `@touchstart.prevent` 사용 (단순 탭 점프) |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame` |
| **하드코딩 값** | ⚠️ | `canvasWidth: 800`, `canvasHeight: 600` 하드코딩 |
| **진동/사운드** | ✅ | 점프/통과/충돌 진동 패턴 분리 |

**잘된 점:**
- 러닝 게임 물리 엔진 (중력, 점프)
- 장애물 생성 시스템
- 구름/땅 패턴 스크롤 효과

**개선 필요:**
- `useCanvas`, `useCleanupTimers` 사용
- 하드코딩된 캔버스 크기 제거

---

### 29. StarGather.vue ⚠️ (6/10)

| 항목 | 상태 | 문제점 |
|------|------|--------|
| **컴포저블 사용** | ✅ | `useCanvas` 사용 |
| **터치 접근성** | ❌ | line 285, 293: `event.touches[0]` null 체크 없음 |
| **UI 일관성** | ❌ | 공통 컴포넌트 미사용 |
| **타이머 정리** | ✅ | `onUnmounted`에서 `cancelAnimationFrame`, `clearInterval` |
| **난이도 설정** | ⚠️ | line 55: 타입 안전성 이슈 가능 |
| **진동/사운드** | ❌ | 진동 피드백 없음 |

**잘된 점:**
- `useCanvas` composable 사용
- 파티클 시스템 사용 (별 수집 시)
- 드래그로 플레이어 이동
- 일반/골든 스타 시스템

**개선 필요:**
- touch null 체크 추가
- `useCleanupTimers` 사용
- 진동 피드백 추가

---

### 30. WhackAMole.vue ✅ (10/10) 🏆 모범 사례

| 항목 | 상태 | 비고 |
|------|------|------|
| **컴포저블 사용** | ✅ | `useCanvas`, `useCleanupTimers`, `useJuicyFeedback` 모두 사용 |
| **터치 접근성** | ✅ | `@touchstart.prevent`, touch null 체크 있음 (line 285-286) |
| **UI 일관성** | ✅ | `ScorePopup` 공통 컴포넌트 사용 |
| **타이머 정리** | ✅ | `useCleanupTimers`로 `safeSetTimeout`, `safeSetInterval` 사용 |
| **난이도 설정** | ✅ | line 66-67: 타입 안전성 확보 (index 범위 체크) |
| **진동/사운드** | ✅ | 콤보/실패에 따른 다양한 진동 패턴 |

**완벽한 모범 사례:**
- 모든 composable 활용 (`useCanvas`, `useCleanupTimers`, `useJuicyFeedback`)
- touch null 체크 있음
- 콤보 시스템 구현 (COMBO_TIMEOUT)
- 중복 히트 방지 플래그 (`isHit`)
- 진동 패턴 다양화 (콤보 5+ 시 특별 패턴)
- `ScorePopup` 공통 컴포넌트 사용
- `safeSetTimeout`, `safeSetInterval` 사용
- 난이도 설정에서 타입 안전성 확보

**BalloonPop.vue와 함께 다른 미니게임 리팩토링의 참조 기준으로 사용하세요.**

---

## 요약

| 파일 | 점수 | 주요 이슈 |
|------|------|-----------|
| BalanceIt.vue | 6/10 | composable 미사용, touch null 체크 |
| BalloonPop.vue | 9/10 | ✅ 모범 사례 |
| CatchBall.vue | 7/10 | touch null 체크, 타입 안전성 |
| CoinCollector.vue | 8/10 | ✅ 우수, 난이도 설정 타입 안전성 |
| ColorMatch.vue | 6/10 | touch null, 타입 에러 다수, 진동 없음 |
| ColorWord.vue | 5/10 | Button 미사용, composable 미사용 |
| DodgeIt.vue | 6/10 | touch null, 진동 없음, composable 부분 사용 |
| DrawLine.vue | 8/10 | ✅ 우수, touch null 체크만 필요 |
| FindPair.vue | 5/10 | composable 미사용, HTML/CSS 기반 |
| FruitSlice.vue | 9/10 | ✅ 모범 사례, touch null만 개선 |
| HiddenObject.vue | 5/10 | composable 미사용, HTML/CSS 기반 |
| JumpUp.vue | 5/10 | composable 미사용, 하드코딩 캔버스 크기 |
| LadderClimb.vue | 5/10 | composable 미사용, Button 미사용 |
| MazeEscape.vue | 6/10 | 고급 터치 구현, onUnmounted 위치 이상 |
| MemorySequence.vue | 8/10 | ✅ 우수, HTML/CSS 기반 사이먼 게임 |
| NumberMatch.vue | 6/10 | touch null 체크, composable 부분 사용 |
| PatternCopy.vue | 6/10 | ✅ Button 사용, useCleanupTimers 필요 |
| PerfectJump.vue | 5/10 | composable 미사용, 하드코딩 캔버스 크기 |
| QuickMath.vue | 5/10 | Button 미사용, composable 미사용 |
| QuickShoot.vue | 5/10 | touch null 체크, composable 미사용, 하드코딩 |
| ReactionTest.vue | 7/10 | 상태 머신 패턴 우수, useCleanupTimers 필요 |
| RhythmTap.vue | 6/10 | 콤보 시스템 좋음, composable 미사용 |
| RotateObject.vue | 5/10 | touch null 체크, composable 미사용, 하드코딩 |
| SizeMatch.vue | 6/10 | 판정 시각화 좋음, composable 미사용 |
| SlidePuzzle.vue | 8/10 | ✅ 고급 터치 구현, Button 사용, 우수 |
| SortIt.vue | 6/10 | useCanvas 사용, touch null 체크, 진동 없음 |
| SpeedClick.vue | 6/10 | touch null 체크, composable 미사용 |
| SpeedRun.vue | 6/10 | 물리 엔진 좋음, composable 미사용 |
| StarGather.vue | 6/10 | useCanvas 사용, touch null 체크, 진동 없음 |
| WhackAMole.vue | 10/10 | 🏆 **완벽한 모범 사례** - 모든 기준 충족 |

---

## 공통 개선 권장 사항

### 1. Composable 통일
```typescript
// 권장 패턴
import { useCanvas, useCleanupTimers, useJuicyFeedback } from '@/composables';

const { ctx, helper, width, height, clear, getCanvasCoordinates } = useCanvas(canvasRef, options);
const { safeSetTimeout, safeSetInterval, cancelAnimationFrame } = useCleanupTimers();
const { scorePopups, createScorePopup, shake } = useJuicyFeedback();
```

### 2. Touch 이벤트 Null 체크
```typescript
// ❌ 위험
const touch = event.touches[0];
const coords = getCanvasCoordinates(touch);

// ✅ 안전
const touch = event.touches[0];
if (!touch) return;
const coords = getCanvasCoordinates(touch);
```

### 3. 난이도 설정 타입 안전성
```typescript
// ❌ 위험
return settings[Math.min(props.difficulty - 1, 5)];

// ✅ 안전
const DEFAULT_SETTINGS = { ... };
const index = Math.max(0, Math.min(props.difficulty - 1, 5));
return settings[index] ?? DEFAULT_SETTINGS;
```

### 4. 공통 컴포넌트 사용
- `ScorePopup` - 점수 팝업
- `Button` - 버튼 (variant="danger", "primary" 등)
- Canvas 외부 UI는 공통 컴포넌트 활용

---

## 모범 사례: BalloonPop.vue

BalloonPop.vue를 다른 미니게임 리팩토링의 참조 기준으로 사용하세요:

- ✅ 모든 composable 활용
- ✅ 터치 이벤트 null 체크
- ✅ 난이도 설정 fallback
- ✅ 공통 컴포넌트 사용
- ✅ 콤보 시스템과 진동 피드백 연동

---

## 최종 통계

### 점수 분포

| 점수 | 파일 수 | 파일 목록 |
|------|---------|-----------|
| 🏆 10/10 | 1개 | WhackAMole |
| ✅ 9/10 | 2개 | BalloonPop, FruitSlice |
| ✅ 8/10 | 4개 | CoinCollector, DrawLine, MemorySequence, SlidePuzzle |
| 7/10 | 2개 | CatchBall, ReactionTest |
| ⚠️ 6/10 | 11개 | BalanceIt, ColorMatch, DodgeIt, MazeEscape, NumberMatch, PatternCopy, RhythmTap, SizeMatch, SortIt, SpeedRun, StarGather |
| ⚠️ 5/10 | 10개 | ColorWord, FindPair, HiddenObject, JumpUp, LadderClimb, PerfectJump, QuickMath, QuickShoot, RotateObject, SpeedClick |

### 주요 이슈 현황

| 이슈 | 해당 파일 수 |
|------|-------------|
| composable 미사용 | 20개 (67%) |
| touch null 체크 누락 | 15개 (50%) |
| 하드코딩 캔버스 크기 | 12개 (40%) |
| Button 컴포넌트 미사용 | 25개 (83%) |
| 진동 피드백 없음 | 4개 (13%) |

### 우선 리팩토링 대상 (5점대)

1. **ColorWord.vue** - Button 미사용, composable 미사용
2. **FindPair.vue** - composable 미사용
3. **HiddenObject.vue** - composable 미사용
4. **JumpUp.vue** - composable 미사용, 하드코딩
5. **LadderClimb.vue** - composable 미사용, Button 미사용
6. **PerfectJump.vue** - composable 미사용, 하드코딩
7. **QuickMath.vue** - Button 미사용, composable 미사용
8. **QuickShoot.vue** - touch null, composable 미사용, 하드코딩
9. **RotateObject.vue** - touch null, composable 미사용
10. **SpeedClick.vue** - touch null, composable 미사용

---

**문서 버전**: 1.0 (완료)
**최종 수정**: 2026-01-30
**점검 완료**: 30/30 파일
