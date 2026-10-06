import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { INITIAL_SETTINGS, INITIAL_OUTGOING_LETTERS, INITIAL_INCOMING_LETTERS } from '../data/initialData';

const OUTGOING_KEY = 'cambodia_correspondence_outgoing_v1';
const INCOMING_KEY = 'cambodia_correspondence_incoming_v1';
const SETTINGS_KEY = 'cambodia_correspondence_settings_v1';

export function loadSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.googleScriptUrl) {
        parsed.googleScriptUrl = INITIAL_SETTINGS.googleScriptUrl;
      }
      if (parsed.institutionName === 'វិទ្យាល័យ ហ៊ុន សែន ព្រែកព្នៅ' || !parsed.institutionName) {
        parsed.institutionName = INITIAL_SETTINGS.institutionName;
      }
      if (parsed.departmentName === 'ការិយាល័យរដ្ឋបាល និងបុគ្គលិក' || !parsed.departmentName) {
        parsed.departmentName = INITIAL_SETTINGS.departmentName;
      }
      return { ...INITIAL_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load settings from storage', err);
  }
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to storage', err);
  }
}

export function loadOutgoingLetters(): OutgoingLetter[] {
  try {
    const raw = localStorage.getItem(OUTGOING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load outgoing letters', err);
  }
  return INITIAL_OUTGOING_LETTERS;
}

export function saveOutgoingLetters(letters: OutgoingLetter[]): void {
  try {
    localStorage.setItem(OUTGOING_KEY, JSON.stringify(letters));
  } catch (err) {
    console.error('Failed to save outgoing letters', err);
  }
}

export function loadIncomingLetters(): IncomingLetter[] {
  try {
    const raw = localStorage.getItem(INCOMING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load incoming letters', err);
  }
  return INITIAL_INCOMING_LETTERS;
}

export function saveIncomingLetters(letters: IncomingLetter[]): void {
  try {
    localStorage.setItem(INCOMING_KEY, JSON.stringify(letters));
  } catch (err) {
    console.error('Failed to save incoming letters', err);
  }
}

/**
 * Sync data with Google Apps Script Web App API
 */
export async function syncWithGoogleSheets(
  scriptUrl: string,
  outgoing: OutgoingLetter[],
  incoming: IncomingLetter[]
): Promise<{ success: boolean; message: string; outgoing?: OutgoingLetter[]; incoming?: IncomingLetter[] }> {
  if (!scriptUrl || !scriptUrl.trim()) {
    return { success: false, message: 'សូមបញ្ចូល Google Apps Script Web App URL នៅក្នុងការកំណត់ជាមុនសិន' };
  }

  const cleanUrl = scriptUrl.trim();

  try {
    // Attempt to push current state and get latest
    const payload = {
      action: 'sync_all',
      outgoing,
      incoming,
    };

    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // text/plain avoids CORS preflight issues with Google Apps Script
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    if (data.status === 'success' || data.success) {
      return {
        success: true,
        message: 'សមកាលកម្មជាមួយ Google Sheets បានជោគជ័យ!',
        outgoing: Array.isArray(data.outgoing) ? data.outgoing : outgoing,
        incoming: Array.isArray(data.incoming) ? data.incoming : incoming,
      };
    } else {
      return {
        success: false,
        message: data.message || 'ការឆ្លើយតបពី Google Sheets មិនត្រឹមត្រូវ',
      };
    }
  } catch (err: any) {
    console.warn('Sync error, testing with GET method:', err);
    try {
      // Fallback check if GET works
      const testRes = await fetch(`${cleanUrl}?action=get_all`);
      if (testRes.ok) {
        const testData = await testRes.json();
        if (testData.status === 'success' && testData.outgoing && testData.incoming) {
          return {
            success: true,
            message: 'ទាញយកទិន្នន័យពី Google Sheets បានជោគជ័យ!',
            outgoing: testData.outgoing,
            incoming: testData.incoming,
          };
        }
      }
    } catch (fallbackErr) {
      // ignore
    }

    return {
      success: false,
      message: `មិនអាចភ្ជាប់ទៅ Google Apps Script បានទេ (Failed to fetch)៖ មូលហេតុមកពី Deployment មិនទាន់បើកជា Anyone ឬ URL ចាស់។ សូមចូល Google Sheets ➜ Extensions ➜ Apps Script ➜ Deploy ➜ Manage Deployments ➜ កែសម្រួលយក "Who has access: Anyone" រួច Save។`,
    };
  }
}

/**
 * Complete Google Apps Script template for the user to copy & paste into extensions -> Apps Script
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * Google Apps Script Web App API សម្រាប់ប្រព័ន្ធសៀវភៅចុះលិខិតចេញ-ចូល
 * ស្ថាប័នអប់រំ និងរដ្ឋបាលកម្ពុជា
 * 
 * របៀបដំឡើង (Setup Instructions):
 * 1. បង្កើត Google Spreadsheet ថ្មីមួយ
 * 2. ចុច Extensions (ផ្នែកបន្ថែម) -> Apps Script
 * 3. លុបកូដចាស់ចោល ហើយបិទភ្ជាប់ (Paste) កូដខាងក្រោមនេះទាំងស្រុង
 * 4. ចុច Save (រក្សាទុក)
 * 5. ចុច Deploy (ដាក់ពង្រាយ) -> New deployment (ការដាក់ពង្រាយថ្មី)
 * 6. ជ្រើស Select type (ជ្រើសប្រភេទ) -> Web app
 * 7. កំណត់ "Execute as": Me (ខ្ញុំ)
 * 8. កំណត់ "Who has access": Anyone (នរណាម្នាក់) *** សំខាន់ណាស់ ***
 * 9. ចុច Deploy -> អនុញ្ញាតសិទ្ធិ (Authorize access)
 * 10. ចម្លង Web App URL យកទៅដាក់ក្នុង Settings នៃ Web Application នេះ
 */

const OUTGOING_SHEET_NAME = 'OutgoingLetters';
const INCOMING_SHEET_NAME = 'IncomingLetters';

const OUTGOING_HEADERS = [
  'ID', 'លេខរៀង', 'ខ្លឹមសារ', 'ថ្ងៃ', 'ខែ', 'ឆ្នាំ', 'ចំនួន', 'ក្រសួងទទួល', 'សេចក្ដីផ្សេងៗ', 'ឈ្មោះឯកសារភ្ជាប់', 'តំណភ្ជាប់ឯកសារ', 'CreatedAt'
];

const INCOMING_HEADERS = [
  'ID', 'លេខរៀង', 'ខ្លឹមសារ', 'ក្រសួងដើម', 'ចំនួន', 'លេខលិខិតដើម', 'ថ្ងៃ', 'ខែ', 'ឆ្នាំ', 'សេចក្ដីផ្សេងៗ', 'ឈ្មោះឯកសារភ្ជាប់', 'តំណភ្ជាប់ឯកសារ', 'CreatedAt'
];

function initSheets(ss) {
  let outSheet = ss.getSheetByName(OUTGOING_SHEET_NAME);
  if (!outSheet) {
    outSheet = ss.insertSheet(OUTGOING_SHEET_NAME);
    outSheet.appendRow(OUTGOING_HEADERS);
    outSheet.getRange(1, 1, 1, OUTGOING_HEADERS.length).setFontWeight('bold').setBackground('#E2E8F0');
    outSheet.setFrozenRows(1);
  }

  let inSheet = ss.getSheetByName(INCOMING_SHEET_NAME);
  if (!inSheet) {
    inSheet = ss.insertSheet(INCOMING_SHEET_NAME);
    inSheet.appendRow(INCOMING_HEADERS);
    inSheet.getRange(1, 1, 1, INCOMING_HEADERS.length).setFontWeight('bold').setBackground('#E2E8F0');
    inSheet.setFrozenRows(1);
  }

  return { outSheet, inSheet };
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const { outSheet, inSheet } = initSheets(ss);

    const outgoing = readSheetRows(outSheet, OUTGOING_HEADERS, 'outgoing');
    const incoming = readSheetRows(inSheet, INCOMING_HEADERS, 'incoming');

    const result = {
      status: 'success',
      outgoing: outgoing,
      incoming: incoming,
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const { outSheet, inSheet } = initSheets(ss);
    
    let contents;
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else {
      contents = e.parameter;
    }

    const action = contents.action || 'sync_all';

    if (action === 'sync_all' || action === 'update_all') {
      if (Array.isArray(contents.outgoing)) {
        writeSheetRows(outSheet, OUTGOING_HEADERS, contents.outgoing, 'outgoing');
      }
      if (Array.isArray(contents.incoming)) {
        writeSheetRows(inSheet, INCOMING_HEADERS, contents.incoming, 'incoming');
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data successfully synced with Google Sheets',
        outgoing: readSheetRows(outSheet, OUTGOING_HEADERS, 'outgoing'),
        incoming: readSheetRows(inSheet, INCOMING_HEADERS, 'incoming')
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Ping successful'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function readSheetRows(sheet, headers, type) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(row => {
    if (type === 'outgoing') {
      return {
        id: String(row[0] || 'out-' + Math.random().toString(36).substr(2, 9)),
        recordNumber: Number(row[1]) || 1,
        summary: String(row[2] || ''),
        day: Number(row[3]) || 1,
        month: Number(row[4]) || 1,
        year: Number(row[5]) || new Date().getFullYear(),
        quantity: Number(row[6]) || 1,
        recipientMinistry: String(row[7] || ''),
        remarks: String(row[8] || ''),
        attachmentName: String(row[9] || ''),
        attachmentUrl: String(row[10] || ''),
        createdAt: String(row[11] || new Date().toISOString())
      };
    } else {
      return {
        id: String(row[0] || 'in-' + Math.random().toString(36).substr(2, 9)),
        recordNumber: Number(row[1]) || 1,
        summary: String(row[2] || ''),
        senderMinistry: String(row[3] || ''),
        quantity: Number(row[4]) || 1,
        originalLetterNumber: String(row[5] || ''),
        day: Number(row[6]) || 1,
        month: Number(row[7]) || 1,
        year: Number(row[8]) || new Date().getFullYear(),
        remarks: String(row[9] || ''),
        attachmentName: String(row[10] || ''),
        attachmentUrl: String(row[11] || ''),
        createdAt: String(row[12] || new Date().toISOString())
      };
    }
  });
}

function writeSheetRows(sheet, headers, dataList, type) {
  // Clear existing data rows
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }

  if (!dataList || dataList.length === 0) return;

  const rows = dataList.map(item => {
    if (type === 'outgoing') {
      return [
        item.id,
        item.recordNumber,
        item.summary,
        item.day,
        item.month,
        item.year,
        item.quantity,
        item.recipientMinistry,
        item.remarks,
        item.attachmentName || '',
        item.attachmentUrl || '',
        item.createdAt
      ];
    } else {
      return [
        item.id,
        item.recordNumber,
        item.summary,
        item.senderMinistry,
        item.quantity,
        item.originalLetterNumber,
        item.day,
        item.month,
        item.year,
        item.remarks,
        item.attachmentName || '',
        item.attachmentUrl || '',
        item.createdAt
      ];
    }
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}
`;
}

/**
 * Export data to UTF-8 CSV
 */
export function exportToCSV(filename: string, rows: (string | number)[][]): void {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const text = String(val ?? '');
        const escaped = text.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n'); // \uFEFF is UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
