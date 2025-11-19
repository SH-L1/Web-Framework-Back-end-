import React, { useState, useEffect, useMemo } from 'react';
import { useUserConfig } from '../context/UserConfigContext';
import DataFilter from '../components/dashboard/DataFilter';

interface CsvData {
  uid: string;
  region_city: string;
  age: string;
  visit_days: string;
  total_payment_may: string;
  retained_90: string;
}

interface MarketingAction {
  _id: string;
  content: string;
  createdAt: string;
}

const MARKETING_TEMPLATES = [
  { title: "점심시간 쿠폰", content: "고객님! 점심시간(12-13시) 방문 시 1시간 무료 쿠폰을 드립니다. 맛있는 식사와 게임을 즐겨보세요!" },
  { title: "주말 올나이트 할인", content: "이번 주말, 밤샘 게임 어떠세요? 심야 정액권 20% 할인 쿠폰을 보내드립니다." },
  { title: "장기 미방문 혜택", content: "오랜만에 뵙고 싶습니다! 지금 방문하시면 아메리카노 1잔 무료 쿠폰을 사용하실 수 있습니다." },
  { title: "신규 게임 출시 이벤트", content: "화제의 신작 게임! PC방에서 플레이하고 1시간 추가 충전 혜택을 받아가세요." }
];

