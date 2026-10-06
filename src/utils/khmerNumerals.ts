import { OutgoingLetter, IncomingLetter, CalculatedHeader } from '../types';

export const KHMER_DIGITS: { [key: string]: string } = {
  '0': '០',
  '1': '១',
  '2': '២',
  '3': '៣',
  '4': '៤',
  '5': '៥',
  '6': '៦',
  '7': '៧',
  '8': '៨',
  '9': '៩',
};

export const KHMER_MONTHS = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
];

export const CAMBODIAN_INSTITUTIONS = [
  'ក្រសួងអប់រំ យុវជន និងកីឡា',
  'ទីស្ដីការគណៈរដ្ឋមន្ត្រី',
  'ក្រសួងសេដ្ឋកិច្ច និងហិរញ្ញវត្ថុ',
  'ក្រសួងមហាផ្ទៃ',
  'ក្រសួងមុខងារសាធារណៈ',
  'ក្រសួងសុខាភិបាល',
  'ក្រសួងការបរទេស និងសហប្រតិបត្តិការអន្តរជាតិ',
  'ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍',
  'ក្រសួងបរិស្ថាន',
  'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ',
  'ក្រសួងយុត្តិធម៌',
  'ក្រសួងផែនការ',
  'ក្រសួងពាណិជ្ជកម្ម',
  'មន្ទីរអប់រំ យុវជន និងកីឡា រាជធានីភ្នំពេញ',
  'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តកណ្ដាល',
  'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តសៀមរាប',
  'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង',
  'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តកំពង់ចាម',
  'ការិយាល័យអប់រំ យុវជន និងកីឡា ក្រុង/ស្រុក/ខណ្ឌ',
  'សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ',
  'សាកលវិទ្យាល័យជាតិបាត់ដំបង',
  'វិទ្យាស្ថានបច្ចេកវិទ្យាកម្ពុជា (ITC)',
  'វិទ្យាល័យ និងអនុវិទ្យាល័យក្នុងតំបន់',
  'អង្គការយូនីសេហ្វ (UNICEF)',
  'អង្គការយូណេស្កូ (UNESCO)',
];

/**
 * Converts a number or string of digits to Khmer digits
 */
export function toKhmerNum(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  return String(num).replace(/[0-9]/g, (char) => KHMER_DIGITS[char] || char);
}

/**
 * Pad number to 3 digits e.g. 1 -> "001"
 */
export function padNumber(num: number, length: number = 3, useKhmer: boolean = false): string {
  const padded = String(num).padStart(length, '0');
  return useKhmer ? toKhmerNum(padded) : padded;
}

/**
 * Format date numbers to double digits e.g. 5 -> "05"
 */
export function padZero(val: number | string, useKhmer: boolean = false): string {
  const padded = String(val).padStart(2, '0');
  return useKhmer ? toKhmerNum(padded) : padded;
}

/**
 * Calculate book header numbers and dates from a list of records
 */
export function calculateBookHeader(
  records: (OutgoingLetter | IncomingLetter)[],
  useKhmer: boolean = false
): CalculatedHeader {
  if (!records || records.length === 0) {
    return {
      fromNumberStr: '......',
      toNumberStr: '......',
      totalCount: 0,
      fromDateStr: 'ថ្ងៃទី ........ ខែ ............. ឆ្នាំ ............',
      toDateStr: 'ថ្ងៃទី ........ ខែ ............. ឆ្នាំ ............',
    };
  }

  // Find min and max record numbers
  let minNum = records[0].recordNumber;
  let maxNum = records[0].recordNumber;

  // Track dates
  let minDate = new Date(records[0].year, records[0].month - 1, records[0].day);
  let maxDate = new Date(records[0].year, records[0].month - 1, records[0].day);
  let minRecord = records[0];
  let maxRecord = records[0];

  for (const r of records) {
    if (r.recordNumber < minNum) minNum = r.recordNumber;
    if (r.recordNumber > maxNum) maxNum = r.recordNumber;

    const rDate = new Date(r.year, r.month - 1, r.day);
    if (rDate < minDate) {
      minDate = rDate;
      minRecord = r;
    }
    if (rDate > maxDate) {
      maxDate = rDate;
      maxRecord = r;
    }
  }

  const fromNumberStr = padNumber(minNum, 3, useKhmer);
  const toNumberStr = padNumber(maxNum, 3, useKhmer);
  const totalCount = records.length;

  const fromDay = padZero(minRecord.day, useKhmer);
  const fromMonth = padZero(minRecord.month, useKhmer);
  const fromYear = useKhmer ? toKhmerNum(minRecord.year) : String(minRecord.year);

  const toDay = padZero(maxRecord.day, useKhmer);
  const toMonth = padZero(maxRecord.month, useKhmer);
  const toYear = useKhmer ? toKhmerNum(maxRecord.year) : String(maxRecord.year);

  return {
    fromNumberStr,
    toNumberStr,
    totalCount,
    fromDateStr: `ថ្ងៃទី ${fromDay} ខែ ${fromMonth} ឆ្នាំ ${fromYear}`,
    toDateStr: `ថ្ងៃទី ${toDay} ខែ ${toMonth} ឆ្នាំ ${toYear}`,
  };
}

/**
 * Format a single letter date nicely
 */
export function formatKhmerDate(
  day: number,
  month: number,
  year: number,
  useKhmer: boolean = false
): string {
  const d = padZero(day, useKhmer);
  const m = padZero(month, useKhmer);
  const y = useKhmer ? toKhmerNum(year) : String(year);
  return `ថ្ងៃទី ${d}/${m}/${y}`;
}
