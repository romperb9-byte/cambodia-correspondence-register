import React, { useState, useMemo } from 'react';
import { OutgoingLetter, SystemSettings, BookFilter } from '../types';
import { calculateBookHeader, KHMER_MONTHS, toKhmerNum, padNumber } from '../utils/khmerNumerals';
import { exportToCSV } from '../services/storageService';
import { 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  RotateCcw,
  Calendar,
  Layers,
  ChevronDown,
  Building,
  Paperclip,
  ExternalLink,
  FileText,
  Link2
} from 'lucide-react';

interface Props {
  letters: OutgoingLetter[];
  settings: SystemSettings;
  onAddLetter: () => void;
  onEditLetter: (letter: OutgoingLetter) => void;
  onDeleteLetter: (letter: OutgoingLetter) => void;
  onViewLetter: (letter: OutgoingLetter) => void;
  onOpenPrintPreview: () => void;
}

export const OutgoingLettersView: React.FC<Props> = ({
  letters,
  settings,
  onAddLetter,
  onEditLetter,
  onDeleteLetter,
  onViewLetter,
  onOpenPrintPreview,
}) => {
  const currentYear = settings.currentYear || new Date().getFullYear();

  // Filter state
  const [filter, setFilter] = useState<BookFilter>({
    year: currentYear,
    month: 'all',
    fromNumber: undefined,
    toNumber: undefined,
    fromDate: '',
    toDate: '',
    searchQuery: '',
    ministry: '',
  });

  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Available unique years in dataset
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    letters.forEach((l) => years.add(Number(l.year)));
    if (!years.has(currentYear)) years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [letters, currentYear]);

  // Available unique ministries in dataset
  const availableMinistries = useMemo(() => {
    const minSet = new Set<string>();
    letters.forEach((l) => {
      if (l.recipientMinistry) minSet.add(l.recipientMinistry.trim());
    });
    return Array.from(minSet).sort();
  }, [letters]);

  // Filter letters according to criteria
  const filteredLetters = useMemo(() => {
    return letters.filter((l) => {
      // Year filter
      if (filter.year !== 'all' && Number(l.year) !== Number(filter.year)) {
        return false;
      }
      // Month filter
      if (filter.month !== 'all' && Number(l.month) !== Number(filter.month)) {
        return false;
      }
      // From number
      if (filter.fromNumber !== undefined && !isNaN(filter.fromNumber) && l.recordNumber < filter.fromNumber) {
        return false;
      }
      // To number
      if (filter.toNumber !== undefined && !isNaN(filter.toNumber) && l.recordNumber > filter.toNumber) {
        return false;
      }
      // Ministry filter
      if (filter.ministry && l.recipientMinistry !== filter.ministry) {
        return false;
      }
      // Date range filter
      if (filter.fromDate) {
        const fromD = new Date(filter.fromDate);
        const lDate = new Date(l.year, l.month - 1, l.day);
        if (lDate < fromD) return false;
      }
      if (filter.toDate) {
        const toD = new Date(filter.toDate);
        toD.setHours(23, 59, 59, 999);
        const lDate = new Date(l.year, l.month - 1, l.day);
        if (lDate > toD) return false;
      }
      // Search query
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchSummary = l.summary.toLowerCase().includes(q);
        const matchMinistry = l.recipientMinistry.toLowerCase().includes(q);
        const matchRemarks = l.remarks?.toLowerCase().includes(q) || false;
        const matchNum = String(l.recordNumber).includes(q);
        if (!matchSummary && !matchMinistry && !matchRemarks && !matchNum) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => a.recordNumber - b.recordNumber);
  }, [letters, filter]);

  // Auto-calculated Header Information
  const headerInfo = useMemo(() => {
    return calculateBookHeader(filteredLetters, settings.useKhmerDigits);
  }, [filteredLetters, settings.useKhmerDigits]);

  const handleResetFilter = () => {
    setFilter({
      year: currentYear,
      month: 'all',
      fromNumber: undefined,
      toNumber: undefined,
      fromDate: '',
      toDate: '',
      searchQuery: '',
      ministry: '',
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'លេខរៀង',
      'ខ្លឹមសារ',
      'ថ្ងៃ',
      'ខែ',
      'ឆ្នាំ',
      'ចំនួន',
      'ក្រសួងទទួល',
      'សេចក្ដីផ្សេងៗ',
      'ឈ្មោះឯកសារភ្ជាប់',
      'តំណភ្ជាប់ឯកសារ',
      'CreatedAt',
    ];
    const rows = filteredLetters.map((l) => [
      l.id,
      l.recordNumber,
      l.summary,
      l.day,
      l.month,
      l.year,
      l.quantity,
      l.recipientMinistry,
      l.remarks,
      l.attachmentName || '',
      l.attachmentUrl || '',
      l.createdAt,
    ]);
    exportToCSV(`OutgoingLetters_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-5">
      {/* Official Book Title & Header Card */}
      <div className="bg-white border-2 border-amber-900/20 rounded-xl p-5 shadow-xs text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700"></div>

        {/* Institution Info */}
        <div className="text-xs text-slate-600 font-medium mb-1">
          {settings.departmentName || 'ការិយាល័យអប់រំ យុវជន និងកីឡា'} · {settings.institutionName || 'សាលាបឋមថ្លុកដង្កោ'}
        </div>

        {/* Official Book Title */}
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 font-moul tracking-wide my-1.5">
          សៀវភៅចុះលិខិតចេញ
        </h1>

        {/* Calculated Official Subheaders */}
        <div className="mt-3 py-2.5 px-4 bg-amber-50/70 border border-amber-200/80 rounded-lg inline-block text-xs sm:text-sm text-slate-800 space-y-1">
          <div className="font-semibold text-amber-950 font-moul tracking-wide">
            លេខ <span className="underline underline-offset-4 decoration-amber-600 px-1 tabular-nums">{headerInfo.fromNumberStr}</span> ដល់លេខ <span className="underline underline-offset-4 decoration-amber-600 px-1 tabular-nums">{headerInfo.toNumberStr}</span> សរុប <span className="underline underline-offset-4 decoration-amber-600 px-1 font-bold text-amber-800 tabular-nums">{settings.useKhmerDigits ? toKhmerNum(headerInfo.totalCount) : headerInfo.totalCount}</span>
          </div>
          <div className="text-slate-700">
            <span className="font-medium">{headerInfo.fromDateStr}</span> ដល់ <span className="font-medium">{headerInfo.toDateStr}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Quick Filters & Actions */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមលេខ, ខ្លឹមសារ, ក្រសួងទទួល, កំណត់សម្គាល់..."
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                showAdvancedFilter
                  ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter size={14} />
              <span>ចម្រោះទិន្នន័យ</span>
              <ChevronDown size={13} className={showAdvancedFilter ? 'rotate-180 transition-transform' : ''} />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenPrintPreview}
              className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Printer size={14} />
              <span>បោះពុម្ពសៀវភៅ</span>
            </button>

            <button
              onClick={onAddLetter}
              className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs font-semibold"
            >
              <Plus size={15} />
              <span>+ បញ្ចូលលិខិតចេញ</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilter && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {/* Year Selector */}
            <div>
              <label className="block text-slate-500 mb-1 font-medium">ឆ្នាំ</label>
              <select
                value={filter.year}
                onChange={(e) =>
                  setFilter({ ...filter, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-600 focus:outline-hidden"
              >
                <option value="all">ទាំងអស់</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    ឆ្នាំ {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div>
              <label className="block text-slate-500 mb-1 font-medium">ខែ</label>
              <select
                value={filter.month}
                onChange={(e) =>
                  setFilter({ ...filter, month: e.target.value === 'all' ? 'all' : Number(e.target.value) })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-600 focus:outline-hidden"
              >
                <option value="all">គ្រប់ខែទាំងអស់</option>
                {KHMER_MONTHS.map((mName, idx) => (
                  <option key={idx} value={idx + 1}>
                    ខែ {idx + 1} ({mName})
                  </option>
                ))}
              </select>
            </div>

            {/* From Number */}
            <div>
              <label className="block text-slate-500 mb-1 font-medium">ពីលេខរៀង</label>
              <input
                type="number"
                min="1"
                placeholder="ឧ. 1"
                value={filter.fromNumber !== undefined ? filter.fromNumber : ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    fromNumber: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-600 focus:outline-hidden"
              >
              </input>
            </div>

            {/* To Number */}
            <div>
              <label className="block text-slate-500 mb-1 font-medium">ដល់លេខរៀង</label>
              <input
                type="number"
                min="1"
                placeholder="ឧ. 50"
                value={filter.toNumber !== undefined ? filter.toNumber : ''}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    toNumber: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-600 focus:outline-hidden"
              >
              </input>
            </div>

            {/* Ministry Filter */}
            <div>
              <label className="block text-slate-500 mb-1 font-medium">ក្រសួងទទួល</label>
              <select
                value={filter.ministry || ''}
                onChange={(e) => setFilter({ ...filter, ministry: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:border-amber-600 focus:outline-hidden truncate"
              >
                <option value="">ទាំងអស់</option>
                {availableMinistries.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilter}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw size={13} />
                <span>កំណត់ឡើងវិញ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Strict 5-Column Table Container as required */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold font-moul text-center text-xs">
                {/* 1. លេខរៀង (ល.រ) */}
                <th className="py-3 px-3 border-r border-slate-300 w-16 sm:w-20">
                  ល.រ
                </th>
                {/* 2. ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ */}
                <th className="py-3 px-4 border-r border-slate-300 min-w-[280px] sm:min-w-[340px]">
                  ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ
                </th>
                {/* 3. ចំនួន */}
                <th className="py-3 px-3 border-r border-slate-300 w-20 sm:w-24">
                  ចំនួន
                </th>
                {/* 4. ក្រសួងទទួល */}
                <th className="py-3 px-4 border-r border-slate-300 w-52 sm:w-64">
                  ក្រសួងទទួល
                </th>
                {/* 5. សេចក្ដីផ្សេងៗ */}
                <th className="py-3 px-4 border-r border-slate-300 min-w-[150px]">
                  សេចក្ដីផ្សេងៗ
                </th>
                {/* 6. ឯកសារភ្ជាប់ (បន្ទាប់ពី សេចក្ដីផ្សេងៗ) */}
                <th className="no-print py-3 px-3 border-r border-slate-300 w-36 sm:w-44 text-center">
                  ឯកសារភ្ជាប់
                </th>
                {/* Action Column strictly for Web Management (Hidden in Print) */}
                <th className="no-print py-3 px-2 w-24 bg-slate-200 text-slate-700 font-sans font-medium text-center">
                  សកម្មភាព
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm">មិនមានកំណត់ត្រាលិខិតចេញដែលត្រូវនឹងលក្ខខណ្ឌចម្រោះទេ</p>
                    <button
                      onClick={onAddLetter}
                      className="mt-3 px-3 py-1.5 text-xs text-amber-700 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> ចុះលិខិតចេញថ្មី
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((item) => {
                  const dayStr = String(item.day).padStart(2, '0');
                  const monthStr = String(item.month).padStart(2, '0');
                  const dateDisplay = `ថ្ងៃទី ${settings.useKhmerDigits ? toKhmerNum(dayStr) : dayStr} ខែ ${settings.useKhmerDigits ? toKhmerNum(monthStr) : monthStr} ឆ្នាំ ${settings.useKhmerDigits ? toKhmerNum(item.year) : item.year}`;
                  const numDisplay = padNumber(item.recordNumber, 3, settings.useKhmerDigits);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/40 transition-colors group align-top"
                    >
                      {/* Column 1: ល.រ */}
                      <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-900 tabular-nums">
                        {numDisplay}
                      </td>

                      {/* Column 2: ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-900">
                        <div className="font-medium text-slate-900 leading-relaxed mb-1.5">
                          {item.summary}
                        </div>
                        <div className="text-xs text-slate-500 font-normal flex items-center gap-1">
                          <Calendar size={13} className="text-amber-700/70 shrink-0" />
                          <span>{dateDisplay}</span>
                        </div>
                      </td>

                      {/* Column 3: ចំនួន */}
                      <td className="py-3 px-3 border-r border-slate-200 text-center text-slate-800 tabular-nums font-medium">
                        {settings.useKhmerDigits ? toKhmerNum(item.quantity) : item.quantity} <span className="text-[11px] text-slate-500 font-normal">ច្បាប់</span>
                      </td>

                      {/* Column 4: ក្រសួងទទួល */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-900 font-medium">
                        <div className="flex items-start gap-1.5">
                          <Building size={14} className="text-amber-700/70 mt-0.5 shrink-0" />
                          <span>{item.recipientMinistry}</span>
                        </div>
                      </td>

                      {/* Column 5: សេចក្ដីផ្សេងៗ */}
                      <td className="py-3 px-4 border-r border-slate-200 text-slate-600 text-xs leading-relaxed">
                        {item.remarks || <span className="text-slate-300">-</span>}
                      </td>

                      {/* Column 6: ឯកសារភ្ជាប់ (បន្ទាប់ពី សេចក្ដីផ្សេងៗ) */}
                      <td className="no-print py-3 px-3 border-r border-slate-200 text-center align-middle">
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-medium transition-colors max-w-full group/btn"
                            title={item.attachmentName || 'បើកមើលឯកសារភ្ជាប់'}
                          >
                            {item.attachmentType === 'link' ? (
                              <Link2 size={13} className="text-amber-700 shrink-0" />
                            ) : (
                              <FileText size={13} className="text-amber-700 shrink-0" />
                            )}
                            <span className="truncate max-w-[90px] sm:max-w-[120px]">
                              {item.attachmentName || (item.attachmentType === 'link' ? 'តំណភ្ជាប់' : 'ឯកសារ')}
                            </span>
                            <ExternalLink size={11} className="text-amber-600 shrink-0 group-hover/btn:translate-x-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Web Action Controls (Hidden on Print) */}
                      <td className="no-print py-3 px-2 text-center align-middle">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewLetter(item)}
                            title="មើលព័ត៌មានលម្អិត"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onEditLetter(item)}
                            title="កែប្រែ"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteLetter(item)}
                            title="លុប"
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            បង្ហាញ <span className="font-semibold text-slate-800 tabular-nums">{filteredLetters.length}</span> លើ <span className="font-semibold text-slate-800 tabular-nums">{letters.length}</span> កំណត់ត្រាសរុប
          </div>
          <div className="flex items-center gap-3">
            <span>ទម្រង់តារាងផ្លូវការ ៥ ជួរឈរ</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenPrintPreview}
              className="text-amber-700 hover:underline font-medium"
            >
              មើលទម្រង់បោះពុម្ព A4/A5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
