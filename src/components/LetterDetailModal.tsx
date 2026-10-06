import React from 'react';
import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { padNumber, toKhmerNum } from '../utils/khmerNumerals';
import { X, Calendar, Building, Hash, FileText, Tag, Edit3, Trash2, ExternalLink, Link2, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: 'outgoing' | 'incoming';
  letter: OutgoingLetter | IncomingLetter | null;
  settings: SystemSettings;
  onEdit: () => void;
  onDelete: () => void;
}

export const LetterDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  type,
  letter,
  settings,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !letter) return null;

  const isOutgoing = type === 'outgoing';
  const outLetter = isOutgoing ? (letter as OutgoingLetter) : null;
  const inLetter = !isOutgoing ? (letter as IncomingLetter) : null;

  const dayStr = String(letter.day).padStart(2, '0');
  const monthStr = String(letter.month).padStart(2, '0');
  const dateFormatted = `ថ្ងៃទី ${settings.useKhmerDigits ? toKhmerNum(dayStr) : dayStr} ខែ ${settings.useKhmerDigits ? toKhmerNum(monthStr) : monthStr} ឆ្នាំ ${settings.useKhmerDigits ? toKhmerNum(letter.year) : letter.year}`;

  const isImageDataUrl = Boolean(
    letter.attachmentUrl &&
    (letter.attachmentUrl.startsWith('data:image/') ||
      letter.attachmentName?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b border-slate-200 flex items-center justify-between ${
            isOutgoing ? 'bg-amber-50/70' : 'bg-blue-50/70'
          }`}
        >
          <div>
            <span
              className={`text-[11px] font-bold tracking-wider uppercase block ${
                isOutgoing ? 'text-amber-800' : 'text-blue-800'
              }`}
            >
              {isOutgoing ? 'សៀវភៅចុះលិខិតចេញ' : 'សៀវភៅចុះលិខិតចូល'}
            </span>
            <h2 className="text-base font-bold text-slate-900 font-moul mt-0.5">
              លេខកូដ {padNumber(letter.recordNumber, 3, settings.useKhmerDigits)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              ខ្លឹមសារលិខិត
            </span>
            <p className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
              {letter.summary}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                {isOutgoing ? 'ក្រសួងទទួល' : 'ក្រសួងដើម (អ្នកផ្ញើ)'}
              </span>
              <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Building size={14} className={isOutgoing ? 'text-amber-700' : 'text-blue-700'} />
                <span>{isOutgoing ? outLetter?.recipientMinistry : inLetter?.senderMinistry}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                ចំនួនឯកសារ
              </span>
              <p className="font-bold text-slate-900 text-sm tabular-nums">
                {settings.useKhmerDigits ? toKhmerNum(letter.quantity) : letter.quantity} ច្បាប់
              </p>
            </div>

            {!isOutgoing && (
              <div className="col-span-2">
                <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                  លេខលិខិតដើម
                </span>
                <p className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <Tag size={14} className="text-blue-700" />
                  <span>{inLetter?.originalLetterNumber || 'គ្មាន'}</span>
                </p>
              </div>
            )}

            <div className="col-span-2">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                កាលបរិច្ឆេទ
              </span>
              <p className="font-medium text-slate-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-500" />
                <span>{dateFormatted}</span>
              </p>
            </div>

            {/* Row 5: សេចក្ដីផ្សេងៗ */}
            <div className="col-span-2">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                សេចក្ដីផ្សេងៗ (កំណត់សម្គាល់)
              </span>
              <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                {letter.remarks || 'គ្មានកំណត់សម្គាល់បន្ថែម'}
              </p>
            </div>

            {/* Row 6: បន្ទាប់ពី សេចក្ដីផ្សេងៗ បង្ហាញឯកសារភ្ជាប់ ឬតំណភ្ជាប់ */}
            <div className="col-span-2">
              <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                ឯកសារភ្ជាប់ (Attachment / Document Link)
              </span>
              {letter.attachmentUrl ? (
                <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        {letter.attachmentType === 'link' ? <Link2 size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {letter.attachmentName || (letter.attachmentType === 'link' ? 'តំណភ្ជាប់ឯកសារ' : 'ឯកសារភ្ជាប់')}
                        </p>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {letter.attachmentType === 'link' ? 'Google Drive / តំណភ្ជាប់ខាងក្រៅ' : 'ឯកសារដែលបានផ្ទុកឡើង'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={letter.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                    >
                      <ExternalLink size={13} />
                      <span>បើកមើល</span>
                    </a>
                  </div>

                  {/* Thumbnail Preview for Images */}
                  {isImageDataUrl && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 flex justify-center">
                      <img
                        src={letter.attachmentUrl}
                        alt={letter.attachmentName || 'Attachment preview'}
                        className="max-h-48 max-w-full rounded-lg border border-slate-200 object-contain shadow-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  គ្មានឯកសារភ្ជាប់
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:underline"
          >
            <Trash2 size={13} />
            <span>លុបកំណត់ត្រានេះ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              បិទ
            </button>
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="px-4 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Edit3 size={13} />
              <span>កែប្រែ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
