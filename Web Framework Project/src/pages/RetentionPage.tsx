import React, { useState, useEffect, useMemo } from 'react';
import { useUserConfig } from '../context/UserConfigContext';
import DataFilter from '../components/dashboard/DataFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CsvData {
  uid: string;
  visit_days: string;
  retained_90: string;
  region_city: string;
  age: string;
}

const RetentionPage: React.FC = () => {
  const { config } = useUserConfig();
  const [allData, setAllData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  // 1. 백엔드에서 전체 데이터 로드
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

  // 2. 전역 설정(config)이 변경되면 로컬 필터 초기화
  useEffect(() => {
    if (config.targetRegion && config.targetRegion !== '전체') {
      setSelectedRegions([config.targetRegion]);
    } else {
      setSelectedRegions([]); // 전체인 경우 모두 해제 (또는 전체 선택 로직)
    }

    if (config.targetAge && config.targetAge !== '전체') {
      setSelectedAges([config.targetAge]);
    } else {
      setSelectedAges([]);
    }
  }, [config]);

  // 3. 필터링 로직 (사이드바 체크박스 반영)
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(item.region_city);
      const ageMatch = selectedAges.length === 0 || selectedAges.includes(item.age);
      return regionMatch && ageMatch;
    });
  }, [allData, selectedRegions, selectedAges]);

  // 4. 차트 데이터 가공
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const groups: { [key: string]: { total: number, retained: number } } = {};
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

  const handleRegionChange = (region: string) => {
    setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  };

  const handleAgeChange = (age: string) => {
    setSelectedAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b pb-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">방문 빈도 및 재구매율 분석</h1>
        <div className="text-sm text-gray-600">
          <span className="mr-2">내 타겟 설정:</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {config.targetRegion} / {config.targetAge}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 사이드바 필터 */}
        <DataFilter 
          selectedRegions={selectedRegions}
          onRegionChange={handleRegionChange}
          selectedAges={selectedAges}
          onAgeChange={handleAgeChange}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-grow space-y-6 min-w-0">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex justify-between">
              <span>방문 일수별 재구매율</span>
              <span className="text-sm font-normal text-gray-500 self-center">표본 수: {filteredData.length.toLocaleString()}명</span>
            </h3>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center text-gray-400">데이터 로딩 중...</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '재구매율']} />
                    <Legend />
                    <Line type="monotone" dataKey="retentionRate" name="재구매율" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">방문 빈도별 고객 수 분포</h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">데이터 로딩 중...</div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()}명`, '고객 수']} />
                    <Legend />
                    <Bar dataKey="count" name="고객 수" fill="#93c5fd" />
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