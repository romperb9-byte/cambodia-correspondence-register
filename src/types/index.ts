export interface OutgoingLetter {
  id: string;
  recordNumber: number; // លេខរៀង (1, 2, 3...)
  summary: string; // ខ្លឹមសារលិខិត
  day: number; // ថ្ងៃ (1-31)
  month: number; // ខែ (1-12)
  year: number; // ឆ្នាំ (e.g. 2026)
  quantity: number; // ចំនួន (ច្បាប់/ឯកសារ)
  recipientMinistry: string; // ក្រសួងទទួល
  remarks: string; // សេចក្ដីផ្សេងៗ
  attachmentUrl?: string; // ឯកសារភ្ជាប់ (Data URL ឬតំណរលីង Google Drive / Web)
  attachmentName?: string; // ឈ្មោះឯកសារ
  attachmentType?: 'file' | 'link'; // ប្រភេទឯកសារ ឬតំណរលីង
  createdAt: string;
}

export interface IncomingLetter {
  id: string;
  recordNumber: number; // លេខរៀង (1, 2, 3...)
  summary: string; // ខ្លឹមសារលិខិត
  senderMinistry: string; // ក្រសួងដើម
  quantity: number; // ចំនួន
  originalLetterNumber: string; // លេខលិខិតដើម
  day: number; // ថ្ងៃ (1-31)
  month: number; // ខែ (1-12)
  year: number; // ឆ្នាំ (e.g. 2026)
  remarks: string; // សេចក្ដីផ្សេងៗ
  attachmentUrl?: string; // ឯកសារភ្ជាប់ (Data URL ឬតំណរលីង Google Drive / Web)
  attachmentName?: string; // ឈ្មោះឯកសារ
  attachmentType?: 'file' | 'link'; // ប្រភេទឯកសារ ឬតំណរលីង
  createdAt: string;
}

export interface SystemSettings {
  institutionName: string; // ឈ្មោះស្ថាប័ន
  departmentName: string; // ឈ្មោះការិយាល័យ/ផ្នែក
  logoUrl?: string; // Logo
  address: string; // អាសយដ្ឋាន
  phone: string; // លេខទូរស័ព្ទ
  email: string; // Email
  currentYear: number; // ឆ្នាំបច្ចុប្បន្ន
  paperSize: 'A4' | 'A5'; // ទំហំក្រដាស
  orientation: 'landscape' | 'portrait'; // ទិសដៅក្រដាស
  showOfficialHeader: boolean; // បង្ហាញបឋមកថាផ្លូវការរាជរដ្ឋាភិបាល
  googleSpreadsheetId: string; // Google Spreadsheet ID
  googleDriveFolderId: string; // Google Drive Folder ID
  googleScriptUrl: string; // Google Apps Script Web App URL
  lastSyncedAt: string | null; // កាលបរិច្ឆេទសមកាលកម្មចុងក្រោយ
  useKhmerDigits: boolean; // ប្រើប្រាស់លេខខ្មែរ (០-៩)
  fontSizePt: number; // ទំហំអក្សរពេលបោះពុម្ព
}

export interface BookFilter {
  year: number | 'all';
  month: number | 'all';
  fromNumber?: number;
  toNumber?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  searchQuery: string;
  ministry?: string;
}

export interface CalculatedHeader {
  fromNumberStr: string;
  toNumberStr: string;
  totalCount: number;
  fromDateStr: string;
  toDateStr: string;
}
