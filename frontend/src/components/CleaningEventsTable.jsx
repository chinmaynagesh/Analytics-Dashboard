import { Plus, Edit } from 'lucide-react';

const cleaningEvents = [
  { date: 'Oct 15, 2025', moneySaved: '+1,512.8', soilingOnDate: '22.6%', cleaningEffectiveness: '99%', isPositive: true },
  { date: 'Sep 18, 2025', moneySaved: '+1,446.2', soilingOnDate: '28.6%', cleaningEffectiveness: '95%', isPositive: true },
  { date: 'Aug 20, 2025', moneySaved: '+1,378.4', soilingOnDate: '30.1%', cleaningEffectiveness: '92%', isPositive: true },
  { date: 'Jul 12, 2025', moneySaved: '+1,234.7', soilingOnDate: '27.9%', cleaningEffectiveness: '90%', isPositive: true },
  { date: 'Jun 05, 2025', moneySaved: '+1,092.5', soilingOnDate: '24.3%', cleaningEffectiveness: '89%', isPositive: true },
  { date: 'May 10, 2025', moneySaved: '+962.3', soilingOnDate: '21.4%', cleaningEffectiveness: '87%', isPositive: true },
  { date: 'Apr 27, 2025', moneySaved: '+834.6', soilingOnDate: '19.8%', cleaningEffectiveness: '85%', isPositive: true },
];

export function CleaningEventsTable() {
  return (
    <div className="bg-[#f5f5f7] rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-[#1a1a1f]">Cleaning Events</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-2 hover:bg-gray-50">
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button className="px-3 py-1.5 bg-white rounded-lg border border-[#e5e7eb] text-sm text-[#1a1a1f] flex items-center gap-2 hover:bg-gray-50">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden border border-[#e5e7eb]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                Date of Event
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                Money Saved / Lost
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                Soiling on Date
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                Cleaning Effectiveness
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb]">
            {cleaningEvents.map((event, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-[#1a1a1f]">
                  {event.date}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={event.isPositive ? 'text-[#10b981] font-medium' : 'text-[#ef4444] font-medium'}>
                    {event.moneySaved}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#1a1a1f]">
                  {event.soilingOnDate}
                </td>
                <td className="px-6 py-4 text-sm text-[#1a1a1f]">
                  {event.cleaningEffectiveness}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
