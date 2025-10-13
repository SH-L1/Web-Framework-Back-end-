# Web-Framework-Back-end-
웹프레임워크(백엔드) 프로젝트

pages 폴더
    기능 : 웹페이지의 개별 화면(페이지) 구성 파일, 전체 화면 구성
    활용 방법 : 데이터 관리 및 하위 컴포넌트로 전달하여 화면에 출력
    파일 설명 : 
        - RetentionPage
            - 방문 빈도와 재방문율 관련 페이지
            - 출석일수가 재구매율에 영향을 미치는가에 대한 정보 전달
            - 방문일수(visit_days)를 구간별로 나누고, 각 구간의 평균 재구매율(retained_90)을 계산
            - 계산된 데이터를 차트 컴포넌트에 전달하여 시각화할 수 있도록 함
            - ex) 출석일수가 10회 미만인 고객 그룹의 재구매율은 50%이지만, 10회 이상인 그룹은 80%에 달함
        - CustomerInsightPage.tsx
            - 고객의 인구통계학적 특정(연령대, 지역)과 패턴을 분석하여 정보 제공하는 페이지
            - age_group 변수를 이용하여 연령대별 평균 결제 금액(total_payment_may)과 평균 체류 시간(avg_duration_min)을 계산
            - region_city 변수를 기준으로 지역별 고객 유지율(retained_90)을 계산, 이를 통하여 시각화하여 직관적으로 식별할 수 있도록 함
        - ChurnPredictionPage.tsx
            - 고객 이탈 가능성을 예측하여, 잠재적 이탈 고객을 선별하여 고객 관리를 돕는 페이지
            - visit_days와 total_payment_may 등의 변수를 이용하여 재방문 가능성이 낮은 고객들을 특정 기준으로 분류
            - 분류된 고객 정보를 테이블 컴포넌트에 전달하여 한눈에 볼 수 있도록 테이블 생성
        - HomePage.tex
            - 메인 페이지
            - 대시보드 소개 및 내비게이션 역할
            - 주요 페이지들을 한눈에 볼 수 있도록 함

components 폴더
    기능 : UI 폴더, 차트, 테이블, 버튼 등의 독립적인 기능 단위로 구성
    활용 방법 : 페에지 컴포넌트에 필요한 데이터를 가져와 시각화 및 화면에 출력
    파일 설명 : 
        - BarChart, LineChart, PieChart
            - 데이터들을 시각화할 수 있도록 차트 생성
            - react-chartjs-2 등과 같은 라이브러리 사용
        - KeyMetricsCard
            - '총 방문자 수', '월 매출액'과 같은 핵심 지표를 카드 형태로 보여줌
            - RetentionPage나 CustomerInsightPage를 배치하여 대시보드의 현재 상태를 한눈에 파악
        - RiskCustomerTable
            - 이탈 가능성이 높은 고객의 목록을 표 형태로 정리
            - ChurnPredictionPage에서 사용자가 분석 결과를 바탕으로 이탈 고객을 파악
            - 고객 uid, visit_days, total_duration_min 등의 정보를 표로 구성
        - TabNavigation
            - 여러 페이지나 섹션을 전환할 수 있는 탭 메뉴
            - App.tsx의 <Header> 컴포넌트 내에 배치하여 사용자가 '재구매율', '고객 분석', '이탈 예측' 페이지 이동을 도움
        - Header
            - 웹페이지 상단에 고정되는 헤더(내비게이션 바)를 담당
            - 로고, TabNavigation.tsx와 같은 메뉴, 그리고 사용자 프로필 아이콘 등을 포함하여 모든 페이지 관리
        - Footer
            - 웹페이지 하단에 고정되는 푸터를 담당
            - 사용자가 필요로 하는 기본 정보를 제공
    
utils 폴더
    기능 : 데이터 가공, 복잡한 계산 수행
    활용 방법 : 복잡한 함수들을 모아놓고 컴포넌트에서 이를 사용할 수 있도록 함
               ex) data.csv 파일을 읽어와 차트에 필요한 형태로 변환
    파일 설명 :
        - dataProcessing
            - 데이터 불러오기, 전처리, 계산 역할 수행
            - data.csv 파일을 불러와 JSON 객체 형태로 변환
            - 원본 데이터를 가공하거나 복잡한 로직 구현현
            - ex) RetentionPage.tsx를 위해 visit_days 구간별 평균 재구매율을 계산하는 함수 생성
