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

// 1. useState와 useEffect를 import 해줘
import React, { useState, useEffect } from 'react';
// 2. papaparse import (설치 안 했으면 npm install papaparse)
import Papa from 'papaparse';

// 3. (옵션) CSV 데이터의 타입을 정의해두면 좋아 (TypeScript니까!)
// data.csv 헤더 보고 네가 맞게 수정해야 돼
interface CsvData {
  uid: string;
  region_city: string;
  age: string;
  total_payment_may: string;
  retained_90: string; // 이탈 여부 (이탈했다면 '0'이겠지?)
  // ... (data.csv에 있는 나머지 컬럼들)
}

const ChurnPredictionPage: React.FC = () => {
  // 4. CSV 데이터를 저장할 state (초기값은 빈 배열)
  const [customerData, setCustomerData] = useState<CsvData[]>([]);
  // 5. (옵션) 로딩 중인지 표시할 state
  const [isLoading, setIsLoading] = useState(true);

  // 6. 컴포넌트가 처음 뜰 때 CSV 데이터 불러오는 로직
  useEffect(() => {
    const csvFilePath = '/data.csv'; 

    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true, 
          skipEmptyLines: true, 
          
          // ▼▼▼▼▼ 바로 여기! ▼▼▼▼▼
          complete: (results: Papa.ParseResult<CsvData>) => { 
            
            // =======================================================
            // [데이터 검증 코드] - F12 (개발자 도구) 콘솔 탭에서 확인!
            // =======================================================
            console.log('--- [PAPA PARSE 검증 시작] ---');
            console.log(`CSV 원본 총 줄 수 (헤더 포함): 22,479`);
            console.log('[PAPA] 파싱된 데이터 개수 (헤더 제외):', results.data.length);
            console.log('[PAPA] 파싱 에러 목록 (이게 빈 배열[]이면 베스트):', results.errors);
            console.log('[PAPA] 인식된 CSV 헤더 (컬럼명):', results.meta.fields);
            console.log('--- [PAPA PARSE 검증 끝] ---');
            // =======================================================

            // (원래 있던 코드)
            setCustomerData(results.data); 
            setIsLoading(false); 
          },
          // ▲▲▲▲▲ 여기까지 ▲▲▲▲▲

          error: (error: any) => { 
            console.error('CSV 파싱 에러:', error);
            setIsLoading(false); 
          },
        });
      })
      .catch((err) => {
        console.error('파일 읽기 에러:', err);
        setIsLoading(false);
      });
  }, []);

  // 8. (예시) 이탈 위험 고객만 필터링 (retained_90이 '0'인 경우)
  const churnRiskCustomers = customerData.filter(
    (customer) => customer.retained_90 === '0'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">3. 이탈 예측 및 가상 시나리오</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-[400px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ... (What-If 시뮬레이션 부분은 그대로) ... */}
          <div className="lg:col-span-1 border p-4 rounded-lg bg-blue-50 shadow-md">
            <h3 className="font-semibold text-xl text-blue-700 mb-3">What-If 시뮬레이션</h3>
            <p className="text-sm text-gray-600 mb-2">평균 방문 일수 조정:</p>
            <input type="range" className="w-full" min="1" max="30" defaultValue="15" />
            <p className="mt-4 font-bold">예상 재구매율 변화: <span className="text-red-500">+X%</span></p>
            <p className="font-bold">예상 매출 증감: <span className="text-red-500">+W,XXX,XXX 원</span></p>
          </div>

          {/* 9. '이탈 위험 고객 목록' 부분 수정! */}
          <div className="lg:col-span-2 border p-4 rounded-lg bg-red-50 shadow-md">
            <h3 className="font-semibold text-xl text-red-700 mb-3">
              이탈 위험 고객 목록 (총 {churnRiskCustomers.length}명)
            </h3>
            
            {isLoading ? (
              <p className="text-gray-600">데이터 로딩 중...</p>
            ) : (
              // 10. (예시) 여기에 테이블 컴포넌트 넣기
              // Tailwind CSS로 간단한 테이블 예시
              <div className="overflow-auto max-h-80"> {/* 테이블 스크롤 */}
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
                    {churnRiskCustomers.slice(0, 100).map((customer) => ( // 너무 많으면 느려지니 100개만
                      <tr key={customer.uid}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.uid}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.region_city}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.age}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {/* 5월 결제액은 숫자로 변환해서 콤마 찍어주기 */}
                          {Number(customer.total_payment_may).toLocaleString()} 원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-4">
               *분류된 고객 정보를 테이블 컴포넌트에 전달하여 한눈에 볼 수 있도록 테이블 생성*
               <br />
               (4.1.6 세그먼트 내보내기 기능 구현)
             </p>
          </div>
        </div>
        
        {/* ... (마케팅 템플릿 부분은 그대로) ... */}
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