const ChurnPredictionPage: React.FC = () => {
  const { config } = useUserConfig();
  const [allData, setAllData] = useState<CsvData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 로컬 필터
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  // 시뮬레이션 및 마케팅 상태
  const [simulationDays, setSimulationDays] = useState(15);
  const [marketingMemo, setMarketingMemo] = useState('');
  const [savedActions, setSavedActions] = useState<MarketingAction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dataRes, marketingRes] = await Promise.all([
          fetch('http://localhost:5000/api/customers/all'),
          fetch('http://localhost:5000/api/marketing')
        ]);

        if (!dataRes.ok) throw new Error('데이터 로드 실패');
        const data = await dataRes.json();
        setAllData(data);

        if (marketingRes.ok) {
          const actions = await marketingRes.json();
          setSavedActions(actions);
        }
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('알 수 없는 오류');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 설정값 연동
  useEffect(() => {
    if (config.targetRegion && config.targetRegion !== '전체') setSelectedRegions([config.targetRegion]);
    else setSelectedRegions([]);
    if (config.targetAge && config.targetAge !== '전체') setSelectedAges([config.targetAge]);
    else setSelectedAges([]);
  }, [config]);

  // 필터링
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(item.region_city);
      const ageMatch = selectedAges.length === 0 || selectedAges.includes(item.age);
      return regionMatch && ageMatch;
    });
  }, [allData, selectedRegions, selectedAges]);

  const churnRiskCustomerList = useMemo(() => {
    return filteredData.filter(c => c.retained_90 === '0');
  }, [filteredData]);

  // --- (이하 시뮬레이션 로직 및 핸들러는 기존과 동일하나 filteredData를 기반으로 계산) ---
  const handleRegionChange = (region: string) => setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
  const handleAgeChange = (age: string) => setSelectedAges(prev => prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]);

  const handleSaveMemo = async () => {
    if (!marketingMemo.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: marketingMemo }),
      });
      if (res.ok) {
        const newAction = await res.json();
        setSavedActions([newAction, ...savedActions]);
        setMarketingMemo('');
        alert('저장되었습니다.');
      }
    } catch (err) { console.error(err); alert('저장 실패'); }
  };

  // 시뮬레이션 계산용 통계 (filteredData 기준)
  const baselineStats = useMemo(() => {
    if (filteredData.length === 0) return { rate: 0, avgRevenuePerRetained: 0, totalCustomers: 0, baselineRetainedRevenue: 0 };
    const retainedCustomers = filteredData.filter(c => c.retained_90 === '1');
    const totalRetained = retainedCustomers.length;
    const totalCustomers = filteredData.length;
    const baselineRate = totalCustomers > 0 ? (totalRetained / totalCustomers) : 0;
    const retainedRevenue = retainedCustomers.reduce((sum, c) => sum + Number(c.total_payment_may), 0);
    const avgRevenuePerRetained = totalRetained > 0 ? (retainedRevenue / totalRetained) : 0;
    return { rate: baselineRate, avgRevenuePerRetained, totalCustomers, baselineRetainedRevenue: totalRetained * avgRevenuePerRetained };
  }, [filteredData]);

  // Anchor Points 계산
  const rateAnchorPoints = useMemo(() => {
    if (filteredData.length === 0) return [];
    // 간단하게 1일, 3일, 7일, 14일, 15일 이상 구간별 재구매율 계산
    const getRate = (min: number, max: number) => {
      const seg = filteredData.filter(c => {
        const d = Number(c.visit_days);
        return d >= min && d <= max;
      });
      if (seg.length === 0) return 0;
      const ret = seg.filter(c => c.retained_90 === '1').length;
      return ret / seg.length;
    };
    const p1 = getRate(1, 1);
    const p2 = getRate(2, 3) || p1;
    const p3 = getRate(4, 7) || p2;
    const p4 = getRate(8, 14) || p3;
    const p5 = getRate(15, 999) || p4;
    return [{day:1, rate:p1}, {day:3, rate:p2}, {day:7, rate:p3}, {day:14, rate:p4}, {day:15, rate:p5}];
  }, [filteredData]);

  const getInterpolatedRate = (days: number) => {
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
    return rateAnchorPoints[rateAnchorPoints.length-1].rate;
  };

  const simulationStats = useMemo(() => {
    const simulatedRate = getInterpolatedRate(simulationDays);
    const simulatedRetainedCount = baselineStats.totalCustomers * simulatedRate;
    const simulatedRevenue = simulatedRetainedCount * baselineStats.avgRevenuePerRetained;
    const rateChange = (simulatedRate - baselineStats.rate) * 100;
    const revenueChange = simulatedRevenue - baselineStats.baselineRetainedRevenue;
    return { rateChange, revenueChange, simulatedRate: simulatedRate * 100 };
  }, [simulationDays, baselineStats, rateAnchorPoints]);

  const formatPercentage = (num: number) => (num > 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`);
  const formatCurrency = (num: number) => (num > 0 ? `+${Number(num.toFixed(0)).toLocaleString()} 원` : `${Number(num.toFixed(0)).toLocaleString()} 원`);

  if (error) return <div className="p-6 text-red-600">에러: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b pb-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">이탈 예측 및 가상 시나리오</h1>
        <div className="text-sm text-gray-600">
          타겟: <span className="font-bold text-blue-600">{config.targetRegion} / {config.targetAge}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <DataFilter 
          selectedRegions={selectedRegions} onRegionChange={handleRegionChange}
          selectedAges={selectedAges} onAgeChange={handleAgeChange}
        />

        <div className="flex-grow space-y-6 min-w-0">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 시뮬레이션 패널 */}
              <div className="lg:col-span-1 border p-4 rounded-lg bg-blue-50 shadow-md">
                <h3 className="font-semibold text-xl text-blue-700 mb-3">What-If 시뮬레이션</h3>
                <label htmlFor="simDays" className="text-sm text-gray-600 mb-2 block">
                  방문 빈도(일) 목표 설정: <span className="font-bold text-blue-700 ml-2">{simulationDays}일</span>
                </label>
                <input id="simDays" type="range" className="w-full accent-blue-600" min="1" max="15" step="1" value={simulationDays} onChange={(e) => setSimulationDays(Number(e.target.value))} />
                <div className="flex justify-between text-xs text-gray-500 mb-4"><span>1일</span><span>15일</span></div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>현재 예상 재구매율:</span> <span className="font-bold">{baselineStats.rate > 0 ? (baselineStats.rate * 100).toFixed(1) : 0}%</span></div>
                  <div className="flex justify-between"><span>목표 달성 시 재구매율:</span> <span className="font-bold text-blue-800">{isLoading ? '...' : simulationStats.simulatedRate.toFixed(1)}%</span></div>
                  <div className="border-t pt-2 mt-2">
                     <p className="font-bold">변화율: <span className={simulationStats.rateChange >= 0 ? "text-green-600" : "text-red-500"}>{formatPercentage(simulationStats.rateChange)}</span></p>
                     <p className="font-bold">예상 매출 효과: <span className={simulationStats.revenueChange >= 0 ? "text-green-600" : "text-red-500"}>{formatCurrency(simulationStats.revenueChange)}</span></p>
                  </div>
                </div>
              </div>

              {/* 위험 고객 목록 */}
              <div className="lg:col-span-2 border p-4 rounded-lg bg-red-50 shadow-md flex flex-col h-96">
                <h3 className="font-semibold text-xl text-red-700 mb-2">이탈 위험 고객 ({churnRiskCustomerList.length}명)</h3>
                <div className="overflow-auto flex-grow bg-white rounded border border-red-100">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-red-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-red-800">UID</th>
                        <th className="px-3 py-2 text-left font-medium text-red-800">지역</th>
                        <th className="px-3 py-2 text-left font-medium text-red-800">나이</th>
                        <th className="px-3 py-2 text-left font-medium text-red-800">5월 결제액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {churnRiskCustomerList.slice(0, 50).map((c) => (
                        <tr key={c.uid}>
                          <td className="px-3 py-2">{c.uid}</td>
                          <td className="px-3 py-2">{c.region_city}</td>
                          <td className="px-3 py-2">{c.age}</td>
                          <td className="px-3 py-2">{Number(c.total_payment_may).toLocaleString()}</td>
                        </tr>
                      ))}
                      {churnRiskCustomerList.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-500">조건에 맞는 위험 고객이 없습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 마케팅 템플릿 섹션 (기존과 동일, 레이아웃만 조정) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 p-6 rounded-xl border shadow-md">
              <h3 className="font-bold text-yellow-800 mb-4">추천 마케팅 템플릿</h3>
              <div className="space-y-2">
                {MARKETING_TEMPLATES.map((t, i) => (
                  <div key={i} onClick={() => setMarketingMemo(t.content)} className="bg-white p-3 rounded border border-yellow-200 hover:bg-yellow-100 cursor-pointer">
                    <div className="font-bold text-yellow-900 text-xs">{t.title}</div>
                    <div className="text-xs text-gray-600 truncate">{t.content}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-md flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4">실행 메모</h3>
              <textarea className="flex-grow border rounded p-2 text-sm mb-2" rows={3} value={marketingMemo} onChange={e => setMarketingMemo(e.target.value)} placeholder="내용을 입력하세요..." />
              <button onClick={handleSaveMemo} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm mb-4">저장</button>
              <div className="flex-grow overflow-y-auto h-32 border-t pt-2">
                {savedActions.map(a => (
                  <div key={a._id} className="text-xs border-b py-1 text-gray-600">{a.content}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurnPredictionPage;