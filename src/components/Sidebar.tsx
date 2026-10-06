import React, { useState } from 'react';
import { CambodiaEmblem } from './CambodiaEmblem';
import { 
  LayoutDashboard, 
  Send, 
  Inbox, 
  BarChart3, 
  Settings, 
  Plus, 
  Printer, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface Props {
  activeTab: 'dashboard' | 'outgoing' | 'incoming' | 'reports' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'outgoing' | 'incoming' | 'reports' | 'settings') => void;
  onOpenNewOutgoing: () => void;
  onOpenNewIncoming: () => void;
  onOpenPrintPreview: (type: 'outgoing' | 'incoming') => void;
  isSyncing: boolean;
  onSync: () => void;
  syncStatus: { status: 'idle' | 'success' | 'error'; message: string };
  lastSyncedAt: string | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenNewOutgoing,
  onOpenNewIncoming,
  onOpenPrintPreview,
  isSyncing,
  onSync,
  syncStatus,
  collapsed,
  setCollapsed,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'ផ្ទាំងគ្រប់គ្រង',
      icon: LayoutDashboard,
      color: 'text-amber-700',
    },
    {
      id: 'outgoing' as const,
      label: 'សៀវភៅលិខិតចេញ',
      icon: Send,
      color: 'text-amber-600',
    },
    {
      id: 'incoming' as const,
      label: 'សៀវភៅលិខិតចូល',
      icon: Inbox,
      color: 'text-blue-600',
    },
    {
      id: 'reports' as const,
      label: 'របាយការណ៍',
      icon: BarChart3,
      color: 'text-emerald-600',
    },
    {
      id: 'settings' as const,
      label: 'ការកំណត់',
      icon: Settings,
      color: 'text-slate-600',
    },
  ];

  return (
    <>
      {/* Mobile Top Header (only visible on mobile to toggle sidebar) */}
      <div className="no-print md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <CambodiaEmblem size={28} />
          <span className="font-moul text-xs text-slate-900 truncate">
            សៀវភៅចុះលិខិតចេញ-ចូល
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewOutgoing}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-700 rounded-lg"
          >
            + ចេញ
          </button>
          <button
            onClick={onOpenNewIncoming}
            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-700 rounded-lg"
          >
            + ចូល
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="no-print md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col justify-between shadow-xs ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header / Brand Logo */}
        <div>
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 text-left focus:outline-hidden group overflow-hidden"
            >
              <CambodiaEmblem size={34} className="shrink-0" />
              {!collapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <span className="font-moul text-xs text-slate-900 tracking-wide block group-hover:text-amber-700 transition-colors truncate">
                    សៀវភៅចុះលិខិត
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                    ស្ថាប័នអប់រំកម្ពុជា
                  </span>
                </div>
              )}
            </button>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={collapsed ? 'ពង្រីករបាខាងឆ្វេង' : 'បង្រួម / លាក់របាខាងឆ្វេង'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Buttons Section (+ បញ្ចូលលិខិត & 🖨️ បោះពុម្ព) */}
          <div className="p-3 space-y-2 border-b border-slate-100">
            {/* New Letter Dropdown / Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`w-full text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs ${
                  collapsed ? 'py-2.5 px-0' : 'py-2.5 px-3'
                }`}
                title="ចុះលិខិតចេញ-ចូលថ្មី"
              >
                <Plus size={16} />
                {!collapsed && <span>+ បញ្ចូលលិខិត</span>}
              </button>

              {showAddMenu && (
                <div
                  className={`absolute mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 ${
                    collapsed ? 'left-full ml-2 top-0' : 'left-0 right-0'
                  }`}
                  onMouseLeave={() => setShowAddMenu(false)}
                >
                  <button
                    onClick={() => {
                      onOpenNewOutgoing();
                      setShowAddMenu(false);
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    ចុះលិខិតចេញថ្មី
                  </button>
                  <button
                    onClick={() => {
                      onOpenNewIncoming();
                      setShowAddMenu(false);
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    ចុះលិខិតចូលថ្មី
                  </button>
                </div>
              )}
            </div>

            {/* Print Book Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPrintMenu(!showPrintMenu)}
                className={`w-full text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  collapsed ? 'py-2 px-0' : 'py-2 px-3'
                }`}
                title="បោះពុម្ពសៀវភៅ"
              >
                <Printer size={15} />
                {!collapsed && <span>បោះពុម្ពសៀវភៅ</span>}
              </button>

              {showPrintMenu && (
                <div
                  className={`absolute mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 ${
                    collapsed ? 'left-full ml-2 top-0' : 'left-0 right-0'
                  }`}
                  onMouseLeave={() => setShowPrintMenu(false)}
                >
                  <button
                    onClick={() => {
                      onOpenPrintPreview('outgoing');
                      setShowPrintMenu(false);
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-amber-600" />
                    បោះពុម្ពសៀវភៅលិខិតចេញ
                  </button>
                  <button
                    onClick={() => {
                      onOpenPrintPreview('incoming');
                      setShowPrintMenu(false);
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-blue-600" />
                    បោះពុម្ពសៀវភៅលិខិតចូល
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-amber-800' : 'text-slate-400 group-hover:text-slate-600'}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Google Sheets Sync & Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-white hover:shadow-xs transition-all border border-slate-200/80 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={syncStatus.message || 'សមកាលកម្មទិន្នន័យជាមួយ Google Sheets'}
          >
            <RefreshCw
              size={15}
              className={`shrink-0 ${isSyncing ? 'animate-spin text-amber-600' : 'text-slate-500'}`}
            />
            {!collapsed && (
              <div className="min-w-0 text-left flex-1">
                <span className="block truncate font-semibold text-[11px]">Google Sheets</span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {syncStatus.status === 'success' ? 'បានសមកាលកម្ម' : isSyncing ? 'កំពុងដំណើរការ...' : 'ចុចដើម្បី Sync'}
                </span>
              </div>
            )}
            {!collapsed && syncStatus.status === 'success' && (
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            )}
            {!collapsed && syncStatus.status === 'error' && (
              <AlertCircle size={13} className="text-rose-600 shrink-0" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
