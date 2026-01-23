# 🎮 빠샤! (PASHA!) - 프로젝트 인덱스

**게임 이름**: 빠샤! (PASHA!)  
**장르**: 미니게임 모음집  
**플랫폼**: 모바일 웹/앱

## 📂 프로젝트 구조 개요

```
pasha-game/
├── 📄 README.md                           # 프로젝트 메인 문서
├── 📄 PROJECT_INDEX.md                    # 프로젝트 인덱스 (이 파일)
├── docs/                                  # 📚 설계 문서
│   ├── GAME_DESIGN_DOCUMENT.md           # 게임 기획서 (핵심)
│   └── COMPONENT_STRUCTURE.md            # 컴포넌트 구조 설계
├── missions/                              # 🎯 미니게임 기획서
│   ├── MISSIONS_SUMMARY.md               # 30개 게임 요약
│   ├── mission-01.md                     # 풍선 터트리기 (상세)
│   ├── mission-02.md                     # 과일 자르기 (상세)
│   ├── mission-03.md                     # 두더지 잡기 (상세)
│   └── mission-list.md                   # 전체 게임 목록
└── src/                                   # 💻 소스 코드
    ├── assets/                            # 에셋 ✅
    │   └── styles/                       # 스타일시트 ✅
    │       ├── main.css                  # 메인 스타일 ✅
    │       └── variables.css             # CSS 변수 ✅
    ├── config/                            # 설정 파일 ✅
    │   ├── constants.ts                  # 게임 상수 ✅
    │   ├── colors.ts                     # 색상 팔레트 ✅
    │   ├── miniGames.ts                  # 30개 미니게임 정의 ✅
    │   └── index.ts                      # Export 인덱스 ✅
    ├── types/                             # TypeScript 타입 정의 ✅
    │   ├── game.ts                       # 게임 상태, 설정 타입 ✅
    │   ├── minigame.ts                   # 미니게임 타입 ✅
    │   └── ranking.ts                    # 랭킹 타입 ✅
    ├── utils/                             # 유틸리티 함수 ✅
    │   ├── difficulty.ts                  # 난이도 계산 ✅
    │   ├── random.ts                      # 랜덤 함수 ✅
    │   ├── canvas.ts                      # Canvas 헬퍼 ✅
    │   ├── storage.ts                     # 로컬 스토리지 ✅
    │   └── index.ts                      # Export 인덱스 ✅
    ├── composables/                       # Vue Composables ✅
    │   ├── useGameState.ts               # 게임 상태 관리 ✅
    │   ├── useAudio.ts                   # 오디오/진동 관리 ✅
    │   ├── useCanvas.ts                  # Canvas 관리 ✅
    │   └── index.ts                      # Export 인덱스 ✅
    ├── components/                        # Vue 컴포넌트
    │   ├── common/                       # 공통 컴포넌트 ✅
    │   │   ├── GameCanvas.vue            # Canvas 컴포넌트 ✅
    │   │   ├── Timer.vue                 # 타이머 컴포넌트 ✅
    │   │   ├── LifeDisplay.vue           # 목숨 표시 ✅
    │   │   ├── ScoreDisplay.vue          # 점수 표시 ✅
    │   │   ├── DifficultyBadge.vue       # 난이도 배지 ✅
    │   │   └── index.ts                  # Export 인덱스 ✅
    │   ├── ui/                           # UI 컴포넌트 ✅
    │   │   ├── Button.vue                # 버튼 컴포넌트 ✅
    │   │   ├── Modal.vue                 # 모달 컴포넌트 ✅
    │   │   └── index.ts                  # Export 인덱스 ✅
    │   └── minigames/                    # 미니게임 컴포넌트 (TODO)
    ├── views/                            # 페이지 뷰 (TODO)
    ├── router/                           # 라우터 ✅
    └── main.ts                           # 앱 진입점 ✅
```

---

## 📋 주요 문서 가이드

### 🎯 시작하기
1. **[README.md](README.md)** - 프로젝트 전체 개요
2. **[GAME_DESIGN_DOCUMENT.md](docs/GAME_DESIGN_DOCUMENT.md)** - 게임 시스템 상세 설명

### 🎮 게임 기획
1. **[MISSIONS_SUMMARY.md](missions/MISSIONS_SUMMARY.md)** - 30개 미니게임 한눈에 보기
2. **[mission-01.md](missions/mission-01.md)** - 풍선 터트리기 (상세 예시)
3. **[mission-02.md](missions/mission-02.md)** - 과일 자르기 (상세 예시)
4. **[mission-03.md](missions/mission-03.md)** - 두더지 잡기 (상세 예시)

