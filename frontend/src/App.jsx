import { useState } from 'react';
import { Download } from 'lucide-react';
import { Sidebar } from './components/Sidebar.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { PlantOverview } from './components/PlantOverview.jsx';
import { SiteDesigner } from './components/SiteDesigner.jsx';
import { SoilingChart } from './components/SoilingChart.jsx';
import { CleaningEventsTable } from './components/CleaningEventsTable.jsx';
import { ChatBot } from './components/ChatBot.jsx';
import { PDFPreviewModal } from './components/PDFPreviewModal.jsx';
import { DashboardPDFContent } from './components/DashboardPDFContent.jsx';
import { PlantOverviewPDFContent } from './components/PlantOverviewPDFContent.jsx';
import { SoilingPDFContent } from './components/SoilingPDFContent.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfContentType, setPdfContentType] = useState('dashboard');
  const [pdfData, setPdfData] = useState({});

  const openPDFPreview = (type, data = {}) => {
    setPdfContentType(type);
    setPdfData(data);
    setPdfPreviewOpen(true);
  };

  const getPDFTitle = () => {
    switch (pdfContentType) {
      case 'dashboard':
        return 'Dashboard Overview - All Plants';
      case 'plant-overview':
        return `Plant Overview - ${pdfData.plant?.name || 'Plant'}`;
      case 'soiling':
        return `Soiling & Maintenance Report - ${pdfData.plant?.name || 'Plant'}`;
      default:
        return 'SolarOS Analytics Report';
    }
  };

  const renderPDFContent = () => {
    switch (pdfContentType) {
      case 'dashboard':
        return <DashboardPDFContent plants={pdfData.plants} kpis={pdfData.kpis} />;
      case 'plant-overview':
        return <PlantOverviewPDFContent plant={pdfData.plant} kpis={pdfData.kpis} powerChartData={pdfData.powerChartData} />;
      case 'soiling':
        return <SoilingPDFContent plant={pdfData.plant} soilingData={pdfData.soilingData} cleaningEvents={pdfData.cleaningEvents} />;
      default:
        return <DashboardPDFContent plants={pdfData.plants} kpis={pdfData.kpis} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#1a1a1f] overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <div className="flex-1 overflow-auto">
        {activePage === 'dashboard' && <Dashboard onExportPDF={(data) => openPDFPreview('dashboard', data)} />}
        
        {activePage === 'plant-overview' && <PlantOverview onExportPDF={(data) => openPDFPreview('plant-overview', data)} />}
        
        {activePage === 'site-designer' && <SiteDesigner />}
        
        {activePage === 'soiling' && (
          <>
            {/* Header */}
            <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h1 className="text-xl text-[#1a1a1f]">Soiling Maintenance</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6b7280]">
                    Sunfield Alpha - Arizona, USA
                  </span>
                  <button 
                    onClick={() => openPDFPreview('soiling', {
                      plant: { name: 'Sunfield Alpha', location: 'Arizona, USA' },
                      soilingData: [],
                      cleaningEvents: []
                    })}
                    className="px-4 py-2 bg-white border border-[#e5e7eb] text-[#1a1a1f] rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
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

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        title={getPDFTitle()}
      >
        {renderPDFContent()}
      </PDFPreviewModal>
    </div>
  );
}
