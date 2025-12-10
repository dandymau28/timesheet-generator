import { format, getDaysInMonth, getDay, startOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export interface WorkDay {
  no: number;
  day: string;
  date: number;
  isHoliday: boolean;
}

// Fallback: Indonesian public holidays 2025 (hardcoded)
const holidays2025: { [key: string]: string } = {
  '2025-01-01': 'Tahun Baru 2025',
  '2025-01-29': 'Tahun Baru Imlek 2576',
  '2025-03-29': 'Hari Suci Nyepi Tahun Baru Saka 1947',
  '2025-03-31': 'Isra Mi\'raj Nabi Muhammad SAW',
  '2025-04-18': 'Wafat Isa Almasih',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Kenaikan Isa Almasih',
  '2025-05-29': 'Ascension of the Prophet',
  '2025-05-31': 'Hari Raya Waisak 2569',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-02': 'Hari Raya Idul Fitri 1446 H',
  '2025-06-03': 'Hari Raya Idul Fitri 1446 H',
  '2025-08-09': 'Hari Raya Idul Adha 1446 H',
  '2025-08-17': 'Hari Kemerdekaan RI',
  '2025-08-30': 'Tahun Baru Islam 1447 H',
  '2025-10-29': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',
};

// Fallback: Indonesian public holidays 2024 (hardcoded)
const holidays2024: { [key: string]: string } = {
  '2024-01-01': 'Tahun Baru 2024',
  '2024-02-10': 'Tahun Baru Imlek 2575',
  '2024-03-11': 'Hari Suci Nyepi Tahun Baru Saka 1946',
  '2024-03-29': 'Wafat Isa Almasih',
  '2024-04-10': 'Hari Raya Idul Fitri 1445 H',
  '2024-04-11': 'Hari Raya Idul Fitri 1445 H',
  '2024-05-01': 'Hari Buruh Internasional',
  '2024-05-09': 'Kenaikan Isa Almasih',
  '2024-05-23': 'Hari Raya Waisak 2568',
  '2024-06-01': 'Hari Lahir Pancasila',
  '2024-06-17': 'Hari Raya Idul Adha 1445 H',
  '2024-07-07': 'Tahun Baru Islam 1446 H',
  '2024-08-17': 'Hari Kemerdekaan RI',
  '2024-09-16': 'Maulid Nabi Muhammad SAW',
  '2024-12-25': 'Hari Raya Natal',
};

// Cache for API holidays to avoid repeated API calls
let holidayCache: { [year: number]: { [key: string]: string } } = {};

// Fetch holidays from API with fallback to hardcoded data
async function fetchHolidaysFromAPI(year: number): Promise<{ [key: string]: string }> {
  try {
    const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`, {
      cache: 'force-cache', // Cache the response
    });

    if (!response.ok) {
      throw new Error('API response not ok');
    }

    const data = await response.json();
    const holidays: { [key: string]: string } = {};

    // Parse API response
    // Expected format: array of objects with { holiday_date, holiday_name, is_national_holiday }
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.is_national_holiday) {
          holidays[item.holiday_date] = item.holiday_name;
        }
      });
    }

    return holidays;
  } catch (error) {
    console.warn(`Failed to fetch holidays from API for year ${year}, using fallback data:`, error);
    // Fallback to hardcoded data
    return getHardcodedHolidays(year);
  }
}

function getHardcodedHolidays(year: number): { [key: string]: string } {
  if (year === 2024) return holidays2024;
  if (year === 2025) return holidays2025;
  return {};
}

async function getHolidaysForYear(year: number): Promise<{ [key: string]: string }> {
  // Check cache first
  if (holidayCache[year]) {
    return holidayCache[year];
  }

  // Fetch from API with fallback
  const holidays = await fetchHolidaysFromAPI(year);

  // Cache the result
  holidayCache[year] = holidays;

  return holidays;
}

function isWeekend(date: Date): boolean {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

function isHoliday(date: Date, holidays: { [key: string]: string }): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.hasOwnProperty(dateStr);
}

export async function generateWorkDays(month: number, year: number): Promise<WorkDay[]> {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const workDays: WorkDay[] = [];
  let counter = 1;

  // Fetch holidays for the year (with caching and fallback)
  const holidays = await getHolidaysForYear(year);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    if (!isWeekend(date) && !isHoliday(date, holidays)) {
      // Use English day names (Mon, Tue, Wed, Thu, Fri)
      const dayName = format(date, 'EEE');
      workDays.push({
        no: counter,
        day: dayName,
        date: day,
        isHoliday: false,
      });
      counter++;
    }
  }

  return workDays;
}

export function getMonthName(month: number): string {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return monthNames[month - 1];
}

export async function getDateRange(month: number, year: number): Promise<string> {
  const workDays = await generateWorkDays(month, year);
  if (workDays.length === 0) return '';

  const firstDay = workDays[0].date;
  const lastDay = workDays[workDays.length - 1].date;
  const monthName = getMonthName(month);

  return `${firstDay} ${monthName} - ${lastDay} ${monthName} ${year}`;
}
