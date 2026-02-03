export function DashboardPDFContent({ plants = [], kpis = {} }) {
  // Calculate production distribution
  const totalProduction = plants.reduce((sum, plant) => {
    const prod = parseFloat(plant.production) || 0;
    return sum + prod;
  }, 0);

  const plantDistribution = plants.map(plant => ({
    name: plant.name,
    production: parseFloat(plant.production) || 0,
    percentage: totalProduction > 0 
      ? ((parseFloat(plant.production) || 0) / totalProduction * 100).toFixed(1)
      : 0
  }));

  // Sort plants by soiling level (highest first)
  const plantsBySoiling = [...plants]
    .map(plant => ({
      name: plant.name,
      soiling: parseFloat(plant.soiling) || 0,
      urgent: parseFloat(plant.soiling) > 4.5
    }))
    .sort((a, b) => b.soiling - a.soiling)
    .slice(0, 5);

  const urgentCount = plantsBySoiling.filter(p => p.urgent).length;

  // Color palette for distribution
  const colors = ['#e87722', '#d4a574', '#60a5fa', '#34d399', '#a78bfa', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[#1a1a1f]">SolarOS Analytics Report</h1>
          <div className="text-sm text-[#6b7280]">Dashboard Overview</div>
        </div>
        <div className="text-sm text-[#6b7280]">
          Generated: {new Date().toLocaleString()} | Report Period: Current Day
        </div>
      </div>

      {/* Company Summary */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Company Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-[#e5e7eb] rounded-lg p-4">
            <div className="text-xs text-[#6b7280] mb-1">Total Production</div>
            <div className="text-xl font-semibold text-[#1a1a1f]">
              {kpis.totalProduction || '—'} {kpis.totalProductionUnit || 'kWh'}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">Active Plants: {kpis.activePlants || plants.length}</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-4">
            <div className="text-xs text-[#6b7280] mb-1">Total Revenue</div>
            <div className="text-xl font-semibold text-[#1a1a1f]">
              {kpis.totalRevenue || '—'} {kpis.totalRevenueUnit || 'USD'}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">System Efficiency: {kpis.avgSystemEfficiency || '—'}</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-4">
            <div className="text-xs text-[#6b7280] mb-1">Next Cleaning</div>
            <div className="text-lg font-semibold text-[#1a1a1f]">{kpis.nextCleaning || '—'}</div>
            <div className="text-xs text-[#6b7280] mt-1">Last cleaned: {kpis.lastCleaned || '—'}</div>
          </div>
        </div>
      </div>

      {/* Production by Plant */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Production Distribution by Plant</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {plantDistribution.map((plant, index) => (
            <div key={plant.name} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-[#6b7280]">{plant.name}:</span>
              <span className="font-semibold text-[#1a1a1f]">{plant.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Soiling Alert - Horizontal Bar */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Plants Ranked by Soiling Level</h2>
        <div className="space-y-2">
          {plantsBySoiling.map((plant, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-32 text-sm text-[#6b7280]">{plant.name}</div>
              <div className="flex-1 bg-[#f3f4f6] rounded-full h-6 relative overflow-hidden">
                <div 
                  className={`h-full ${plant.urgent ? 'bg-[#ef4444]' : 'bg-[#e87722]'} rounded-full`}
                  style={{ width: `${Math.min((plant.soiling / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="w-16 text-sm font-semibold text-[#1a1a1f] text-right">{plant.soiling}%</div>
            </div>
          ))}
        </div>
        {urgentCount > 0 && (
          <div className="mt-4 p-3 bg-[#fef2f2] border border-[#fca5a5] rounded-lg">
            <div className="text-xs font-semibold text-[#dc2626]">⚠️ Maintenance Alert</div>
            <div className="text-xs text-[#991b1b] mt-1">
              {urgentCount} plant{urgentCount > 1 ? 's' : ''} require{urgentCount === 1 ? 's' : ''} immediate cleaning (soiling &gt; 4.5%)
            </div>
          </div>
        )}
      </div>

      {/* Plants Detail Table */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Plants Detail Summary</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#f9fafb] border-y border-[#e5e7eb]">
                <th style={{ width: '18%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Plant</th>
                <th style={{ width: '16%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Location</th>
                <th style={{ width: '10%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>P.R</th>
                <th style={{ width: '14%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Production</th>
                <th style={{ width: '12%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Revenue</th>
                <th style={{ width: '10%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Soiling</th>
                <th style={{ width: '20%', textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#1a1a1f' }}>Next Clean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {plants.slice(0, 5).map((plant, index) => (
                <tr key={plant.id || index}>
                  <td style={{ padding: '6px 8px', color: '#1a1a1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.name}</td>
                  <td style={{ padding: '6px 8px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.location}</td>
                  <td style={{ padding: '6px 8px', color: '#1a1a1f' }}>{plant.avgPR}</td>
                  <td style={{ padding: '6px 8px', color: '#1a1a1f' }}>{plant.production}</td>
                  <td style={{ padding: '6px 8px', color: '#1a1a1f' }}>{plant.revenue}K</td>
                  <td style={{ padding: '6px 8px', color: '#1a1a1f' }}>{plant.soiling}</td>
                  <td style={{ padding: '6px 8px', color: '#6b7280' }}>{plant.nextCleaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {plants.length > 5 && (
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
              Showing 5 of {plants.length} plants
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e5e7eb] pt-6 mt-8">
        <div className="text-xs text-[#6b7280] text-center">
          SolarOS Analytics Platform • Solar Plant Monitoring & Management
        </div>
      </div>
    </div>
  );
}
