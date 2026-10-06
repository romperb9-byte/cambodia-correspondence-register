import React from 'react';
import { CambodiaEmblem } from './CambodiaEmblem';
import { Plus, Printer, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenNewOutgoing,
  onOpenNewIncoming,
  onOpenPrintPreview,
  isSyncing,
  onSync,
  syncStatus,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [showPrintMenu, setShowPrintMenu] = React.useState(false);

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-hidden group"
            >
              <CambodiaEmblem size={38} className="shrink-0" />
              <div>
                <span className="font-moul text-base text-slate-900 tracking-wide block group-hover:text-amber-700 transition-colors">
                  សៀវភៅចុះលិខិតចេញ-ចូល
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  ស្ថាប័នអប់រំ និងរដ្ឋបាលសាធារណៈ
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ផ្ទាំងគ្រប់គ្រង
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'outgoing'
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              សៀវភៅលិខិតចេញ
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'incoming'
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              សៀវភៅលិខិតចូល
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              របាយការណ៍
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-amber-800 bg-amber-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ការកំណត់
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              title={syncStatus.message || 'សមកាលកម្មទិន្នន័យជាមួយ Google Sheets'}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin text-amber-600' : ''} />
              <span className="hidden sm:inline">Google Sheets</span>
              {syncStatus.status === 'success' && <CheckCircle2 size={13} className="text-emerald-600" />}
              {syncStatus.status === 'error' && <AlertCircle size={13} className="text-rose-600" />}
            </button>

            {/* Print Action Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPrintMenu(!showPrintMenu)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">បោះពុម្ពសៀវភៅ</span>
              </button>

              {showPrintMenu && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setShowPrintMenu(false)}
                >
                  <button
                    onClick={() => {
                      onOpenPrintPreview('outgoing');
                      setShowPrintMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-amber-600" />
                    បោះពុម្ពសៀវភៅលិខិតចេញ
                  </button>
                  <button
                    onClick={() => {
                      onOpenPrintPreview('incoming');
                      setShowPrintMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <FileText size={14} className="text-blue-600" />
                    បោះពុម្ពសៀវភៅលិខិតចូល
                  </button>
                </div>
              )}
            </div>

            {/* Add New Letter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Plus size={15} />
                <span>+ បញ្ចូលលិខិត</span>
              </button>

              {showAddMenu && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50"
                  onMouseLeave={() => setShowAddMenu(false)}
                >
                  <button
                    onClick={() => {
                      onOpenNewOutgoing();
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    ចុះលិខិតចេញថ្មី
                  </button>
                  <button
                    onClick={() => {
                      onOpenNewIncoming();
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    ចុះលិខិតចូលថ្មី
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
