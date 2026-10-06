import React, { useState, useMemo } from 'react';
import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { calculateBookHeader, toKhmerNum, padNumber } from '../utils/khmerNumerals';
import { CambodiaEmblem } from './CambodiaEmblem';
import { Printer, X, FileText, Check, Settings2, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'outgoing' | 'incoming';
  outgoingLetters: OutgoingLetter[];
  incomingLetters: IncomingLetter[];
  settings: SystemSettings;
}

export const PrintPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  type: initialType,
  outgoingLetters,
  incomingLetters,
  settings,
}) => {
  const [bookType, setBookType] = useState<'outgoing' | 'incoming'>(initialType);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>(settings.paperSize || 'A4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(settings.orientation || 'landscape');
  const [showOfficialHeader, setShowOfficialHeader] = useState<boolean>(settings.showOfficialHeader);
  const [useKhmerDigits, setUseKhmerDigits] = useState<boolean>(settings.useKhmerDigits);
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(settings.fontSizePt || 11);

  // Sync initial type when opening
  React.useEffect(() => {
    setBookType(initialType);
  }, [initialType, isOpen]);

  // Active records sorted by sequential number
  const activeRecords = useMemo(() => {
    if (bookType === 'outgoing') {
      return [...outgoingLetters].sort((a, b) => a.recordNumber - b.recordNumber);
    } else {
      return [...incomingLetters].sort((a, b) => a.recordNumber - b.recordNumber);
    }
  }, [bookType, outgoingLetters, incomingLetters]);

  // Calculate header dynamically
  const headerInfo = useMemo(() => {
    return calculateBookHeader(activeRecords, useKhmerDigits);
  }, [activeRecords, useKhmerDigits]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden when printing via .no-print) */}
      <div className="no-print sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Book Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setBookType('outgoing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                bookType === 'outgoing'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              សៀវភៅលិខិតចេញ
            </button>
            <button
              onClick={() => setBookType('incoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                bookType === 'incoming'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              សៀវភៅលិខិតចូល
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-2">
            <span>{activeRecords.length} កំណត់ត្រា</span>
          </div>
        </div>

        {/* Center: Print Options */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Paper Size */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setPaperSize('A4')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                paperSize === 'A4' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              A4
            </button>
            <button
              onClick={() => setPaperSize('A5')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                paperSize === 'A5' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              A5
            </button>
          </div>

          {/* Orientation */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                orientation === 'landscape' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ផ្ដេក (Landscape)
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                orientation === 'portrait' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              បញ្ឈរ (Portrait)
            </button>
          </div>

          {/* Header Toggle */}
          <button
            onClick={() => setShowOfficialHeader(!showOfficialHeader)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showOfficialHeader
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {showOfficialHeader ? '✓ បឋមកថារដ្ឋ' : 'បឋមកថារដ្ឋ'}
          </button>

          {/* Khmer Numerals Toggle */}
          <button
            onClick={() => setUseKhmerDigits(!useKhmerDigits)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              useKhmerDigits
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {useKhmerDigits ? '✓ លេខខ្មែរ (០-៩)' : 'លេខអារ៉ាប់ (0-9)'}
          </button>

          {/* Cover Page Toggle */}
          <button
            onClick={() => setIncludeCoverPage(!includeCoverPage)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              includeCoverPage
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {includeCoverPage ? '✓ ទំព័រក្របមុខ' : '+ ទំព័រក្របមុខ'}
          </button>
        </div>

        {/* Right: Print & Close Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>បោះពុម្ពឥឡូវនេះ (Print)</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Printable Paper Canvas */}
      <div className="py-8 px-4 w-full flex justify-center printable-area">
        <div
          className={`bg-white shadow-2xl print:shadow-none text-black mx-auto transition-all ${
            paperSize === 'A4'
              ? orientation === 'landscape'
                ? 'w-[297mm] min-h-[210mm]'
                : 'w-[210mm] min-h-[297mm]'
              : orientation === 'landscape'
              ? 'w-[210mm] min-h-[148mm]'
              : 'w-[148mm] min-h-[210mm]'
          } p-8 sm:p-12 print:p-0 print:m-0`}
          style={{ fontSize: `${fontSize}pt` }}
        >
          {/* ================= OPTIONAL BOOK COVER PAGE ================= */}
          {includeCoverPage && (
            <div
              className="border-4 border-double border-slate-900 p-8 sm:p-12 min-h-[90%] flex flex-col justify-between items-center text-center mb-12"
              style={{ pageBreakAfter: 'always' }}
            >
              {/* National Motto */}
              <div>
                <CambodiaEmblem size={70} className="mx-auto mb-3" />
                <h2 className="font-moul text-base sm:text-lg text-slate-900 tracking-wider">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </h2>
                <h3 className="font-moul text-xs sm:text-sm text-slate-800 tracking-widest mt-1">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </h3>
                <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-2"></div>
              </div>

              {/* Institution Details */}
              <div className="my-8 space-y-2">
                <p className="font-moul text-base sm:text-xl text-slate-900">
                  {settings.institutionName}
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {settings.departmentName}
                </p>
              </div>

              {/* Cover Title */}
              <div className="my-10 py-6 px-10 border-2 border-slate-900 inline-block bg-slate-50/50">
                <h1 className="font-moul text-lg sm:text-2xl text-slate-900 tracking-wider">
                  {bookType === 'outgoing' ? 'សៀវភៅចុះលិខិតចេញ' : 'សៀវភៅចុះលិខិតចូល'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-3">
                  ឆ្នាំ {useKhmerDigits ? toKhmerNum(settings.currentYear) : settings.currentYear}
                </p>
              </div>

              {/* Cover Metadata Range */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                <p>
                  ចាប់ពីលេខ <strong>{headerInfo.fromNumberStr}</strong> ដល់លេខ <strong>{headerInfo.toNumberStr}</strong>
                </p>
                <p>
                  {headerInfo.fromDateStr} ដល់ {headerInfo.toDateStr}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  ចំនួនសរុប៖ <strong>{useKhmerDigits ? toKhmerNum(headerInfo.totalCount) : headerInfo.totalCount}</strong> លិខិត
                </p>
              </div>

              {/* Footer */}
              <div className="text-[11px] text-slate-500 pt-6">
                {settings.address && <span>{settings.address} · </span>}
                {settings.phone && <span>ទូរស័ព្ទ៖ {settings.phone}</span>}
              </div>
            </div>
          )}

          {/* ================= REGISTER BOOK MAIN PAGE ================= */}
          <div className="space-y-4">
            {/* Optional Official National Header */}
            {showOfficialHeader && (
              <div className="flex justify-between items-start text-xs mb-4 pb-2 border-b border-slate-200">
                <div className="text-left">
                  <p className="font-moul text-xs text-slate-900">{settings.institutionName}</p>
                  <p className="text-[11px] text-slate-700">{settings.departmentName}</p>
                </div>
                <div className="text-center">
                  <p className="font-moul text-xs text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                  <p className="font-moul text-[11px] text-slate-800">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                </div>
              </div>
            )}

            {/* Official Book Title (Strictly as specified) */}
            <div className="text-center space-y-1">
              <h1 className="font-moul text-base sm:text-lg text-slate-900 tracking-wide">
                {bookType === 'outgoing' ? 'សៀវភៅចុះលិខិតចេញ' : 'សៀវភៅចុះលិខិតចូល'}
              </h1>

              {/* Header Number and Date calculations strictly as required */}
              <div className="space-y-1 pt-1 text-xs sm:text-sm text-slate-900">
                <div className="font-semibold tracking-wide">
                  លេខ <span className="underline decoration-slate-900 px-1 font-bold">{headerInfo.fromNumberStr}</span> ដល់លេខ <span className="underline decoration-slate-900 px-1 font-bold">{headerInfo.toNumberStr}</span> សរុប <span className="underline decoration-slate-900 px-1 font-bold">{useKhmerDigits ? toKhmerNum(headerInfo.totalCount) : headerInfo.totalCount}</span>
                </div>
                <div className="text-slate-800">
                  <span className="font-medium">{headerInfo.fromDateStr}</span> ដល់ <span className="font-medium">{headerInfo.toDateStr}</span>
                </div>
              </div>
            </div>

            {/* STRICT 5-COLUMN TABLE */}
            <div className="mt-4">
              {bookType === 'outgoing' ? (
                /* OUTGOING TABLE (Strict 5 Columns) */
                <table className="w-full border-collapse border border-slate-900 text-xs sm:text-[11pt]">
                  <thead>
                    <tr className="bg-slate-100 font-moul text-center text-slate-900 border-b border-slate-900">
                      {/* Column 1 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[8%] text-center align-middle">
                        ល.រ
                      </th>
                      {/* Column 2 */}
                      <th className="border border-slate-900 py-2.5 px-3 w-[44%] text-center align-middle">
                        ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ
                      </th>
                      {/* Column 3 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[10%] text-center align-middle">
                        ចំនួន
                      </th>
                      {/* Column 4 */}
                      <th className="border border-slate-900 py-2.5 px-3 w-[22%] text-center align-middle">
                        ក្រសួងទទួល
                      </th>
                      {/* Column 5 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[16%] text-center align-middle">
                        សេចក្ដីផ្សេងៗ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-slate-900 py-8 text-center text-slate-400">
                          គ្មានទិន្នន័យលិខិតចេញ
                        </td>
                      </tr>
                    ) : (
                      (activeRecords as OutgoingLetter[]).map((row) => {
                        const dayStr = String(row.day).padStart(2, '0');
                        const monthStr = String(row.month).padStart(2, '0');
                        const dateStr = `ថ្ងៃទី ${useKhmerDigits ? toKhmerNum(dayStr) : dayStr} ខែ ${useKhmerDigits ? toKhmerNum(monthStr) : monthStr} ឆ្នាំ ${useKhmerDigits ? toKhmerNum(row.year) : row.year}`;
                        const numStr = padNumber(row.recordNumber, 3, useKhmerDigits);

                        return (
                          <tr key={row.id} className="align-top border-b border-slate-900">
                            {/* 1. លេខរៀង */}
                            <td className="border border-slate-900 py-2 px-2 text-center font-bold tabular-nums">
                              {numStr}
                            </td>

                            {/* 2. ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ */}
                            <td className="border border-slate-900 py-2 px-3 leading-relaxed">
                              <div className="font-normal text-slate-900">{row.summary}</div>
                              <div className="text-[10pt] text-slate-700 italic mt-1">
                                {dateStr}
                              </div>
                            </td>

                            {/* 3. ចំនួន */}
                            <td className="border border-slate-900 py-2 px-2 text-center tabular-nums">
                              {useKhmerDigits ? toKhmerNum(row.quantity) : row.quantity}
                            </td>

                            {/* 4. ក្រសួងទទួល */}
                            <td className="border border-slate-900 py-2 px-3">
                              {row.recipientMinistry}
                            </td>

                            {/* 5. សេចក្ដីផ្សេងៗ */}
                            <td className="border border-slate-900 py-2 px-2 text-slate-700 text-[10pt]">
                              {row.remarks || ''}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                /* INCOMING TABLE (Strict 5 Columns) */
                <table className="w-full border-collapse border border-slate-900 text-xs sm:text-[11pt]">
                  <thead>
                    <tr className="bg-slate-100 font-moul text-center text-slate-900 border-b border-slate-900">
                      {/* Column 1 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[8%] text-center align-middle">
                        ល.រ
                      </th>
                      {/* Column 2 */}
                      <th className="border border-slate-900 py-2.5 px-3 w-[42%] text-center align-middle">
                        ខ្លឹមសារលិខិត ក្រសួងដើម
                      </th>
                      {/* Column 3 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[10%] text-center align-middle">
                        ចំនួន
                      </th>
                      {/* Column 4 */}
                      <th className="border border-slate-900 py-2.5 px-3 w-[24%] text-center align-middle">
                        លេខលិខិតដើម ថ្ងៃទី ខែ ឆ្នាំ
                      </th>
                      {/* Column 5 */}
                      <th className="border border-slate-900 py-2.5 px-2 w-[16%] text-center align-middle">
                        សេចក្ដីផ្សេងៗ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-slate-900 py-8 text-center text-slate-400">
                          គ្មានទិន្នន័យលិខិតចូល
                        </td>
                      </tr>
                    ) : (
                      (activeRecords as IncomingLetter[]).map((row) => {
                        const dayStr = String(row.day).padStart(2, '0');
                        const monthStr = String(row.month).padStart(2, '0');
                        const dateStr = `ថ្ងៃទី ${useKhmerDigits ? toKhmerNum(dayStr) : dayStr}/${useKhmerDigits ? toKhmerNum(monthStr) : monthStr}/${useKhmerDigits ? toKhmerNum(row.year) : row.year}`;
                        const numStr = padNumber(row.recordNumber, 3, useKhmerDigits);

                        return (
                          <tr key={row.id} className="align-top border-b border-slate-900">
                            {/* 1. លេខរៀង */}
                            <td className="border border-slate-900 py-2 px-2 text-center font-bold tabular-nums">
                              {numStr}
                            </td>

                            {/* 2. ខ្លឹមសារលិខិត ក្រសួងដើម */}
                            <td className="border border-slate-900 py-2 px-3 leading-relaxed">
                              <div className="font-normal text-slate-900">{row.summary}</div>
                              <div className="text-[10pt] text-slate-800 font-semibold mt-1">
                                ពី៖ {row.senderMinistry}
                              </div>
                            </td>

                            {/* 3. ចំនួន */}
                            <td className="border border-slate-900 py-2 px-2 text-center tabular-nums">
                              {useKhmerDigits ? toKhmerNum(row.quantity) : row.quantity}
                            </td>

                            {/* 4. លេខលិខិតដើម ថ្ងៃទី ខែ ឆ្នាំ */}
                            <td className="border border-slate-900 py-2 px-3">
                              <div className="font-medium">
                                លេខ៖ {row.originalLetterNumber || 'គ្មាន'}
                              </div>
                              <div className="text-[10pt] text-slate-700 italic mt-0.5">
                                {dateStr}
                              </div>
                            </td>

                            {/* 5. សេចក្ដីផ្សេងៗ */}
                            <td className="border border-slate-900 py-2 px-2 text-slate-700 text-[10pt]">
                              {row.remarks || ''}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Official Cambodian Verification / Endorsement Signatures at the bottom */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs sm:text-sm font-medium text-slate-900" style={{ pageBreakInside: 'avoid' }}>
              <div>
                <p className="font-moul text-xs">បានឃើញ និងឯកភាព</p>
                <p className="mt-1 font-semibold">{settings.departmentName || 'ប្រធានការិយាល័យ'}</p>
                <div className="h-16"></div>
                <p className="text-slate-500 text-xs">(ហត្ថលេខា និងត្រា)</p>
              </div>

              <div>
                <p>
                  ថ្ងៃទី............ ខែ............ ឆ្នាំ {useKhmerDigits ? toKhmerNum(settings.currentYear) : settings.currentYear}
                </p>
                <p className="mt-1 font-semibold">អ្នកកត់ត្រា</p>
                <div className="h-16"></div>
                <p className="text-slate-500 text-xs">(ហត្ថលេខា និងឈ្មោះ)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
