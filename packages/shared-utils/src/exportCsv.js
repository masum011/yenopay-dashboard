export function exportToCsv(filename, rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }

  const headers = columns
    ? columns.map((col) => col.header || col.key)
    : Object.keys(rows[0]);

  const keys = columns
    ? columns.map((col) => col.key)
    : Object.keys(rows[0]);

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => keys.map((key) => escapeCell(row[key])).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
