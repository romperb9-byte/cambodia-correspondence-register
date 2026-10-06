import React, { useState, useMemo } from 'react';
import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { KHMER_MONTHS, toKhmerNum } from '../utils/khmerNumerals';
import { exportToCSV } from '../services/storageService';
import { BarChart3, Download, Printer, Calendar, Building, FileText } from 'lucide-react';

interface Props {
  outgoingLetters: OutgoingLetter[];
  incomingLetters: IncomingLetter[];
  settings: SystemSettings;
}

export const ReportsView: React.FC<Props> = ({
  outgoingLetters,
  incomingLetters,
  settings,
}) => {
  const currentYear = settings.currentYear || new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Available years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    outgoingLetters.forEach((l) => set.add(Number(l.year)));
    incomingLetters.forEach((l) => set.add(Number(l.year)));
    if (!set.has(currentYear)) set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  }, [outgoingLetters, incomingLetters, currentYear]);

  // Letters filtered by year
  const outThisYear = useMemo(
    () => outgoingLetters.filter((l) => Number(l.year) === selectedYear),
    [outgoingLetters, selectedYear]
  );
  const inThisYear = useMemo(
    () => incomingLetters.filter((l) => Number(l.year) === selectedYear),
    [incomingLetters, selectedYear]
  );

  // Monthly breakdown
  const monthlyStats = useMemo(() => {
    return KHMER_MONTHS.map((name, idx) => {
      const monthNum = idx + 1;
      const outLetters = outThisYear.filter((l) => Number(l.month) === monthNum);
      const inLetters = inThisYear.filter((l) => Number(l.month) === monthNum);
      const outCopies = outLetters.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
      const inCopies = inLetters.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);

      return {
        monthNum,
        monthName: name,
        outCount: outLetters.length,
        inCount: inLetters.length,
        outCopies,
        inCopies,
        totalLetters: outLetters.length + inLetters.length,
      };
    });
  }, [outThisYear, inThisYear]);

  // Top recipient ministries (Outgoing)
  const topRecipients = useMemo(() => {
    const counts: { [key: string]: number } = {};
    outThisYear.forEach((l) => {
      const min = l.recipientMinistry || 'មិនបានបញ្ជាក់';
      counts[min] = (counts[min] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [outThisYear]);

  // Top sender ministries (Incoming)
  const topSenders = useMemo(() => {
    const counts: { [key: string]: number } = {};
    inThisYear.forEach((l) => {
      const min = l.senderMinistry || 'មិនបានបញ្ជាក់';
      counts[min] = (counts[min] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [inThisYear]);

  const totalOutYear = outThisYear.length;
  const totalInYear = inThisYear.length;
  const grandTotal = totalOutYear + totalInYear;

  const handleExportReportCSV = () => {
    const headers = ['ខែ', 'លិខិតចេញ (ចំនួនលិខិត)', 'លិខិតចេញ (ចំនួនច្បាប់)', 'លិខិតចូល (ចំនួនលិខិត)', 'លិខិតចូល (ចំនួនច្បាប់)', 'សរុបលិខិត'];
    const rows = monthlyStats.map((m) => [
      `ខែ ${m.monthNum} (${m.monthName})`,
      m.outCount,
      m.outCopies,
      m.inCount,
      m.inCopies,
      m.totalLetters,
    ]);
    rows.push([
      'សរុបប្រចាំឆ្នាំ',
      totalOutYear,
      monthlyStats.reduce((s, m) => s + m.outCopies, 0),
      totalInYear,
      monthlyStats.reduce((s, m) => s + m.inCopies, 0),
      grandTotal,
    ]);
    exportToCSV(`Annual_Correspondence_Report_${selectedYear}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-moul">
            របាយការណ៍បូកសរុបលិខិតរដ្ឋបាល
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ស្ថិតិលម្អិតនៃលិខិតចេញ និងលិខិតចូលប្រចាំឆ្នាំ {selectedYear} របស់ {settings.institutionName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">ជ្រើសរើសឆ្នាំ៖</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-amber-600"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  ឆ្នាំ {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportReportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
          <span className="text-xs text-slate-500 block mb-1">លិខិតចេញសរុប (ឆ្នាំ {selectedYear})</span>
          <span className="text-2xl sm:text-3xl font-bold text-amber-700 tabular-nums">
            {totalOutYear}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">លិខិត</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
          <span className="text-xs text-slate-500 block mb-1">លិខិតចូលសរុប (ឆ្នាំ {selectedYear})</span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
            {totalInYear}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">លិខិត</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-center">
          <span className="text-xs text-slate-500 block mb-1">ចរន្តលិខិតសរុប (ឆ្នាំ {selectedYear})</span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {grandTotal}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">លិខិត</span>
        </div>
      </div>

      {/* Monthly Detailed Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-moul">
            តារាងបែងចែកបរិមាណលិខិតតាមខែនីមួយៗ ឆ្នាំ {selectedYear}
          </h2>
          <span className="text-xs text-slate-500">គិតជាចំនួនលិខិត និងចំនួនច្បាប់</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-2.5 px-4 text-center w-16">ខែ</th>
                <th className="py-2.5 px-4">ឈ្មោះខែ</th>
                <th className="py-2.5 px-4 text-center text-amber-900">លិខិតចេញ (ចំនួនលិខិត)</th>
                <th className="py-2.5 px-4 text-center text-amber-900">លិខិតចេញ (ចំនួនច្បាប់)</th>
                <th className="py-2.5 px-4 text-center text-blue-900">លិខិតចូល (ចំនួនលិខិត)</th>
                <th className="py-2.5 px-4 text-center text-blue-900">លិខិតចូល (ចំនួនច្បាប់)</th>
                <th className="py-2.5 px-4 text-center font-bold text-slate-900">សរុប (លិខិត)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyStats.map((m) => (
                <tr key={m.monthNum} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 text-center font-bold text-slate-900 tabular-nums">
                    {m.monthNum}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {m.monthName}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums text-amber-700 font-medium">
                    {m.outCount}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums text-slate-600">
                    {m.outCopies}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums text-blue-700 font-medium">
                    {m.inCount}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums text-slate-600">
                    {m.inCopies}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums font-bold text-slate-900">
                    {m.totalLetters}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                <td colSpan={2} className="py-3 px-4 text-center font-moul text-xs">
                  សរុបប្រចាំឆ្នាំ {selectedYear}
                </td>
                <td className="py-3 px-4 text-center tabular-nums text-amber-800">
                  {totalOutYear}
                </td>
                <td className="py-3 px-4 text-center tabular-nums text-slate-800">
                  {monthlyStats.reduce((s, m) => s + m.outCopies, 0)}
                </td>
                <td className="py-3 px-4 text-center tabular-nums text-blue-800">
                  {totalInYear}
                </td>
                <td className="py-3 px-4 text-center tabular-nums text-slate-800">
                  {monthlyStats.reduce((s, m) => s + m.inCopies, 0)}
                </td>
                <td className="py-3 px-4 text-center tabular-nums text-slate-950 font-bold text-sm">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Top Ministries Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Outgoing Recipients */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 font-moul mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            ស្ថាប័នដែលបានផ្ញើលិខិតចេញទៅច្រើនជាងគេ
          </h3>
          <div className="space-y-2 text-xs">
            {topRecipients.length === 0 ? (
              <p className="text-slate-400 py-3 text-center">គ្មានទិន្នន័យ</p>
            ) : (
              topRecipients.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800 truncate pr-2">{item.name}</span>
                  <span className="font-bold text-amber-700 tabular-nums shrink-0">{item.count} លិខិត</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Incoming Senders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 font-moul mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            ស្ថាប័នដែលបានផ្ញើលិខិតចូលមកច្រើនជាងគេ
          </h3>
          <div className="space-y-2 text-xs">
            {topSenders.length === 0 ? (
              <p className="text-slate-400 py-3 text-center">គ្មានទិន្នន័យ</p>
            ) : (
              topSenders.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-800 truncate pr-2">{item.name}</span>
                  <span className="font-bold text-blue-700 tabular-nums shrink-0">{item.count} លិខិត</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
