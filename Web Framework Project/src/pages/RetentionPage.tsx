import React, { useState, useEffect, useMemo } from 'react';
import { useUserConfig } from '../context/UserConfigContext';
import DataFilter, { REGION_MAP } from '../components/dashboard/DataFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CsvData {
  uid: string;
  region_city_group: string;
  visit_days: string;
  retained_90: string;
  age: string;
}

const RetentionPage: React.FC = () => {
  const { config } = useUserConfig();
  const [allData, setAllData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rate' | 'count'>('rate'); // 탭 상태 추가

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/customers/all`);
        const result = await response.json();
        setAllData(result);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (config.targetRegion && config.targetRegion !== '전체') setSelectedRegions([config.targetRegion]);
    else setSelectedRegions([]);
    if (config.targetAge && config.targetAge !== '전체') setSelectedAges([config.targetAge]);
    else setSelectedAges([]);
  }, [config]);

  // 필터링 로직
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const itemRegion = (item.region_city_group || '').trim();
      
      let itemAgeGroup = '';
      const ageNum = parseInt(item.age);
      if (!isNaN(ageNum)) {
        if (ageNum >= 10 && ageNum < 20) itemAgeGroup = '10s';
        else if (ageNum >= 20 && ageNum < 30) itemAgeGroup = '20s';
        else if (ageNum >= 30 && ageNum < 40) itemAgeGroup = '30s';
        else if (ageNum >= 40 && ageNum < 50) itemAgeGroup = '40s';
        else if (ageNum >= 50) itemAgeGroup = '50s';
      }

      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(itemRegion);
      const ageMatch = selectedAges.length === 0 || selectedAges.includes(itemAgeGroup);
      
      return regionMatch && ageMatch;
    });
  }, [allData, selectedRegions, selectedAges]);

  // 차트 데이터 가공
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const groups: { [key: string]: { total: number, retained: number } } = {};
    // 1일부터 10일까지, 그리고 11일 이상으로 그룹화
    for (let i = 1; i <= 10; i++) groups[`${i}일`] = { total: 0, retained: 0 };
    groups['11일+'] = { total: 0, retained: 0 };

    filteredData.forEach(row => {
      const visits = Number(row.visit_days);
      const retained = row.retained_90 === '1';
      let key = visits >= 11 ? '11일+' : `${visits}일`;
      if (groups[key]) {
        groups[key].total += 1;
        if (retained) groups[key].retained += 1;
      }
    });
    return Object.keys(groups).map(key => ({
      name: key,
      retentionRate: groups[key].total > 0 ? (groups[key].retained / groups[key].total) * 100 : 0,
      count: groups[key].total
    }));
  }, [filteredData]);

  // 자동 인사이트 생성
  const insightText = useMemo(() => {
    if (filteredData.length === 0) return "데이터가 없습니다.";

    if (activeTab === 'rate') {
      // 재구매율이 가장 높은 구간 찾기
      const bestRate = [...chartData].sort((a, b) => b.retentionRate - a.retentionRate)[0];
      if (!bestRate) return "데이터가 충분하지 않습니다.";
      return `분석 결과, 방문 빈도가 '${bestRate.name}'인 고객군의 재구매율이 약 ${bestRate.retentionRate.toFixed(1)}%로 가장 높습니다. 꾸준한 방문을 유도하는 것이 중요합니다.`;
    } else {
      // 고객 수가 가장 많은 구간 찾기
      const mostCount = [...chartData].sort((a, b) => b.count - a.count)[0];
      if (!mostCount) return "데이터가 충분하지 않습니다.";
      return `현재 가장 많은 고객이 분포한 구간은 방문 빈도 '${mostCount.name}'입니다 (${mostCount.count.toLocaleString()}명). 이들을 상위 방문 구간으로 이동시키기 위한 전략이 필요합니다.`;
    }
  }, [activeTab, chartData, filteredData.length]);

  const handleRegionChange = (region: string) => setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  const handleAgeChange = (age: string) => setSelectedAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b pb-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">방문 빈도 및 재구매율 분석</h1>
        <div className="text-sm text-gray-600">
          타겟 설정: <span className="font-bold text-blue-600">
            {config.targetRegion === '전체' ? '전국' : REGION_MAP[config.targetRegion] || config.targetRegion} / {config.targetAge.replace('s', '대')}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <DataFilter 
          selectedRegions={selectedRegions} onRegionChange={handleRegionChange}
          selectedAges={selectedAges} onAgeChange={handleAgeChange}
        />
        
        <div className="flex-grow min-w-0">
          {/* 탭 버튼 */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab('rate')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'rate' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
            >
              방문 일수별 재구매율
            </button>
            <button
              onClick={() => setActiveTab('count')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'count' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
            >
              방문 빈도별 고객 수
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex justify-between items-center">
              <span>{activeTab === 'rate' ? '방문 일수별 재구매율 추이' : '방문 빈도별 고객 분포'}</span>
              <span className="text-sm font-normal text-gray-500">표본 수: {filteredData.length.toLocaleString()}명</span>
            </h3>
            
            {/* 그래프 영역 */}
            {isLoading ? (
              <div className="h-96 flex justify-center items-center text-gray-400">데이터 로딩 중...</div>
            ) : (
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'rate' ? (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '재구매율']} 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="retentionRate" name="재구매율" stroke="#2563eb" strokeWidth={4} activeDot={{ r: 8 }} dot={{r: 4}} />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString()}명`, '고객 수']} 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                      />
                      <Legend />
                      <Bar dataKey="count" name="고객 수" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* 인사이트 영역 */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">분석 인사이트</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">{insightText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetentionPage;