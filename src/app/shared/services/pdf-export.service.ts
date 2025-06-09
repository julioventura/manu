import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// npm install jspdf-autotable
// npm install --save-dev @types/jspdf-autotable

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  exportDataAsPDF(data: any[], title: string) {
    const doc = new jsPDF('p', 'pt');
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = data.map(item => headers.map(h => item[h] || ''));

    doc.text(title, 40, 40);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60
    });
    doc.save(`${title}.pdf`);
  }
}