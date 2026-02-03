import { X, Download, Printer, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function PDFPreviewModal({ isOpen, onClose, title, children }) {
  const printRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const element = printRef.current;
      
      // Capture the content as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename from title
      const filename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + new Date().toISOString().split('T')[0] + '.pdf';
      
      // Download the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print option instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-lg font-semibold text-[#1a1a1f]">Print Preview</h2>
            <p className="text-sm text-[#6b7280]">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#f9fafb] hover:bg-[#f3f4f6] border border-[#e5e7eb] rounded-lg text-sm text-[#1a1a1f] flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-[#e87722] hover:bg-[#d66815] disabled:bg-[#e87722]/70 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#f9fafb] hover:bg-[#f3f4f6] rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#1a1a1f]" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div 
          style={{ 
            flex: 1, 
            overflow: 'auto', 
            padding: '24px', 
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          <div 
            ref={printRef}
            className="bg-white shadow-lg p-8 print-content"
            style={{ 
              width: '210mm',
              minHeight: '297mm',
              flexShrink: 0,
              height: 'fit-content',
            }}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center justify-between text-sm text-[#6b7280]">
            <div>Preview - A4 Format (210mm × 297mm)</div>
            <div>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
