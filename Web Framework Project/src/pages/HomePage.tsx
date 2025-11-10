import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { PAGES } from '../config/navigation';
import { PageKey } from '../config/navigation'; 

interface CsvData {
  retained_90: string; 
}

interface HomePageProps {
  onNavigate: (page: PageKey) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [customerData, setCustomerData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const csvFilePath = '/data.csv'; 

    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true, 
          skipEmptyLines: true, 
          complete: (results: Papa.ParseResult<CsvData>) => { 
            setCustomerData(results.data); 
            setIsLoading(false); 
          },
          error: (error: any) => { 
            console.error('HomePage CSV 파싱 에러:', error);
            setIsLoading(false); 
          },
        });
      })
      .catch((err) => {
        console.error('HomePage 파일 읽기 에러:', err);
        setIsLoading(false);
      });
  }, []); 

  const churnRiskCustomersCount = useMemo(() => {
    return customerData.filter(
      (customer) => customer.retained_90 === '0'
    ).length;
  }, [customerData]); 

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">PC방 고객 인사이트 대시보드</h1>
      <p className="text-lg text-gray-600 mb-6">
        데이터 기반의 효율적 고객 관리와 맞춤 마케팅 전략 수립을 위한 핵심 도구입니다.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        
        {PAGES.map(page => (
          <div 
            key={page.key}
            className={`
              p-5 border border-gray-200 rounded-lg shadow-sm h-full
              transition-all hover:shadow-md cursor-pointer
              flex flex-col
              ${page.key === 'Retention' ? 'bg-green-50 hover:bg-green-100' : ''}
              ${page.key === 'Customer' ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
              ${page.key === 'Churn' ? 'bg-red-50 hover:bg-red-100' : ''}
            `}
            onClick={() => onNavigate(page.key as PageKey)}
          >
            <div className="flex items-center mb-3">
              <page.icon className={`
                w-8 h-8 mr-3 shrink-0
                ${page.key === 'Retention' ? 'text-green-700' : ''}
                ${page.key === 'Customer' ? 'text-yellow-700' : ''}
                ${page.key === 'Churn' ? 'text-red-700' : ''}
              `} />
              <h3 className={`
                text-xl font-semibold
                ${page.key === 'Retention' ? 'text-green-800' : ''}
                ${page.key === 'Customer' ? 'text-yellow-800' : ''}
                ${page.key === 'Churn' ? 'text-red-800' : ''}
              `}>
                {page.name}
              </h3>
            </div>

            {page.key === 'Retention' && (
              <>
                <p className="text-sm text-gray-700 mt-2 mb-4 flex-grow"> 
                  방문 빈도가 높을수록 재구매율이 급격히 상승합니다.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center">
                    <span className="text-xs w-12 shrink-0">1일 방문</span>
                    <div className="h-4 bg-green-200 rounded" style={{ width: '20%' }} title="낮음"></div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12 shrink-0">4-7일</span>
                    <div className="h-4 bg-green-300 rounded" style={{ width: '45%' }} title="중간"></div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12 shrink-0">15일+</span>
                    <div className="h-4 bg-green-500 rounded" style={{ width: '80%' }} title="높음"></div>
                  </div>
                </div>
              </>
            )}

            {page.key === 'Customer' && (
              <>
                <p className="text-sm text-gray-700 mt-2 mb-4 flex-grow">
                  '20대' 연령층이 평균 결제 금액과 체류 시간 모두 가장 높게 나타납니다.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center" title="20대 (매우 높음)">
                    <span className="text-xs w-12 shrink-0">20대</span>
                    <div className="h-4 bg-yellow-500 rounded" style={{ width: '90%' }}></div>
                  </div>
                  <div className="flex items-center" title="30대 (중간)">
                    <span className="text-xs w-12 shrink-0">30대</span>
                    <div className="h-4 bg-yellow-300 rounded" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex items-center" title="10대 (중간)">
                    <span className="text-xs w-12 shrink-0">10대</span>
                    <div className="h-4 bg-yellow-300 rounded" style={{ width: '55%' }}></div>
                  </div>
                   <div className="flex items-center" title="40대+ (낮음)">
                    <span className="text-xs w-12 shrink-0">40대+</span>
                    <div className="h-4 bg-yellow-200 rounded" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </>
            )}

            {page.key === 'Churn' && (
              <>
                <p className="text-sm text-gray-700 mt-2 mb-4 flex-grow">
                  선제적 관리가 필요한 '이탈 위험군' 고객 목록을 즉시 확인할 수 있습니다.
                </p>
                <div className="mt-3 p-3 bg-white rounded shadow-inner text-center">
                  <p className="text-sm text-gray-700">분석된 위험 고객</p>
                  <p className="text-3xl font-bold text-red-600">
                    {isLoading ? '...' : churnRiskCustomersCount.toLocaleString()} 명
                  </p>
                  <p className="text-xs text-gray-500">(상세 목록 확인)</p>
                </div>
              </>
            )}

          </div>
        ))}
      </div>
      
    </div>
  );
};

export default HomePage;