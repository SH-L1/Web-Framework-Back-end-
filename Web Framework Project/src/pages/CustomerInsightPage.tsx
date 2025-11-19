import React, { useState, useEffect, useMemo } from 'react';
import { useUserConfig } from '../context/UserConfigContext';
import DataFilter from '../components/dashboard/DataFilter';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface CsvData {
  uid: string;
  region_city: string;
  age: string;
  total_payment_may: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomerInsightPage: React.FC = () => {
  const { config } = useUserConfig();
  const [allData, setAllData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(item.region_city);
      const ageMatch = selectedAges.length === 0 || selectedAges.includes(item.age);
      return regionMatch && ageMatch;
    });
  }, [allData, selectedRegions, selectedAges]);

  const regionData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    filteredData.forEach(d => {
      const r = d.region_city || 'Unknown';
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredData]);

  const ageData = useMemo(() => {
    const counts: {[key: string]: number} = {};
    filteredData.forEach(d => {
      const a = d.age || 'Unknown';
      counts[a] = (counts[a] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
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
        <h1 className="text-3xl font-bold text-gray-800">고객 특성 분석</h1>
        <div className="text-sm text-gray-600">
          타겟: <span className="font-bold text-blue-600">{config.targetRegion} / {config.targetAge}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <DataFilter 
          selectedRegions={selectedRegions} onRegionChange={handleRegionChange}
          selectedAges={selectedAges} onAgeChange={handleAgeChange}
        />
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">선택된 그룹 내 지역 분포</h3>
            {isLoading ? <div className="h-64 flex justify-center items-center">로딩 중...</div> : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData} cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80} fill="#8884d8" dataKey="value"
                    >
                      {regionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">선택된 그룹 내 연령 분포</h3>
            {isLoading ? <div className="h-64 flex justify-center items-center">로딩 중...</div> : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={50} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="고객 수" fill="#ff8042" />
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