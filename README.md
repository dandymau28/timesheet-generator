# Timesheet Generator

Aplikasi web untuk generate timesheet dalam format PDF dengan otomatis exclude hari Sabtu, Minggu, dan hari libur nasional Indonesia.

## Fitur

- Input data karyawan (Nama, Jabatan, NIK, Lokasi)
- Pilih bulan dan tahun untuk periode timesheet
- Otomatis generate tanggal kerja (exclude weekend & libur nasional)
- Input multiple aktivitas per hari
- Generate PDF dengan format yang sama persis dengan template
- Support hari libur nasional Indonesia tahun 2024-2025

## Cara Menggunakan

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

### 3. Isi Form

1. **Data Karyawan**: Isi nama, lokasi, jabatan, dan NIK
2. **Pilih Periode**: Pilih bulan dan tahun untuk timesheet
3. **Data Penandatangan**: Isi nama dan jabatan untuk bagian:
   - Dilaporkan Oleh
   - Disetujui Oleh
   - Diketahui Oleh
4. **Input Aktivitas**:
   - Setiap hari kerja sudah terisi otomatis dengan nomor, hari, dan tanggal
   - Weekend (Sabtu & Minggu) dan hari libur nasional otomatis di-skip
   - Klik input field untuk menambahkan aktivitas
   - Klik tombol "+ Tambah Aktivitas" untuk menambah poin aktivitas baru
   - Klik tombol "✕" untuk menghapus aktivitas

### 4. Generate PDF

Klik tombol **"Generate PDF"** di bagian bawah halaman. PDF akan otomatis terdownload dengan nama format:
```
[Lokasi] - [Nama] - [Jabatan] Timesheet - [Bulan] [Tahun].pdf
```

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **jsPDF** - PDF generation
- **date-fns** - Date manipulation

## Struktur Folder

```
timesheet-app/
├── app/
│   └── page.tsx          # Main page component
├── types/
│   └── timesheet.ts      # TypeScript types
├── utils/
│   ├── dateUtils.ts      # Date generation & holiday logic
│   └── pdfGenerator.ts   # PDF generation logic
└── README.md
```

## Catatan

- Aplikasi ini menggunakan data hari libur nasional yang sudah hard-coded untuk tahun 2024 dan 2025
- Jam kerja default adalah 9:00 - 18:00 untuk semua hari
- Format PDF mengikuti template yang ada dengan layout 2 halaman

## Build untuk Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
