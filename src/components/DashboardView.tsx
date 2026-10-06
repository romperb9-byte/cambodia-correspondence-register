import React from 'react';
import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { KHMER_MONTHS, toKhmerNum } from '../utils/khmerNumerals';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Building2,
  CheckCircle2
} from 'lucide-react';

interface Props {
  outgoingLetters: OutgoingLetter[];
  incomingLetters: IncomingLetter[];
  settings: SystemSettings;
  onNavigateTab: (tab: 'outgoing' | 'incoming' | 'reports' | 'settings') => void;
  onOpenNewOutgoing: () => void;
  onOpenNewIncoming: () => void;
  onOpenPrintPreview: (type: 'outgoing' | 'incoming') => void;
}

export const DashboardView: React.FC<Props> = ({
  outgoingLetters,
  incomingLetters,
  settings,
  onNavigateTab,
  onOpenNewOutgoing,
  onOpenNewIncoming,
  onOpenPrintPreview,
}) => {
  const currentYear = settings.currentYear || new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Outgoing metrics
  const totalOutgoing = outgoingLetters.length;
  const outgoingThisYear = outgoingLetters.filter((l) => Number(l.year) === currentYear).length;
  const outgoingThisMonth = outgoingLetters.filter(
    (l) => Number(l.year) === currentYear && Number(l.month) === currentMonth
  ).length;

  // Incoming metrics
  const totalIncoming = incomingLetters.length;
  const incomingThisYear = incomingLetters.filter((l) => Number(l.year) === currentYear).length;
  const incomingThisMonth = incomingLetters.filter(
    (l) => Number(l.year) === currentYear && Number(l.month) === currentMonth
  ).length;

  // Monthly breakdown for current year
  const monthlyData = KHMER_MONTHS.map((monthName, idx) => {
    const monthNum = idx + 1;
    const outCount = outgoingLetters.filter(
      (l) => Number(l.year) === currentYear && Number(l.month) === monthNum
    ).length;
    const inCount = incomingLetters.filter(
      (l) => Number(l.year) === currentYear && Number(l.month) === monthNum
    ).length;
    return {
      monthNum,
      monthName,
      outCount,
      inCount,
      total: outCount + inCount,
    };
  });

  const maxMonthTotal = Math.max(...monthlyData.map((m) => m.total), 1);

  // Recent entries
  const recentOutgoing = [...outgoingLetters]
    .sort((a, b) => b.recordNumber - a.recordNumber)
    .slice(0, 4);

  const recentIncoming = [...incomingLetters]
    .sort((a, b) => b.recordNumber - a.recordNumber)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Institution Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-800 font-medium mb-1">
            <Building2 size={15} />
            <span>{settings.institutionName || 'ស្ថាប័នអប់រំកម្ពុជា'}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.departmentName || 'ការិយាល័យរដ្ឋបាល'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-moul tracking-wide">
            ផ្ទាំងគ្រប់គ្រងសៀវភៅចុះលិខិត
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            គ្រប់គ្រង និងតាមដានកំណត់ត្រាលិខិតចេញ និងលិខិតចូល ឆ្នាំ {currentYear}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewOutgoing}
            className="px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>+ ចុះលិខិតចេញ</span>
          </button>
          <button
            onClick={onOpenNewIncoming}
            className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>+ ចុះលិខិតចូល</span>
          </button>
          <button
            onClick={() => onOpenPrintPreview('outgoing')}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>បោះពុម្ព</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Outgoing Letters Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-moul">សៀវភៅចុះលិខិតចេញ</h2>
                <span className="text-[11px] text-slate-500">Outgoing Letter Register</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('outgoing')}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>មើលតារាង</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <span className="text-xs text-slate-500 block mb-1">ចំនួនសរុប</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalOutgoing}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <span className="text-xs text-slate-500 block mb-1">ក្នុងខែនេះ (ខែ {currentMonth})</span>
              <span className="text-2xl font-bold text-amber-700 tabular-nums">
                {outgoingThisMonth}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <span className="text-xs text-slate-500 block mb-1">ក្នុងឆ្នាំ {currentYear}</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {outgoingThisYear}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
          </div>
        </div>

        {/* Incoming Letters Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-moul">សៀវភៅចុះលិខិតចូល</h2>
                <span className="text-[11px] text-slate-500">Incoming Letter Register</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('incoming')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>មើលតារាង</span>
              <ArrowDownLeft size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <span className="text-xs text-slate-500 block mb-1">ចំនួនសរុប</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalIncoming}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <span className="text-xs text-slate-500 block mb-1">ក្នុងខែនេះ (ខែ {currentMonth})</span>
              <span className="text-2xl font-bold text-blue-700 tabular-nums">
                {incomingThisMonth}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <span className="text-xs text-slate-500 block mb-1">ក្នុងឆ្នាំ {currentYear}</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {incomingThisYear}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">លិខិត</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Statistics Chart / Visual Representation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-moul">
              ស្ថិតិប្រៀបធៀបលិខិតចេញ និងលិខិតចូល ប្រចាំខែ ឆ្នាំ {currentYear}
            </h3>
            <span className="text-xs text-slate-500">
              ការវិវត្តនៃបរិមាណលិខិតរដ្ឋបាលតាមខែនីមួយៗ
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-amber-600 inline-block"></span>
              លិខិតចេញ
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
              លិខិតចូល
            </span>
          </div>
        </div>

        {/* 12 Months Bars */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
          {monthlyData.map((m) => {
            const outHeight = maxMonthTotal > 0 ? (m.outCount / maxMonthTotal) * 100 : 0;
            const inHeight = maxMonthTotal > 0 ? (m.inCount / maxMonthTotal) * 100 : 0;

            return (
              <div key={m.monthNum} className="flex flex-col items-center">
                <div className="h-28 w-full flex items-end justify-center gap-1 pb-1">
                  {/* Outgoing Bar */}
                  <div
                    className="w-3.5 bg-amber-500 hover:bg-amber-600 rounded-t-xs transition-all relative group"
                    style={{ height: `${Math.max(outHeight, 4)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-xs whitespace-nowrap z-10 tabular-nums">
                      ចេញ: {m.outCount}
                    </div>
                  </div>
                  {/* Incoming Bar */}
                  <div
                    className="w-3.5 bg-blue-500 hover:bg-blue-600 rounded-t-xs transition-all relative group"
                    style={{ height: `${Math.max(inHeight, 4)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded-xs whitespace-nowrap z-10 tabular-nums">
                      ចូល: {m.inCount}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600 font-medium mt-1 truncate">
                  {m.monthName}
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {m.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Outgoing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              លិខិតចេញដែលបានចុះចុងក្រោយ
            </h3>
            <button
              onClick={() => onNavigateTab('outgoing')}
              className="text-xs text-amber-700 hover:underline"
            >
              មើលទាំងអស់
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentOutgoing.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">មិនទាន់មានលិខិតចេញនៅឡើយទេ</p>
            ) : (
              recentOutgoing.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                      <span className="font-semibold text-amber-800 tabular-nums">
                        លេខ {String(item.recordNumber).padStart(3, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        ថ្ងៃទី {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium truncate">{item.summary}</p>
                    <p className="text-[11px] text-slate-500 truncate">ទៅ៖ {item.recipientMinistry}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                    {item.quantity} ច្បាប់
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Incoming */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-moul flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              លិខិតចូលដែលបានចុះចុងក្រោយ
            </h3>
            <button
              onClick={() => onNavigateTab('incoming')}
              className="text-xs text-blue-700 hover:underline"
            >
              មើលទាំងអស់
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentIncoming.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">មិនទាន់មានលិខិតចូលនៅឡើយទេ</p>
            ) : (
              recentIncoming.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                      <span className="font-semibold text-blue-800 tabular-nums">
                        លេខ {String(item.recordNumber).padStart(3, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        ថ្ងៃទី {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium truncate">{item.summary}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      ពី៖ {item.senderMinistry} (លេខដើម: {item.originalLetterNumber || 'គ្មាន'})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                    {item.quantity} ច្បាប់
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Google Sheets Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-moul">
              ការរក្សាទុកទិន្នន័យ Google Sheets Database
            </h4>
            <p className="text-xs text-slate-600">
              {settings.googleScriptUrl
                ? 'បានភ្ជាប់ជាមួយ Google Apps Script API រួចរាល់។ ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាព។'
                : 'អាចភ្ជាប់ជាមួយ Google Sheets តាមរយៈ Google Apps Script API នៅក្នុងផ្ទាំងការកំណត់ ដើម្បីរក្សាទិន្នន័យអចិន្ត្រៃយ៍។'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('settings')}
          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
        >
          {settings.googleScriptUrl ? 'គ្រប់គ្រងការតភ្ជាប់' : 'ដំឡើង Google Sheets'}
        </button>
      </div>
    </div>
  );
};