### 💻 개발 가이드
1. **[COMPONENT_STRUCTURE.md](docs/COMPONENT_STRUCTURE.md)** - 컴포넌트 구조 및 사용법
2. **[TypeScript 타입](src/types/)** - 타입 정의 파일들
3. **[유틸리티 함수](src/utils/)** - 재사용 가능한 함수들

---

## 🎯 핵심 기능 요약

### 게임 시스템
- ✅ 30개 미니게임 (각 1회씩, 랜덤 순서)
- ✅ 5판마다 상승하는 6단계 난이도
- ✅ 3개의 목숨 + 1회 광고 컨티뉴
- ✅ 12% 확률 하드모드
- ✅ 글로벌/로컬 랭킹

### 점수 시스템
- 속도 기반 (남은시간 × 보너스)
- 정확도 기반 (성공률 × 100)
- 횟수 기반 (성공 × 점수)
- 혼합형 (복합 계산)

### UI/UX
- 게임 시작 전 간단한 지시문 (1-2초)
- 사운드/진동 피드백
- Canvas + CSS + 이모지 구현

---

## 📊 미니게임 분류

### 🎯 반사신경/타이밍 (10개)
Mission 1-10: 풍선 터트리기, 과일 자르기, 두더지 잡기, 타이밍 점프, 리듬 탭, 색깔 매칭, 빠른 클릭, 반응 테스트, 공 받기, 슈팅 게임

### 🧩 퍼즐/인지 (8개)
Mission 11-18: 숫자 맞추기, 같은 그림 찾기, 순서 기억, 색깔 이름, 빠른 계산, 패턴 따라하기, 숨은 그림, 퍼즐 슬라이드

### 🏃 액션/수집 (7개)
Mission 19-25: 동전 모으기, 장애물 피하기, 사다리 오르기, 미로 탈출, 별 수집, 점프 게임, 스피드 런

### 🎨 그리기/조작 (5개)
Mission 26-30: 선 긋기, 물체 회전, 크기 맞추기, 균형 잡기, 순서 나열

---

## 🛠️ 기술 스택

### 프론트엔드
- **Vue.js 3** (Composition API)
- **TypeScript**
- **Vite**

### 렌더링
- **Canvas API** - 게임 오브젝트
- **HTML5 + CSS3** - UI 요소
- **이모지** - 캐릭터/아이템

### 기능
- **Web Audio API** - 사운드
- **Vibration API** - 햅틱 피드백
- **LocalStorage** - 데이터 저장

---

## 🚀 개발 단계

### ✅ Phase 1: 기획 완료
- [x] 게임 시스템 설계
- [x] 30개 미니게임 컨셉 정의
- [x] 컴포넌트 구조 설계
- [x] 타입 정의 (game.ts, minigame.ts, ranking.ts)
- [x] 유틸리티 함수 (difficulty.ts, random.ts, canvas.ts, storage.ts)

### 🔄 Phase 2: 개발 진행 중
- [x] 타입 시스템 완성 (GameState, GameSession, DifficultyLevel 등)
- [x] 유틸리티 함수 완성 (난이도 계산, 랜덤, Canvas 헬퍼, 로컬 스토리지)
- [x] Composables 구현 (useGameState, useAudio, useCanvas)
- [x] 공통 컴포넌트 구현 (GameCanvas, Timer, LifeDisplay, ScoreDisplay, DifficultyBadge)
- [ ] 미니게임 1-10 개발
- [ ] 미니게임 11-20 개발
- [ ] 미니게임 21-30 개발

### ⏳ Phase 3: 통합 예정
- [ ] 사운드/진동 시스템
- [ ] 랭킹 시스템
- [ ] 광고 SDK 연동
- [ ] 밸런싱 및 테스트

---

## 📖 문서별 주요 내용

### README.md
- 프로젝트 전체 개요
- 기술 스택
- 설치 및 실행 방법
- 개발 로드맵

### docs/GAME_DESIGN_DOCUMENT.md (63KB)
- 게임 컨셉 및 특징
- 게임 플레이 시스템 (목숨, 컨티뉴, 난이도)
- 점수 시스템 (4가지 타입 설명)
- UI/UX 설계 (화면 구성, 지시문)
- 사운드/진동 시스템
- 랭킹 시스템
- 기술 구현 설계
- 개발 로드맵

