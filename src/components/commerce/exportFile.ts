/** Triggers a browser download of generated content. */
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

const csvCell = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Builds CSV text from a header row and data rows (values are escaped). */
export const toCsv = (header: string[], rows: (string | number)[][]) =>
  [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

export const todayStamp = () => new Date().toISOString().slice(0, 10);
