import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = data.map(item => {
      return headers
        .map(header => `"${String(item[header] || '').replace(/"/g, '""')}"`)
        .join(',');
    });
    csvRows.unshift(headers.join(','));
    return csvRows.join('\n');
  }

  downloadCSV(filename: string, csv: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}