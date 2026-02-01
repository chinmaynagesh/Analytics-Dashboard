import { useState, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, Plus, Wifi, WifiOff } from 'lucide-react';
import { useDashboardStream } from '../api/solarApi';

export function Dashboard() {
  const { data, error, isConnected } = useDashboardStream();
  
  // Extract data from stream
  const plants = data?.plants || [];
  const kpis = data?.kpis || {};
  
  // Find the plant with the soonest cleaning date
  const nextCleaningPlant = plants.length > 0 
    ? plants.reduce((min, plant) => {
        const daysLeft = parseInt(plant.daysLeft) || 999;
        const minDays = parseInt(min.daysLeft) || 999;
        return daysLeft < minDays ? plant : min;
      }, plants[0])
    : null;

  return (
    <div className="min-h-screen bg-[#e8e8ea]">
      {/* Header */}
      <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl text-[#1a1a1f]">Dashboard</h1>
            {/* Connection Status Indicator */}
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
          <button className="px-4 py-2 bg-[#1a1a1f] text-white rounded-lg text-sm hover:bg-[#2a2a35] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Plant
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Loading State */}
        {!data && !error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#e87722] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#6b7280]">Connecting to solar monitoring system...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Connection error. Make sure the backend server is running on port 3001.</p>
          </div>
        )}

        {/* Company KPIs */}
        {data && (
          <>
            <div className="mb-6">
              <h2 className="text-lg text-[#1a1a1f] mb-4">Company KPIs</h2>
              <div className="grid grid-cols-3 gap-4">
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

                {/* Next cleaning */}
                <div className="bg-white rounded-lg p-4 border border-[#e5e7eb]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6b7280]">🗓️ Next cleaning</span>
                    <HelpCircle className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                  <div className="text-lg font-semibold text-[#1a1a1f] mb-1">
                    {nextCleaningPlant?.name || 'Sunfield Alpha'}
                  </div>
                  <div className="text-xs text-[#6b7280]">{kpis.nextCleaning || '—'}</div>
                  <div className="text-xs text-[#6b7280]">Last cleaned: {kpis.lastCleaned || '—'}</div>
                </div>
              </div>
            </div>

            {/* Plants Overview */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
                <h2 className="text-lg text-[#1a1a1f]">Plants Overview</h2>
                <div className="text-xs text-[#6b7280]">
                  Active Plants: {kpis.activePlants || plants.length} | System Efficiency: {kpis.avgSystemEfficiency || '—'}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Plant Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Avg PR
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Production
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Soiling
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                        Next Cleaning Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    {plants.map((plant, index) => (
                      <tr key={plant.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-[#1a1a1f]">{plant.name}</div>
                          <div className="text-xs text-[#6b7280]">{plant.location} • {plant.capacity}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#1a1a1f] transition-all duration-300">
                          {plant.avgPR}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1a1a1f] transition-all duration-300">{plant.production}</div>
                          <div className="text-xs text-[#6b7280]">{plant.productionUnit}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1a1a1f] transition-all duration-300">{plant.revenue}K</div>
                          <div className="text-xs text-[#6b7280]">{plant.revenueUnit}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#1a1a1f] transition-all duration-300">
                          <span className={parseFloat(plant.soiling) > 10 ? 'text-orange-600 font-medium' : ''}>
                            {plant.soiling}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1a1a1f]">{plant.nextCleaning}</div>
                          <div className="text-xs text-[#6b7280]">{plant.daysLeft}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
                <div className="text-sm text-[#6b7280]">
                  Showing 1-{plants.length} of {plants.length} plants
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-1 hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-[#1a1a1f] text-white rounded-lg text-sm">1</button>
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] hover:bg-gray-50">2</button>
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] hover:bg-gray-50">3</button>
                  <span className="px-2 text-[#6b7280]">...</span>
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-1 hover:bg-gray-50">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
