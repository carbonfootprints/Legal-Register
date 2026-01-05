import ExcelJS from 'exceljs';

class ExcelExport {
  static async generateLegalRegisterExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Legal Register');

    // Set column headers and widths
    worksheet.columns = [
      { header: 'SL No.', key: 'slNo', width: 8 },
      { header: 'Permit', key: 'permit', width: 30 },
      { header: 'Authorization No.', key: 'authorizationNo', width: 25 },
      { header: 'Issuing Authority', key: 'issuingAuthority', width: 40 },
      { header: 'Date of Application', key: 'dateOfApplication', width: 18 },
      { header: 'Date of Issue', key: 'dateOfIssue', width: 18 },
      { header: 'Date of Expiry', key: 'dateOfExpiry', width: 18 },
      { header: 'Due Date for Renewal', key: 'dueDateForRenewal', width: 20 },
      { header: 'Reporting Frequency', key: 'reportingFrequency', width: 18 },
      { header: 'Date of Last Report', key: 'dateOfLastReport', width: 18 },
      { header: 'Responsibility', key: 'responsibility', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow({
        slNo: item.slNo,
        permit: item.permit,
        authorizationNo: item.authorizationNo,
        issuingAuthority: item.issuingAuthority,
        dateOfApplication: item.dateOfApplication ? new Date(item.dateOfApplication).toLocaleDateString('en-IN') : 'N/A',
        dateOfIssue: item.dateOfIssue ? new Date(item.dateOfIssue).toLocaleDateString('en-IN') : 'N/A',
        dateOfExpiry: item.dateOfExpiry ? new Date(item.dateOfExpiry).toLocaleDateString('en-IN') : 'N/A',
        dueDateForRenewal: item.dueDateForRenewal ? new Date(item.dueDateForRenewal).toLocaleDateString('en-IN') : 'N/A',
        reportingFrequency: item.reportingFrequency || 'N/A',
        dateOfLastReport: item.dateOfLastReport ? new Date(item.dateOfLastReport).toLocaleDateString('en-IN') : 'N/A',
        responsibility: item.responsibility,
        status: item.status
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
    });

    // Add color coding for status
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell('status');
        const status = statusCell.value;

        if (status === 'Active') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD4EDDA' }
          };
          statusCell.font = { color: { argb: 'FF155724' } };
        } else if (status === 'Expired') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8D7DA' }
          };
          statusCell.font = { color: { argb: 'FF721C24' } };
        } else if (status === 'Pending Renewal') {
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF3CD' }
          };
          statusCell.font = { color: { argb: 'FF856404' } };
        }
      }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

export default ExcelExport;
