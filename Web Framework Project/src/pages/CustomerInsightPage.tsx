// import React from 'react';

// const CustomerInsightPage: React.FC = () => (
//   <div className="p-6 max-w-7xl mx-auto">
//     <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">2. 고객 특성 분석 (지역/연령)</h1>
//     <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
//       <div className="flex justify-end mb-4">
//         <div className="p-2 border rounded-lg bg-gray-50">
//           <p className="text-sm font-medium">필터링 컴포넌트 위치</p>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="border p-4 rounded-lg bg-white shadow-md">
//           <h3 className="font-semibold text-lg mb-2">연령대별 평균 결제 및 체류 시간</h3>
//           <p className="text-sm text-gray-500">
//             *age_group 변수를 이용한 분석 시각화 예정*
//           </p>
//         </div>
        
//         <div className="border p-4 rounded-lg bg-white shadow-md">
//           <h3 className="font-semibold text-lg mb-2">지역별 고객 유지율 (Interactive Drill-Down 대상)</h3>
//           <p className="text-sm text-gray-500">
//             *region_city 변수를 기준으로 유지율 계산 및 BarChart 시각화 예정*
//             <br />
//             (4.1.6 차트 드릴다운 기능 구현)
//           </p>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default CustomerInsightPage;

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  ComposedChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';


const KOREAN_TO_ENGLISH_AGE_MAP: { [key: string]: string } = {
  '10대': 'Teens',
  '20대': 'Twenties',
  '30대': 'Thirties',
  '40대': 'Forties+',
  '50대': 'Fifties',
  '60대': 'Sixties',
  '기타': 'Others', 
};

const KOREAN_TO_ENGLISH_REGION_MAP: { [key: string]: string } = {
  '서울': 'Seoul',
  '경기': 'Gyeonggi-do',
  '인천': 'Incheon',
  '강원': 'Gangwon-do',
  '충남': 'Chungcheongnam-do',
  '충북': 'Chungcheongbuk-do',
  '대전': 'Daejeon',
  '세종': 'Sejong',
  '경남': 'Gyeongsangnam-do',
  '경북': 'Gyeongsangbuk-do',
  '부산': 'Busan',
  '울산': 'Ulsan',
  '대구': 'Daegu',
  '전남': 'Jeollanam-do',
  '전북': 'Jeollabuk-do',
  '광주': 'Gwangju',
  '제주': 'Jeju',
  '기타': 'Others', 
};

const ENGLISH_TO_KOREAN_AGE_MAP: { [key: string]: string } = {
  'Teens': '10대',
  'Twenties': '20대',
  'Thirties': '30대',
  'Forties': '40대',
  'Forties+': '40대', 
  'Fifties': '50대',
  'Sixties': '60대',
  'Others': '기타',
};
// -------------------------------------------------------------

interface CsvData {
  
  uid: string;
  region_city_group: string;
  region_city_group_no: string;
  region_city: string;
  age_group: string;
  age: string;
  visit_days: string;
  total_duration_min: string;
  avg_duration_min: string;
  total_payment_may: string;
  retained_june: string;
  retained_july: string;
  retained_august: string;
  retained_90: string;
}

const AGE_GROUP_ORDER: { [key: string]: number } = {
  'Teens': 1, 'Twenties': 2, 'Thirties': 3, 'Forties+eeeeeeee': 4,
  'Fifties': 5, 'Sixties': 6, 'Others': 7,
};

// [수정] CustomerInsightPage는 차트에서 한글을 써야 하므로, 영->한 맵은 유지합니다.
const KOREAN_REGION_MAP: { [key: string]: string } = {
  'Seoul': '서울', 'Gyeonggi-do': '경기', 'Incheon': '인천', 'Gangwon-do': '강원',
  'Chungcheongnam-do': '충남', 'Chungcheongbuk-do': '충북', 'Daejeon': '대전',
  'Sejong': '세종', 'Gyeongsangnam-do': '경남', 'Gyeongsangbuk-do': '경북',
  'Busan': '부산', 'Ulsan': '울산', 'Daegu': '대구', 'Jeollanam-do': '전남',
  'Jeollabuk-do': '전북', 'Gwangju': '광주', 'Jeju': '제주', 'Others': '기타',
};

interface CustomerInsightPageProps {
  selectedAgeGroups: string[]; // '10대', '20대' ...
  selectedRegions: string[];   // '서울', '경기' ...
}

