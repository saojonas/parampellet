import * as XLSX from 'xlsx';
import type { Reading } from './rules';

function normalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = String(value)
    .replace('%', '')
    .replace(',', '.')
    .trim();

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function formatExcelDate(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  return String(value);
}

function formatExcelTime(value: unknown): string {
  if (!value && value !== 0) return '';

  if (value instanceof Date) {
    return value.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return String(value);
}

function pick(row: Record<string, unknown>, possibleHeaders: string[]): unknown {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  );

  for (const header of possibleHeaders) {
    const found = normalized[normalizeHeader(header)];
    if (found !== undefined) return found;
  }

  return '';
}

export async function parseXlsxFile(file: File): Promise<Reading[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: true,
  });

  return rows
    .map((row) => ({
      data: formatExcelDate(pick(row, ['DATA'])),
      hora: formatExcelTime(pick(row, ['HORA'])),
      produto: String(pick(row, ['PRODUTO']) ?? ''),
      op: String(pick(row, ['OP']) ?? ''),
      umidadeComposto: parseNumber(pick(row, ['UMIDADE DO COMPOSTO%', 'UMIDADE DO COMPOSTO'])),
      umidadeMassa: parseNumber(pick(row, ['UMIDADE DA MASSA%', 'UMIDADE DA MASSA'])),
      umidadePellet: parseNumber(pick(row, ['UMIDADE DO PELLET%', 'UMIDADE DO PELLET'])),
      matriz: parseNumber(pick(row, ['TEMPERATURA MATRIZ C°', 'TEMPERATURA MATRIZ', 'MATRIZ'])),
      resfriador: parseNumber(pick(row, ['TEMPERATURA RESFRIADOR C°', 'TEMPERATURA RESFRIADOR', 'RESFRIADOR'])),
      densidade: parseNumber(pick(row, ['DENSIDADE'])),
      dureza: parseNumber(pick(row, ['DUREZA kgf', 'DUREZA'])),
      comprimento: parseNumber(pick(row, ['COMPRIMENTO < 7', 'COMPRIMENTO'])),
      diametro: parseNumber(pick(row, ['DIÂMETRO < 4', 'DIAMETRO < 4', 'DIÂMETRO', 'DIAMETRO'])),
    }))
    .filter((row) => row.hora || row.produto || row.matriz !== null || row.dureza !== null);
}
