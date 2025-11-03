# PC방 데이터 인사이트 대시보드

## 1. 프로젝트 개요

### 1.1. 프로젝트 명
PC방 데이터 인사이트 대시보드

### 1.2. 프로젝트 배경 및 목적
최근 PC방 시장은 경쟁 심화로 단순 시간 판매를 넘어 고객 유지율(Retention) 개선이 장기적인 수익성을 좌우하는 핵심 과제가 되었습니다.

본 프로젝트는 **"출석형 서비스(헬스장, 스터디카페 등)에서 '출석 빈도'가 '재구매 의도'에 긍정적인 영향을 미칠 것이다"** 라는 가설을 기반으로, 제공된 PC방 고객 데이터를 심층 분석합니다.

최종 목표는 분석 결과를 시각화하는 인터랙티브 대시보드를 구축하여, PC방 운영자가 데이터 기반의 효율적인 고객 관리 및 맞춤형 마케팅 전략을 수립할 수 있도록 지원하는 것입니다.

### 1.3. 팀원
- 전효배
- 강규석
- 임성훈
- 장석태

---

## 2. 핵심 분석 결과 (Core Insights)

Python (`analysis.py`)을 사용한 사전 분석을 통해 다음과 같은 핵심 인사이트를 도출했습니다.

### 방문 빈도가 재구매율의 핵심 동인 (Key Driver)
상관관계 분석 결과, `retained_90`(90일 내 재구매 여부) 변수와 가장 강한 양의 상관관계를 가진 변수는 `visit_days`(방문 일수)로 확인되었습니다.

### 재구매 확률의 정량적 측정 (Logistic Regression)
로지스틱 회귀분석 결과, 방문 일수가 1일 증가할 때마다 고객의 90일 내 재구매 확률(정확히는 오즈비, Odds Ratio)이 **약 11%씩 증가**하는 것을 확인했습니다.

이는 막연한 추측이 아닌, 데이터로 증명된 구체적인 수치이며, 대시보드의 'What-If 시뮬레이션' 기능의 핵심 근거가 됩니다.

---

## 3. 기술 스택 (Tech Stack)

본 프로젝트는 데이터 분석 단계와 대시보드 구현 단계에서 서로 다른 기술 스택을 사용합니다.

| 구분 | 목적 | 사용 기술 |
|------|------|-----------|
| **Data Analysis** | 데이터 전처리 및 분석 모델 검증 | - Python<br>- Pandas / Numpy<br>- Scikit-learn (LogisticRegression) |
| **Frontend** | 인터랙티브 대시보드 구축 | - React (with TypeScript)<br>- Tailwind CSS (Styling)<br>- Recharts (Data Visualization) |

---

## 4. 데이터 흐름 (Data Flow)

프로젝트의 데이터는 **"Python을 통한 사전 분석"**과 **"React를 통한 실시간 분석"**의 2단계를 거칩니다.

### 1단계: Python 전처리 (Analysis)
1. `data.csv` (교수님 제공 원본)
2. `preprocessing.py` 실행
   - `total_payment_may` 변수의 극단적 이상치 처리 (Capping)
   - `avg_payment_per_visit` 등 파생 변수 생성
3. `clean_data.csv` (전처리 완료된 분석용 데이터) 생성

### 2단계: React 대시보드 (Visualization)
1. React 앱 실행 시, `/public` 폴더에 위치한 `clean_data.csv` 파일을 fetch API로 로드합니다.
2. `App.tsx`: 로드된 전체 데이터를 `allData`라는 useState에 저장합니다.
3. `dataProcessing.ts`: `allData`를 받아 `analysis.py`의 Pandas 로직을 TypeScript로 구현한 분석 함수 (예: `calculateRetentionByVisitDays`)를 실행합니다.
4. `RetentionPage.tsx`: 가공된 `chartData`를 `BarChart.tsx` 컴포넌트에 props로 전달합니다.
5. `BarChart.tsx`: 데이터를 받아 Recharts 라이브러리로 차트를 최종 렌더링합니다.

---

## 5. 프로젝트 구조 (Frontend)

`create-react-app` (TypeScript)를 기반으로 하며, 다음과 같은 핵심 구조를 가집니다.

```
src/
├── components/
│   ├── charts/
│   │   ├── BarChart.tsx          # (구현 완료) 범용 막대 차트
│   │   ├── LineChart.tsx
│   │   └── PieChart.tsx
│   ├── dashboard/
│   │   ├── KeyMetricsCard.tsx    # 핵심 지표 (KPI) 카드
│   │   ├── RiskCustomerTable.tsx # 이탈 위험 고객 테이블
│   │   └── TabNavigation.tsx     # 페이지 이동 탭
│   └── layout/
│       ├── Header.tsx            # 상단 헤더
│       └── Footer.tsx            # 하단 푸터
│
├── config/
│   └── navigation.tsx            # 페이지 메뉴, 아이콘 등 공통 설정
│
├── pages/
│   ├── HomePage.tsx              # 프로젝트 소개 페이지
│   ├── RetentionPage.tsx         # [페이지 1] 재구매율 분석
│   ├── CustomerInsightPage.tsx   # [페이지 2] 고객 특성 분석
│   └── ChurnPredictionPage.tsx   # [페이지 3] 이탈 예측
│
├── utils/
│   └── dataProcessing.ts         # ★ React의 데이터 분석 엔진 (TS로 구현된 Pandas)
│
├── App.tsx                       # 메인 라우터, 데이터 로딩 및 상태 관리
└── index.css                     # Tailwind CSS 설정
```

---

## 6. 대시보드 페이지 구성

기획서에 따라 대시보드는 3개의 핵심 분석 페이지로 구성됩니다.

### [Page 1] 재구매율 분석 (RetentionPage)
**목표**: "꾸준한 방문이 재구매로 이어진다"는 핵심 인사이트 증명

**주요 기능**:
- **방문 일수 구간별 재구매율** (구현 완료): `visit_days`를 5개 구간(1-2일, 3-5일...)으로 나누어 평균 `retained_90`을 막대 차트로 시각화합니다.

### [Page 2] 고객 특성 분석 (CustomerInsightPage)
**목표**: 주요 고객층(연령/지역)을 파악하고 맞춤 마케팅 근거 마련

**주요 기능** (구현 예정):
- **연령대별 분석**: `age_group`별 평균 결제 금액, 평균 체류 시간 시각화
- **지역별 분석**: `region_city`별 고객 유지율 시각화
- **인터랙티브 필터**: 연령, 지역별로 차트 데이터를 필터링하는 기능

### [Page 3] 이탈 예측 및 관리 (ChurnPredictionPage)
**목표**: 이탈 위험 고객을 선제적으로 관리하고, 방문 유도 전략의 효과 시뮬레이션

**주요 기능** (구현 예정):
- **What-If 시뮬레이션**: `analysis.py`의 오즈비(11%) 값을 활용, "방문 횟수를 X회 늘리면 재구매율이 Y%로 증가"하는 가상 시나리오 분석
- **이탈 위험 고객 목록**: 방문 빈도가 낮은 고객을 `RiskCustomerTable`로 추출

---

## 7. 프로젝트 실행 방법

### 1. 저장소를 클론합니다
```bash
git clone [repository-url]
cd [project-folder]
```

### 2. 필요한 라이브러리를 설치합니다
```bash
npm install
```

### 3. (필수) clean_data.csv 파일을 public/ 폴더 내에 위치시킵니다

### 4. 프로젝트를 시작합니다
```bash
npm start
```
