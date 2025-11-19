// import React from 'react';

// const ChurnPredictionPage: React.FC = () => {
//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">3. 이탈 예측 및 가상 시나리오</h1>
//       <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-1 border p-4 rounded-lg bg-blue-50 shadow-md">
//             <h3 className="font-semibold text-xl text-blue-700 mb-3">What-If 시뮬레이션</h3>
//             <p className="text-sm text-gray-600 mb-2">평균 방문 일수 조정:</p>
//             <input type="range" className="w-full" min="1" max="30" defaultValue="15" />
//             <p className="mt-4 font-bold">예상 재구매율 변화: <span className="text-red-500">+X%</span></p>
//             <p className="font-bold">예상 매출 증감: <span className="text-red-500">+W,XXX,XXX 원</span></p>
//           </div>
          
//           <div className="lg:col-span-2 border p-4 rounded-lg bg-red-50 shadow-md">
//             <h3 className="font-semibold text-xl text-red-700 mb-3">이탈 위험 고객 목록 (RiskCustomerTable)</h3>
//             <p className="text-sm text-gray-600 mb-4">
//               *분류된 고객 정보를 테이블 컴포넌트에 전달하여 한눈에 볼 수 있도록 테이블 생성*
//               <br />
//               (4.1.6 세그먼트 내보내기 기능 구현)
//             </p>
//           </div>
//         </div>
        
//         <div className="mt-8 border p-6 rounded-xl bg-yellow-50 shadow-md">
//              <h3 className="font-semibold text-xl text-yellow-700 mb-3">마케팅 템플릿 추천 및 메모 (4.1.5)</h3>
//              <p className="text-sm text-gray-600">
//                인사이트 기반으로 "점심시간 1시간 무료 쿠폰" 등의 템플릿 추천 기능 구현 예정.
//              </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChurnPredictionPage;

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';

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

// 2. [수정] CsvData 타입 (필요한 컬럼만 남김)
interface CsvData {
  uid: string;
  region_city_group: string;
  region_city: string;
  age_group: string;
  age: string;
  visit_days: string;
  total_payment_may: string;
  retained_90: string;
}

// 3. [추가] App.tsx로부터 받을 props 타입
interface ChurnPredictionPageProps {
  selectedAgeGroups: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
}