const CustomerInsightPage: React.FC<CustomerInsightPageProps> = ({
  selectedAgeGroups,
  selectedRegions,
}) => {
  const [originalData, setOriginalData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CSV 로딩
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
          error: (err: any) => { console.error('CustomerInsight CSV 파싱 에러:', err); setIsLoading(false); },
        });
      })
      .catch((err) => { console.error('CustomerInsight 파일 읽기 에러:', err); setIsLoading(false); });
  }, []);

 //dashboardStats useMemo 훅
  const dashboardStats = useMemo(() => {
    if (isLoading || originalData.length === 0) {
      return { ageGroupStats: [], regionRetentionStats: [] };
    }

    // 1. 한글 -> 영어 키로 변환 (필터링용)
    const englishAgeGroups = selectedAgeGroups.map(age => KOREAN_TO_ENGLISH_AGE_MAP[age]).filter(Boolean);
    const englishRegions = selectedRegions.map(region => KOREAN_TO_ENGLISH_REGION_MAP[region]).filter(Boolean);

    // 2. 필터링 로직
    const filteredData = originalData.filter((c) => {
      // 3.  변환된 영어 키(englishAgeGroups)로 CSV 데이터(c.age_group)를 필터링
      if (
        englishAgeGroups.length > 0 &&
        !englishAgeGroups.includes(c.age_group || 'Others')
      ) {
        return false;
      }
      // 4.  변환된 영어 키(englishRegions)로 CSV 데이터(c.region_city_group)를 필터링
      if (
        englishRegions.length > 0 &&
        !englishRegions.includes(c.region_city_group || 'Others')
      ) {
        return false;
      }
      return true;
    });

    if (filteredData.length === 0) {
      return { ageGroupStats: [], regionRetentionStats: [] };
    }

    // 5. 이하 통계 집계 로직
    const ageStats: { [key: string]: { total: number; sumPayment: number; sumDuration: number } } = {};
    const regionStats: { [key: string]: { total: number; retained: number } } = {};

    //  ageStats 집계 로직 (단순화)
    filteredData.forEach((c) => {
      // 'Forties+' 강제 매핑 및 'Fifties' 등 Others 처리 로직 삭제
      let ageGroup = c.age_group || 'Others';
      const region = c.region_city_group || 'Others';
      const isRetained = c.retained_90 === '1';
      const payment = Number(c.total_payment_may) || 0;
      const duration = Number(c.total_duration_min) || 0;

      // (ageStats[ageGroup] 집계 로직은 동일)
      if (!ageStats[ageGroup]) { ageStats[ageGroup] = { total: 0, sumPayment: 0, sumDuration: 0 }; }
      ageStats[ageGroup].total++;
      ageStats[ageGroup].sumPayment += payment;
      ageStats[ageGroup].sumDuration += duration;

      // (regionStats[region] 집계 로직은 동일)
      if (!regionStats[region]) { regionStats[region] = { total: 0, retained: 0 }; }
      regionStats[region].total++;
      if (isRetained) { regionStats[region].retained++; }
    });
    //  ageStats 집계 로직

    // . ageGroupChartData 가공 로직 (한글 변환 추가)
    const ageGroupChartData = Object.entries(ageStats)
      .map(([name, data]) => ({
        name: name, // 1. 영어 이름 (Teens, Twenties, Forties...)
        '평균 결제 금액': data.total > 0 ? Math.round(data.sumPayment / data.total) : 0,
        '평균 체류 시간': data.total > 0 ? parseFloat((data.sumDuration / data.total).toFixed(1)) : 0,
      }))
      .sort((a, b) => (AGE_GROUP_ORDER[a.name] || 99) - (AGE_GROUP_ORDER[b.name] || 99)) // 2. 영어 이름 기준 정렬
      .map((item) => ({ // 3. 한글 ('10대', '20대', '40대'...)로 교체
        ...item,
        name: ENGLISH_TO_KOREAN_AGE_MAP[item.name] || item.name,
      }));
    //  ageGroupChartData 가공 로직

    // (regionRetentionChartData 가공 로직은 수정 없음)
    const regionRetentionChartData = Object.entries(regionStats)
      .map(([name, data]) => ({
        name: KOREAN_REGION_MAP[name] || name, // X축 라벨 (서울, 경기...)
        '유지율 (%)': data.total > 0 ? parseFloat(((data.retained / data.total) * 100).toFixed(1)) : 0,
        '고객 수': data.total,
      }))
      .sort((a, b) => b['고객 수'] - a['고객 수']);

    return {
      ageGroupStats: ageGroupChartData,
      regionRetentionStats: regionRetentionChartData
    };

  }, [originalData, isLoading, selectedAgeGroups, selectedRegions]); // (의존성 배열은 동일)
  const regionChartHeight = (dashboardStats.regionRetentionStats.length * 35) + 50;

  // 8. JSX 렌더링
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">고객 특성 분석 (지역/연령)</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 차트 1: 연령대별 */}
          <div className="border p-4 rounded-lg bg-white shadow-md">
            <h3 className="font-semibold text-lg mb-2">연령대별 평균 결제 및 체류 시간</h3>
            {isLoading ? ( <p className="text-sm text-gray-500">데이터 로딩 중...</p> ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <ComposedChart
                    data={dashboardStats.ageGroupStats}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#8884d8"
                      label={{ value: '평균 결제 금액 (원)', angle: -90, position: 'insideLeft', dx: -10 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#ff7300"
                      label={{ value: '평균 체류 시간 (분)', angle: 90, position: 'insideRight', dx: 10 }}
                    />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Legend />
                    <Bar dataKey="평균 결제 금액" fill="#8884d8" yAxisId="left" />
                    <Line
                      type="monotone"
                      dataKey="평균 체류 시간"
                      stroke="#ff7300"
                      strokeWidth={2}
                      yAxisId="right"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 차트 2: 지역별 고객 유지율  */}
          <div className="border p-4 rounded-lg bg-white shadow-md">
            <h3 className="font-semibold text-lg mb-2">지역별 고객 유지율</h3>
            {isLoading ? ( <p className="text-sm text-gray-500">데이터 로딩 중...</p> ) : (
              <div style={{ width: '100%', height: regionChartHeight }}>
                <ResponsiveContainer>
                  <BarChart
                    data={dashboardStats.regionRetentionStats}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="%" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name === '유지율 (%)') return [`${value}%`, '유지율'];
                        if (name === '고객 수') return [value.toLocaleString(), '고객 수'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="유지율 (%)" fill="#ffc658" />
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

export default CustomerInsightPage;