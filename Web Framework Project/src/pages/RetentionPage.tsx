// import React from 'react';

// const RetentionPage: React.FC = () => (
//   <div className="p-6 max-w-7xl mx-auto">
//     <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">1. 재구매율 분석 (출석 빈도)</h1>
//     <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
//       <p className="text-gray-700 mb-4">
//         <strong>핵심 인사이트:</strong> 꾸준한 방문 유도가 장기 고객 유지의 핵심이며, 출석일수 1일 증가 시 재구매 확률이 크게 증가합니다.
//       </p>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// =        <div className="lg:col-span-1 border p-4 rounded-lg bg-green-50">
//           <h3 className="font-semibold text-lg text-green-700">핵심 지표 카드</h3>
//           <p>90일 재구매율: <strong>XX.X%</strong></p>
//         </div>
        
// =        <div className="lg:col-span-2 border p-4 rounded-lg bg-white shadow-md">
//           <h3 className="font-semibold text-lg mb-2">방문 일수 구간별 평균 재구매율 (BarChart)</h3>
//           <p className="text-sm text-gray-500">
//             *dataProcessing.ts 함수를 사용하여 visit_days를 구간별로 나누고 재구매율 계산 후 시각화 예정*
//           </p>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default RetentionPage;

// 1. useMemo, useState, useEffect 불러오기
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// --- 1. [추가] 필터링을 위한 한글/영어 변환 맵 ---
const KOREAN_TO_ENGLISH_AGE_MAP: { [key: string]: string } = {
  '10대': 'Teens',
  '20대': 'Twenties',
  '30대': 'Thirties',
  '40대': 'Forties+', // 40대는 Forties+와 매칭
  '기타': 'Others',
};

const KOREAN_TO_ENGLISH_REGION_MAP: { [key: string]: string } = {
  '서울': 'Seoul', '경기': 'Gyeonggi-do', '인천': 'Incheon', '강원': 'Gangwon-do',
  '충남': 'Chungcheongnam-do', '충북': 'Chungcheongbuk-do', '대전': 'Daejeon',
  '세종': 'Sejong', '경남': 'Gyeongsangnam-do', '경북': 'Gyeongsangbuk-do',
  '부산': 'Busan', '울산': 'Ulsan', '대구': 'Daegu', '전남': 'Jeollanam-do',
  '전북': 'Jeollabuk-do', '광주': 'Gwangju', '제주': 'Jeju', '기타': 'Others',
};

// 가격 범위 맵 (Key: 한글 라벨, Value: [최소, 최대])
const PRICE_RANGE_MAP: { [key: string]: [number, number] } = {
  '~ 10,000원': [0, 10000],
  '10,001 ~ 50,000원': [10001, 50000],
  '50,001 ~ 100,000원': [50001, 100000],
  '100,001원 ~': [100001, Infinity],
};
// ----------------------------------------------------

// 2. [수정] CsvData 타입에 total_payment_may 추가 (필수)
interface CsvData {
  uid: string;
  region_city_group: string;
  age_group: string;
  visit_days: string;
  retained_90: string;
  total_payment_may: string; // <--- 가격 필터용
  // ... (다른 컬럼들)
}

// 3. [추가] App.tsx로부터 받을 props 타입
interface RetentionPageProps {
  selectedAgeGroups: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
}

