import PDFDocument from 'pdfkit';

class PDFExport {
  static async generateLegalRegisterPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          layout: 'landscape',
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 30, right: 30 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Title
        doc.fontSize(18).font('Helvetica-Bold').text('Legal Register Report', {
          align: 'center'
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-IN')}`, {
          align: 'center'
        });
        doc.moveDown(1);

        // Table configuration
        const tableTop = doc.y;
        const rowHeight = 30;
        const fontSize = 8;
        const startX = 30;

        const columns = [
          { key: 'slNo', header: 'SL', width: 30, align: 'center' },
          { key: 'permit', header: 'Permit', width: 120, align: 'left' },
          { key: 'documentNo', header: 'Document No.', width: 85, align: 'left' },
          { key: 'issuingAuthority', header: 'Issuing Authority', width: 120, align: 'left' },
          { key: 'dateOfIssue', header: 'Issue Date', width: 70, align: 'center' },
          { key: 'dueDateForRenewal', header: 'Renewal Due', width: 70, align: 'center' },
          { key: 'reportingFrequency', header: 'Frequency', width: 80, align: 'left' },
          { key: 'responsibility', header: 'Resp.', width: 80, align: 'left' },
          { key: 'status', header: 'Status', width: 65, align: 'center' }
        ];

        // Calculate total table width
        const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);

        let currentY = tableTop;

        // Draw table header
        doc.fontSize(fontSize).font('Helvetica-Bold');
        let currentX = startX;

        columns.forEach(col => {
          doc.rect(currentX, currentY, col.width, rowHeight).fillAndStroke('#4472C4', '#000000');
          doc.fillColor('#FFFFFF').text(col.header, currentX + 3, currentY + 10, {
            width: col.width - 6,
            align: 'center',
            lineBreak: false
          });
          currentX += col.width;
        });

        currentY += rowHeight;
        doc.fillColor('#000000');

        // Draw table rows
        doc.font('Helvetica').fontSize(fontSize);

        data.forEach((item, index) => {
          // Check if we need a new page
          if (currentY > 500) {
            doc.addPage({ layout: 'landscape', size: 'A4' });
            currentY = 50;

            // Redraw header on new page
            currentX = startX;
            doc.fontSize(fontSize).font('Helvetica-Bold');
            columns.forEach(col => {
              doc.rect(currentX, currentY, col.width, rowHeight).fillAndStroke('#4472C4', '#000000');
              doc.fillColor('#FFFFFF').text(col.header, currentX + 3, currentY + 10, {
                width: col.width - 6,
                align: 'center',
                lineBreak: false
              });
              currentX += col.width;
            });
            currentY += rowHeight;
            doc.fillColor('#000000').font('Helvetica');
          }

          currentX = startX;

          // Alternate row colors
          if (index % 2 === 0) {
            doc.rect(startX, currentY, totalTableWidth, rowHeight).fillAndStroke('#F5F5F5', '#000000');
          } else {
            doc.rect(startX, currentY, totalTableWidth, rowHeight).stroke('#000000');
          }

          // Draw cell data
          const rowData = {
            slNo: item.slNo || '',
            permit: (item.permit || '').substring(0, 40),
            documentNo: (item.documentNo || '').substring(0, 25),
            issuingAuthority: (item.issuingAuthority || '').substring(0, 40),
            dateOfIssue: item.dateOfIssue ? new Date(item.dateOfIssue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A',
            dueDateForRenewal: item.dueDateForRenewal ? new Date(item.dueDateForRenewal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A',
            reportingFrequency: (item.reportingFrequency || 'N/A').substring(0, 22),
            responsibility: (item.responsibility || '').substring(0, 22),
            status: item.status || 'N/A'
          };

          // Draw cell borders and text
          columns.forEach(col => {
            // Draw cell border
            doc.rect(currentX, currentY, col.width, rowHeight).stroke('#000000');

            // Draw text with proper alignment
            doc.fillColor('#000000').text(rowData[col.key], currentX + 3, currentY + 10, {
              width: col.width - 6,
              align: col.align,
              lineBreak: false
            });
            currentX += col.width;
          });

          currentY += rowHeight;
        });

        // Footer
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).font('Helvetica').fillColor('#666666').text(
            `Page ${i + 1} of ${pages.count} | Generated: ${new Date().toLocaleDateString('en-IN')}`,
            startX,
            doc.page.height - 30,
            {
              align: 'center',
              width: doc.page.width - 60
            }
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default PDFExport;
