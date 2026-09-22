// Minimal RFC-4180-style CSV serialization + browser download helper.
// No dependency — the escaping rules needed here (quote fields containing a
// comma/quote/newline, double up internal quotes) are small and stable
// enough that a library would add more weight than value.

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCsvField(raw: string): string {
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCsvField(col.header)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => escapeCsvField(String(col.value(row) ?? "")))
      .join(","),
  );
  // Leading BOM so Excel (still the most common CSV consumer) reads this as
  // UTF-8 instead of mis-rendering non-ASCII characters (₹, accented names).
  return "﻿" + [header, ...lines].join("\r\n");
}

// Browser-only — triggers a file download via a throwaway <a download>,
// which works the same on desktop and tablet Chrome/Safari.
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
