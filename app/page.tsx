'use client';

import { useState, useEffect } from 'react';
import { generateWorkDays, getDateRange } from '@/utils/dateUtils';
import { generatePDF } from '@/utils/pdfGenerator';
import { TimesheetData, DayActivity } from '@/types/timesheet';

export default function Home() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [nama, setNama] = useState('Dandy Maulana');
  const [jabatan, setJabatan] = useState('Backend Developer');
  const [nik, setNik] = useState('25100546');
  const [lokasi, setLokasi] = useState('Durianpay');

  // Signature fields
  const [reporter, setReporter] = useState('Dandy Maulana');
  const [reporterTitle, setReporterTitle] = useState('Backend Engineer');
  const [approver, setApprover] = useState('Jhovie Anggoro');
  const [approverTitle, setApproverTitle] = useState('Head of Engineering');
  const [acknowledger, setAcknowledger] = useState('Tami Zagita');
  const [acknowledgerTitle, setAcknowledgerTitle] = useState('HRGA');

  const [workDays, setWorkDays] = useState<DayActivity[]>([]);
  const [dateRange, setDateRange] = useState<string>('');
  const [isLoadingDays, setIsLoadingDays] = useState(false);

  useEffect(() => {
    const fetchWorkDays = async () => {
      setIsLoadingDays(true);
      try {
        const days = await generateWorkDays(month, year);
        const activities: DayActivity[] = days.map((day) => ({
          no: day.no,
          day: day.day,
          date: day.date,
          activities: [''],
        }));
        setWorkDays(activities);

        // Also update date range
        const range = await getDateRange(month, year);
        setDateRange(range);
      } catch (error) {
        console.error('Error generating work days:', error);
      } finally {
        setIsLoadingDays(false);
      }
    };

    fetchWorkDays();
  }, [month, year]);

  const handleActivityChange = (dayIndex: number, activityIndex: number, value: string) => {
    const newWorkDays = [...workDays];
    newWorkDays[dayIndex].activities[activityIndex] = value;
    setWorkDays(newWorkDays);
  };

  const addActivity = (dayIndex: number) => {
    const newWorkDays = [...workDays];
    newWorkDays[dayIndex].activities.push('');
    setWorkDays(newWorkDays);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newWorkDays = [...workDays];
    if (newWorkDays[dayIndex].activities.length > 1) {
      newWorkDays[dayIndex].activities.splice(activityIndex, 1);
      setWorkDays(newWorkDays);
    }
  };

  const handleGeneratePDF = () => {
    const data: TimesheetData = {
      header: {
        nama,
        jabatan,
        nik,
        lokasi,
        month,
        year,
      },
      activities: workDays.map((day) => ({
        ...day,
        activities: day.activities.filter((act) => act.trim() !== ''),
      })),
      signatures: {
        reporter,
        reporterTitle,
        approver,
        approverTitle,
        acknowledger,
        acknowledgerTitle,
      },
    };

    const pdf = generatePDF(data);
    pdf.save(
      `${lokasi} - ${nama} - ${jabatan} Timesheet - ${getMonthName(month)} ${year}.pdf`
    );
  };

  const getMonthName = (m: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[m - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center drop-shadow-md">
          Timesheet Generator
        </h1>

        {/* Header Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Karyawan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Lokasi kerja"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="NIK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              Periode: {isLoadingDays ? 'Loading...' : dateRange}
            </p>
          </div>
        </div>

        {/* Signature Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Data Penandatangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Dilaporkan Oleh</h3>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-gray-50 text-gray-900"
                placeholder="Nama"
              />
              <input
                type="text"
                value={reporterTitle}
                onChange={(e) => setReporterTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Disetujui Oleh</h3>
              <input
                type="text"
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-gray-50 text-gray-900"
                placeholder="Nama"
              />
              <input
                type="text"
                value={approverTitle}
                onChange={(e) => setApproverTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Jabatan"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Diketahui Oleh</h3>
              <input
                type="text"
                value={acknowledger}
                onChange={(e) => setAcknowledger(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 bg-gray-50 text-gray-900"
                placeholder="Nama"
              />
              <input
                type="text"
                value={acknowledgerTitle}
                onChange={(e) => setAcknowledgerTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                placeholder="Jabatan"
              />
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Input Aktivitas Harian</h2>
          {isLoadingDays ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading hari kerja dari API...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-400">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th className="border border-gray-400 px-4 py-3 w-12 text-white font-semibold">No</th>
                    <th className="border border-gray-400 px-4 py-3 w-20 text-white font-semibold">Hari</th>
                    <th className="border border-gray-400 px-4 py-3 w-20 text-white font-semibold">Tanggal</th>
                    <th className="border border-gray-400 px-4 py-3 w-24 text-white font-semibold">Jam Masuk</th>
                    <th className="border border-gray-400 px-4 py-3 w-24 text-white font-semibold">Jam Keluar</th>
                    <th className="border border-gray-400 px-4 py-3 text-white font-semibold">Aktivitas</th>
                  </tr>
                </thead>
                <tbody>
                  {workDays.map((day, dayIndex) => (
                  <tr key={dayIndex} className="hover:bg-blue-50 transition-colors">
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900">
                      {day.no}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900">
                      {day.day}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900">
                      {day.date}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                      9:00
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                      18:00
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="space-y-2">
                        {day.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) =>
                                handleActivityChange(
                                  dayIndex,
                                  activityIndex,
                                  e.target.value
                                )
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 text-gray-900"
                              placeholder="Masukkan aktivitas..."
                            />
                            {day.activities.length > 1 && (
                              <button
                                onClick={() =>
                                  removeActivity(dayIndex, activityIndex)
                                }
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addActivity(dayIndex)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
                        >
                          + Tambah Aktivitas
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGeneratePDF}
            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            📄 Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
