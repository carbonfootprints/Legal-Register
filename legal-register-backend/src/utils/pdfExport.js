import PDFDocument from 'pdfkit';

class PDFExport {
  static async generateLegalRegisterPDF(data, user = {}) {
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

        // Document control header (top-right block) — values from user profile
        const docNo = user.legalRegDocNo || '';
        const revNo = user.legalRegRevNo || '';
        const revDate = user.legalRegRevDate
          ? new Date(user.legalRegRevDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : '';
        const headerBlockX = doc.page.width - 30 - 200;
        const headerBlockY = 30;
        const labelW = 90;
        const valueW = 110;
        const cellH = 18;

        const headerRows = [
          { label: 'Document No.', value: docNo },
          { label: 'Revision No.', value: revNo },
          { label: 'Revision Date', value: revDate }
        ];

        doc.fontSize(8).font('Helvetica-Bold');
        headerRows.forEach((row, i) => {
          const y = headerBlockY + i * cellH;
          doc.rect(headerBlockX, y, labelW, cellH).fillAndStroke('#4472C4', '#000000');
          doc.fillColor('#FFFFFF').text(row.label, headerBlockX + 3, y + 5, { width: labelW - 6, align: 'left', lineBreak: false });
          doc.rect(headerBlockX + labelW, y, valueW, cellH).fillAndStroke('#FFFFFF', '#000000');
          doc.fillColor('#000000').font('Helvetica').text(row.value, headerBlockX + labelW + 3, y + 5, { width: valueW - 6, align: 'left', lineBreak: false });
          doc.font('Helvetica-Bold');
        });

        // Title
        doc.fillColor('#000000').fontSize(18).font('Helvetica-Bold').text('Legal Register Report', 30, headerBlockY + 10, {
          width: headerBlockX - 40,
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
          { key: 'slNo',              header: 'SL',           width: 25,  align: 'center' },
          { key: 'permit',            header: 'Permit',       width: 130, align: 'left'   },
          { key: 'documentNo',        header: 'Ref. No.',     width: 95,  align: 'left'   },
          { key: 'issuingAuthority',  header: 'Issuing Auth.',width: 115, align: 'left'   },
          { key: 'dateOfIssue',       header: 'Issue Date',   width: 65,  align: 'center' },
          { key: 'dueDateForRenewal', header: 'Renewal Due',  width: 70,  align: 'center' },
          { key: 'reportingFrequency',header: 'Frequency',    width: 90,  align: 'left'   },
          { key: 'responsibility',    header: 'Resp.',        width: 90,  align: 'left'   },
          { key: 'status',            header: 'Status',       width: 72,  align: 'center' }
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
            permit: (item.permit || '').substring(0, 45),
            documentNo: (item.documentNo || '').substring(0, 30),
            issuingAuthority: (item.issuingAuthority || '').substring(0, 40),
            dateOfIssue: item.dateOfIssue ? new Date(item.dateOfIssue).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A',
            dueDateForRenewal: item.noExpiry ? 'No Expiry' : (item.dueDateForRenewal ? new Date(item.dueDateForRenewal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'),
            reportingFrequency: (item.reportingFrequency || 'N/A').substring(0, 25),
            responsibility: (item.responsibility || '').substring(0, 25),
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
