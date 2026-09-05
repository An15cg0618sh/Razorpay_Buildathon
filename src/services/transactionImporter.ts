import type { Transaction, TransactionDirection, TransactionStatus } from '../types';

export type ImportFormat =
  | 'CSV'
  | 'Excel'
  | 'PDF'
  | 'DOC'
  | 'DOCX'
  | 'TXT'
  | 'JSON'
  | 'XML'
  | 'PNG'
  | 'JPG'
  | 'JPEG'
  | 'WEBP';

export type ImportCapability = 'parsed' | 'parser-pending' | 'ocr-pending';

export interface DetectedFile {
  format: ImportFormat;
  capability: ImportCapability;
}

export interface ImportExtraction {
  detected: DetectedFile;
  transactions: Transaction[];
  message?: string;
}

const maxFileBytes = 10 * 1024 * 1024;
const extensionFormats: Record<string, ImportFormat> = {
  csv: 'CSV', xls: 'Excel', xlsx: 'Excel', pdf: 'PDF', doc: 'DOC', docx: 'DOCX',
  txt: 'TXT', json: 'JSON', xml: 'XML', png: 'PNG', jpg: 'JPG', jpeg: 'JPEG', webp: 'WEBP',
};
const mimeFormats: Record<string, ImportFormat> = {
  'text/csv': 'CSV', 'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/pdf': 'PDF', 'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT', 'application/json': 'JSON', 'text/xml': 'XML', 'application/xml': 'XML',
  'image/png': 'PNG', 'image/jpg': 'JPG', 'image/jpeg': 'JPEG', 'image/webp': 'WEBP',
};

function capabilityFor(format: ImportFormat): ImportCapability {
  if (['CSV', 'TXT', 'JSON', 'XML'].includes(format)) return 'parsed';
  if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(format)) return 'ocr-pending';
  return 'parser-pending';
}

export function detectFile(file: File): DetectedFile | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const format = (file.type && mimeFormats[file.type]) || (extension && extensionFormats[extension]);
  return format ? { format, capability: capabilityFor(format) } : null;
}

function valueFrom(record: Record<string, unknown>, names: string[]): string {
  const key = Object.keys(record).find((candidate) => names.includes(candidate.toLowerCase().replace(/[_\s-]/g, '')));
  return key === undefined ? '' : String(record[key] ?? '').trim();
}

function normalizeHeaderName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isValidDate(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp);
}

