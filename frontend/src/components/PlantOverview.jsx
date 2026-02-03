import { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HelpCircle, ChevronDown, Wifi, WifiOff, Download } from 'lucide-react';
import { usePlantStream, fetchPerformanceRatioData } from '../api/solarApi';

export function PlantOverview({ plantId = 1, plantName = "Sunfield Alpha", plantLocation = "Arizona, USA", onExportPDF }) {
  const { data, error, isConnected } = usePlantStream(plantId);
  
  // Extract data from stream
  const plant = data?.plant || {};
  const kpis = data?.kpis || {};
  const powerChartData = data?.powerChart || [];
  const [prData, setPrData] = useState([]);
  
  // Fetch PR data separately (or use from stream if available)
  useEffect(() => {
    async function fetchPRData() {
      try {
        const data = await fetchPerformanceRatioData();
        setPrData(data);
      } catch (err) {
        console.error('Failed to fetch PR data:', err);
      }
    }
    fetchPRData();
    // Refresh PR data periodically
    const interval = setInterval(fetchPRData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#e8e8ea]">
      {/* Header */}
      <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl text-[#1a1a1f]">Plant Overview</h1>
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6b7280]">{plant.name || plantName} • {plant.location || plantLocation}</span>
            <button 
              onClick={() => onExportPDF && onExportPDF({ 
                plant: { name: plant.name || plantName, location: plant.location || plantLocation },
                kpis,
                powerChartData
              })}
              disabled={!data}
              className="px-4 py-2 bg-white border border-[#e5e7eb] text-[#1a1a1f] rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="px-4 py-2 bg-[#e87722] text-white rounded-lg text-sm hover:bg-[#d66815] transition-colors">
              Maintenance
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Loading State */}
        {!data && !error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#e87722] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#6b7280]">Loading plant data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Connection error. Make sure the backend server is running on port 3001.</p>
          </div>
        )}

        {data && (
          <>
            {/* Plant KPIs */}
            <div className="mb-6">
              <h2 className="text-lg text-[#1a1a1f] mb-4">Plant KPIs</h2>
              <div className="grid grid-cols-5 gap-4">
                {/* Avg P.R */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">⚡ Avg P.R</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className="text-2xl font-semibold text-[#1a1a1f] mb-1 transition-all duration-300">
                    {kpis.avgPR || '—'}
                  </div>
                  <div className="text-xs text-[#6b7280]">Expected: 88.1 / 103.9</div>
                </div>

                {/* Total Production */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">⚡ Total Production</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className="text-2xl font-semibold text-[#1a1a1f] mb-1 transition-all duration-300">
                    {kpis.totalProduction || '—'}
                    <span className="text-sm text-[#6b7280] ml-1">{kpis.totalProductionUnit || 'kWh'}</span>
                  </div>
                  <div className="text-xs text-[#6b7280]">Expected: 20000 kWh / 1.25.33</div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">💰 Total Revenue</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className="text-2xl font-semibold text-[#1a1a1f] mb-1 transition-all duration-300">
                    {kpis.totalRevenue || '—'}
                    <span className="text-sm text-[#6b7280] ml-1">{kpis.totalRevenueUnit || '$USD'}</span>
                  </div>
                  <div className="text-xs text-[#6b7280]">Expected: 1.48 $USD / 1.10.22</div>
                </div>

                {/* Avg Soiling */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">💧 Avg Soiling</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className={`text-2xl font-semibold mb-1 transition-all duration-300 ${
                    parseFloat(kpis.avgSoiling) > 10 ? 'text-orange-600' : 'text-[#1a1a1f]'
                  }`}>
                    {kpis.avgSoiling || '—'}
                  </div>
                  <div className="text-xs text-[#6b7280]">Latest updated: {kpis.latestSoilingUpdate || '—'}</div>
                </div>

                {/* Next cleaning */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">🗓️ Next cleaning</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className="text-lg font-semibold text-[#1a1a1f] mb-1">{kpis.nextCleaning || '—'}</div>
                  <div className="text-xs text-[#6b7280]">{plant.name || plantName}</div>
                  <div className="text-xs text-[#6b7280]">Last cleaned: {kpis.latestSoilingUpdate || '—'}</div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="bg-white rounded-lg p-6 border border-[#e5e7eb]">
              <div className="flex items-center gap-4 mb-6 border-b border-[#e5e7eb]">
                <button className="px-4 py-2 text-sm font-medium text-[#1a1a1f] border-b-2 border-[#1a1a1f]">
                  Performance
                </button>
                <button className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#1a1a1f]">
                  Energy Loss
                </button>
              </div>

              {/* Actual vs Expected Power */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1a1a1f]">📊 Actual vs Expected Power</span>
                  </div>
                  <button className="px-3 py-1.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb] text-xs text-[#1a1a1f] flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#e87722]" />
                      <span className="text-xs text-[#6b7280]">Actual Power</span>
                    </div>
                    <div className="text-2xl font-semibold text-[#1a1a1f] transition-all duration-300">
                      {kpis.actualPower || '—'} <span className="text-sm text-[#6b7280] font-normal">kWh</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full border-2 border-[#1a1a1f]" style={{ borderStyle: 'dashed' }} />
                      <span className="text-xs text-[#6b7280]">Expected Power</span>
                    </div>
                    <div className="text-2xl font-semibold text-[#1a1a1f] transition-all duration-300">
                      {kpis.expectedPower || '—'} <span className="text-sm text-[#6b7280] font-normal">kWh</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-2">
                      Daily <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', height: '200px', minWidth: 0, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={powerChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e87722" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e87722" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: 'Power (kWh)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#e87722"
                        strokeWidth={2}
                        fill="url(#colorActual)"
                        name="Actual Power"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expected"
                        stroke="#1a1a1f"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Expected Power"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Ratio Analysis */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1a1a1f]">📈 Performance Ratio Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-[#f9fafb] rounded-lg border border-[#e5e7eb] text-xs text-[#1a1a1f] flex items-center gap-2">
                      <HelpCircle className="w-3 h-3" />
                    </button>
                    <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-2">
                      Monthly <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', height: '200px', minWidth: 0, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={prData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[80, 110]}
                        label={{ value: 'Power (%)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line type="monotone" dataKey="line1" stroke="#e87722" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="line2" stroke="#d4a574" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="line3" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="line4" stroke="#1a1a1f" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