### docs/COMPONENT_STRUCTURE.md (44KB)
- 컴포넌트 아키텍처
- 공통 컴포넌트 (GameCanvas, ScoreDisplay, LifeDisplay, Timer 등)
- UI 컴포넌트 (MainMenu, GamePlay, GameOver 등)
- Composables (상태 관리, 오디오, 진동, Canvas)
- 유틸리티 함수
- 성능 최적화 가이드

### missions/MISSIONS_SUMMARY.md (21KB)
- 30개 미니게임 전체 요약
- 카테고리별 분류
- 조작 방법, 점수 시스템, 제한시간
- 이모지 및 구현 방법
- 개발 우선순위

### missions/mission-01.md (예시 - 풍선 터트리기)
- 게임 상세 설명
- 조작 방법 및 규칙
- 점수 시스템
- 난이도별 변화 표
- 하드 모드 설명
- 비주얼 구현 방법 (Canvas + 이모지)
- 구현 로직 (TypeScript 코드)
- 테스트 체크리스트

---

## 💡 개발 시작 가이드

### 1단계: 문서 읽기
```
README.md → GAME_DESIGN_DOCUMENT.md → COMPONENT_STRUCTURE.md
```

### 2단계: 타입 이해하기
```
src/types/game.ts → minigame.ts → ranking.ts
```

### 3단계: 유틸리티 활용
```
src/utils/difficulty.ts  # 난이도 계산
src/utils/random.ts      # 랜덤 함수
src/utils/canvas.ts      # Canvas 헬퍼
src/utils/storage.ts     # 데이터 저장
```

### 4단계: 미니게임 개발
```
1. missions/mission-XX.md 읽기
2. src/components/minigames/MiniGameXX.vue 생성
3. MiniGameProps 구현
4. 게임 로직 작성
5. 테스트 및 밸런싱
```

---

## 🎨 디자인 가이드

### 컬러 팔레트
```css
/* 주 색상 */
--primary: #FF6B6B;
--secondary: #4ECDC4;
--accent: #FFE66D;

/* 배경 */
--bg: #F7FFF7;

/* 텍스트 */
--text: #2C3E50;
```

### 이모지 사용 예시
```
❤️ 목숨
⭐ 난이도
🎈 풍선
🍎 과일
🐹 두더지
🎯 타겟
🏆 랭킹
⚙️ 설정
```

---

## 📞 참고사항

### 각 MD 파일의 역할
- **기획서**: 게임 시스템과 전체 구조 설명
- **컴포넌트 문서**: 코드 구현 가이드
- **미션 파일**: 개별 게임 상세 기획

### 개발 순서 권장
1. 공통 컴포넌트 (GameCanvas, Timer 등)
2. 간단한 미니게임 3-5개 (Mission 1, 3, 6, 19, 26)
3. 게임 플로우 통합
4. 나머지 미니게임 개발
5. 사운드/랭킹 등 부가 기능

---

## ✨ 프로젝트 하이라이트

### ✅ 완료된 작업
- 📋 완전한 게임 기획서 (GAME_DESIGN_DOCUMENT.md, 63KB)
- 🎯 30개 미니게임 컨셉 정의 (MISSIONS_SUMMARY.md)
- 📐 컴포넌트 아키텍처 설계 (COMPONENT_STRUCTURE.md, 44KB)
- 💻 TypeScript 타입 시스템 (game.ts, minigame.ts, ranking.ts)
- ⚙️ Config 파일 완성 (constants.ts, colors.ts, miniGames.ts)
- 🛠️ 유틸리티 함수 세트 (difficulty, random, canvas, storage)
- 🎮 핵심 Composables (useGameState, useAudio, useCanvas)
- 🧩 공통 Vue 컴포넌트 (GameCanvas, Timer, LifeDisplay, ScoreDisplay, DifficultyBadge)
- 🎨 UI 컴포넌트 (Button, Modal)
- 💅 스타일시트 (main.css, variables.css with CSS variables)
- 📊 난이도/점수 시스템 구현
- 🎮 핵심 Composables (useGameState, useAudio, useCanvas)
- 🧩 공통 Vue 컴포넌트 (GameCanvas, Timer, LifeDisplay, ScoreDisplay, DifficultyBadge)

### 🎨 특별한 점
- 이미지 없이 Canvas + CSS + 이모지만으로 구현
- AI가 활용하기 좋은 MD 파일 기반 관리
- 확장 가능한 미니게임 구조
- 상세한 개발 가이드

---

**총 문서 페이지**: 200+ 페이지 상당  
**작성 일자**: 2026-01-22  
**프로젝트 상태**: 기획 완료, 개발 준비 완료 ✅
