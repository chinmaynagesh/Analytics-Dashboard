import { useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { PlantOverview } from './components/PlantOverview.jsx';
import { SiteDesigner } from './components/SiteDesigner.jsx';
import { SoilingChart } from './components/SoilingChart.jsx';
import { CleaningEventsTable } from './components/CleaningEventsTable.jsx';
import { ChatBot } from './components/ChatBot.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#1a1a1f] overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <div className="flex-1 overflow-auto">
        {activePage === 'dashboard' && <Dashboard />}
        
        {activePage === 'plant-overview' && <PlantOverview />}
        
        {activePage === 'site-designer' && <SiteDesigner />}
        
        {activePage === 'soiling' && (
          <>
            {/* Header */}
            <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h1 className="text-xl text-[#1a1a1f]">Soiling Maintenance</h1>
                <div className="text-sm text-[#6b7280]">
                  Sunfield Alpha - Arizona, USA
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="p-8 bg-[#e8e8ea]">
              <SoilingChart />
              <CleaningEventsTable />
            </main>
          </>
        )}
        
        {activePage === 'settings' && (
          <div className="min-h-screen bg-[#e8e8ea]">
            <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
              <h1 className="text-xl text-[#1a1a1f]">Settings</h1>
            </header>
            <main className="p-8">
              <div className="bg-white rounded-lg p-6 border border-[#e5e7eb]">
                <p className="text-[#6b7280]">Settings page coming soon...</p>
              </div>
            </main>
          </div>
        )}
      </div>
      
      {/* AI ChatBot - fixed position, always visible */}
      <ChatBot />
    </div>
  );
}
