import { LayoutDashboard, Building2, Droplets, Settings, MapPin, ChevronDown, PenTool } from 'lucide-react';

export function Sidebar({ activePage, onNavigate }) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plant-overview', label: 'Plant Overview', icon: Building2 },
    { id: 'site-designer', label: 'Site Designer', icon: PenTool },
    { id: 'soiling', label: 'Soiling', icon: Droplets },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const plantLocations = [
    { id: 'sunfield-alpha', label: 'Sunfield Alpha' },
    { id: 'cactus-bloom', label: 'Cactus Bloom' },
    { id: 'mountain-crest', label: 'Mountain Crest' },
  ];

  return (
    <div className="w-56 bg-[#1a1a1f] border-r border-[#2a2a35] h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b border-[#2a2a35]">
        <div className="w-8 h-8 bg-gradient-to-br from-[#e87722] to-[#d4a574] rounded flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="white"/>
          </svg>
        </div>
        <span className="text-white text-sm font-semibold">SolarOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Plant Locations */}
        <div className="mt-8">
          <div className="px-3 mb-2 flex items-center gap-2 text-xs text-[#6b7280] uppercase tracking-wide">
            <MapPin className="w-3 h-3" />
            Plants
          </div>
          <div className="space-y-1">
            {plantLocations.map((plant) => (
              <button
                key={plant.id}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:bg-white/5 hover:text-white transition-colors"
              >
                <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
                {plant.label}
              </button>
            ))}
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:bg-white/5 hover:text-white transition-colors">
              <ChevronDown className="w-3 h-3" />
              More
            </button>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#2a2a35]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#e87722] to-[#d4a574] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">AI</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">Acme Inc</div>
            <div className="text-xs text-[#6b7280] truncate">admin@acme.com</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#6b7280]" />
        </div>
      </div>
    </div>
  );
}
