import React, { useState } from 'react';
import { SystemSettings, OutgoingLetter, IncomingLetter } from '../types';
import { getGoogleAppsScriptTemplate, syncWithGoogleSheets } from '../services/storageService';
import { CambodiaEmblem } from './CambodiaEmblem';
import { 
  Save, 
  RefreshCw, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Building2, 
  Printer, 
  Database, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Code2
} from 'lucide-react';

interface Props {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  outgoingLetters: OutgoingLetter[];
  incomingLetters: IncomingLetter[];
  onImportAllData: (outgoing: OutgoingLetter[], incoming: IncomingLetter[]) => void;
  onResetSampleData: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  syncStatus: { status: 'idle' | 'success' | 'error'; message: string };
}

export const SettingsView: React.FC<Props> = ({
  settings,
  onSaveSettings,
  outgoingLetters,
  incomingLetters,
  onImportAllData,
  onResetSampleData,
  onSyncNow,
  isSyncing,
  syncStatus,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyAppsScript = () => {
    const code = getGoogleAppsScriptTemplate();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!formData.googleScriptUrl || !formData.googleScriptUrl.trim()) {
      setTestResult({
        success: false,
        message: 'សូមបញ្ចូល Google Apps Script Web App URL ជាមុនសិន',
      });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    const result = await syncWithGoogleSheets(
      formData.googleScriptUrl,
      outgoingLetters,
      incomingLetters
    );

    setTestingConnection(false);
    setTestResult(result);
  };

  const handleExportJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      institution: formData.institutionName,
      settings: formData,
      outgoingLetters,
      incomingLetters,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_correspondence_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.outgoingLetters) && Array.isArray(parsed.incomingLetters)) {
          onImportAllData(parsed.outgoingLetters, parsed.incomingLetters);
          if (parsed.settings) {
            setFormData({ ...formData, ...parsed.settings });
            onSaveSettings({ ...formData, ...parsed.settings });
          }
          alert('បាននាំចូលទិន្នន័យ (Import) ដោយជោគជ័យ!');
        } else {
          alert('ទម្រង់ឯកសារ JSON មិនត្រឹមត្រូវ');
        }
      } catch (err) {
        alert('បរាជ័យក្នុងការអានឯកសារ JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-moul">
            ការកំណត់ប្រព័ន្ធ (System Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            កំណត់ព័ត៌មានស្ថាប័ន ការភ្ជាប់ Google Sheets និងទម្រង់បោះពុម្ព
          </p>
        </div>
        <CambodiaEmblem size={44} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Institution Profile */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-amber-700" />
            <h2 className="text-sm font-bold text-slate-900 font-moul">
              ព័ត៌មានស្ថាប័ន និងការិយាល័យ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ឈ្មោះស្ថាប័ន / សាលារៀន *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. វិទ្យាល័យ ហ៊ុន សែន ព្រែកព្នៅ ឬ ក្រសួងអប់រំ យុវជន និងកីឡា"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ឈ្មោះការិយាល័យ / ផ្នែក *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ការិយាល័យរដ្ឋបាល និងបុគ្គលិក"
                value={formData.departmentName}
                onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                អាសយដ្ឋាន
              </label>
              <input
                type="text"
                placeholder="រាជធានី-ខេត្ត / ក្រុង-ស្រុក-ខណ្ឌ..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                លេខទូរស័ព្ទទំនាក់ទំនង
              </label>
              <input
                type="text"
                placeholder="023 ... / 012 ..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@moeys.gov.kh"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ឆ្នាំប្រតិទិន / ឆ្នាំសិក្សា
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                value={formData.currentYear}
                onChange={(e) => setFormData({ ...formData, currentYear: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Google Sheets Database Configuration */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900 font-moul">
                Google Sheets Database & Google Apps Script API
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 hover:underline"
            >
              <Code2 size={13} />
              <span>មើលកូដ Google Apps Script & របៀបដំឡើង</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            ទិន្នន័យត្រូវបានរក្សាទុកក្នុង Google Sheets តាមរយៈ Google Apps Script Web App API។ ប្រព័ន្ធនឹងអាន និងសរសេរទៅសន្លឹកកិច្ចការ <strong>OutgoingLetters</strong> និង <strong>IncomingLetters</strong> ដោយស្វ័យប្រវត្តិ។
          </p>

          <div className="space-y-4 text-xs">
            {/* Script URL */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Google Apps Script Web App URL *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={formData.googleScriptUrl}
                  onChange={(e) => setFormData({ ...formData, googleScriptUrl: e.target.value })}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <RefreshCw size={13} className={testingConnection ? 'animate-spin' : ''} />
                  <span>{testingConnection ? 'កំពុងតេស្ត...' : 'សាកល្បងការតភ្ជាប់'}</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ទទួលបានពីការ Deploy លើ Google Apps Script ជាមួយសិទ្ធិ "Who has access: Anyone"
              </span>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`mt-2 p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Spreadsheet ID & Drive Folder ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Spreadsheet ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={formData.googleSpreadsheetId}
                  onChange={(e) => setFormData({ ...formData, googleSpreadsheetId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Drive Folder ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                  value={formData.googleDriveFolderId}
                  onChange={(e) => setFormData({ ...formData, googleDriveFolderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Print & Display Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Printer size={18} className="text-amber-700" />
            <h2 className="text-sm font-bold text-slate-900 font-moul">
              ទម្រង់បោះពុម្ព និងការបង្ហាញ (Print & Display Format)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ទំហំក្រដាសលំនាំដើម
              </label>
              <select
                value={formData.paperSize}
                onChange={(e) => setFormData({ ...formData, paperSize: e.target.value as 'A4' | 'A5' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ទិសដៅក្រដាស
              </label>
              <select
                value={formData.orientation}
                onChange={(e) =>
                  setFormData({ ...formData, orientation: e.target.value as 'landscape' | 'portrait' })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              >
                <option value="landscape">ផ្ដេក (Landscape - ស័ក្តិសមបំផុតសម្រាប់ ៥ ជួរឈរ)</option>
                <option value="portrait">បញ្ឈរ (Portrait)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                ទម្រង់លេខ (Numerals)
              </label>
              <select
                value={formData.useKhmerDigits ? 'khmer' : 'arabic'}
                onChange={(e) =>
                  setFormData({ ...formData, useKhmerDigits: e.target.value === 'khmer' })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-amber-600 focus:outline-hidden"
              >
                <option value="arabic">លេខអារ៉ាប់ (0, 1, 2, 3...)</option>
                <option value="khmer">លេខខ្មែរ (០, ១, ២, ៣...)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={formData.showOfficialHeader}
                onChange={(e) => setFormData({ ...formData, showOfficialHeader: e.target.checked })}
                className="rounded-xs text-amber-700 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-medium">
                បង្ហាញបឋមកថាផ្លូវការរាជរដ្ឋាភិបាល (ព្រះរាជាណាចក្រកម្ពុជា ជាតិ សាសនា ព្រះមហាក្សត្រ) ក្នុងទំព័របោះពុម្ព
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Data Backup & Restore */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database size={18} className="text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 font-moul">
              ការបម្រុងទុក និងស្ដារទិន្នន័យ (Backup & Restore)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>ទាញយកទិន្នន័យបម្រុងទុក (Export JSON)</span>
            </button>

            <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload size={14} />
              <span>ស្ដារទិន្នន័យ (Import JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញមែនទេ? កំណត់ត្រាថ្មីៗអាចនឹងត្រូវបាត់បង់។')) {
                  onResetSampleData();
                }
              }}
              className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium transition-colors ml-auto"
            >
              ផ្ទុកទិន្នន័យគំរូឡើងវិញ (Reset to Sample)
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 size={16} />
              <span>បានរក្សាទុកការកំណត់ដោយជោគជ័យ!</span>
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save size={15} />
            <span>រក្សាទុកការកំណត់</span>
          </button>
        </div>
      </form>

      {/* Code Modal with Instructions */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code2 size={20} className="text-emerald-700" />
                <h3 className="font-moul text-sm text-slate-900">
                  កូដ Google Apps Script Web App API
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-amber-900 font-moul">របៀបតភ្ជាប់ជាមួយ Google Sheets (១០ ជំហានងាយៗ):</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 leading-relaxed">
                  <li>បង្កើត Google Spreadsheet ថ្មីមួយនៅក្នុង Google Drive របស់អ្នក</li>
                  <li>ចុចលើ Menu <strong>Extensions (ផ្នែកបន្ថែម)</strong> → <strong>Apps Script</strong></li>
                  <li>លុបកូដចាស់ក្នុងផ្ទាំង Apps Script ចោលទាំងស្រុង</li>
                  <li>ចុចប៊ូតុង "ចម្លងកូដ Apps Script" ខាងក្រោម ហើយ Paste ចូលក្នុង Apps Script</li>
                  <li>ចុចរូប Save (រូបថាស) ឬចុច Ctrl+S</li>
                  <li>ចុចប៊ូតុង <strong>Deploy (ដាក់ពង្រាយ)</strong> → <strong>New deployment</strong></li>
                  <li>ចុចលើរូប Gear (Select type) → ជ្រើស <strong>Web app</strong></li>
                  <li>ត្រង់ "Execute as" ជ្រើស <strong>Me</strong></li>
                  <li>ត្រង់ "Who has access" ជ្រើស <strong>Anyone</strong> (សំខាន់បំផុត ដើម្បីឱ្យ Web App អាន/សរសេរបាន)</li>
                  <li>ចុច Deploy → ចុច Authorize access → ចម្លង Web App URL យកមកបិទភ្ជាប់ (Paste) ក្នុង Settings នេះ!</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-slate-700">កូដ Google Apps Script (JavaScript):</span>
                <button
                  onClick={handleCopyAppsScript}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'បានចម្លងរួចរាល់!' : 'ចម្លងកូដ Apps Script'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-80 border border-slate-700">
                {getGoogleAppsScriptTemplate()}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
              >
                យល់ព្រម និងបិទ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