// 4. [수정] props 받기
const ChurnPredictionPage: React.FC<ChurnPredictionPageProps> = ({
  selectedAgeGroups,
  selectedRegions,
  selectedPriceRanges,
}) => {
  const [originalData, setOriginalData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationDays, setSimulationDays] = useState(15);

  // 5. CSV 로딩 (수정 없음)
  useEffect(() => {
    const csvFilePath = '/data.csv';
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: Papa.ParseResult<CsvData>) => {
            setOriginalData(results.data);
            setIsLoading(false);
          },
          error: (error: any) => { console.error('CSV 파싱 에러:', error); setIsLoading(false); },
        });
      })
      .catch((err) => { console.error('파일 읽기 에러:', err); setIsLoading(false); });
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
        const isInPriceRange = priceRanges.some(([min, max]) => 
          payment >= min && payment <= max
        );
        if (!isInPriceRange) {
          return false;
        }
      }
      
      return true; // 모든 필터 통과
    });
  }, [originalData, isLoading, selectedAgeGroups, selectedRegions, selectedPriceRanges]);

  // 7. [수정] 이하 모든 useMemo가 'filteredData'를 사용하도록 의존성 변경
  const churnRiskCustomers = useMemo(() => {
    return filteredData.filter(
      (customer) => customer.retained_90 === '0'
    );
  }, [filteredData]);

  const baselineStats = useMemo(() => {
    if (filteredData.length === 0) {
      return { rate: 0, avgRevenuePerRetained: 0, totalCustomers: 0, baselineRetainedRevenue: 0 };
    }
    
    const retainedCustomers = filteredData.filter(c => c.retained_90 === '1');
    const totalRetained = retainedCustomers.length;
    const totalCustomers = filteredData.length;
    
    // [수정] totalCustomers가 0일 때 NaN 방지
    const baselineRate = totalCustomers > 0 ? (totalRetained / totalCustomers) : 0;
    
    const retainedRevenue = retainedCustomers.reduce((sum, c) => sum + Number(c.total_payment_may), 0);
    const avgRevenuePerRetained = totalRetained > 0 ? (retainedRevenue / totalRetained) : 0;
    const baselineRetainedRevenue = totalRetained * avgRevenuePerRetained;

    return { rate: baselineRate, avgRevenuePerRetained, totalCustomers, baselineRetainedRevenue };
  }, [filteredData]);

  const retentionRatesByDayGroup = useMemo(() => {
    if (filteredData.length === 0) return {};

    const segments: { [key: string]: { total: number, retained: number } } = {
      '1일': { total: 0, retained: 0 },
      '2-3일': { total: 0, retained: 0 },
      '4-7일': { total: 0, retained: 0 },
      '8-14일': { total: 0, retained: 0 },
      '15일+': { total: 0, retained: 0 },
    };

    filteredData.forEach(customer => {
      const visitDays = Number(customer.visit_days) || 0;
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

    const rates: { [key: string]: number } = {};
    Object.entries(segments).forEach(([name, counts]) => {
      rates[name] = (counts.total > 0) ? (counts.retained / counts.total) : 0;
    });
    return rates;
  }, [filteredData]);
  
  // (시뮬레이션 로직은 수정 없음, baselineStats 등을 그대로 사용)
  const rateAnchorPoints = useMemo(() => {
    if (isLoading || Object.keys(retentionRatesByDayGroup).length === 0) return [];
    const rates = retentionRatesByDayGroup;
    const p1 = rates['1일'] || 0;
    const p2 = rates['2-3일'] || p1;
    const p3 = rates['4-7일'] || p2;
    const p4 = rates['8-14일'] || p3;
    const p5 = rates['15일+'] || p4;
    return [
      { day: 1, rate: p1 },
      { day: 3, rate: p2 },
      { day: 7, rate: p3 },
      { day: 14, rate: p4 },
      { day: 15, rate: p5 }
    ];
  }, [retentionRatesByDayGroup, isLoading]);

  const getInterpolatedRate = (days: number): number => {
    if (rateAnchorPoints.length === 0) return 0;
    if (days <= 1) return rateAnchorPoints[0].rate;
    if (days >= 15) return rateAnchorPoints[rateAnchorPoints.length - 1].rate;

    for (let i = 1; i < rateAnchorPoints.length; i++) {
      const p2 = rateAnchorPoints[i];
      if (days <= p2.day) {
        const p1 = rateAnchorPoints[i - 1];
        if (p2.day - p1.day === 0) return p1.rate; 
        const t = (days - p1.day) / (p2.day - p1.day);
        return p1.rate + (p2.rate - p1.rate) * t;
      }
    }
    return rateAnchorPoints[rateAnchorPoints.length - 1].rate;
  };

  const simulationStats = useMemo(() => {
    // [수정] 0으로 나누기 방지
    if (baselineStats.totalCustomers === 0) {
      return { rateChange: 0, revenueChange: 0, simulatedRate: 0 };
    }
    
    const simulatedRate = getInterpolatedRate(simulationDays);
    const simulatedRetainedCount = baselineStats.totalCustomers * simulatedRate;
    const simulatedRevenue = simulatedRetainedCount * baselineStats.avgRevenuePerRetained;
    
    const rateChange = (simulatedRate - baselineStats.rate) * 100;
    const revenueChange = simulatedRevenue - baselineStats.baselineRetainedRevenue;

    return { rateChange, revenueChange, simulatedRate: simulatedRate * 100 };
  }, [simulationDays, baselineStats, getInterpolatedRate]); // [수정] getInterpolatedRate 추가

  // 포맷팅 함수 (수정 없음)
  const formatPercentage = (num: number) => {
    const fixedNum = num.toFixed(1);
    if (num > 0) return `+${fixedNum}%`;
    return `${fixedNum}%`;
  };

  const formatCurrency = (num: number) => {
    const fixedNum = num.toFixed(0);
    const formattedNum = Number(fixedNum).toLocaleString();
    if (num > 0) return `+${formattedNum} 원`;
    return `${formattedNum} 원`;
  };

  // 8. JSX 렌더링 (수정 없음, filteredData 기반으로 자동 업데이트됨)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">이탈 예측 및 가상 시나리오</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border p-4 rounded-lg bg-blue-50 shadow-md">
            <h3 className="font-semibold text-xl text-blue-700 mb-3">What-If 시뮬레이션</h3>
            
            <label htmlFor="simDays" className="text-sm text-gray-600 mb-2 block">
              방문 일수 조정: 
              <span className="font-bold text-blue-700 ml-2">{simulationDays}일</span>
            </label>
            <input 
              id="simDays"
              type="range" 
              className="w-full" 
              min="1" 
              max="15"
              step="1"
              value={simulationDays}
              onChange={(e) => setSimulationDays(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1일</span>
              <span>15일</span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-bold">
                예상 재구매율: 
                <span className="text-lg text-blue-800 ml-2">
                  {isLoading ? '...' : simulationStats.simulatedRate.toFixed(1)}%
                </span>
              </p>
              <p className="font-bold">
                재구매율 변화: 
                <span className={simulationStats.rateChange >= 0 ? "text-green-600" : "text-red-500"}>
                  {isLoading ? '...' : formatPercentage(simulationStats.rateChange)}
                </span>
              </p>
              <p className="font-bold">
                예상 매출 증감: 
                <span className={simulationStats.revenueChange >= 0 ? "text-green-600" : "text-red-500"}>
                  {isLoading ? '...' : formatCurrency(simulationStats.revenueChange)}
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 border p-4 rounded-lg bg-red-50 shadow-md">
            <h3 className="font-semibold text-xl text-red-700 mb-3">
              이탈 위험 고객 목록 (총 {churnRiskCustomers.length}명)
            </h3>
            
            {isLoading ? (
              <p className="text-gray-600">데이터 로딩 중...</p>
            ) : (
              <div className="overflow-auto max-h-80"> 
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">UID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">지역</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">나이</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-red-800 uppercase">5월 결제액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {churnRiskCustomers.slice(0, 100).map((customer) => (
                      <tr key={customer.uid}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.uid}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.region_city}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.age}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {Number(customer.total_payment_may).toLocaleString()} 원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-4">
              * (상위 100개 고객만 표시됩니다)
            </p>
          </div>
        </div>
        
        <div className="mt-8 border p-6 rounded-xl bg-yellow-50 shadow-md">
            <h3 className="font-semibold text-xl text-yellow-700 mb-3">마케팅 템플릿 추천 및 메모 (4.1.5)</h3>
            <p className="text-sm text-gray-600">
              인사이트 기반으로 "점심시간 1시간 무료 쿠폰" 등의 템플릿 추천 기능 구현 예정.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChurnPredictionPage;