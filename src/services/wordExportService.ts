import { OutgoingLetter, IncomingLetter, SystemSettings } from '../types';
import { toKhmerNum } from '../utils/khmerNumerals';

interface ExportWordOptions {
  bookType: 'outgoing' | 'incoming';
  letters: (OutgoingLetter | IncomingLetter)[];
  settings: SystemSettings;
  headerInfo: {
    fromNumberStr: string;
    toNumberStr: string;
    totalCount: number;
    fromDateStr: string;
    toDateStr: string;
  };
  paperSize?: 'A4' | 'A5';
  orientation?: 'landscape' | 'portrait';
  showOfficialHeader?: boolean;
  useKhmerDigits?: boolean;
  includeCoverPage?: boolean;
}

/**
 * Generates an official Microsoft Word (.doc) document complete with:
 * - Proper Landscape orientation XML configuration
 * - Khmer Moul / Khmer OS Battambang font definitions
 * - Official National & Institution Header (Department above School)
 * - Strict 5-column correspondence book layout
 * - Ready for editing in Microsoft Word, WPS Office, or Google Docs
 */
export function exportToWordDocument({
  bookType,
  letters,
  settings,
  headerInfo,
  orientation = 'landscape',
  showOfficialHeader = true,
  useKhmerDigits = false,
  includeCoverPage = false,
}: ExportWordOptions): void {
  const isLandscape = orientation === 'landscape';
  const title = bookType === 'outgoing' ? 'សៀវភៅចុះលិខិតចេញ' : 'សៀវភៅចុះលិខិតចូល';
  const filename = `${title}_${settings.currentYear || new Date().getFullYear()}.doc`;

  const totalDisplay = useKhmerDigits ? toKhmerNum(headerInfo.totalCount) : headerInfo.totalCount;

  // Build rows HTML
  let rowsHtml = '';
  if (bookType === 'outgoing') {
    const outgoingList = letters as OutgoingLetter[];
    rowsHtml = outgoingList
      .map((item) => {
        const numDisplay = useKhmerDigits ? toKhmerNum(item.recordNumber) : item.recordNumber;
        const qtyDisplay = useKhmerDigits ? toKhmerNum(item.quantity) : item.quantity;
        const dayDisplay = useKhmerDigits ? toKhmerNum(item.day) : item.day;
        const monthDisplay = useKhmerDigits ? toKhmerNum(item.month) : item.month;
        const yearDisplay = useKhmerDigits ? toKhmerNum(item.year) : item.year;

        const attachmentHtml = item.attachmentName
          ? `<div style="font-size: 8.5pt; color: #2563eb; margin-top: 3px;">📎 ឯកសារភ្ជាប់: ${item.attachmentName}</div>`
          : '';

        return `
          <tr style="mso-yfti-irow:1; page-break-inside: avoid;">
            <td style="border: 1.0pt solid #000; padding: 6px 4px; text-align: center; vertical-align: top; width: 50px;">
              ${numDisplay}
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top;">
              <div style="font-weight: bold; line-height: 1.35;">${item.summary}</div>
              <div style="font-size: 9pt; color: #475569; margin-top: 3px;">
                ថ្ងៃទី${dayDisplay} ខែ${monthDisplay} ឆ្នាំ${yearDisplay}
              </div>
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 4px; text-align: center; vertical-align: top; width: 65px;">
              ${qtyDisplay}
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top; width: 170px;">
              ${item.recipientMinistry}
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top; width: 150px;">
              ${item.remarks || '-'}
              ${attachmentHtml}
            </td>
          </tr>
        `;
      })
      .join('');
  } else {
    const incomingList = letters as IncomingLetter[];
    rowsHtml = incomingList
      .map((item) => {
        const numDisplay = useKhmerDigits ? toKhmerNum(item.recordNumber) : item.recordNumber;
        const qtyDisplay = useKhmerDigits ? toKhmerNum(item.quantity) : item.quantity;
        const dayDisplay = useKhmerDigits ? toKhmerNum(item.day) : item.day;
        const monthDisplay = useKhmerDigits ? toKhmerNum(item.month) : item.month;
        const yearDisplay = useKhmerDigits ? toKhmerNum(item.year) : item.year;

        const attachmentHtml = item.attachmentName
          ? `<div style="font-size: 8.5pt; color: #2563eb; margin-top: 3px;">📎 ឯកសារភ្ជាប់: ${item.attachmentName}</div>`
          : '';

        return `
          <tr style="mso-yfti-irow:1; page-break-inside: avoid;">
            <td style="border: 1.0pt solid #000; padding: 6px 4px; text-align: center; vertical-align: top; width: 50px;">
              ${numDisplay}
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top;">
              <div style="font-weight: bold; line-height: 1.35;">${item.summary}</div>
              <div style="font-size: 9pt; color: #475569; margin-top: 3px;">
                ស្ថាប័នដើម៖ ${item.senderMinistry}
              </div>
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 4px; text-align: center; vertical-align: top; width: 65px;">
              ${qtyDisplay}
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top; width: 170px;">
              <div>លេខ៖ <strong>${item.originalLetterNumber || 'គ្មាន'}</strong></div>
              <div style="font-size: 9pt; color: #475569; margin-top: 2px;">
                ចុះថ្ងៃទី${dayDisplay} ខែ${monthDisplay} ឆ្នាំ${yearDisplay}
              </div>
            </td>
            <td style="border: 1.0pt solid #000; padding: 6px 8px; vertical-align: top; width: 150px;">
              ${item.remarks || '-'}
              ${attachmentHtml}
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Cover page HTML if requested
  const coverHtml = includeCoverPage
    ? `
      <div style="page-break-after: always; text-align: center; padding: 40px 20px; border: 3pt double #000; margin-bottom: 30px;">
        <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 14pt; margin-bottom: 4px;">
          ព្រះរាជាណាចក្រកម្ពុជា
        </div>
        <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 12pt; margin-bottom: 20px;">
          ជាតិ សាសនា ព្រះមហាក្សត្រ
        </div>
        <div style="width: 120px; height: 1px; background-color: #000; margin: 0 auto 30px auto;"></div>

        <div style="margin: 40px 0;">
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 13pt; margin-bottom: 8px;">
            ${settings.departmentName || 'ការិយាល័យអប់រំ យុវជន និងកីឡា'}
          </div>
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 16pt; color: #1e3a8a;">
            ${settings.institutionName || 'សាលាបឋមថ្លុកដង្កោ'}
          </div>
        </div>

        <div style="margin: 50px auto; display: inline-block; padding: 15px 40px; border: 2pt solid #000;">
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 20pt; letter-spacing: 1px;">
            ${title}
          </div>
          <div style="font-size: 12pt; margin-top: 10px; font-weight: bold;">
            ឆ្នាំ ${useKhmerDigits ? toKhmerNum(settings.currentYear) : settings.currentYear}
          </div>
        </div>

        <div style="margin-top: 40px; font-size: 11pt; line-height: 1.8;">
          <div>ចាប់ពីលេខ <strong>${headerInfo.fromNumberStr}</strong> ដល់លេខ <strong>${headerInfo.toNumberStr}</strong></div>
          <div>${headerInfo.fromDateStr} ដល់ ${headerInfo.toDateStr}</div>
          <div style="margin-top: 8px;">ចំនួនសរុប៖ <strong>${totalDisplay}</strong> លិខិត</div>
        </div>
      </div>
    `
    : '';

  // Official header
  const officialHeaderHtml = showOfficialHeader
    ? `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: none;">
        <tr>
          <td style="width: 50%; vertical-align: bottom; text-align: left; border: none; padding: 0;">
            <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 10.5pt; line-height: 1.4;">
              ${settings.departmentName || 'ការិយាល័យអប់រំ យុវជន និងកីឡា'}
            </div>
            <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 10.5pt; line-height: 1.4;">
              ${settings.institutionName || 'សាលាបឋមថ្លុកដង្កោ'}
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; text-align: right; border: none; padding: 0;">
            <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 11pt; line-height: 1.4;">
              ព្រះរាជាណាចក្រកម្ពុជា
            </div>
            <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 10pt; line-height: 1.4; margin-top: 2px;">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </div>
          </td>
        </tr>
      </table>
      <div style="border-bottom: 1px solid #94a3b8; margin-bottom: 14px;"></div>
    `
    : '';

  // Table headers strictly 5 columns
  const tableHeaderCols =
    bookType === 'outgoing'
      ? `
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 4px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 50px;">
          ល.រ
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt;">
          ខ្លឹមសារលិខិត ថ្ងៃទី ខែ ឆ្នាំ
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 4px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 65px;">
          ចំនួន
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 170px;">
          ក្រសួងទទួល
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 150px;">
          សេចក្ដីផ្សេងៗ
        </th>
      `
      : `
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 4px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 50px;">
          ល.រ
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt;">
          ខ្លឹមសារលិខិត ក្រសួងដើម
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 4px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 65px;">
          ចំនួន
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 170px;">
          លេខលិខិតដើម ថ្ងៃទី ខែ ឆ្នាំ
        </th>
        <th style="border: 1.0pt solid #000; background-color: #f1f5f9; padding: 8px 6px; font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 9.5pt; width: 150px;">
          សេចក្ដីផ្សេងៗ
        </th>
      `;

  const wordHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: ${isLandscape ? '841.9pt 595.3pt' : '595.3pt 841.9pt'};
      mso-page-orientation: ${isLandscape ? 'landscape' : 'portrait'};
      margin: 28.35pt 28.35pt 28.35pt 28.35pt;
      mso-header-margin: 18.0pt;
      mso-footer-margin: 18.0pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Hanuman', 'Siemreap', Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.4;
      color: #0f172a;
    }
    table {
      border-collapse: collapse;
      mso-table-layout-alt: fixed;
    }
    h1, h2, h3 {
      font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif;
    }
  </style>
</head>
<body lang="KM">
  <div class="Section1">
    ${coverHtml}

    ${officialHeaderHtml}

    <div style="text-align: center; margin-bottom: 14px;">
      <h1 style="font-size: 15pt; margin: 4px 0; color: #000; letter-spacing: 0.5px;">
        ${title}
      </h1>
      <div style="font-size: 10pt; margin-top: 4px; font-weight: bold;">
        លេខ <span style="text-decoration: underline;">${headerInfo.fromNumberStr}</span> ដល់លេខ <span style="text-decoration: underline;">${headerInfo.toNumberStr}</span> សរុប <span style="text-decoration: underline;">${totalDisplay}</span>
      </div>
      <div style="font-size: 9.5pt; color: #334155; margin-top: 2px;">
        ${headerInfo.fromDateStr} ដល់ ${headerInfo.toDateStr}
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; border: 1.0pt solid #000; font-size: 10pt;">
      <thead>
        <tr style="mso-yfti-irow:0; mso-yfti-firstrow:yes; page-break-after: avoid;">
          ${tableHeaderCols}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Official Cambodian Verification / Endorsement Signatures at the bottom -->
    <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 36px; page-break-inside: avoid;">
      <tr>
        <td style="width: 50%; text-align: center; vertical-align: top; border: none; padding: 0 10px;">
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 11pt; color: #000;">
            បានឃើញ និងឯកភាព
          </div>
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 11pt; color: #000; margin-top: 4px;">
            នាយកសាលា
          </div>
          <div style="height: 70px;"></div>
          <div style="font-size: 9.5pt; color: #475569;">
            (ហត្ថលេខា និងត្រា)
          </div>
          <div style="width: 200px; border-bottom: 1.5pt solid #000; margin: 18px auto 0 auto;"></div>
        </td>

        <td style="width: 50%; text-align: center; vertical-align: top; border: none; padding: 0 10px;">
          <div style="font-size: 10pt; color: #0f172a;">
            ថ្ងៃទី............ ខែ............ ឆ្នាំ ${useKhmerDigits ? toKhmerNum(settings.currentYear) : settings.currentYear}
          </div>
          <div style="font-family: 'Khmer OS Muol Light', 'Khmer OS Muol', 'Moul', sans-serif; font-size: 11pt; color: #000; margin-top: 4px;">
            អ្នកកត់ត្រា
          </div>
          <div style="height: 70px;"></div>
          <div style="font-size: 9.5pt; color: #475569;">
            (ហត្ថលេខា និងឈ្មោះ)
          </div>
          <div style="width: 200px; border-bottom: 1.5pt solid #000; margin: 18px auto 0 auto;"></div>
        </td>
      </tr>
    </table>

    <div style="margin-top: 24px; font-size: 8.5pt; color: #64748b; text-align: right;">
      កាលបរិច្ឆេទបង្កើតឯកសារ៖ ${new Date().toLocaleDateString('km-KH')} · ប្រព័ន្ធគ្រប់គ្រងសៀវភៅចុះលិខិតចេញ-ចូល
    </div>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
