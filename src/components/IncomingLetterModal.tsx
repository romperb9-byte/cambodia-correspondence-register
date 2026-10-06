import React, { useState, useEffect } from 'react';
import { IncomingLetter } from '../types';
import { CAMBODIAN_INSTITUTIONS, KHMER_MONTHS } from '../utils/khmerNumerals';
import { AttachmentField } from './AttachmentField';
import { X, Calendar, Building, Hash, FileText, Check, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (letter: IncomingLetter) => void;
  existingLetter?: IncomingLetter | null;
  nextSuggestedNumber: number;
  currentYear: number;
}

export const IncomingLetterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingLetter,
  nextSuggestedNumber,
  currentYear,
}) => {
  const [recordNumber, setRecordNumber] = useState<number>(nextSuggestedNumber);
  const [summary, setSummary] = useState('');
  const [senderMinistry, setSenderMinistry] = useState(CAMBODIAN_INSTITUTIONS[0]);
  const [customMinistry, setCustomMinistry] = useState('');
  const [isCustomMinistry, setIsCustomMinistry] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [originalLetterNumber, setOriginalLetterNumber] = useState('');
  const [day, setDay] = useState<number>(new Date().getDate());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [remarks, setRemarks] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState<'file' | 'link' | undefined>(undefined);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingLetter) {
      setRecordNumber(existingLetter.recordNumber);
      setSummary(existingLetter.summary);
      setQuantity(existingLetter.quantity);
      setOriginalLetterNumber(existingLetter.originalLetterNumber || '');
      setDay(existingLetter.day);
      setMonth(existingLetter.month);
      setYear(existingLetter.year);
      setRemarks(existingLetter.remarks || '');
      setAttachmentUrl(existingLetter.attachmentUrl || '');
      setAttachmentName(existingLetter.attachmentName || '');
      setAttachmentType(existingLetter.attachmentType);

      if (CAMBODIAN_INSTITUTIONS.includes(existingLetter.senderMinistry)) {
        setSenderMinistry(existingLetter.senderMinistry);
        setIsCustomMinistry(false);
        setCustomMinistry('');
      } else {
        setSenderMinistry('custom');
        setIsCustomMinistry(true);
        setCustomMinistry(existingLetter.senderMinistry);
      }
    } else {
      setRecordNumber(nextSuggestedNumber);
      setSummary('');
      setQuantity(1);
      setOriginalLetterNumber('');
      const now = new Date();
      setDay(now.getDate());
      setMonth(now.getMonth() + 1);
      setYear(currentYear);
      setSenderMinistry(CAMBODIAN_INSTITUTIONS[0]);
      setIsCustomMinistry(false);
      setCustomMinistry('');
      setRemarks('');
      setAttachmentUrl('');
      setAttachmentName('');
      setAttachmentType(undefined);
    }
    setErrors({});
  }, [existingLetter, nextSuggestedNumber, currentYear, isOpen]);

  if (!isOpen) return null;

  const handleMinistrySelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomMinistry(true);
      setSenderMinistry('custom');
    } else {
      setIsCustomMinistry(false);
      setSenderMinistry(val);
      setCustomMinistry('');
    }
  };

  const handleSetToday = () => {
    const now = new Date();
    setDay(now.getDate());
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!recordNumber || recordNumber <= 0) {
      newErrors.recordNumber = 'សូមបញ្ចូលលេខរៀងឱ្យបានត្រឹមត្រូវ';
    }
    if (!summary.trim()) {
      newErrors.summary = 'សូមបញ្ចូលខ្លឹមសារសង្ខេបរបស់លិខិត';
    }
    if (!day || day < 1 || day > 31) {
      newErrors.day = 'ថ្ងៃត្រូវនៅចន្លោះពី 1 ដល់ 31';
    }
    if (!month || month < 1 || month > 12) {
      newErrors.month = 'ខែត្រូវនៅចន្លោះពី 1 ដល់ 12';
    }
    if (!year || year < 2000 || year > 2100) {
      newErrors.year = 'ឆ្នាំមិនត្រឹមត្រូវ';
    }
    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'ចំនួនត្រូវធំជាង 0';
    }

    const finalMinistry = isCustomMinistry ? customMinistry.trim() : senderMinistry.trim();
    if (!finalMinistry) {
      newErrors.ministry = 'សូមជ្រើស ឬបញ្ចូលឈ្មោះក្រសួងដើម';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const letterToSave: IncomingLetter = {
      id: existingLetter?.id || `in-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      recordNumber: Number(recordNumber),
      summary: summary.trim(),
      senderMinistry: finalMinistry,
      quantity: Number(quantity),
      originalLetterNumber: originalLetterNumber.trim(),
      day: Number(day),
      month: Number(month),
      year: Number(year),
      remarks: remarks.trim(),
      attachmentUrl: attachmentUrl.trim() || undefined,
      attachmentName: attachmentName.trim() || undefined,
      attachmentType: attachmentType,
      createdAt: existingLetter?.createdAt || new Date().toISOString(),
    };

    onSave(letterToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-moul">
              {existingLetter ? 'កែប្រែកំណត់ត្រាលិខិតចូល' : 'ចុះលិខិតចូលថ្មី'}
            </h2>
            <p className="text-xs text-slate-500">
              ទម្រង់បែបបទកត់ត្រាសៀវភៅចុះលិខិតចូលផ្លូវការ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Row 1: លេខរៀង & ចំនួន */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                <Hash size={13} className="text-blue-700" />
                <span>លេខរៀង (ល.រ) *</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={recordNumber}
                onChange={(e) => setRecordNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden tabular-nums"
              />
              {errors.recordNumber && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.recordNumber}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ចំនួន (ច្បាប់/ឯកសារទទួល) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden tabular-nums"
              />
              {errors.quantity && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.quantity}</span>
              )}
            </div>
          </div>

          {/* Row 2: ក្រសួងដើម */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Building size={13} className="text-blue-700" />
              <span>ក្រសួងដើម / ស្ថាប័នដើមផ្ញើមក *</span>
            </label>
            <select
              value={isCustomMinistry ? 'custom' : senderMinistry}
              onChange={(e) => handleMinistrySelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden mb-2"
            >
              {CAMBODIAN_INSTITUTIONS.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
              <option value="custom">-- បញ្ចូលឈ្មោះក្រសួង/ស្ថាប័នផ្សេងទៀត --</option>
            </select>

            {isCustomMinistry && (
              <input
                type="text"
                placeholder="វាយបញ្ចូលឈ្មោះក្រសួង មន្ទីរ ឬស្ថាប័នដើម..."
                value={customMinistry}
                onChange={(e) => setCustomMinistry(e.target.value)}
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            )}
            {errors.ministry && (
              <span className="text-[11px] text-rose-600 mt-1 block">{errors.ministry}</span>
            )}
          </div>

          {/* Row 3: លេខលិខិតដើម */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Tag size={13} className="text-blue-700" />
              <span>លេខលិខិតដើម (លេខដែលបានចុះពីស្ថាប័នដើម)</span>
            </label>
            <input
              type="text"
              placeholder="ឧ. ០១៥ អយក.សជណ ឬ ៤៥៨ សហវ"
              value={originalLetterNumber}
              onChange={(e) => setOriginalLetterNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Row 4: កាលបរិច្ឆេទលិខិតដើម (ថ្ងៃ ខែ ឆ្នាំ) */}
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-700" />
                <span>កាលបរិច្ឆេទលិខិតដើម (ថ្ងៃ ខែ ឆ្នាំ) *</span>
              </label>
              <button
                type="button"
                onClick={handleSetToday}
                className="text-[11px] text-blue-800 hover:text-blue-900 font-medium hover:underline"
              >
                យកថ្ងៃនេះ
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">ថ្ងៃ (1-31)</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:border-blue-600 focus:outline-hidden tabular-nums text-center"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">ខែ (1-12)</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:border-blue-600 focus:outline-hidden text-center truncate"
                >
                  {KHMER_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      ខែ {idx + 1} ({m})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-0.5">ឆ្នាំ</span>
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:border-blue-600 focus:outline-hidden tabular-nums text-center"
                />
              </div>
            </div>
          </div>

          {/* Row 5: ខ្លឹមសារលិខិត */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <FileText size={13} className="text-blue-700" />
              <span>ខ្លឹមសារលិខិត *</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="កត់ត្រាខ្លឹមសារសង្ខេប ឬកម្មវត្ថុនៃលិខិតដែលបានទទួល..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden leading-relaxed"
            />
            {errors.summary && (
              <span className="text-[11px] text-rose-600 mt-1 block">{errors.summary}</span>
            )}
          </div>

          {/* Row 6: សេចក្ដីផ្សេងៗ */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              សេចក្ដីផ្សេងៗ (កំណត់សម្គាល់បន្ថែម)
            </label>
            <input
              type="text"
              placeholder="សម្គាល់ផ្សេងៗ (ឧ. បានចាត់ចែងជូននាយក, រង់ចាំឯកភាព, ...)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Row 7: បន្ទាប់ពី សេចក្ដីផ្សេងៗ បន្ថែម upload ឯកសារ ឬតំណរលិង ឯកសារ */}
          <AttachmentField
            attachmentUrl={attachmentUrl}
            attachmentName={attachmentName}
            attachmentType={attachmentType}
            onChange={(data) => {
              setAttachmentUrl(data.url || '');
              setAttachmentName(data.name || '');
              setAttachmentType(data.type);
            }}
          />

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check size={15} />
              <span>{existingLetter ? 'រក្សាទុកការកែប្រែ' : 'កត់ត្រាលិខិតចូល'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
