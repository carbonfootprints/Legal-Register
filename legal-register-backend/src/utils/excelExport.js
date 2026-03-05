import ExcelJS from 'exceljs';

class ExcelExport {
  static async generateLegalRegisterExcel(data, user = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Legal Register');

    // Define column widths (no header — we add rows manually)
    worksheet.columns = [
      { key: 'slNo',               width: 8  },
      { key: 'permit',             width: 30 },
      { key: 'documentNo',         width: 25 },
      { key: 'issuingAuthority',   width: 40 },
      { key: 'documentNumber',     width: 20 },
      { key: 'revisionNumber',     width: 12 },
      { key: 'revisionDate',       width: 15 },
      { key: 'dateOfIssue',        width: 15 },
      { key: 'dateOfExpiry',       width: 15 },
      { key: 'dueDateForRenewal',  width: 18 },
      { key: 'reportingFrequency', width: 18 },
      { key: 'dateOfLastReport',   width: 15 },
      { key: 'responsibility',     width: 15 },
      { key: 'status',             width: 15 },
    ];

    const totalCols = 14;

    // ── Row 1: Document control header ────────────────────────────
    const revDate = user.legalRegRevDate
      ? new Date(user.legalRegRevDate).toLocaleDateString('en-IN')
      : '';

    worksheet.addRow([
      user.companyName || '',   // A — company name (merged A:C)
      '', '',
      'Document No.',           // D
      user.legalRegDocNo || '', // E
      'Revision No.',           // F
      user.legalRegRevNo || '', // G
      'Revision Date',          // H
      revDate,                  // I
      '', '',                   // J, K
    ]);

    // Merge company name across A1:C1
    worksheet.mergeCells(1, 1, 1, 3);
    // Merge revision date value + trailing cols
    worksheet.mergeCells(1, 9, 1, totalCols);

    const infoRow = worksheet.getRow(1);
    infoRow.height = 22;
    infoRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      cell.font = { bold: true, size: 10, color: { argb: 'FF1E3A1E' } };
      cell.border = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
    });

    // ── Row 2: Column headers ──────────────────────────────────────
    worksheet.addRow([
      'SL No.',
      'Permit',
      'Reference Number',
      'Issuing Authority',
      'Document Number',
      'Revision Number',
      'Revision Date',
      'Date of Issue',
      'Date of Expiry',
      'Due Date for Renewal',
      'Reporting Frequency',
      'Date of last report',
      'Responsibility',
      'Status',
    ]);

    const headerRow = worksheet.getRow(2);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top:    { style: 'thin' },
        left:   { style: 'thin' },
        bottom: { style: 'thin' },
        right:  { style: 'thin' },
      };
    });

    // ── Rows 3+: Data ─────────────────────────────────────────────
    data.forEach((item) => {
      const expiryVal  = item.noExpiry ? 'No Expiry' : (item.dateOfExpiry      ? new Date(item.dateOfExpiry).toLocaleDateString('en-IN')      : 'N/A');
      const renewalVal = item.noExpiry ? 'No Expiry' : (item.dueDateForRenewal ? new Date(item.dueDateForRenewal).toLocaleDateString('en-IN') : 'N/A');

      worksheet.addRow({
        slNo:               item.slNo,
        permit:             item.permit,
        documentNo:         item.documentNo,
        issuingAuthority:   item.issuingAuthority,
        documentNumber:     item.documentNumber || '',
        revisionNumber:     item.revisionNumber || '',
        revisionDate:       item.revisionDate ? new Date(item.revisionDate).toLocaleDateString('en-IN') : '',
        dateOfIssue:        item.dateOfIssue        ? new Date(item.dateOfIssue).toLocaleDateString('en-IN')        : 'N/A',
        dateOfExpiry:       expiryVal,
        dueDateForRenewal:  renewalVal,
        reportingFrequency: item.reportingFrequency || 'N/A',
        dateOfLastReport:   item.dateOfLastReport   ? new Date(item.dateOfLastReport).toLocaleDateString('en-IN')   : 'N/A',
        responsibility:     item.responsibility,
        status:             item.status,
      });
    });

    // ── Borders + alignment for data rows ─────────────────────────
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < 3) return;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top:    { style: 'thin' },
          left:   { style: 'thin' },
          bottom: { style: 'thin' },
          right:  { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    // ── Status colour coding ───────────────────────────────────────
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < 3) return;
      const statusCell = row.getCell('status');
      const status = statusCell.value;
      if (status === 'Active') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        statusCell.font = { color: { argb: 'FF155724' } };
      } else if (status === 'Expired') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
        statusCell.font = { color: { argb: 'FF721C24' } };
      } else if (status === 'Pending Renewal') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        statusCell.font = { color: { argb: 'FF856404' } };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export default ExcelExport;
