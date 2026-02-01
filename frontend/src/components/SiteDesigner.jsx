import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Group } from 'react-konva';
import { MousePointer2, PenTool, Square, Trash2, RotateCcw, Download, ZoomIn, ZoomOut } from 'lucide-react';

const PANEL_WIDTH = 40;
const PANEL_HEIGHT = 24;
const GRID_SIZE = 10;

export function SiteDesigner() {
  const [tool, setTool] = useState('select'); // 'select', 'boundary', 'panel'
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Check if point is inside boundary polygon
  const isPointInPolygon = (x, y, polygon) => {
    if (polygon.length < 6) return false; // Need at least 3 points
    let inside = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
      const xi = polygon[i], yi = polygon[i + 1];
      const xj = polygon[j], yj = polygon[j + 1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Snap to grid
  const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  // Handle stage click
  const handleStageClick = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const x = pos.x / scale;
    const y = pos.y / scale;

    if (tool === 'boundary') {
      if (!isDrawingBoundary) {
        setBoundaryPoints([x, y]);
        setIsDrawingBoundary(true);
      } else {
        // Check if clicking near first point to close
        const firstX = boundaryPoints[0];
        const firstY = boundaryPoints[1];
        const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
        
        if (dist < 20 && boundaryPoints.length >= 6) {
          // Close the polygon
          setIsDrawingBoundary(false);
          setTool('panel');
        } else {
          setBoundaryPoints([...boundaryPoints, x, y]);
        }
      }
    } else if (tool === 'panel' && boundaryPoints.length >= 6) {
      const snappedX = snapToGrid(x - PANEL_WIDTH / 2);
      const snappedY = snapToGrid(y - PANEL_HEIGHT / 2);
      
      // Check if panel center would be inside boundary
      if (isPointInPolygon(snappedX + PANEL_WIDTH / 2, snappedY + PANEL_HEIGHT / 2, boundaryPoints)) {
        const newPanel = {
          id: Date.now(),
          x: snappedX,
          y: snappedY,
          rotation: 0,
        };
        setPanels([...panels, newPanel]);
      }
    } else if (tool === 'select') {
      setSelectedPanel(null);
    }
  };

  // Handle panel drag
  const handlePanelDragEnd = (e, panelId) => {
    const newX = snapToGrid(e.target.x());
    const newY = snapToGrid(e.target.y());
    
    setPanels(panels.map(p => 
      p.id === panelId ? { ...p, x: newX, y: newY } : p
    ));
  };

  // Calculate polygon area using Shoelace formula
  const calculateBoundaryArea = () => {
    if (boundaryPoints.length < 6) return 0;
    let area = 0;
    const n = boundaryPoints.length / 2;
    for (let i = 0; i < n; i++) {
      const x1 = boundaryPoints[i * 2];
      const y1 = boundaryPoints[i * 2 + 1];
      const x2 = boundaryPoints[((i + 1) % n) * 2];
      const y2 = boundaryPoints[((i + 1) % n) * 2 + 1];
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area / 2);
  };

  // Calculate stats
  const panelCount = panels.length;
  const estimatedPower = panelCount * 400; // 400W per panel
  const estimatedArea = panelCount * (PANEL_WIDTH * PANEL_HEIGHT) / 100; // sq meters approximation
  const boundaryAreaPixels = calculateBoundaryArea();
  // Convert pixels to real-world units (assuming 1 pixel = 1 meter for simplicity)
  const boundaryAreaM2 = boundaryAreaPixels;
  const boundaryAreaKm2 = boundaryAreaM2 / 1000000;

  // Clear all
  const handleClear = () => {
    setBoundaryPoints([]);
    setPanels([]);
    setIsDrawingBoundary(false);
    setSelectedPanel(null);
    setTool('boundary');
  };

  // Delete selected panel
  const handleDeletePanel = () => {
    if (selectedPanel) {
      setPanels(panels.filter(p => p.id !== selectedPanel));
      setSelectedPanel(null);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5));

  // Auto-fill panels in boundary
  const handleAutoFill = () => {
    if (boundaryPoints.length < 6) return;
    
    // Find bounding box of polygon
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < boundaryPoints.length; i += 2) {
      minX = Math.min(minX, boundaryPoints[i]);
      minY = Math.min(minY, boundaryPoints[i + 1]);
      maxX = Math.max(maxX, boundaryPoints[i]);
      maxY = Math.max(maxY, boundaryPoints[i + 1]);
    }

    const newPanels = [];
    const spacing = 8;
    
    for (let x = minX + 20; x < maxX - PANEL_WIDTH - 20; x += PANEL_WIDTH + spacing) {
      for (let y = minY + 20; y < maxY - PANEL_HEIGHT - 20; y += PANEL_HEIGHT + spacing) {
        const centerX = x + PANEL_WIDTH / 2;
        const centerY = y + PANEL_HEIGHT / 2;
        
        if (isPointInPolygon(centerX, centerY, boundaryPoints)) {
          newPanels.push({
            id: Date.now() + newPanels.length,
            x: snapToGrid(x),
            y: snapToGrid(y),
            rotation: 0,
          });
        }
      }
    }
    
    setPanels(newPanels);
  };

  return (
    <div className="min-h-screen bg-[#e8e8ea] flex flex-col">
      {/* Header */}
      <header className="bg-[#f5f5f7] border-b border-[#e5e7eb] px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-[#1a1a1f]">Site Designer</h1>
          <div className="text-sm text-[#6b7280]">
            Design your solar panel layout
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#e5e7eb] px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('select')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                tool === 'select' ? 'bg-[#e87722] text-white' : 'bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea]'
              }`}
            >
              <MousePointer2 className="w-4 h-4" />
              Select
            </button>
            <button
              onClick={() => { setTool('boundary'); setIsDrawingBoundary(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                tool === 'boundary' ? 'bg-[#e87722] text-white' : 'bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea]'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Draw Boundary
            </button>
            <button
              onClick={() => setTool('panel')}
              disabled={boundaryPoints.length < 6}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                tool === 'panel' ? 'bg-[#e87722] text-white' : 'bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea]'
              } ${boundaryPoints.length < 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Square className="w-4 h-4" />
              Add Panel
            </button>
            
            <div className="w-px h-6 bg-[#e5e7eb] mx-2" />
            
            <button
              onClick={handleAutoFill}
              disabled={boundaryPoints.length < 6}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea] transition-colors ${
                boundaryPoints.length < 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Auto-Fill
            </button>
            
            <button
              onClick={handleDeletePanel}
              disabled={!selectedPanel}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea] transition-colors ${
                !selectedPanel ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea] transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#6b7280] w-12 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-[#f5f5f7] text-[#1a1a1f] hover:bg-[#e8e8ea] transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div ref={containerRef} className="flex-1 bg-[#fafafa] m-4 rounded-lg border border-[#e5e7eb] overflow-hidden">
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onClick={handleStageClick}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* Grid */}
              {Array.from({ length: Math.ceil(stageSize.width / scale / GRID_SIZE) + 1 }).map((_, i) => (
                <Line
                  key={`v-${i}`}
                  points={[i * GRID_SIZE, 0, i * GRID_SIZE, stageSize.height / scale]}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: Math.ceil(stageSize.height / scale / GRID_SIZE) + 1 }).map((_, i) => (
                <Line
                  key={`h-${i}`}
                  points={[0, i * GRID_SIZE, stageSize.width / scale, i * GRID_SIZE]}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                />
              ))}

              {/* Boundary Polygon */}
              {boundaryPoints.length >= 4 && (
                <Line
                  points={boundaryPoints}
                  stroke="#e87722"
                  strokeWidth={2}
                  closed={!isDrawingBoundary}
                  fill={!isDrawingBoundary ? "rgba(232, 119, 34, 0.1)" : undefined}
                  dash={isDrawingBoundary ? [5, 5] : undefined}
                />
              )}

              {/* Boundary Points */}
              {boundaryPoints.length >= 2 && 
                Array.from({ length: boundaryPoints.length / 2 }).map((_, i) => (
                  <Circle
                    key={`bp-${i}`}
                    x={boundaryPoints[i * 2]}
                    y={boundaryPoints[i * 2 + 1]}
                    radius={6}
                    fill={i === 0 && isDrawingBoundary ? "#4ade80" : "#e87722"}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))
              }

              {/* Solar Panels */}
              {panels.map((panel) => (
                <Group
                  key={panel.id}
                  x={panel.x}
                  y={panel.y}
                  draggable={tool === 'select'}
                  onDragEnd={(e) => handlePanelDragEnd(e, panel.id)}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    setSelectedPanel(panel.id);
                  }}
                >
                  {/* Panel background */}
                  <Rect
                    width={PANEL_WIDTH}
                    height={PANEL_HEIGHT}
                    fill="#1e3a5f"
                    stroke={selectedPanel === panel.id ? "#e87722" : "#0f2840"}
                    strokeWidth={selectedPanel === panel.id ? 2 : 1}
                    cornerRadius={2}
                  />
                  {/* Panel cells - horizontal lines */}
                  {[1, 2].map((i) => (
                    <Line
                      key={`h-${i}`}
                      points={[2, i * (PANEL_HEIGHT / 3), PANEL_WIDTH - 2, i * (PANEL_HEIGHT / 3)]}
                      stroke="#2d5a87"
                      strokeWidth={0.5}
                    />
                  ))}
                  {/* Panel cells - vertical lines */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Line
                      key={`v-${i}`}
                      points={[i * (PANEL_WIDTH / 6), 2, i * (PANEL_WIDTH / 6), PANEL_HEIGHT - 2]}
                      stroke="#2d5a87"
                      strokeWidth={0.5}
                    />
                  ))}
                </Group>
              ))}

              {/* Instructions */}
              {boundaryPoints.length === 0 && (
                <Text
                  x={stageSize.width / scale / 2 - 150}
                  y={stageSize.height / scale / 2 - 20}
                  text="Click 'Draw Boundary' then click on canvas to draw your property boundary"
                  fontSize={14}
                  fill="#6b7280"
                  width={300}
                  align="center"
                />
              )}

              {isDrawingBoundary && boundaryPoints.length >= 6 && (
                <Text
                  x={boundaryPoints[0] - 50}
                  y={boundaryPoints[1] - 25}
                  text="Click here to close"
                  fontSize={10}
                  fill="#4ade80"
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Stats Panel */}
        <div className="w-72 bg-white border-l border-[#e5e7eb] p-6">
          <h2 className="text-lg font-semibold text-[#1a1a1f] mb-6">Layout Summary</h2>
          
          <div className="space-y-4">
            <div className="bg-[#f5f5f7] rounded-lg p-4">
              <div className="text-sm text-[#6b7280] mb-1">Boundary Area</div>
              <div className="text-2xl font-semibold text-[#1a1a1f]">
                {boundaryAreaM2 >= 1000000 
                  ? `${boundaryAreaKm2.toFixed(3)} km²` 
                  : boundaryAreaM2 >= 10000
                    ? `${(boundaryAreaM2 / 10000).toFixed(2)} ha`
                    : `${boundaryAreaM2.toFixed(0)} m²`}
              </div>
              {boundaryAreaM2 > 0 && boundaryAreaM2 < 1000000 && (
                <div className="text-xs text-[#9ca3af] mt-1">{boundaryAreaKm2.toFixed(6)} km²</div>
              )}
            </div>

            <div className="bg-[#f5f5f7] rounded-lg p-4">
              <div className="text-sm text-[#6b7280] mb-1">Total Panels</div>
              <div className="text-2xl font-semibold text-[#1a1a1f]">{panelCount}</div>
            </div>
            
            <div className="bg-[#f5f5f7] rounded-lg p-4">
              <div className="text-sm text-[#6b7280] mb-1">Estimated Power</div>
              <div className="text-2xl font-semibold text-[#1a1a1f]">
                {estimatedPower >= 1000 ? `${(estimatedPower / 1000).toFixed(1)} kW` : `${estimatedPower} W`}
              </div>
            </div>
            
            <div className="bg-[#f5f5f7] rounded-lg p-4">
              <div className="text-sm text-[#6b7280] mb-1">Panel Area</div>
              <div className="text-2xl font-semibold text-[#1a1a1f]">{estimatedArea.toFixed(1)} m²</div>
              {boundaryAreaM2 > 0 && (
                <div className="text-xs text-[#9ca3af] mt-1">
                  {((estimatedArea / boundaryAreaM2) * 100).toFixed(1)}% coverage
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#e87722] to-[#d4a574] rounded-lg p-4 text-white">
              <div className="text-sm opacity-90 mb-1">Est. Annual Production</div>
              <div className="text-2xl font-semibold">
                {((estimatedPower * 4.5) / 1000).toFixed(1)} MWh
              </div>
              <div className="text-xs opacity-75 mt-1">Based on 4.5 peak sun hours/day</div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e5e7eb]">
            <h3 className="text-sm font-medium text-[#1a1a1f] mb-3">Instructions</h3>
            <ol className="text-xs text-[#6b7280] space-y-2">
              <li className="flex gap-2">
                <span className="bg-[#e87722] text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                <span>Click "Draw Boundary" and click on canvas to mark property corners</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-[#e87722] text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                <span>Click on the first point (green) to close the boundary</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-[#e87722] text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                <span>Use "Add Panel" to place panels manually, or "Auto-Fill" to fill automatically</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-[#e87722] text-white w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
                <span>Use "Select" to drag and rearrange panels</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
