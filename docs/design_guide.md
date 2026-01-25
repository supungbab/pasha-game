# 캐주얼 미니게임 UI/UX 디자인 가이드

## 컬러 팔레트

### 메인 컬러 (노랑 계열)
- **Primary Yellow**: `#FFD700` (밝은 노랑)
- **Secondary Yellow**: `#FFC107` (따뜻한 노랑)
- **Dark Yellow**: `#F9A825` (강조용 진한 노랑)

### 보조 컬러
- **Accent Orange**: `#FF9800` (강조 및 호버 효과)
- **Neutral Cream**: `#FFF8DC` (배경 보조)
- **Contrast Purple**: `#5E35B1` (중요 요소 대비색)
- **Contrast Teal**: `#00BCD4` (대안 대비색)

### 중립 컬러
- **White**: `#FFFFFF` (주 배경)
- **Light Gray**: `#F5F5F5` (보조 배경)
- **Dark Gray**: `#424242` (텍스트)
- **Black**: `#212121` (강조 텍스트)

---

## UI 디자인 원칙

### 1. 형태 (Shape)
- **버튼**: 둥근 모서리 (border-radius: 12-20px)
- **카드/패널**: 부드러운 모서리 (border-radius: 16-24px)
- **아이콘**: 심플하고 통통한 스타일
- **전체 분위기**: 친근하고 부드러운 느낌

### 2. 그라데이션 사용 규칙
⚠️ **과도한 그라데이션 금지**

#### 허용되는 그라데이션
- **버튼**: 미묘한 수직 그라데이션만 (위→아래, 5-10% 명도 차이)
  ```css
  background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
  ```
- **배경**: 매우 부드러운 그라데이션 (선택사항)
  ```css
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF8DC 100%);
  ```

#### 금지되는 그라데이션
- ❌ 무지개 그라데이션
- ❌ 복잡한 다중 컬러 그라데이션
- ❌ 아이콘이나 작은 UI 요소에 그라데이션
- ❌ 텍스트 그라데이션

### 3. 입체감 표현 (Depth)
그라데이션 대신 다음 방법 사용:

- **그림자 (Shadow)**
  ```css
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 호버 시 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  ```

- **테두리 (Border)**
  ```css
  border: 2px solid #F9A825;
  ```

- **밝기 차이 (Brightness Variation)**
  - 배경: 밝은 톤
  - 카드: 중간 톤
  - 버튼: 선명한 톤

---

## 타이포그래피

### 폰트 선택
- **영문**: Nunito, Poppins, Quicksand (산세리프, 둥근 느낌)
- **한글**: Pretendard, SUIT, Noto Sans KR (가독성 좋은 산세리프)

### 폰트 크기
- **제목 (Heading)**: 24-32px, Bold (700)
- **부제목 (Subheading)**: 18-20px, SemiBold (600)
- **본문 (Body)**: 14-16px, Regular (400)
- **버튼 텍스트**: 16-18px, Bold (700)
- **캡션**: 12-14px, Regular (400)

### 텍스트 컬러 규칙
- 노랑 배경 위: 검정(`#212121`) 또는 진한 회색(`#424242`)
- 흰색/밝은 배경 위: 검정 또는 진한 회색
- 진한 배경 위: 흰색(`#FFFFFF`)
- ⚠️ **노랑 텍스트는 가독성 낮음 - 사용 자제**

---

## 컴포넌트 스타일 가이드

### 버튼
```css
/* Primary Button */
background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
border-radius: 16px;
padding: 12px 24px;
box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
color: #212121;
font-weight: 700;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(255, 215, 0, 0.4);

/* Active */
transform: translateY(0);
```

### 카드
```css
background: #FFFFFF;
border-radius: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
padding: 20px;
border: 2px solid #FFF8DC;
```

### 아이콘
- 스타일: 플랫 디자인 (단색)
- 크기: 24px, 32px, 48px (용도별)
- 컬러: 메인 노랑 또는 대비색 사용

---

## 애니메이션 가이드

### 권장 애니메이션
- **버튼 클릭**: Bounce 효과
  ```css
  transition: transform 0.2s ease;
  ```

- **카드 호버**: 살짝 올라오는 효과
  ```css
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  ```

- **페이지 전환**: Fade in/out
  ```css
  transition: opacity 0.3s ease;
  ```

### 애니메이션 속도
- 빠른 피드백: 0.15-0.2초
- 일반 전환: 0.3초
- 느린 전환: 0.5초

---

## 레이아웃 원칙

### 간격 (Spacing)
- **매우 작음**: 4px
- **작음**: 8px
- **기본**: 16px
- **중간**: 24px
- **큼**: 32px
- **매우 큼**: 48px

### 그리드
- 모바일: 4px 기준 그리드
- 데스크톱: 8px 기준 그리드

---

## 접근성 (Accessibility)

### 대비율
- 텍스트와 배경 대비율: 최소 4.5:1 (WCAG AA 기준)
- 노랑 배경에는 반드시 진한 텍스트 사용

### 터치 타겟
- 최소 크기: 44x44px (모바일)
- 버튼 간 간격: 최소 8px

---

## 디자인 스타일 요약

✅ **DO (해야 할 것)**
- 플랫-세미플랫 디자인 사용
- 부드러운 그림자로 입체감 표현
- 둥근 모서리로 친근감 표현
- 심플하고 직관적인 아이콘
- 명확한 컬러 위계

❌ **DON'T (하지 말아야 할 것)**
- 과도한 그라데이션
- 복잡한 패턴이나 텍스처
- 가독성 낮은 노랑 텍스트
- 너무 많은 색상 사용 (4-5개 컬러 이내)
- 작은 폰트 크기 (최소 12px)

---

## 참고 사항

이 가이드는 **캐주얼 미니게임**에 최적화되어 있습니다.
- 직관적이고 빠른 이해가 중요
- 친근하고 즐거운 분위기
- 모바일 우선 고려
- 빠른 로딩과 반응성 중요
