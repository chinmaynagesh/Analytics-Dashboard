export function PlantOverviewPDFContent({ plant = {}, kpis = {}, powerChartData = [] }) {
  // Calculate power efficiency from chart data
  const totalActual = powerChartData.reduce((sum, d) => sum + (d.actual || 0), 0);
  const totalExpected = powerChartData.reduce((sum, d) => sum + (d.expected || 0), 0);
  const efficiencyPercent = totalExpected > 0 
    ? Math.round((totalActual / totalExpected) * 100) 
    : 0;

  // Determine status based on efficiency
  const getStatus = () => {
    if (efficiencyPercent >= 95) return { label: 'Excellent', color: 'bg-[#dcfce7] border-[#86efac] text-[#166534]' };
    if (efficiencyPercent >= 85) return { label: 'Good', color: 'bg-[#ecfdf5] border-[#6ee7b7] text-[#065f46]' };
    if (efficiencyPercent >= 75) return { label: 'Attention Required', color: 'bg-[#fef3c7] border-[#fbbf24] text-[#92400e]' };
    return { label: 'Critical', color: 'bg-[#fef2f2] border-[#fca5a5] text-[#dc2626]' };
  };

  const status = getStatus();

  // Group power data by time periods for the PDF
  const groupPowerByPeriod = () => {
    if (powerChartData.length === 0) return [];
    
    // Simple grouping - split into 6 periods
    const periodSize = Math.ceil(powerChartData.length / 6);
    const periods = [];
    
    for (let i = 0; i < 6; i++) {
      const start = i * periodSize;
      const end = Math.min(start + periodSize, powerChartData.length);
      const periodData = powerChartData.slice(start, end);
      
      if (periodData.length > 0) {
        const actual = periodData.reduce((sum, d) => sum + (d.actual || 0), 0);
        const expected = periodData.reduce((sum, d) => sum + (d.expected || 0), 0);
        const eff = expected > 0 ? Math.round((actual / expected) * 100) : 0;
        
        periods.push({
          label: periodData[0]?.time || `Period ${i + 1}`,
          actual: Math.round(actual),
          efficiency: eff
        });
      }
    }
    
    return periods;
  };

  const powerPeriods = groupPowerByPeriod();

  // Calculate soiling impact
  const soilingValue = parseFloat(kpis.avgSoiling) || 0;
  const expectedRecovery = Math.round(soilingValue * 0.8); // Estimate ~80% of soiling as recoverable

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#e5e7eb] pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[#1a1a1f]">
            {plant.name || 'Plant'} - Performance Report
          </h1>
          <div className="text-sm text-[#6b7280]">{plant.location || 'Location'}</div>
        </div>
        <div className="text-sm text-[#6b7280]">
          Generated: {new Date().toLocaleString()} | Report Period: Current Day
        </div>
      </div>

      {/* KPI Summary */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Plant Performance Summary</h2>
        <div className="grid grid-cols-5 gap-3">
          <div className="border border-[#e5e7eb] rounded-lg p-3">
            <div className="text-xs text-[#6b7280] mb-1">Avg P.R</div>
            <div className="text-xl font-semibold text-[#1a1a1f]">{kpis.avgPR || '—'}</div>
            <div className="text-xs text-[#6b7280] mt-1">Expected: 95.0%</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-3">
            <div className="text-xs text-[#6b7280] mb-1">Production</div>
            <div className="text-xl font-semibold text-[#1a1a1f]">{kpis.totalProduction || '—'}</div>
            <div className="text-xs text-[#6b7280] mt-1">{kpis.totalProductionUnit || 'kWh'}</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-3">
            <div className="text-xs text-[#6b7280] mb-1">Revenue</div>
            <div className="text-xl font-semibold text-[#1a1a1f]">{kpis.totalRevenue || '—'}</div>
            <div className="text-xs text-[#6b7280] mt-1">{kpis.totalRevenueUnit || 'USD'}</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-3">
            <div className="text-xs text-[#6b7280] mb-1">Avg Soiling</div>
            <div className={`text-xl font-semibold ${soilingValue > 10 ? 'text-[#e87722]' : 'text-[#1a1a1f]'}`}>
              {kpis.avgSoiling || '—'}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">{kpis.latestSoilingUpdate || '—'}</div>
          </div>
          <div className="border border-[#e5e7eb] rounded-lg p-3">
            <div className="text-xs text-[#6b7280] mb-1">Next Cleaning</div>
            <div className="text-base font-semibold text-[#1a1a1f]">{kpis.nextCleaning || '—'}</div>
            <div className="text-xs text-[#6b7280] mt-1">{plant.name}</div>
          </div>
        </div>
      </div>

      {/* Power Efficiency */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Power Efficiency Analysis</h2>
        <div className="bg-[#f9fafb] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-[#6b7280] mb-1">Actual Power</div>
              <div className="text-2xl font-semibold text-[#e87722]">{efficiencyPercent}% of Expected</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#6b7280] mb-1">Status</div>
              <div className={`inline-block px-3 py-1 ${status.color} border rounded-full text-xs font-semibold`}>
                {status.label}
              </div>
            </div>
          </div>
          <div className="text-sm text-[#6b7280]">
            {efficiencyPercent < 90 && soilingValue > 5 
              ? `Current production is below expected levels. Soiling at ${kpis.avgSoiling || soilingValue}% is contributing to reduced efficiency. Cleaning is expected to restore ~${expectedRecovery}% performance gain.`
              : `Plant is operating within expected parameters. Continue monitoring for optimal performance.`
            }
          </div>
        </div>

        {/* Hourly Performance Breakdown */}
        {powerPeriods.length > 0 && (
          <div className="grid grid-cols-6 gap-2 text-xs">
            {powerPeriods.map((period, index) => (
              <div 
                key={index} 
                className={`${index === powerPeriods.length - 1 ? 'bg-[#e87722]/10 border-[#e87722]' : 'bg-white border-[#e5e7eb]'} border rounded p-2 text-center`}
              >
                <div className="text-[#6b7280] mb-1">{period.label}</div>
                <div className={`font-semibold ${index === powerPeriods.length - 1 ? 'text-[#e87722]' : 'text-[#1a1a1f]'}`}>
                  {period.actual} kWh
                </div>
                <div className="text-[#6b7280]">{period.efficiency}% eff.</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly PR Trend */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Performance Summary</h2>
        <div className="bg-[#f9fafb] rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-[#6b7280] mb-1">Actual Power</div>
              <div className="text-lg font-semibold text-[#e87722]">{kpis.actualPower || '—'} kWh</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] mb-1">Expected Power</div>
              <div className="text-lg font-semibold text-[#1a1a1f]">{kpis.expectedPower || '—'} kWh</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] mb-1">Efficiency</div>
              <div className="text-lg font-semibold text-[#1a1a1f]">{efficiencyPercent}%</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] mb-1">Average P.R</div>
              <div className="text-lg font-semibold text-[#1a1a1f]">{kpis.avgPR || '—'}</div>
            </div>
          </div>
        </div>
        
        {efficiencyPercent >= 88 && (
          <div className="mt-3 p-3 bg-[#ecfdf5] border border-[#6ee7b7] rounded-lg">
            <div className="text-xs font-semibold text-[#065f46]">✓ Insight</div>
            <div className="text-xs text-[#047857] mt-1">
              Performance ratio remains healthy. Regular maintenance schedule is maintaining optimal efficiency.
            </div>
          </div>
        )}
      </div>

      {/* Notes and Recommendations */}
      <div className="border-t border-[#e5e7eb] pt-6">
        <h2 className="text-lg font-semibold text-[#1a1a1f] mb-4">Notes & Recommendations</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <div className="font-semibold text-[#1a1a1f]">•</div>
            <div className="text-[#6b7280]">
              Soiling at {kpis.avgSoiling || '—'} - {kpis.nextCleaning ? `cleaning scheduled for ${kpis.nextCleaning}` : 'schedule cleaning soon'}
              {expectedRecovery > 0 && `. Expected recovery: +${expectedRecovery}% PR`}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold text-[#1a1a1f]">•</div>
            <div className="text-[#6b7280]">
              Last soiling update: {kpis.latestSoilingUpdate || '—'}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold text-[#1a1a1f]">•</div>
            <div className="text-[#6b7280]">
              Optimal cleaning frequency for this location: Every 60-75 days
            </div>
          </div>
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
