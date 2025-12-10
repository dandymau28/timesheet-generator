export interface TimesheetHeader {
  nama: string;
  jabatan: string;
  nik: string;
  lokasi: string;
  month: number;
  year: number;
}

export interface DayActivity {
  no: number;
  day: string;
  date: number;
  activities: string[];
}

export interface SignatureData {
  reporter: string;
  reporterTitle: string;
  approver: string;
  approverTitle: string;
  acknowledger: string;
  acknowledgerTitle: string;
}

export interface TimesheetData {
  header: TimesheetHeader;
  activities: DayActivity[];
  signatures: SignatureData;
}
