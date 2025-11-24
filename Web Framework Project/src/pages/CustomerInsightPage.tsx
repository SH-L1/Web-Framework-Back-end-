import React, { useState, useEffect, useMemo } from 'react';
import { useUserConfig } from '../context/UserConfigContext';
import DataFilter, { REGION_MAP } from '../components/dashboard/DataFilter';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface CsvData {
  uid: string;
  region_city_group: string; // ★ 핵심: 도/광역시 정보
  region_city: string;
  age: string;
  total_payment_may: string;
}

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'];

const CustomerInsightPage: React.FC = () => {
  const { config } = useUserConfig();
  const [allData, setAllData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'region' | 'age'>('region');

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

  // ★ 필터링 로직 수정
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const itemRegion = (item.region_city_group || '').trim(); // 'Gyeonggi-do'
      
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

  // ★ 지역 데이터 집계 (region_city_group 기준)
  const regionData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    filteredData.forEach(d => {
      // 도/광역시 기준으로 집계 (예: 'Gyeonggi-do')
      const r = d.region_city_group ? d.region_city_group.trim() : 'Unknown';
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ 
        originalKey: key,
        name: REGION_MAP[key] || key, // 'Gyeonggi-do' -> '경기'로 변환
        value: counts[key] 
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // 연령 데이터 집계
  const ageData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    filteredData.forEach(d => {
      const ageNum = parseInt(d.age);
      let group = '기타';
      if (!isNaN(ageNum)) {
        if (ageNum < 20) group = '10대';
        else if (ageNum < 30) group = '20대';
        else if (ageNum < 40) group = '30대';
        else if (ageNum < 50) group = '40대';
        else group = '50대 이상';
      }
      counts[group] = (counts[group] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const insightText = useMemo(() => {
    if (filteredData.length === 0) return "조건에 맞는 데이터가 없습니다.";
    
    if (activeTab === 'region') {
      if (regionData.length === 0) return "지역 정보가 없습니다.";
      const topRegion = regionData[0];
      const ratio = ((topRegion.value / filteredData.length) * 100).toFixed(1);
      return `현재 필터 조건에서 가장 많은 고객이 거주하는 지역은 '${topRegion.name}'이며, 전체의 약 ${ratio}%를 차지합니다.`;
    } else {
      if (ageData.length === 0) return "연령 정보가 없습니다.";
      const topAge = ageData[0];
      const ratio = ((topAge.value / filteredData.length) * 100).toFixed(1);
      return `주요 고객층은 '${topAge.name}'로 확인됩니다 (전체의 ${ratio}%). ${topAge.name} 맞춤형 전략이 유효할 수 있습니다.`;
    }
  }, [activeTab, filteredData.length, regionData, ageData]);

  const handleRegionChange = (region: string) => setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  const handleAgeChange = (age: string) => setSelectedAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b pb-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">고객 특성 분석</h1>
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
          <div className="flex space-x-2 mb-4">
            <button onClick={() => setActiveTab('region')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'region' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>지역별 분포</button>
            <button onClick={() => setActiveTab('age')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'age' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>연령별 분포</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'region' ? '지역별 고객 수 (상위순)' : '연령대별 고객 수 (상위순)'}
            </h3>
            
            {isLoading ? (
              <div className="h-96 flex justify-center items-center text-gray-400">데이터 로딩 중...</div>
            ) : (
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={activeTab === 'region' ? regionData : ageData} 
                    layout="vertical" 
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={60} 
                      tick={{fontSize: 14, fontWeight: 600, fill: '#4b5563'}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f3f4f6'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      {(activeTab === 'region' ? regionData : ageData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">데이터 인사이트</h4>
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

export default CustomerInsightPage;