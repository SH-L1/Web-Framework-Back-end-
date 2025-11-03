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
// 2. (강력 추천) 차트 라이브러리 불러오기 (일단 설치부터!)
// 터미널: npm install recharts @types/recharts
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

// 3. (공통) CSV 데이터 타입 정의 (ChurnPredictionPage랑 같음)
interface CsvData {
  uid: string;
  region_city_group: string;
  region_city_group_no: string;
  region_city: string;
  age_group: string;
  age: string;
  visit_days: string; // <-- 이번에 쓸 핵심 컬럼
  total_duration_min: string;
  avg_duration_min: string;
  total_payment_may: string;
  retained_june: string;
  retained_july: string;
  retained_august: string;
  retained_90: string; // <-- 이것도 핵심 컬럼
}

const RetentionPage: React.FC = () => {
  // 4. (공통) 데이터 로딩 state
  const [customerData, setCustomerData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 5. (공통) CSV 데이터 로딩 로직
  useEffect(() => {
    const csvFilePath = '/data.csv'; // public 폴더
    fetch(csvFilePath)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<CsvData>) => {
            setCustomerData(results.data);
            setIsLoading(false);
          },
          error: (err: any) => {
            console.error('RetentionPage CSV 파싱 에러:', err);
            setIsLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error('RetentionPage 파일 읽기 에러:', err);
        setIsLoading(false);
      });
  }, []);

  // =================================================================
  // 🚀 [핵심 로직 1] 전체 90일 재구매율 계산 (useMemo 사용)
  // =================================================================
  const overallRetentionRate = useMemo(() => {
    // customerData가 비어있으면 계산 안 함
    if (customerData.length === 0) return 0; 
    
    // retained_90이 '1'인 고객 수
    const retainedCount = customerData.filter(
      (c) => c.retained_90 === '1'
    ).length;
    
    // (재구매 고객 / 전체 고객) * 100
    return (retainedCount / customerData.length) * 100;

  }, [customerData]); // customerData가 바뀔 때만 재계산!

  // =================================================================
  // 7. [핵심 로직 2] 방문 일수 구간별 재구매율 (dataProcessing.ts 역할)
  // =================================================================
  const retentionByVisitDays = useMemo(() => {
    if (customerData.length === 0) return [];

    // '방문 일수'를 기준으로 고객을 그룹화할 통계 객체
    const segments: { [key: string]: { total: number, retained: number } } = {
      '1일': { total: 0, retained: 0 },
      '2-3일': { total: 0, retained: 0 },
      '4-7일': { total: 0, retained: 0 },
      '8-14일': { total: 0, retained: 0 },
      '15일+': { total: 0, retained: 0 },
    };

    // 22,000+ 데이터를 싹 돌면서 그룹에 집어넣기
    customerData.forEach(customer => {
      const visitDays = Number(customer.visit_days); // "5" -> 5
      const isRetained = customer.retained_90 === '1';

      let segmentName: keyof typeof segments | null = null;
      if (visitDays === 1) segmentName = '1일';
      else if (visitDays >= 2 && visitDays <= 3) segmentName = '2-3일';
      else if (visitDays >= 4 && visitDays <= 7) segmentName = '4-7일';
      else if (visitDays >= 8 && visitDays <= 14) segmentName = '8-14일';
      else if (visitDays >= 15) segmentName = '15일+';

      // 해당 그룹에 속하면
      if (segmentName) {
        segments[segmentName].total++; // +1명
        if (isRetained) {
          segments[segmentName].retained++; // 재구매도 했으면 +1명
        }
      }
    });

    // 차트 라이브러리가 쓰기 좋은 배열 형태로 변환
    return Object.entries(segments).map(([name, counts]) => ({
      name: name, // 예: "1일", "2-3일"
      // (재구매 / 전체) * 100, 소수점 1자리까지
      '재구매율 (%)': (counts.total > 0) 
        ? parseFloat(((counts.retained / counts.total) * 100).toFixed(1)) 
        : 0,
      '고객 수': counts.total,
    }));
    
  }, [customerData]); // 이것도 customerData 바뀔 때만 재계산

  
  // 8. (수정된 JSX) 계산된 데이터를 화면에 렌더링
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">1. 재구매율 분석 (출석 빈도)</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
        <p className="text-gray-700 mb-4">
          <strong>핵심 인사이트:</strong> 꾸준한 방문 유도가 장기 고객 유지의 핵심이며, 출석일수 1일 증가 시 재구매 확률이 크게 증가합니다.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 핵심 지표 카드 */}
          <div className="lg:col-span-1 border p-4 rounded-lg bg-green-50">
            <h3 className="font-semibold text-lg text-green-700">핵심 지표 카드</h3>
            <p className="text-2xl font-bold mt-2">
              90일 재구매율: 
              <strong className="ml-2 text-green-800">
                {/* 로딩 중이면 '...' 표시, 아니면 계산된 값 표시 (소수점 1자리) */}
                {isLoading ? '...' : `${overallRetentionRate.toFixed(1)}%`}
              </strong>
            </p>
            <p className='text-sm text-gray-600 mt-2'>(총 {customerData.length.toLocaleString()}명 대상)</p>
          </div>
          
          {/* BarChart */}
          <div className="lg:col-span-2 border p-4 rounded-lg bg-white shadow-md">
            <h3 className="font-semibold text-lg mb-2">방문 일수 구간별 평균 재구매율 (BarChart)</h3>
            
            {isLoading ? (
              <p className="text-sm text-gray-500">데이터 로딩 중...</p>
            ) : (
              // 9. Recharts로 차트 그리기 (높이 300px)
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={retentionByVisitDays} // <-- 7번에서 계산한 데이터를 여기에 쏙!
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" /> {/* X축은 'name' ("1일", "2-3일", ...) */}
                    <YAxis unit="%" /> {/* Y축은 '%' 단위 */}
                    <Tooltip 
                      // 툴팁(마우스 올리면 나오는 창) 포맷 이쁘게
                      formatter={(value: number, name: string) => {
                        if (name === '재구매율 (%)') return [`${value}%`, '재구매율'];
                        if (name === '고객 수') return [value.toLocaleString(), '고객 수'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="재구매율 (%)" fill="#4ade80" /> {/* 초록색 바 */}
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