// 4. [수정] props 받기
const RetentionPage: React.FC<RetentionPageProps> = ({
  selectedAgeGroups,
  selectedRegions,
  selectedPriceRanges,
}) => {
  const [originalData, setOriginalData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 5. CSV 로딩 (수정 없음)
  useEffect(() => {
    const csvFilePath = '/data.csv';
    fetch(csvFilePath)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<CsvData>) => {
            setOriginalData(results.data);
            setIsLoading(false);
          },
          error: (err: any) => { console.error('RetentionPage CSV 파싱 에러:', err); setIsLoading(false); },
        });
      })
      .catch((err) => { console.error('RetentionPage 파일 읽기 에러:', err); setIsLoading(false); });
  }, []);

  // 6. [수정] 필터가 적용된 데이터를 계산하는 useMemo
  const filteredData = useMemo(() => {
    if (isLoading || originalData.length === 0) {
      return [];
    }

    // 6a. 필터링을 위한 영어 키/값 변환
    const englishAgeGroups = selectedAgeGroups.map(age => KOREAN_TO_ENGLISH_AGE_MAP[age]).filter(Boolean);
    const englishRegions = selectedRegions.map(region => KOREAN_TO_ENGLISH_REGION_MAP[region]).filter(Boolean);
    const priceRanges = selectedPriceRanges.map(range => PRICE_RANGE_MAP[range]).filter(Boolean);

    return originalData.filter((c) => {
      // 6b. 연령대 필터
      if (
        englishAgeGroups.length > 0 &&
        !englishAgeGroups.includes(c.age_group || 'Others')
      ) {
        return false;
      }
      
      // 6c. 지역 필터
      if (
        englishRegions.length > 0 &&
        !englishRegions.includes(c.region_city_group || 'Others')
      ) {
        return false;
      }
      
      // 6d. [새로 추가] 가격 필터
      if (priceRanges.length > 0) {
        const payment = Number(c.total_payment_may) || 0;
        // 선택된 가격 범위 중 하나라도 만족(some)하면 통과
        const isInPriceRange = priceRanges.some(([min, max]) => 
          payment >= min && payment <= max
        );
        if (!isInPriceRange) {
          return false; // 만족하는 범위가 하나도 없으면 탈락
        }
      }
      
      return true; // 모든 필터 통과
    });
  }, [originalData, isLoading, selectedAgeGroups, selectedRegions, selectedPriceRanges]);

  // 7. [수정] 전체 재구매율 (filteredData 사용)
  const overallRetentionRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    
    const retainedCount = filteredData.filter(
      (c) => c.retained_90 === '1'
    ).length;
    
    return (retainedCount / filteredData.length) * 100;

  }, [filteredData]);

  // 8. [수정] 방문일수별 재구매율 (filteredData 사용)
  const retentionByVisitDays = useMemo(() => {
    if (filteredData.length === 0) return [];

    const segments: { [key: string]: { total: number, retained: number } } = {
      '1일': { total: 0, retained: 0 },
      '2-3일': { total: 0, retained: 0 },
      '4-7일': { total: 0, retained: 0 },
      '8-14일': { total: 0, retained: 0 },
      '15일+': { total: 0, retained: 0 },
    };

    filteredData.forEach(customer => {
      const visitDays = Number(customer.visit_days);
      const isRetained = customer.retained_90 === '1';

      let segmentName: keyof typeof segments | null = null;
      if (visitDays === 1) segmentName = '1일';
      else if (visitDays >= 2 && visitDays <= 3) segmentName = '2-3일';
      else if (visitDays >= 4 && visitDays <= 7) segmentName = '4-7일';
      else if (visitDays >= 8 && visitDays <= 14) segmentName = '8-14일';
      else if (visitDays >= 15) segmentName = '15일+';

      if (segmentName) {
        segments[segmentName].total++;
        if (isRetained) {
          segments[segmentName].retained++;
        }
      }
    });

    return Object.entries(segments).map(([name, counts]) => ({
      name: name,
      '재구매율 (%)': (counts.total > 0)
        ? parseFloat(((counts.retained / counts.total) * 100).toFixed(1))
        : 0,
      '고객 수': counts.total,
    }));
    
  }, [filteredData]);

  
  // 9. JSX 렌더링 (filteredData.length로 예외처리)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">재구매율 분석 (출석 빈도)</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg-col-span-1 border p-4 rounded-lg bg-green-50">
            <h3 className="font-semibold text-lg text-green-700">핵심 지표</h3>
            <p className="text-2xl font-bold mt-2">
              90일간 재구매율: 
              <strong className="ml-2 text-green-800">
                {isLoading ? '...' : (filteredData.length === 0 ? '0.0%' : `${overallRetentionRate.toFixed(1)}%`)}
              </strong>
            </p>
            <p className='text-sm text-gray-600 mt-2'>(총 {filteredData.length.toLocaleString()}명 대상)</p>
          </div>
          
          <div className="lg:col-span-2 border p-4 rounded-lg bg-white shadow-md">
            <h3 className="font-semibold text-lg mb-2">방문 일수 구간별 평균 재구매율 (BarChart)</h3>
            
            {isLoading ? (
              <p className="text-sm text-gray-500">데이터 로딩 중...</p>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={retentionByVisitDays}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === '재구매율 (%)') return [`${value}%`, '재구매율'];
                        if (name === '고객 수') return [value.toLocaleString(), '고객 수'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="재구매율 (%)" fill="#4ade80" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetentionPage;