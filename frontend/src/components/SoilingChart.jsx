import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { HelpCircle, Calendar } from 'lucide-react';

const chartData = [
  { date: '2/1', soiling: 5, selected: 0, production: 15 },
  { date: '7/01', soiling: 10, selected: 0, production: 20 },
  { date: '7/18', soiling: 15, selected: 0, production: 25 },
  { date: '7/28', soiling: 20, selected: 0, production: 30 },
  { date: '8/06', soiling: 25, selected: 0, production: 35 },
  { date: '8/12', soiling: 22, selected: 0, production: 32 },
  { date: '8/16', soiling: 18, selected: 0, production: 28 },
  { date: '8/24', soiling: 20, selected: 0, production: 30 },
  { date: '9/01', soiling: 24, selected: 0, production: 34 },
  { date: '9/08', soiling: 28, selected: 0, production: 38 },
  { date: '9/15', soiling: 25, selected: 0, production: 35 },
  { date: '9/22', soiling: 22, selected: 0, production: 32 },
  { date: '9/26', soiling: 20, selected: 0, production: 30 },
  { date: '9/30', soiling: 24, selected: 0, production: 34 },
  { date: '10/21', soiling: 5, selected: 50, production: 10 },
  { date: '10/23', soiling: 0, selected: 52, production: 5 },
  { date: '10/31', soiling: 0, selected: 48, production: 3 },
  { date: '11/01', soiling: 0, selected: 45, production: 2 },
  { date: '11/11', soiling: 0, selected: 42, production: 1 },
  { date: '11/15', soiling: 0, selected: 40, production: 0 },
  { date: '11/23', soiling: 0, selected: 38, production: 0 },
];

export function SoilingChart() {
  return (
    <div className="bg-[#f5f5f7] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg text-[#1a1a1f]">Soiling Trend & Cleaning Schedule</h2>
          <HelpCircle className="w-4 h-4 text-[#6b7280]" />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-2 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            Monthly
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-start gap-8 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#e87722]" />
            <span className="text-xs text-[#6b7280]">Today's Soiling</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#1a1a1f]">2.3%</span>
            <span className="text-sm text-[#10b981]">↑</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[#60a5fa]" />
            <span className="text-xs text-[#6b7280]">Selected Date</span>
          </div>
          <div className="text-sm text-[#1a1a1f]">Nov 1, 2025</div>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#60a5fa]" />
                <span className="text-xs text-[#6b7280]">Selected Date Cost</span>
              </div>
              <div className="text-lg font-semibold text-[#1a1a1f]">7904 <span className="text-xs font-normal">$USD</span></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
                <span className="text-xs text-[#6b7280]">Optimized Cleaning Cost</span>
              </div>
              <div className="text-lg font-semibold text-[#1a1a1f]">5881 <span className="text-xs font-normal">$USD</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '256px', minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSoiling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e87722" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#e87722" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Production Efficiency (%)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1f', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <ReferenceLine x="10/21" stroke="#60a5fa" strokeWidth={2} />
            <Area
              type="monotone"
              dataKey="soiling"
              stroke="#e87722"
              strokeWidth={2}
              fill="url(#colorSoiling)"
              name="Soiling"
            />
            <Area
              type="monotone"
              dataKey="selected"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorSelected)"
              name="Selected Date"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Production Efficiency Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-[#e87722]" />
          <span className="text-[#6b7280]">Production Efficiency</span>
        </div>
      </div>
    </div>
  );
}