function parseAmount(value: unknown, typeValue?: string): { amount: number; direction: TransactionDirection } | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const sanitized = raw.replace(/[₹,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
  const numeric = Number(sanitized);
  if (!Number.isFinite(numeric) || numeric === 0) return null;

  const explicitType = typeValue?.trim().toLowerCase();
  const direction = sanitized.startsWith('-') || numeric < 0
    ? 'outflow'
    : explicitType === 'debit'
      ? 'outflow'
      : explicitType === 'credit'
        ? 'inflow'
        : 'inflow';

  return { amount: Math.abs(numeric), direction };
}

function normalizeRecord(record: Record<string, unknown>, index: number): Transaction | null {
  const date = valueFrom(record, ['date', 'transactiondate', 'valuedate']);
  const description = valueFrom(record, ['description', 'narration', 'details', 'memo']);
  const typeValue = valueFrom(record, ['type', 'direction', 'transactiontype']);
  const amount = parseAmount(valueFrom(record, ['amount', 'value', 'debit', 'credit', 'transactionamount']), typeValue);

  if (!date || !description || !isValidDate(date) || !amount) return null;

  const normalizedType = typeValue.trim().toLowerCase();
  if (normalizedType && !['credit', 'debit'].includes(normalizedType)) return null;

  const counterparty = valueFrom(record, ['vendor', 'counterparty', 'payee', 'party']) || 'Imported account';
  const statusValue = valueFrom(record, ['status']).toLowerCase();
  const status: TransactionStatus = statusValue === 'pending' || statusValue === 'unmatched' ? statusValue : 'cleared';

  return {
    id: `imported-${Date.now()}-${index}`,
    date,
    description,
    counterparty,
    account: valueFrom(record, ['account', 'bankaccount']) || 'Imported statement',
    category: valueFrom(record, ['category', 'type']) || 'Unassigned',
    direction: amount.direction,
    amount: amount.amount,
    status,
  };
}

function parseDelimitedRow(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function detectTextDelimiter(line: string): string | null {
  const candidates = [',', '\t', ';', '|'];
  let bestDelimiter: string | null = null;
  let bestScore = 0;

  for (const delimiter of candidates) {
    const cells = parseDelimitedRow(line, delimiter);
    if (cells.length < 2) continue;

    const normalizedCells = cells.map((cell) => normalizeHeaderName(cell));
    const score = normalizedCells.filter((cell) => ['date', 'description', 'reference', 'category', 'vendor', 'amount', 'type', 'risk', 'status'].includes(cell)).length;
    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  return bestScore >= 2 ? bestDelimiter : null;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const delimiter = detectTextDelimiter(lines[0]);
  if (!delimiter) return [];

  const headers = parseDelimitedRow(lines[0], delimiter).map((header) => normalizeHeaderName(header));
  if (headers.filter((header) => ['date', 'description', 'amount'].includes(header)).length < 2) return [];

  return lines.slice(1).map((line) => {
    const values = parseDelimitedRow(line, delimiter);
    if (!values.some((value) => value.trim())) return {};
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  }).filter((record) => Object.keys(record).length > 0);
}

function parseText(text: string): Record<string, unknown>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const firstLine = lines.find((line) => line.trim().length > 0);
  if (!firstLine) return [];

  const delimiter = detectTextDelimiter(firstLine);
  if (!delimiter) return [];

  const headers = parseDelimitedRow(firstLine, delimiter).map((header) => normalizeHeaderName(header));
  if (headers.filter((header) => ['date', 'description', 'amount'].includes(header)).length < 2) return [];

  return lines.slice(lines.indexOf(firstLine) + 1).map((line) => {
    const values = parseDelimitedRow(line, delimiter);
    if (!values.some((value) => value.trim())) return {};

    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  }).filter((record) => Object.keys(record).length > 0);
}

function parseXml(text: string): Record<string, unknown>[] {
  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('This XML file could not be read.');
  return [...document.querySelectorAll('transaction, row, record')].map((element) =>
    Object.fromEntries([...element.children].map((child) => [child.tagName.toLowerCase(), child.textContent ?? ''])),
  );
}

function parseJson(text: string): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(text);
  const records = Array.isArray(parsed) ? parsed : (parsed as { transactions?: unknown[] }).transactions;
  if (!Array.isArray(records)) throw new Error('JSON must contain an array of transaction objects.');
  return records.filter((record): record is Record<string, unknown> => typeof record === 'object' && record !== null);
}

export async function extractTransactions(file: File, detected: DetectedFile): Promise<ImportExtraction> {
  if (file.size === 0) throw new Error('This file is empty. Please choose a file containing transaction data.');
  if (file.size > maxFileBytes) throw new Error('This file is larger than 10 MB. Please choose a smaller statement.');
  if (detected.capability !== 'parsed') {
    const message = detected.capability === 'ocr-pending'
      ? 'Image document detected. OCR processing will be connected in the document intelligence stage.'
      : `${detected.format} detected. Browser document parsing will be connected in the document intelligence stage.`;
    return { detected, transactions: [], message };
  }
  const text = await file.text();
  let records: Record<string, unknown>[];
  if (detected.format === 'CSV') records = parseCsv(text);
  else if (detected.format === 'JSON') records = parseJson(text);
  else if (detected.format === 'XML') records = parseXml(text);
  else records = parseText(text);

  const transactions = records.map((record, index) => normalizeRecord(record, index)).filter((record): record is Transaction => record !== null);
  if (records.length > 0 && transactions.length === 0) throw new Error('Unable to detect financial transactions in this file. Please check its structure and values.');
  return { detected, transactions, message: transactions.length === 0 ? 'No transactions detected. Please check that the document contains transaction data.' : undefined };
}
