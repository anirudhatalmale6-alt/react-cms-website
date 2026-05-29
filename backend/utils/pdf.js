const PDFDocument = require('pdfkit');

function generateQuotationPdf(quotation) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#666666')
        .text(`Quotation #: ${quotation.quotation_number}`, { align: 'center' });
      doc.text(`Date: ${new Date(quotation.created_at).toLocaleDateString()}`, { align: 'center' });
      if (quotation.valid_until) {
        doc.text(`Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`, { align: 'center' });
      }

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
      doc.moveDown(1);

      // Client info
      doc.fillColor('#000000').fontSize(12).font('Helvetica-Bold').text('Bill To:');
      doc.fontSize(10).font('Helvetica');
      doc.text(quotation.client_name || '');
      if (quotation.client_company) doc.text(quotation.client_company);
      if (quotation.client_email) doc.text(quotation.client_email);

      doc.moveDown(1.5);

      // Table header
      const tableTop = doc.y;
      const colX = { desc: 50, qty: 330, price: 400, total: 480 };

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
      doc.rect(50, tableTop - 5, 495, 20).fill('#333333');
      doc.fillColor('#ffffff');
      doc.text('Description', colX.desc, tableTop, { width: 270 });
      doc.text('Qty', colX.qty, tableTop, { width: 60, align: 'center' });
      doc.text('Unit Price', colX.price, tableTop, { width: 70, align: 'right' });
      doc.text('Total', colX.total, tableTop, { width: 65, align: 'right' });

      doc.fillColor('#000000');

      // Table rows
      let y = tableTop + 22;
      const items = quotation.items || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        const bgColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(50, y - 5, 495, 20).fill(bgColor);
        doc.fillColor('#000000').fontSize(9).font('Helvetica');
        doc.text(item.description || '', colX.desc, y, { width: 270 });
        doc.text(String(item.quantity || 0), colX.qty, y, { width: 60, align: 'center' });
        doc.text(formatCurrency(item.unit_price), colX.price, y, { width: 70, align: 'right' });
        doc.text(formatCurrency(item.total), colX.total, y, { width: 65, align: 'right' });
        y += 22;
      }

      // Totals
      y += 10;
      doc.moveTo(350, y).lineTo(545, y).stroke('#cccccc');
      y += 10;
      doc.fontSize(10).font('Helvetica');
      doc.text('Subtotal:', 350, y, { width: 120, align: 'right' });
      doc.font('Helvetica-Bold').text(formatCurrency(quotation.subtotal), 480, y, { width: 65, align: 'right' });

      y += 25;
      doc.rect(350, y - 5, 195, 25).fill('#333333');
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('TOTAL:', 350, y, { width: 120, align: 'right' });
      doc.text(formatCurrency(quotation.total), 480, y, { width: 65, align: 'right' });

      doc.fillColor('#000000');

      // Notes
      if (quotation.notes) {
        y += 50;
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:', 50, y);
        doc.moveDown(0.3);
        doc.fontSize(9).font('Helvetica').text(quotation.notes, 50, doc.y, { width: 495 });
      }

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#999999');
      doc.text('Generated on ' + new Date().toLocaleString(), 50, 760, { align: 'center', width: 495 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '€ ' + num.toFixed(2);
}

module.exports = { generateQuotationPdf };
