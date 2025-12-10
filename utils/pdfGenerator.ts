import jsPDF from 'jspdf';
import { TimesheetData } from '@/types/timesheet';
import { getDateRange } from './dateUtils';

export function generatePDF(data: TimesheetData) {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let currentPage = 1;
  let yPosition = margin;

  // Header with underline
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const titleText = 'TIMESHEET';
  pdf.text(titleText, pageWidth / 2, yPosition, { align: 'center' });

  // Add underline
  const titleWidth = pdf.getTextWidth(titleText);
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.setLineWidth(0.5);
  pdf.line(titleX, yPosition + 1, titleX + titleWidth, yPosition + 1);

  yPosition += 10;

  // Employee Info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;

  pdf.text('Nama', leftColX, yPosition);
  pdf.text(`: ${data.header.nama}`, leftColX + 20, yPosition);
  pdf.text('Lokasi', rightColX, yPosition);
  pdf.text(`: ${data.header.lokasi}`, rightColX + 20, yPosition);

  yPosition += 5;
  pdf.text('Jabatan', leftColX, yPosition);
  pdf.text(`: ${data.header.jabatan}`, leftColX + 20, yPosition);
  const dateRange = getDateRange(data.header.month, data.header.year);
  pdf.text('Periode', rightColX, yPosition);
  pdf.text(`: ${dateRange}`, rightColX + 20, yPosition);

  yPosition += 5;
  pdf.text('NIK', leftColX, yPosition);
  pdf.text(`: ${data.header.nik}`, leftColX + 20, yPosition);

  yPosition += 8;

  // Table setup
  const tableStartY = yPosition;
  const colWidths = {
    no: 10,
    day: 15,
    date: 18,
    timeIn: 15,
    timeOut: 15,
    activity: contentWidth - 10 - 15 - 18 - 15 - 15 - 20,
    paraf: 20,
  };

  let currentX = margin;

  // Draw table header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);

  const headerHeight = 12;

  // NO
  pdf.rect(currentX, yPosition, colWidths.no, headerHeight);
  pdf.text('NO.', currentX + colWidths.no / 2, yPosition + headerHeight / 2 + 1, { align: 'center' });
  currentX += colWidths.no;

  // HARI
  pdf.rect(currentX, yPosition, colWidths.day, headerHeight);
  pdf.text('HARI', currentX + colWidths.day / 2, yPosition + 7, { align: 'center' });
  currentX += colWidths.day;

  // TANGGAL
  pdf.rect(currentX, yPosition, colWidths.date, headerHeight);
  pdf.text('TANGGAL', currentX + colWidths.date / 2, yPosition + 7, { align: 'center' });
  currentX += colWidths.date;

  // JAM KERJA (merged header)
  const jamKerjaWidth = colWidths.timeIn + colWidths.timeOut;
  pdf.rect(currentX, yPosition, jamKerjaWidth, 6);
  pdf.text('JAM KERJA', currentX + jamKerjaWidth / 2, yPosition + 4, { align: 'center' });

  // JAM KERJA - IN
  pdf.rect(currentX, yPosition + 6, colWidths.timeIn, 6);
  pdf.text('IN', currentX + colWidths.timeIn / 2, yPosition + 10, { align: 'center' });
  currentX += colWidths.timeIn;

  // JAM KERJA - OUT
  pdf.rect(currentX, yPosition + 6, colWidths.timeOut, 6);
  pdf.text('OUT', currentX + colWidths.timeOut / 2, yPosition + 10, { align: 'center' });
  currentX += colWidths.timeOut;

  // Activity
  pdf.rect(currentX, yPosition, colWidths.activity, headerHeight);
  pdf.text('Activity', currentX + colWidths.activity / 2, yPosition + 7, { align: 'center' });
  currentX += colWidths.activity;

  // PARAF
  pdf.rect(currentX, yPosition, colWidths.paraf, headerHeight);
  pdf.text('PARAF', currentX + colWidths.paraf / 2, yPosition + 7, { align: 'center' });

  yPosition += headerHeight;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  const maxRowsPerPage = 18; // Adjust based on page size
  let rowCount = 0;

  for (const activity of data.activities) {
    if (rowCount >= maxRowsPerPage && currentPage === 1) {
      // Add page number at bottom with boxes
      pdf.setFontSize(9);

      // Draw two small boxes on left and right
      const boxWidth = 15;
      const boxHeight = 8;
      const pageNumberY = pageHeight - 13;

      // Left box
      pdf.rect(margin, pageNumberY, boxWidth, boxHeight);

      // Right box
      pdf.rect(pageWidth - margin - boxWidth, pageNumberY, boxWidth, boxHeight);

      // Page number text (centered)
      pdf.text(`Page ${currentPage} of 2`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // New page
      pdf.addPage();
      currentPage++;
      yPosition = margin;
      rowCount = 0;
    }

    // Calculate row height based on activities
    let totalLines = 0;
    for (const act of activity.activities) {
      const lines = pdf.splitTextToSize(`- ${act}`, colWidths.activity - 4);
      totalLines += lines.length;
    }
    const rowHeight = Math.max(10, totalLines * 4.5 + 4);

    currentX = margin;

    // NO
    pdf.rect(currentX, yPosition, colWidths.no, rowHeight);
    pdf.text(activity.no.toString(), currentX + colWidths.no / 2, yPosition + 6, { align: 'center' });
    currentX += colWidths.no;

    // HARI
    pdf.rect(currentX, yPosition, colWidths.day, rowHeight);
    pdf.text(activity.day, currentX + colWidths.day / 2, yPosition + 6, { align: 'center' });
    currentX += colWidths.day;

    // TANGGAL
    pdf.rect(currentX, yPosition, colWidths.date, rowHeight);
    pdf.text(activity.date.toString(), currentX + colWidths.date / 2, yPosition + 6, { align: 'center' });
    currentX += colWidths.date;

    // TIME IN
    pdf.rect(currentX, yPosition, colWidths.timeIn, rowHeight);
    pdf.text('9:00', currentX + colWidths.timeIn / 2, yPosition + 6, { align: 'center' });
    currentX += colWidths.timeIn;

    // TIME OUT
    pdf.rect(currentX, yPosition, colWidths.timeOut, rowHeight);
    pdf.text('18:00', currentX + colWidths.timeOut / 2, yPosition + 6, { align: 'center' });
    currentX += colWidths.timeOut;

    // Activity
    pdf.rect(currentX, yPosition, colWidths.activity, rowHeight);
    let activityY = yPosition + 5;
    pdf.setFontSize(8);
    for (const act of activity.activities) {
      const lines = pdf.splitTextToSize(`- ${act}`, colWidths.activity - 4);
      pdf.text(lines, currentX + 2, activityY);
      activityY += lines.length * 4.5;
    }
    currentX += colWidths.activity;

    // PARAF
    pdf.rect(currentX, yPosition, colWidths.paraf, rowHeight);

    yPosition += rowHeight;
    rowCount++;
  }

  // Add empty rows to fill up to 23 rows on last page
  const totalRows = 23;
  const emptyRowsNeeded = totalRows - data.activities.length;

  for (let i = 0; i < emptyRowsNeeded; i++) {
    if (rowCount >= maxRowsPerPage && currentPage === 1) {
      pdf.setFontSize(9);

      // Draw two small boxes on left and right
      const boxWidth = 15;
      const boxHeight = 8;
      const pageNumberY = pageHeight - 13;

      // Left box
      pdf.rect(margin, pageNumberY, boxWidth, boxHeight);

      // Right box
      pdf.rect(pageWidth - margin - boxWidth, pageNumberY, boxWidth, boxHeight);

      // Page number text (centered)
      pdf.text(`Page ${currentPage} of 2`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.addPage();
      currentPage++;
      yPosition = margin;
      rowCount = 0;
    }

    const rowHeight = 10;
    currentX = margin;

    pdf.rect(currentX, yPosition, colWidths.no, rowHeight);
    currentX += colWidths.no;

    pdf.rect(currentX, yPosition, colWidths.day, rowHeight);
    currentX += colWidths.day;

    pdf.rect(currentX, yPosition, colWidths.date, rowHeight);
    currentX += colWidths.date;

    pdf.rect(currentX, yPosition, colWidths.timeIn, rowHeight);
    currentX += colWidths.timeIn;

    pdf.rect(currentX, yPosition, colWidths.timeOut, rowHeight);
    currentX += colWidths.timeOut;

    pdf.rect(currentX, yPosition, colWidths.activity, rowHeight);
    currentX += colWidths.activity;

    pdf.rect(currentX, yPosition, colWidths.paraf, rowHeight);

    yPosition += rowHeight;
    rowCount++;
  }

  yPosition += 5;

  // Signatures section - with table
  const signatureTableHeight = 30;
  const signatureWidth = contentWidth / 3;

  currentX = margin;

  // Draw signature table
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');

  // Header row
  pdf.rect(currentX, yPosition, signatureWidth, 6);
  pdf.text('Dilaporkan Oleh,', currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, 6);
  pdf.text('Disetujui Oleh,', currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, 6);
  pdf.text('Diketahui Oleh,', currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  yPosition += 6;

  // Content row (for signature space)
  currentX = margin;
  pdf.rect(currentX, yPosition, signatureWidth, signatureTableHeight);
  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, signatureTableHeight);
  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, signatureTableHeight);

  yPosition += signatureTableHeight;

  // Name row
  currentX = margin;
  const nameRowHeight = 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);

  pdf.rect(currentX, yPosition, signatureWidth, nameRowHeight);
  pdf.text(`(${data.signatures.reporter})`, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, nameRowHeight);
  pdf.text(`(${data.signatures.approver})`, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, nameRowHeight);
  pdf.text(`(${data.signatures.acknowledger})`, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  yPosition += nameRowHeight;

  // Title row
  currentX = margin;
  const titleRowHeight = 6;

  pdf.setFontSize(8);

  pdf.rect(currentX, yPosition, signatureWidth, titleRowHeight);
  pdf.text(data.signatures.reporterTitle, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, titleRowHeight);
  pdf.text(data.signatures.approverTitle, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  currentX += signatureWidth;
  pdf.rect(currentX, yPosition, signatureWidth, titleRowHeight);
  pdf.text(data.signatures.acknowledgerTitle, currentX + signatureWidth / 2, yPosition + 4, { align: 'center' });

  // Page number with boxes
  pdf.setFontSize(9);

  // Draw two small boxes on left and right of page number
  const boxWidth = 15;
  const boxHeight = 8;
  const pageNumberY = pageHeight - 13;

  // Left box
  pdf.rect(margin, pageNumberY, boxWidth, boxHeight);

  // Right box
  pdf.rect(pageWidth - margin - boxWidth, pageNumberY, boxWidth, boxHeight);

  // Page number text (centered)
  pdf.text(`Page ${currentPage} of 2`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  return pdf;
}
