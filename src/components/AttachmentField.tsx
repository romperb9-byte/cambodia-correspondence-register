import React, { useState, useRef } from 'react';
import { Upload, Link2, FileText, ExternalLink, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AttachmentData {
  url?: string;
  name?: string;
  type?: 'file' | 'link';
}

interface Props {
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'file' | 'link';
  onChange: (data: AttachmentData) => void;
}

export const AttachmentField: React.FC<Props> = ({
  attachmentUrl = '',
  attachmentName = '',
  attachmentType = 'file',
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>(attachmentType === 'link' ? 'link' : 'upload');
  const [linkInput, setLinkInput] = useState(attachmentType === 'link' ? attachmentUrl : '');
  const [linkNameInput, setLinkNameInput] = useState(attachmentType === 'link' ? attachmentName : '');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAttachment = Boolean(attachmentUrl && attachmentUrl.trim());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setFileError('');
    // Max 10MB check
    if (file.size > 10 * 1024 * 1024) {
      setFileError('ឯកសារធំពេក (លើសពី 10MB)។ សូមប្រើប្រាស់ Google Drive Link ជំនួសវិញ។');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        url: dataUrl,
        name: file.name,
        type: 'file',
      });
    };
    reader.onerror = () => {
      setFileError('បរាជ័យក្នុងការអានឯកសារ');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyLink = () => {
    if (!linkInput.trim()) return;
    onChange({
      url: linkInput.trim(),
      name: linkNameInput.trim() || 'តំណភ្ជាប់ឯកសារ',
      type: 'link',
    });
  };

  const handleClear = () => {
    onChange({
      url: '',
      name: '',
      type: undefined,
    });
    setLinkInput('');
    setLinkNameInput('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <label className="block text-slate-800 font-semibold flex items-center gap-1.5">
          <FileText size={14} className="text-amber-700" />
          <span>ឯកសារភ្ជាប់ ឬតំណភ្ជាប់ឯកសារ (Attachment / Link)</span>
        </label>
        {hasAttachment && (
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>មានឯកសារភ្ជាប់</span>
          </span>
        )}
      </div>

      {hasAttachment ? (
        /* Attached File/Link Card */
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              {attachmentType === 'link' ? <Link2 size={16} /> : <FileText size={16} />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {attachmentName || (attachmentType === 'link' ? 'តំណភ្ជាប់ឯកសារ' : 'ឯកសារភ្ជាប់')}
              </p>
              <span className="text-[11px] text-slate-500 block truncate">
                {attachmentType === 'link' ? 'Google Drive / តំណភ្ជាប់ខាងក្រៅ' : 'ឯកសារដែលបានផ្ទុកឡើង (File)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-700 hover:text-amber-800 hover:bg-amber-100 rounded-md transition-colors flex items-center gap-1 font-medium"
              title="បើកមើលឯកសារ"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">បើកមើល</span>
            </a>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
              title="លុបចេញ"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Upload / Link Selector Tabs */
        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg w-fit text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload size={13} />
              <span>ផ្ទុកឡើងឯកសារ (Upload File)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`px-3 py-1 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'link'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link2 size={13} />
              <span>តំណភ្ជាប់ (Google Drive / Link)</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            /* Upload File Dropzone */
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-300 hover:border-amber-400 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={22} className="mx-auto text-amber-700/80 mb-1.5" />
                <p className="font-semibold text-slate-800 text-xs">
                  ចុចដើម្បីជ្រើសឯកសារ ឬអូសទម្លាក់ទីនេះ (PDF, រូបភាព, Word, Excel)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ទំហំអតិបរមា 10MB (ប្រសិនបើឯកសារធំ សូមប្រើប្រាស់ Google Drive Link)
                </p>
              </div>

              {fileError && (
                <div className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Paste Google Drive / External Link */
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5 font-medium">
                  តំណភ្ជាប់ Google Drive ឬ Website URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... ឬ https://..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:border-amber-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLink}
                    disabled={!linkInput.trim()}
                    className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    ភ្ជាប់
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5 font-medium">
                  ឈ្មោះសម្គាល់ឯកសារ (Optional)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ឯកសារច្បាប់ដើម_PDF ឬ របាយការណ៍ភ្ជាប់"
                  value={linkNameInput}
                  onChange={(e) => setLinkNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
